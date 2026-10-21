#!/usr/bin/env python3
"""
web_monitor_node.py
===================
Node JEMBATAN antara ROS 2 dan Frontend Web.

Tugas:
  1. Subscribe /gps_pub + /motion_pub → gabung → publish /asv/telemetry (JSON String)
  2. Subscribe /camera1/image/compressed → encode base64 → publish /asv/video1 (String)

Cara jalankan:
  # Mode DUMMY (laptop monitoring, pakai backend/msg):
  source ~/web_kki/ros_ws/install/setup.bash
  ros2 run backend web_monitor_node

  # Mode ROBOT (di robot, pakai kki_26/msg):
  source ~/mikeros_ws/install/setup.bash
  ASV_MSG_PKG=kki_26 ros2 run kki_26 web_monitor_node
  (atau salin file ini ke paket kki_26)

ENV VAR:
  ASV_MSG_PKG  : 'backend' (default) | 'kki_26'
  VIDEO_FPS    : throttle kamera (default: 3)
  TELEMETRY_HZ : throttle telemetri (default: 2)
"""

import rclpy
import json
import base64
import os
import time
from rclpy.node import Node
from std_msgs.msg import String
from datetime import datetime
from sensor_msgs.msg import CompressedImage

# ============================================================
# PILIH PAKET PESAN SESUAI ENV
# backend  → untuk dummy / laptop monitoring
# kki_26   → untuk robot asli
# ============================================================
MSG_PKG = os.environ.get('ASV_MSG_PKG', 'backend')

try:
    if MSG_PKG == 'kki_26':
        from kki_26.msg import Gpsdata, Motiondata
    else:
        from backend.msg import Gpsdata, Motiondata
    print(f'[web_monitor_node] Paket pesan: {MSG_PKG}')
except ImportError as e:
    print(f'[web_monitor_node] GAGAL import {MSG_PKG}.msg: {e}')
    raise


