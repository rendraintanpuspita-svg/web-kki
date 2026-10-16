#!/usr/bin/env python3

import rclpy
import requests
import threading
import time
import os

from rclpy.node import Node
from backend.msg import Motiondata


image_list = ["sbox1.jpg","ubox1.jpg"]
save_folder = "/home/mala/kki26/web_app/public"
base_url = "http://192.168.2.100:2501"
os.makedirs(save_folder, exist_ok=True)
x = y = 0.0

# Menandakan robot sedang dalam kondisi RESET
reset_done = False


#hapus gambar
def delete_images():
    for filename in image_list:
        file_path = os.path.join(save_folder,filename)

        try:
            if os.path.isfile(file_path):
                os.remove(file_path)

                print(f"[LOCAL] terhapus: {filename}")

            else:
                print(f"[LOCAL] tidak ditemukan: {filename}")

        except Exception as e:
            print(
                f"[LOCAL] Gagal menghapus {filename}")
            
def motion_callback(msg):

    global x, y, reset_done

    x = round(msg.x * 100, 1)
    y = round(msg.y * 100, 1)

    if x == 0.0 and y <= 40.0:

        if not reset_done:
            print( "[RESET] Menghapus gambar.")
            delete_images()
            reset_done = True

    else:

        if reset_done:
            print(
                "[RESET] Done")
        reset_done = False


# download gamabr
def download_images_loop():
    while True:

        if reset_done:

            time.sleep(1)
            continue

        for filename in image_list:

            try:
                url = f"{base_url}/{filename}"
                response = requests.get(url,timeout=3)

                if response.status_code == 200:
                    file_path = os.path.join(save_folder, filename)

                    with open(file_path,"wb" ) as f: f.write(response.content)

                    print("[IMG] Download OK:",filename)

                else:
                    print(
                        f"[IMG] Gagal {filename} ")
                    
            except requests.exceptions.RequestException as e:
                print(f"[IMG] Gagal {filename}")

            except Exception as e:
                print(f"[IMG] Error {filename}")
        time.sleep(1)



class ImageMonitor(Node):
    def __init__(self):
        super().__init__("image_monitor")
        self.subscription = self.create_subscription(Motiondata,"/motion_pub",motion_callback,10)


def main():
    rclpy.init()
    node = ImageMonitor()

    # Thread untuk download gambar
    download_thread = threading.Thread(target=download_images_loop,daemon=True)
    download_thread.start()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        print("[INFO] STOP.")
    finally:
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()