#!/usr/bin/env python3
import rclpy
import asyncio
import aiohttp
import time
from rclpy.node import Node
from backend.msg import Gpsdata
from backend.msg import Motiondata
from datetime import datetime

save_folder = "/home/mala/kki26/web_app/public"
last_upload_time = 0
latitude = longitude = cog = sog = 0.0 
x = y = 0.0


def gps_callback(msg: Gpsdata):
    global latitude, longitude, cog, sog
    latitude = msg.latitude
    longitude = msg.longitude
    cog = msg.cog
    sog = msg.sog
    print(f"[GPS]       Latitude: {latitude:.1f}, Longitude: {longitude:.1f}, cog: {cog:.1f}, sog: {sog:.1f}")


async def main():
    rclpy.init()
    node = Node('monitoring_sub')

    node.create_subscription(Gpsdata, '/gps_pub', gps_callback, 10)

    executor = rclpy.executors.MultiThreadedExecutor()
    #loop = asyncio.get_event_loop()
    loop = asyncio.get_running_loop()
    gps_callback.loop = loop

    try:
        async with aiohttp.ClientSession() as session:
            gps_callback.session = session
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