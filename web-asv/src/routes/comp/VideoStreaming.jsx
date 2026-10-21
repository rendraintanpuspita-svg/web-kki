/**
 * VideoStreaming.jsx
 * ==================
 * Menampilkan video stream dari kamera robot.
 *
 * Props (pilih salah satu, urutan prioritas):
 *   streamUrl  : string — URL MJPEG stream dari web_video_server
 *                (contoh: http://IP:8080/stream?topic=/camera1/image)
 *                Dipakai bila DATA_SOURCE=back4app atau VIDEO_STREAM_URL diset.
 *
 *   base64Img  : string — data base64 JPEG dari rosbridge (/asv/video1)
 *                Dipakai bila DATA_SOURCE=rosbridge.
 *
 * Kalau keduanya tidak ada → tampilkan pesan menunggu.
 */

import { useState } from 'react';

function VideoStreaming({ base64Img, streamUrl }) {
  const [videoError, setVideoError] = useState(false);
  const [retryKey, setRetryKey]     = useState(0);

  const handleRetry = () => {
    setVideoError(false);
    setRetryKey((k) => k + 1);
  };

  // ─────────────────────────────────────────────────────────────
  // Pilih mode render
  // ─────────────────────────────────────────────────────────────
  const hasStream = !!streamUrl;
  const hasBase64 = !!base64Img;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-slate-900 p-4">

      <h2 className="mb-3 shrink-0 text-lg font-semibold">
        Video Streaming
      </h2>

      <div className="min-h-0 flex-1 rounded-lg bg-black border border-white/10
                      flex items-center justify-center overflow-hidden relative">

        {/* ── MODE 1: MJPEG stream (web_video_server / Cloudflare) ── */}
        {hasStream && !videoError && (
          <img
            key={retryKey}
            src={streamUrl}
            alt="Live Camera Feed"
            className="h-full w-full object-contain"
            onError={() => setVideoError(true)}
            onLoad={() => setVideoError(false)}
          />
        )}

        {/* ── MODE 2: base64 dari rosbridge ── */}
        {!hasStream && hasBase64 && (
          <img
            src={`data:image/jpeg;base64,${base64Img}`}
            alt="Video stream"
            className="h-full w-full object-contain"
          />
        )}

        {/* ── ERROR: stream gagal ── */}
        {hasStream && videoError && (
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <p className="text-sm text-red-400">
              Gagal terhubung ke kamera
            </p>
            <button
              onClick={handleRetry}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-xs
                         font-semibold text-white hover:bg-blue-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ── MENUNGGU: belum ada sumber ── */}
        {!hasStream && !hasBase64 && (
          <p className="text-sm text-slate-500">
            Menunggu video stream...
          </p>
        )}

      </div>
    </div>
  );
}

export default VideoStreaming;