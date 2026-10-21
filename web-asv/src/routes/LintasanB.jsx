/**
 * LintasanB.jsx
 * =============
 * Halaman monitoring lintasan B — sama dengan LintasanA, beda Trajectory.
 */

import VideoStreaming      from './comp/VideoStreaming';
import MissionStatus      from './comp/MissionStatus';
import Geotag             from './comp/Geotag';
import CaptureSurface     from './comp/CaptureSurface';
import CaptureUnderwater  from './comp/CaptureUnderwater';
import PositionLog        from './comp/PositionLog';
import TrajectoryB        from './comp/TrajectoryB';
import BatteryStatus      from './comp/BatteryStatus';

import useAsvData         from '../hooks/useAsvData';
import useBack4AppData    from '../hooks/useBack4AppData';
import useCaptureImages   from '../hooks/useCaptureImages';
import { DATA_SOURCE, VIDEO_STREAM_URL } from '../config';

function LintasanB() {
  const rosBridge   = useAsvData();
  const back4App    = useBack4AppData();

  // Pilih sumber aktif
  const isRosBridge = DATA_SOURCE !== 'back4app';
  const { latest, log, battery, mission, video1, video2, resetLog, isStale } =
    isRosBridge ? rosBridge : { ...back4App, battery: null, mission: null, video1: null, video2: null };

  const { surfaceSrc, underwaterSrc } = useCaptureImages();
  const streamUrl = VIDEO_STREAM_URL || null;

  return (
    <div className="h-[calc(100vh-232px)] px-4 pb-4">

      <div className="grid h-full grid-cols-12 gap-4">

        {/* ================= LEFT ================= */}
        <div className="col-span-3 flex min-h-0 flex-col gap-4">

          <div className="min-h-0 flex-[6] overflow-hidden">
            <VideoStreaming
              streamUrl={streamUrl}
              base64Img={video1}
            />
          </div>

          <div className="min-h-0 flex-[4] overflow-hidden">
            <MissionStatus step={mission?.step ?? null} />
          </div>

        </div>


        {/* ================= CENTER ================= */}
        <div className="col-span-6 min-h-0">

          <div className="grid h-full grid-rows-[3fr_4fr_3fr] gap-4">

            <div className="min-h-0 overflow-hidden">
              <Geotag data={latest} stale={!isRosBridge && isStale} />
            </div>

            <div className="grid min-h-0 grid-cols-2 gap-4">

              <div className="min-h-0 overflow-hidden">
                <CaptureSurface
                  src={surfaceSrc}
                  base64Img={video1}
                />
              </div>

              <div className="min-h-0 overflow-hidden">
                <CaptureUnderwater
                  src={underwaterSrc}
                  base64Img={video2}
                />
              </div>

            </div>

            <div className="min-h-0 overflow-hidden">
              <PositionLog log={log} onReset={resetLog} />
            </div>

          </div>

        </div>


        {/* ================= RIGHT ================= */}
        <div className="col-span-3 flex min-h-0 flex-col gap-4">

          <div className="min-h-0 flex-[9] overflow-hidden">

            <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-slate-900 p-4">

              <h2 className="mb-3 shrink-0 text-lg font-semibold">
                Trajectory B
              </h2>

              <div className="min-h-0 flex-1 overflow-hidden">
                <TrajectoryB pointsData={log} />
              </div>

            </div>

          </div>

          <div className="min-h-0 flex-[3] overflow-hidden">
            <BatteryStatus battery={battery} />
          </div>

        </div>

      </div>

    </div>
  );
}

export default LintasanB;