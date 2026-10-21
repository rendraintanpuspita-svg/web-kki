/**
 * LintasanA.jsx
 * =============
 * Halaman monitoring lintasan A.
 *
 * Sumber data (otomatis dipilih dari config.js):
 *   DATA_SOURCE=rosbridge → pakai useAsvData (WebSocket ke ROS)
 *   DATA_SOURCE=back4app  → pakai useBack4AppData (polling HTTP ke cloud)
 *
 * Gambar capture  → useCaptureImages (polling HTTP ke capture server)
 * Video streaming → streamUrl dari config ATAU base64 dari rosbridge
 */

import MissionStatus      from './comp/MissionStatus';
import BatteryStatus      from './comp/BatteryStatus';
import Geotag             from './comp/Geotag';
import CaptureSurface     from './comp/CaptureSurface';
import CaptureUnderwater  from './comp/CaptureUnderwater';
import PositionLog        from './comp/PositionLog';
import VideoStreaming      from './comp/VideoStreaming';
import TrajectoryA        from './comp/TrajectoryA';

import useAsvData         from '../hooks/useAsvData';
import useBack4AppData    from '../hooks/useBack4AppData';
import useCaptureImages   from '../hooks/useCaptureImages';
import { DATA_SOURCE, VIDEO_STREAM_URL } from '../config';

function LintasanA() {
  // =============================================================
  // DATA TELEMETRI — pilih berdasarkan DATA_SOURCE
  // =============================================================
  const rosBridge   = useAsvData();        // selalu jalan (biar rosbridge standby)
  const back4App    = useBack4AppData();   // selalu jalan (polling berhenti kalau key kosong)

  // Pilih sumber aktif
  const isRosBridge = DATA_SOURCE !== 'back4app';
  const { latest, log, battery, mission, video1, video2, resetLog } =
    isRosBridge ? rosBridge : { ...back4App, battery: null, mission: null, video1: null, video2: null };

  // =============================================================
  // GAMBAR CAPTURE — dari server capture robot
  // =============================================================
  const { surfaceSrc, underwaterSrc } = useCaptureImages();

  // =============================================================
  // VIDEO STREAMING
  // Prioritas: VIDEO_STREAM_URL (web_video_server/Cloudflare)
  //            → base64 dari rosbridge (video1)
  // =============================================================
  const streamUrl = VIDEO_STREAM_URL || null;

  return (
    <div className="h-[calc(100vh-232px)] px-4 pb-4">

      {/* ================= MAIN 3 COLUMNS ================= */}
      <div className="grid h-full grid-cols-12 gap-4">

        {/* ================= LEFT ================= */}
        <div className="col-span-3 flex min-h-0 flex-col gap-4">

          {/* Video Streaming */}
          <div className="min-h-0 flex-[6] overflow-hidden">
            <VideoStreaming
              streamUrl={streamUrl}
              base64Img={video1}
            />
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
                {/* src = URL capture server; base64Img = fallback rosbridge */}
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
                {/* log berisi array titik dengan field x, y */}
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
