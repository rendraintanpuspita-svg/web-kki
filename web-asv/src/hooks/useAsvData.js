import { useCallback, useState } from "react";
import useJsonTopic from "./useJsonTopic";
import { MAX_LOG, TOPICS } from "../config";

export default function useAsvData() {
  const [latest, setLatest] = useState(null);   // telemetry terbaru
  const [log, setLog] = useState([]);           // riwayat, TERBARU DI ATAS
  const [battery, setBattery] = useState(null);
  const [mission, setMission] = useState(null);

  useJsonTopic(TOPICS.telemetry, (msg) => {
    setLatest(msg);
    setLog((prev) => {
      // seq mengecil = putaran baru / node di-restart -> log mulai dari awal
      if (prev.length > 0 && msg.seq <= prev[0].seq) return [msg];
      return [msg, ...prev].slice(0, MAX_LOG);
    });
  });

  useJsonTopic(TOPICS.battery, setBattery);
  useJsonTopic(TOPICS.mission, setMission);

  const resetLog = useCallback(() => {
    setLog([]);
    setLatest(null);
  }, []);

  return { latest, log, battery, mission, resetLog };
}