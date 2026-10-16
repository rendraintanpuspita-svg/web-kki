#!/usr/bin/env python3
import rclpy
import asyncio
import aiohttp
import time
import os
from rclpy.node import Node
from backend.msg import Gpsdata
from backend.msg import Motiondata
from datetime import datetime

save_folder = "/home/mala/kki26/web_app/public"
last_upload_time = 0
latitude = longitude = cog = sog = 0.0 
x = y = 0.0

# konfigurasi back4app
URL = "https://parseapi.back4app.com/classes/kapal"
BACK4APP_HEADERS = {
    'X-Parse-Application-Id': 'dWmMzg8refPpHQnp7dSjQRForwI9rpW4ftphXUwr',
    'X-Parse-REST-API-Key': '6cwraZgkMzXb9msJIbsD5X2F7krKIv5giVsuQe2p',
    'Content-Type': 'application/json',}

async def upload_to_back4app(session, data: dict):
    # Ambil waktu sekarang
    now = datetime.now()
    data["Day"] = now.strftime("%A")          # Nama hari, contoh: Monday
    data["Date"] = now.strftime("%Y-%m-%d")   # Format tanggal: 2025-09-24
    data["Time"] = now.strftime("%H:%M:%S")   # Jam:Menit:Detik

    try:
        async with session.post(URL, json=data, headers=BACK4APP_HEADERS) as resp:
            if resp.status == 201:
                print("Data berhasil")
            else:
                text = await resp.text()
                print(f"Gagal ({resp.status}): {text}")
    except Exception as e:
        print(f"[UPLOAD ERROR] {e}")

def gps_callback(msg: Gpsdata):
    global latitude, longitude, cog, sog
    latitude = msg.latitude
    longitude = msg.longitude
    cog = msg.cog
    sog = msg.sog
    print(f"[GPS]       Latitude: {latitude:.1f}, Longitude: {longitude:.1f}, cog: {cog:.1f}, sog: {sog:.1f}")

    # panggil upload
    # upload_data(gps_callback)

def motion_callback(msg: Motiondata):
    global x, y
    now = time.time()
    x = round(msg.x * 100, 1)
    y = round(msg.y * 100, 1)
    print(f"[MOTION]    x={x:.1f} *, y={y:.1f}")
    print()

    # panggil upload
    # upload_data(motion_callback)


def upload_data(callback):
    global last_upload_time, latitude, longitude, cog, sog, x, y
    now = time.time()

    if (now - last_upload_time) >= 1:  # 1000 ms
        code = None
        if x == 0.0 and y <= 40.0:
            code = "0125"
            print("RESET")

        data = {
            "Lattitude": round (latitude, 6),
            "Longitude": round (longitude, 6),
            "COG": round (cog, 2),
            "SOG_Knot": round (sog / 1.852, 2),
            "SOG_kmperhours": round(sog, 2),
            "x": x,
            "y": y,
            "code": code,
        }
        asyncio.run_coroutine_threadsafe(
            upload_to_back4app(callback.session, data),
            callback.loop
        )
        last_upload_time = now

async def main():
    rclpy.init()
    node = Node('monitoring_sub')

    node.create_subscription(Gpsdata, '/gps_pub', gps_callback, 10)
    node.create_subscription(Motiondata, '/motion_pub', motion_callback, 10)

    executor = rclpy.executors.MultiThreadedExecutor()
    #loop = asyncio.get_event_loop()
    loop = asyncio.get_running_loop()
    motion_callback.loop = loop
    gps_callback.loop = loop

    try:
        async with aiohttp.ClientSession() as session:
            gps_callback.session = session
            motion_callback.session = session

            executor.add_node(node)
            await loop.run_in_executor(None, executor.spin)

    except (asyncio.CancelledError, KeyboardInterrupt):
        print("[INFO] STOP")
    finally:
        if not session.closed:
            await session.close()
        if rclpy.ok():
            rclpy.shutdown()

if __name__ == "__main__":
    asyncio.run(main())