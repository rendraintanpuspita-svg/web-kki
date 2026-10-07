import { Ros } from "roslib";

export function startRosConnection(url, { onInstance, onStatus, retryMs = 2000 }) {
  let stopped = false;
  let retryTimer = null;
  let current = null;

  const connect = () => {
    if (stopped) return;

    // instance BARU di tiap percobaan (lebih aman daripada connect ulang)
    const ros = new Ros();
    current = ros;
    let failed = false;

    const fail = () => {
      if (failed) return;
      failed = true;
      ros.close();
      if (stopped) return;
      onStatus("disconnected");
      retryTimer = setTimeout(connect, retryMs);
    };

    ros.on("connection", () => {
      if (!stopped) onStatus("connected");
    });
    ros.on("close", fail);
    ros.on("error", fail);

    onStatus("connecting");
    onInstance(ros);

    ros
      .connect(url)
      .then(() => {
        if (stopped) ros.close();
      })
      .catch(fail);
  };

  connect();

  return () => {
    stopped = true;
    clearTimeout(retryTimer);
    current?.close();
  };
}