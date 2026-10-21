// =============================================================
// config.js — Konfigurasi global frontend ASV
// =============================================================
// Cara set env untuk development lokal:
//   Buat file .env.local di folder web-asv/ berisi:
//     VITE_ROSBRIDGE_URL=ws://IP_ROBOT:9090
//     VITE_DATA_SOURCE=rosbridge
//
// Cara set env untuk Vercel (online/demo):
//   Di Vercel dashboard → Settings → Environment Variables
//   VITE_DATA_SOURCE=back4app
//   VITE_BACK4APP_APP_ID=xxx
//   VITE_BACK4APP_REST_KEY=yyy
//   VITE_CAPTURE_SERVER_URL=https://xxx.trycloudflare.com
// =============================================================

// ─────────────────────────────────────────────────────────────
// SUMBER DATA
// 'rosbridge' → WiFi lokal (hari lomba, npm run dev)
// 'back4app'  → Internet / Vercel (demo online)
// ─────────────────────────────────────────────────────────────
export const DATA_SOURCE =
  import.meta.env.VITE_DATA_SOURCE ?? 'rosbridge';

// ─────────────────────────────────────────────────────────────
// ROSBRIDGE — koneksi WebSocket ke ROS
// Default: host yang sama, port 9090
// Untuk robot di IP lain: VITE_ROSBRIDGE_URL=ws://IP_ROBOT:9090
// ─────────────────────────────────────────────────────────────
export const ROSBRIDGE_URL =
  import.meta.env.VITE_ROSBRIDGE_URL ??
  `ws://${window.location.hostname}:9090`;

// ─────────────────────────────────────────────────────────────
// TOPIC ROS — nama topic di ROS 2
// Semua bertipe std_msgs/String berisi JSON (kecuali video = base64)
// ─────────────────────────────────────────────────────────────
export const TOPICS = {
  telemetry: '/asv/telemetry',   // GPS + Motion → JSON
  battery:   '/asv/battery',     // {pct, voltage} → JSON
  mission:   '/asv/mission',     // {step} → JSON
  video1:    '/asv/video1',      // kamera surface  → base64 string
  video2:    '/asv/video2',      // kamera underwater → base64 string
};

// Tipe pesan ROS semua String (JSON di dalam .data)
export const MSG_STRING = 'std_msgs/msg/String';

// ─────────────────────────────────────────────────────────────
// BACK4APP — polling data GPS/Motion untuk mode online
// ─────────────────────────────────────────────────────────────
export const BACK4APP_APP_ID   = import.meta.env.VITE_BACK4APP_APP_ID   ?? '';
export const BACK4APP_REST_KEY = import.meta.env.VITE_BACK4APP_REST_KEY ?? '';
export const BACK4APP_CLASS    = import.meta.env.VITE_BACK4APP_CLASS    ?? 'kapal';
export const BACK4APP_URL      =
  `https://parseapi.back4app.com/classes/${BACK4APP_CLASS}`;
export const BACK4APP_POLL_MS  = 3000;   // polling setiap 3 detik

// ─────────────────────────────────────────────────────────────
// CAPTURE SERVER — server foto hasil capture robot
// Untuk lomba: http://IP_ROBOT:2601
// Untuk online: Cloudflare Tunnel URL
// ─────────────────────────────────────────────────────────────
export const CAPTURE_SERVER_URL =
  import.meta.env.VITE_CAPTURE_SERVER_URL ?? '';

// URL gambar capture (polling tiap 3 detik)
export const CAPTURE_SURFACE_PATH    = '/images/sbox1.jpg';
export const CAPTURE_UNDERWATER_PATH = '/images/ubox1.jpg';
export const CAPTURE_POLL_MS         = 3000;

// ─────────────────────────────────────────────────────────────
// VIDEO STREAMING (MJPEG dari web_video_server)
// Dipakai sebagai FALLBACK kalau base64 rosbridge tidak jalan
// ─────────────────────────────────────────────────────────────
export const VIDEO_STREAM_URL =
  import.meta.env.VITE_VIDEO_STREAM_URL ?? '';
// Contoh: http://IP_ROBOT:8080/stream?topic=/camera1/image&type=ros_compressed
// Atau via Cloudflare: https://xxx.trycloudflare.com/stream

// ─────────────────────────────────────────────────────────────
// LAIN-LAIN
// ─────────────────────────────────────────────────────────────
export const MAX_LOG = 500;   // batas baris Position Log di memori