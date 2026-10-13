import { useCallback, useState } from "react";
import useJsonTopic from "./useJsonTopic";
import { MAX_LOG, TOPICS } from "../config";

export default function useAsvData() {
  const [latest, setLatest]   = useState(null);  // telemetry terbaru
  const [log, setLog]         = useState([]);    // riwayat, TERBARU DI ATAS
  const [battery, setBattery] = useState(null);
  const [mission, setMission] = useState(null);
  const [video1, setVideo1]   = useState(null);  // base64 kamera surface
  const [video2, setVideo2]   = useState(null);  // base64 kamera underwater

  useJsonTopic(TOPICS.telemetry, (msg) => {
    setLatest(msg);
    setLog((prev) => {
      // seq mengecil = putaran baru / node di-restart → log mulai dari awal
      if (prev.length > 0 && msg.seq <= prev[0].seq) return [msg];
      return [msg, ...prev].slice(0, MAX_LOG);
    });
  });

  useJsonTopic(TOPICS.battery, setBattery);
  useJsonTopic(TOPICS.mission, setMission);
  useJsonTopic(TOPICS.video1, (msg) => setVideo1(msg.data));
  useJsonTopic(TOPICS.video2, (msg) => setVideo2(msg.data));

  const resetLog = useCallback(() => {
    setLog([]);
    setLatest(null);
  }, []);

  return { latest, log, battery, mission, video1, video2, resetLog };
}