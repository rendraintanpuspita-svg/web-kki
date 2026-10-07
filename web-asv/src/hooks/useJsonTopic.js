import { useEffect, useRef } from "react";
import { Topic } from "roslib";
import { useRos } from "../context/RosContext";
import { MSG_STRING } from "../config";

export default function useJsonTopic(name, onMessage) {
  const { ros } = useRos();

  // simpan callback terbaru di ref agar tidak subscribe ulang tiap render
  const callbackRef = useRef(onMessage);
  useEffect(() => {
    callbackRef.current = onMessage;
  });

  useEffect(() => {
    if (!ros) return;

    const topic = new Topic({ ros, name, messageType: MSG_STRING });

    topic.subscribe((msg) => {
      try {
        callbackRef.current(JSON.parse(msg.data));
      } catch (err) {
        console.error(`Pesan ${name} bukan JSON valid:`, err);
      }
    });

    return () => topic.unsubscribe();
  }, [ros, name]);
}