class WebMonitorNode(Node):

    def __init__(self):
        super().__init__('web_monitor_node')

        # --------------------------------------------------------
        # Konfigurasi dari ENV
        # --------------------------------------------------------
        video_fps      = float(os.environ.get('VIDEO_FPS', '3'))
        telemetry_hz   = float(os.environ.get('TELEMETRY_HZ', '2'))

        self._video_interval     = 1.0 / video_fps      # detik antar frame
        self._telemetry_interval = 1.0 / telemetry_hz   # detik antar telemetri

        self._last_video_time     = 0.0
        self._last_telemetry_time = 0.0

        # --------------------------------------------------------
        # Data internal (diperbarui oleh callback)
        # --------------------------------------------------------
        self._gps    = None   # dict hasil parse Gpsdata
        self._motion = None   # dict hasil parse Motiondata
        self._seq    = 0      # counter pesan telemetri
        self._have_gps = False  # flag: GPS fix sudah masuk

        # --------------------------------------------------------
        # Publisher → dibaca oleh frontend via rosbridge
        # --------------------------------------------------------
        self._pub_telemetry = self.create_publisher(String, '/asv/telemetry', 10)
        self._pub_video1    = self.create_publisher(String, '/asv/video1',    1)
        # Siapkan slot untuk video2 (kamera underwater, belum ada topic)
        # self._pub_video2 = self.create_publisher(String, '/asv/video2', 1)

        # --------------------------------------------------------
        # Subscriber ← dari robot / dummy_pub
        # --------------------------------------------------------
        self.create_subscription(Gpsdata,   '/gps_pub',    self._on_gps,    10)
        self.create_subscription(Motiondata, '/motion_pub', self._on_motion, 10)
        self.create_subscription(
            CompressedImage,
            '/camera1/image/compressed',
            self._on_image,
            1  # queue 1 → selalu frame terbaru
        )

        self.get_logger().info(
            f'web_monitor_node SIAP '
            f'(pkg={MSG_PKG}, video={video_fps}fps, '
            f'telemetry={telemetry_hz}Hz)'
        )

    # ===========================================================
    # CALLBACK GPS
    # ===========================================================
    def _on_gps(self, msg: Gpsdata):
        """
        Terima data GPS dari micro_bridge / dummy_pub.
        Simpan ke state internal, lalu coba publish telemetri.
        """
        self._gps = {
            'lat':      round(msg.latitude,  6),
            'lon':      round(msg.longitude, 6),
            'cog':      round(msg.cog,       2),
            # Robot kirim m/s → konversi ke knot dan km/h
            'sog_knot': round(msg.sog * 1.943844, 2),
            'sog_kmh':  round(msg.sog * 3.6,      2),
        }
        self._have_gps = True
        self._try_publish_telemetry()

    # ===========================================================
    # CALLBACK MOTION
    # ===========================================================
    def _on_motion(self, msg: Motiondata):
        """
        Terima data motion dari micro_bridge / dummy_pub.
        x,y dari STM32 dalam meter → kali 100 = cm (untuk canvas).
        """
        self._motion = {
            'x': round(msg.x * 100.0, 1),  # cm
            'y': round(msg.y * 100.0, 1),  # cm
        }
        self._try_publish_telemetry()

    # ===========================================================
    # PUBLISH TELEMETRI (throttle)
    # ===========================================================
    def _try_publish_telemetry(self):
        """
        Gabungkan GPS + Motion jadi satu JSON → publish ke /asv/telemetry.
        Di-throttle sesuai TELEMETRY_HZ agar tidak banjir data.
        Tidak publish kalau GPS belum fix (have_gps=False).
        """
        now = time.time()

        if (now - self._last_telemetry_time) < self._telemetry_interval:
            return  # masih terlalu cepat

        if not self._have_gps:
            return  # skip: GPS belum valid

        self._seq += 1
        dt = datetime.now()

        payload = {
            'seq':      self._seq,
            'date':     dt.strftime('%Y-%m-%d'),
            'time':     dt.strftime('%H:%M:%S'),
            # GPS fields
            'lat':      self._gps['lat']      if self._gps else 0.0,
            'lon':      self._gps['lon']      if self._gps else 0.0,
            'cog':      self._gps['cog']      if self._gps else 0.0,
            'sog_knot': self._gps['sog_knot'] if self._gps else 0.0,
            'sog_kmh':  self._gps['sog_kmh']  if self._gps else 0.0,
            # Motion fields (cm)
            'x':        self._motion['x'] if self._motion else 0.0,
            'y':        self._motion['y'] if self._motion else 0.0,
            'heading':  0.0,  # placeholder; nanti dari motion.yawm
        }

        msg = String()
        msg.data = json.dumps(payload)
        self._pub_telemetry.publish(msg)
        self._last_telemetry_time = now

        self.get_logger().debug(
            f"[TEL #{self._seq}] lat={payload['lat']}, lon={payload['lon']}, "
            f"x={payload['x']}, y={payload['y']}"
        )

    # ===========================================================
    # CALLBACK KAMERA → base64 → /asv/video1
    # ===========================================================
    def _on_image(self, msg: CompressedImage):
        """
        Terima frame JPEG compressed dari vision1_web.py.
        Encode ke base64 → publish sebagai std_msgs/String.
        Frontend langsung pakai: <img src="data:image/jpeg;base64,{data}">
        Di-throttle sesuai VIDEO_FPS.
        """
        now = time.time()

        if (now - self._last_video_time) < self._video_interval:
            return  # skip frame ini

        b64 = base64.b64encode(bytes(msg.data)).decode('ascii')

        out = String()
        out.data = b64   # langsung string base64, bukan JSON
        self._pub_video1.publish(out)
        self._last_video_time = now

        self.get_logger().debug(
            f'[IMG] frame dikirim, size={len(b64)//1024}KB'
        )


# ===========================================================
# ENTRY POINT
# ===========================================================
def main(args=None):
    rclpy.init(args=args)
    node = WebMonitorNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('web_monitor_node dihentikan.')
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == '__main__':
    main()
