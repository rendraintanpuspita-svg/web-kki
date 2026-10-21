#!/usr/bin/env python3
"""
data.py — Upload data GPS + Motion ke Back4App
===============================================
Subscribe /gps_pub dan /motion_pub lalu upload ke Back4App setiap 5 detik.
Hanya upload kalau GPS sudah fix (have_gps=True).

ENV VAR (baca dari .env atau shell):
  BACK4APP_APP_ID   : Application ID
  BACK4APP_REST_KEY : REST API Key
  UPLOAD_INTERVAL   : detik antar upload (default 5)

Cara jalankan:
  source ~/web_kki/ros_ws/install/setup.bash
  ASV_MSG_PKG=backend ros2 run backend data_node
"""

import rclpy
import asyncio
import aiohttp
import time
import os
from rclpy.node import Node
from datetime import datetime

# ============================================================
# PILIH PAKET PESAN
# ============================================================
MSG_PKG = os.environ.get('ASV_MSG_PKG', 'backend')
if MSG_PKG == 'kki_26':
    from kki_26.msg import Gpsdata, Motiondata
else:
    from backend.msg import Gpsdata, Motiondata

# ============================================================
# KONFIGURASI BACK4APP — baca dari environment, JANGAN hardcode
# ============================================================
BACK4APP_APP_ID     = os.environ.get('BACK4APP_APP_ID',     'n2vZNBYLLTVmQynI5NKbsr37fFzqnLcBS0NOPmyp')
BACK4APP_MASTER_KEY = os.environ.get('BACK4APP_MASTER_KEY', 'kEDjmU7XsJvTwBjHRelH4KCHZO2ulDDGKiOoeq8f ')
BACK4APP_REST_KEY   = os.environ.get('BACK4APP_REST_KEY',   'SAPk6DeBqaAtvzM0ZF6SD1s3WYMPF2gekjf0siii')
BACK4APP_CLASS      = os.environ.get('BACK4APP_CLASS',      'kapal')
UPLOAD_INTERVAL     = float(os.environ.get('UPLOAD_INTERVAL', '1'))

URL = f'https://parseapi.back4app.com/classes/{BACK4APP_CLASS}'
BACK4APP_HEADERS = {
    'X-Parse-Application-Id': BACK4APP_APP_ID,
    'Content-Type':           'application/json',
}
# Master key (bisa menulis walau class dikunci) diutamakan daripada REST key
if BACK4APP_MASTER_KEY:
    BACK4APP_HEADERS['X-Parse-Master-Key'] = BACK4APP_MASTER_KEY
else:
    BACK4APP_HEADERS['X-Parse-REST-API-Key'] = BACK4APP_REST_KEY


# ============================================================
# STATE GLOBAL
# ============================================================
last_upload_time = 0.0
have_gps  = False   # flag: GPS fix sudah masuk

latitude  = longitude = cog = sog_raw = 0.0  # sog_raw dalam m/s
x = y = 0.0


# ============================================================
# UPLOAD KE BACK4APP
# ============================================================
async def upload_to_back4app(session: aiohttp.ClientSession, data: dict):
    now = datetime.now()
    data['Day']  = now.strftime('%A')
    data['Date'] = now.strftime('%Y-%m-%d')
    data['Time'] = now.strftime('%H:%M:%S')

    try:
        async with session.post(URL, json=data, headers=BACK4APP_HEADERS) as resp:
            if resp.status == 201:
                print('[UPLOAD] OK')
            else:
                text = await resp.text()
                print(f'[UPLOAD] Gagal ({resp.status}): {text}')
    except Exception as e:
        print(f'[UPLOAD ERROR] {e}')


# ============================================================
# CALLBACK GPS
# ============================================================
def gps_callback(msg: Gpsdata):
    global latitude, longitude, cog, sog_raw, have_gps
    latitude  = msg.latitude
    longitude = msg.longitude
    cog       = msg.cog
    sog_raw   = msg.sog   # m/s (dari STM32)
    have_gps  = True
    print(f'[GPS] lat={latitude:.6f}, lon={longitude:.6f}, '
          f'cog={cog:.1f}, sog={sog_raw:.2f} m/s')
    _try_upload(gps_callback)


# ============================================================
# CALLBACK MOTION
# ============================================================
def motion_callback(msg: Motiondata):
    global x, y
    x = round(msg.x * 100.0, 1)   # meter → cm
    y = round(msg.y * 100.0, 1)
    print(f'[MOTION] x={x:.1f} cm, y={y:.1f} cm')
    _try_upload(motion_callback)


# ============================================================
# LOGIKA UPLOAD (throttle + have_gps guard)
# ============================================================
def _try_upload(callback):
    global last_upload_time

    if not have_gps:
        print('[UPLOAD] Skip — GPS belum fix')
        return

    now = time.time()
    if (now - last_upload_time) < UPLOAD_INTERVAL:
        return  # belum waktunya

    # Tentukan kode reset
    code = None
    if x == 0.0 and y <= 40.0:
        code = '0125'
        print('[UPLOAD] RESET CODE')

    data = {
        'Latitude':         round(latitude,  6),   # ejaan konsisten
        'Longitude':        round(longitude, 6),
        'COG':              round(cog,       2),
        # Konversi SOG: robot kirim m/s
        'SOG_Knot':         round(sog_raw * 1.943844, 2),
        'SOG_kmperhours':   round(sog_raw * 3.6,      2),
        'x':                x,
        'y':                y,
        'code':             code,
    }

    asyncio.run_coroutine_threadsafe(
        upload_to_back4app(callback.session, data),
        callback.loop
    )
    last_upload_time = now


# ============================================================
# MAIN
# ============================================================
async def main():
    if not BACK4APP_APP_ID or not (BACK4APP_MASTER_KEY or BACK4APP_REST_KEY):
        print('[ERROR] BACK4APP_APP_ID dan BACK4APP_MASTER_KEY belum diset!')
        print('  Jalankan: set -a; source src/backend/.env; set +a')
        return
    print(f'[INFO] upload ke class "{BACK4APP_CLASS}" tiap {UPLOAD_INTERVAL}s')

    rclpy.init()
    node = Node('data_node')

    node.create_subscription(Gpsdata,    '/gps_pub',    gps_callback,    10)
    node.create_subscription(Motiondata, '/motion_pub', motion_callback, 10)

    executor = rclpy.executors.MultiThreadedExecutor()
    loop = asyncio.get_running_loop()
    gps_callback.loop    = loop
    motion_callback.loop = loop

    try:
        async with aiohttp.ClientSession() as session:
            gps_callback.session    = session
            motion_callback.session = session
            executor.add_node(node)
            await loop.run_in_executor(None, executor.spin)

    except (asyncio.CancelledError, KeyboardInterrupt):
        print('[INFO] data_node dihentikan')
    finally:
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == '__main__':
    asyncio.run(main())