// Alamat rosbridge. Default: host yang membuka web, port 9090.
// Kalau ROS di laptop lain, buat file .env di web-asv:
//   VITE_ROSBRIDGE_URL=ws://IP-ROBOT:9090
export const ROSBRIDGE_URL =
  import.meta.env.VITE_ROSBRIDGE_URL ?? `ws://${window.location.hostname}:9090`;

export const TOPICS = {
  telemetry: "/asv/telemetry",
  battery:   "/asv/battery",
  mission:   "/asv/mission",
  video1:    "/asv/video1",    // kamera surface  (base64 jpeg dari web_monitor_node)
  video2:    "/asv/video2",    // kamera underwater
};

// Tipe pesan ROS 2
export const MSG_STRING = "std_msgs/msg/String";

// Batas baris Position Log di memori
export const MAX_LOG = 500;