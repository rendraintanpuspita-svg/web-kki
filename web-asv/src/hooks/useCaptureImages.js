/**
 * useCaptureImages.js
 * ===================
 * Hook untuk polling gambar hasil capture robot.
 *
 * Cara kerja:
 *   - Setiap CAPTURE_POLL_MS (default 3 detik), tambahkan ?t=timestamp ke URL
 *   - Browser dipaksa reload gambar (bypass cache) karena timestamp berubah
 *   - Kalau server tidak ada / error → pakai fallback image
 *
 * URL gambar:
 *   Lomba lokal : http://IP_ROBOT:2601/images/sbox1.jpg
 *   Online      : https://xxx.trycloudflare.com/images/sbox1.jpg
 *   Set via VITE_CAPTURE_SERVER_URL di .env.local
 *
 * Return:
 *   surfaceSrc    : URL gambar surface (sbox1.jpg)
 *   underwaterSrc : URL gambar underwater (ubox1.jpg)
 *   retryCapture  : fungsi untuk force refresh sekarang
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CAPTURE_SERVER_URL,
  CAPTURE_SURFACE_PATH,
  CAPTURE_UNDERWATER_PATH,
  CAPTURE_POLL_MS,
} from '../config';

// Fallback: file statis di /public (selalu ada)
const FALLBACK_SURFACE    = '/surface.jpg';
const FALLBACK_UNDERWATER = '/underwater.jpg';

export default function useCaptureImages() {
  const [timestamp, setTimestamp] = useState(() => Date.now());

  // Refresh timestamp setiap CAPTURE_POLL_MS
  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(Date.now());
    }, CAPTURE_POLL_MS);

    return () => clearInterval(timer);
  }, []);

  // Paksa refresh segera (dipanggil dari luar kalau diperlukan)
  const retryCapture = useCallback(() => {
    setTimestamp(Date.now());
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Susun URL gambar
  // Kalau CAPTURE_SERVER_URL kosong → pakai fallback lokal
  // ─────────────────────────────────────────────────────────────
  const base = CAPTURE_SERVER_URL.replace(/\/$/, '');   // hapus trailing slash

  const surfaceSrc    = base
    ? `${base}${CAPTURE_SURFACE_PATH}?t=${timestamp}`
    : FALLBACK_SURFACE;

  const underwaterSrc = base
    ? `${base}${CAPTURE_UNDERWATER_PATH}?t=${timestamp}`
    : FALLBACK_UNDERWATER;

  return {
    surfaceSrc,
    underwaterSrc,
    retryCapture,
    hasCaptureServer: !!base,
  };
}
