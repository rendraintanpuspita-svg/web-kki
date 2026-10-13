import MissionStatus from "./comp/MissionStatus";
import BatteryStatus from "./comp/BatteryStatus";
import Geotag from "./comp/Geotag";
import CaptureSurface from "./comp/CaptureSurface";
import CaptureUnderwater from "./comp/CaptureUnderwater";
import PositionLog from "./comp/PositionLog";
import VideoStreaming from "./comp/VideoStreaming";
import TrajectoryA from "./comp/TrajectoryA";

import useAsvData from "../hooks/useAsvData";

function LintasanA() {
  const { latest, log, battery, mission, video1, video2, resetLog } = useAsvData();

  return (
    <div className="h-[calc(100vh-232px)] px-4 pb-4">

      {/* ================= MAIN 3 COLUMNS ================= */}
      <div className="grid h-full grid-cols-12 gap-4">

        {/* ================= LEFT ================= */}
        <div className="col-span-3 flex min-h-0 flex-col gap-4">

          {/* Video Streaming — kamera surface */}
          <div className="min-h-0 flex-[6] overflow-hidden">
            <VideoStreaming base64Img={video1} />
          </div>

          {/* Mission Status */}
          <div className="min-h-0 flex-[4] overflow-hidden">
            <MissionStatus step={mission?.step ?? null} />
          </div>
        </div>


        {/* ================= CENTER ================= */}
        <div className="col-span-6 min-h-0">

          <div className="grid h-full grid-rows-[3fr_4fr_3fr] gap-4">

            {/* Geotag & Telemetry */}
            <div className="min-h-0 overflow-hidden">
              <Geotag data={latest} />
            </div>

            {/* Capture Surface + Underwater */}
            <div className="grid min-h-0 grid-cols-2 gap-4">

              <div className="min-h-0 overflow-hidden">
                <CaptureSurface base64Img={video1} />
              </div>

              <div className="min-h-0 overflow-hidden">
                <CaptureUnderwater base64Img={video2} />
              </div>

            </div>

            {/* Position Log */}
            <div className="min-h-0 overflow-hidden">
              <PositionLog log={log} onReset={resetLog} />
            </div>

          </div>

        </div>


        {/* ================= RIGHT ================= */}
        <div className="col-span-3 flex min-h-0 flex-col gap-4">

          {/* Trajectory A */}
          <div className="min-h-0 flex-[9] overflow-hidden">

            <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-slate-900 p-4">

              <h2 className="mb-3 shrink-0 text-lg font-semibold">
                Trajectory A
              </h2>

              <div className="min-h-0 flex-1 overflow-hidden">
                <TrajectoryA pointsData={log} />
              </div>

            </div>

          </div>


          {/* Battery Status */}
          <div className="min-h-0 flex-[3] overflow-hidden">
            <BatteryStatus battery={battery} />
          </div>

        </div>

      </div>

    </div>
  );
}

export default LintasanA;
