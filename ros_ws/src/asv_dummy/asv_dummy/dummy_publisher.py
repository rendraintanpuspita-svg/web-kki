import json

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

from asv_dummy.simulator import PathSimulator


class DummyPublisher(Node):
    def __init__(self):
        super().__init__("asv_dummy_publisher")

        # parameter yang bisa diubah dari terminal
        self.declare_parameter("lintasan", "A")
        self.declare_parameter("speed", 0.5)      # m/s

        lintasan = self.get_parameter("lintasan").value
        speed = float(self.get_parameter("speed").value)

        self.dt = 0.5                             # publish tiap 0,5 detik (2 Hz)
        self.sim = PathSimulator(lintasan, speed_m_s=speed)

        # tiga "channel"
        self.pub_telemetry = self.create_publisher(String, "/asv/telemetry", 10)
        self.pub_battery = self.create_publisher(String, "/asv/battery", 10)
        self.pub_mission = self.create_publisher(String, "/asv/mission", 10)

        self.create_timer(self.dt, self.tick)
        self.get_logger().info(f"Dummy ASV aktif | lintasan={lintasan} speed={speed} m/s")

    @staticmethod
    def to_msg(data):
        msg = String()
        msg.data = json.dumps(data)
        return msg

    def tick(self):
        self.pub_telemetry.publish(self.to_msg(self.sim.step(self.dt)))
        self.pub_battery.publish(self.to_msg(self.sim.battery()))
        self.pub_mission.publish(self.to_msg(self.sim.mission()))


def main():
    rclpy.init()
    node = DummyPublisher()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()