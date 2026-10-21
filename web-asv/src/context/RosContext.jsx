import { createContext, useContext, useEffect, useState } from "react";
import { ROSBRIDGE_URL, DATA_SOURCE } from "../config";
import { startRosConnection } from "../lib/rosConnection";

  const [status, setStatus] = useState(
    DATA_SOURCE === "back4app" ? "cloud" : "connecting"
  );

export function RosProvider({ children }) {
  const [ros, setRos] = useState(null);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    if (DATA_SOURCE === "back4app") return;
    return startRosConnection(ROSBRIDGE_URL, { onInstance: setRos, onStatus: setStatus });
  }, []);

  return (
    <RosContext.Provider value={{ ros, status }}>
      {children}
    </RosContext.Provider>
  );
}

export const useRos = () => useContext(RosContext);