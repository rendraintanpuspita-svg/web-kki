#!/usr/bin/env python3

import rclpy
import random
from rclpy.node import Node
from backend.msg import Gpsdata
from backend.msg import Motiondata


class DummyPublisher(Node):

    def __init__(self):
        super().__init__("dummy_pub")

        self.gps_pub = self.create_publisher(
            Gpsdata,
            "/gps_pub",
            10)

        self.motion_pub = self.create_publisher(
            Motiondata,
            "/motion_pub",
            10)

        self.timer = self.create_timer(
            1.0,
            self.timer_callback)

        # Posisi awal motion
        self.x = 0.0
        self.y = 0.0

    def timer_callback(self):

        gps = Gpsdata()
        motion = Motiondata()

        # ==========================
        # Dummy GPS (Random)
        # ==========================
        gps.latitude = random.uniform(-6.90, -6.89)
        gps.longitude = random.uniform(107.60, 107.61)
        gps.cog = random.uniform(0.0, 359.9)
        gps.sog = random.uniform(0.0, 10.0)

        # ==========================
        # Dummy Motion
        # ==========================
        motion.x = self.x
        motion.y = self.y

        # Publish data
        self.gps_pub.publish(gps)
        self.motion_pub.publish(motion)

        # self.get_logger().info(
        #     f"[GPS] lat={gps.latitude:.5f}, "
        #     f"long={gps.longitude:.5f}, "
        #     f"cog={gps.cog:.1f}, "
        #     f"sog={gps.sog:.1f}"
        # )

        self.get_logger().info(
            f"[MOTION] x={motion.x:.1f} y={motion.y:.1f}"
        )

        # y bertambah 2 setiap detik
        self.y += 0.2


def main(args=None):
    rclpy.init(args=args)

    node = DummyPublisher()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info("Dummy publisher dihentikan.")
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()