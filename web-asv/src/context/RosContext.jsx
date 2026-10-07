import { createContext, useContext, useEffect, useState } from "react";
import { ROSBRIDGE_URL } from "../config";
import { startRosConnection } from "../lib/rosConnection";

const RosContext = createContext({ ros: null, status: "connecting" });

export function RosProvider({ children }) {
  const [ros, setRos] = useState(null);
  const [status, setStatus] = useState("connecting");

  useEffect(
    () => startRosConnection(ROSBRIDGE_URL, { onInstance: setRos, onStatus: setStatus }),
    []
  );

  return (
    <RosContext.Provider value={{ ros, status }}>
      {children}
    </RosContext.Provider>
  );
}

export const useRos = () => useContext(RosContext);