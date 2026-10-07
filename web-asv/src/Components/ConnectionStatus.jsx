import { useRos } from "../context/RosContext";
import { ROSBRIDGE_URL } from "../config";

const STYLE = {
  connected: { dot: "bg-emerald-400", text: "ROS connected" },
  connecting: { dot: "bg-amber-400 animate-pulse", text: "Connecting..." },
  disconnected: { dot: "bg-red-500", text: "ROS disconnected" },
};

function ConnectionStatus() {
  const { status } = useRos();
  const { dot, text } = STYLE[status];

  return (
    <div
      title={ROSBRIDGE_URL}
      className="ml-4 flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      {text}
    </div>
  );
}

export default ConnectionStatus;