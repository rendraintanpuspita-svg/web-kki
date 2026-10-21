/**
 * useBack4AppData.js
 * ==================
 * Hook untuk fetch data GPS + Motion dari Back4App.
 * Dipakai saat DATA_SOURCE = 'back4app' (mode online / Vercel).
 *
 * Data yang di-fetch:
 *   Back4App class: kapal (atau sesuai VITE_BACK4APP_CLASS)
 *   Field di Back4App: Latitude, Longitude, COG, SOG_Knot, SOG_kmperhours,
 *                      x, y, code, Day, Date, Time
 *
 * Return:
 *   latest : objek data terbaru (sudah dinormalisasi nama field)
 *   log    : array semua data (terbaru di atas, max MAX_LOG baris)
 *   resetLog: fungsi untuk reset log
 *
 * Normalisasi field (supaya komponen tidak perlu tahu asal data):
 *   Latitude / Lattitude → lat
 *   Longitude            → lon
 *   SOG_Knot             → sog_knot
 *   SOG_kmperhours       → sog_kmh
 *   COG                  → cog
 *   x, y                 → x, y (sama)
 *   Date, Time, Day      → date, time, day
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BACK4APP_URL,
  BACK4APP_APP_ID,
  BACK4APP_REST_KEY,
  BACK4APP_POLL_MS,
  MAX_LOG,
} from '../config';

// ─────────────────────────────────────────────────────────────
// Normalisasi satu baris dari Back4App → format internal
// ─────────────────────────────────────────────────────────────
function normalizeItem(item) {
  // Back4App lama pakai 'Lattitude' (typo), baru pakai 'Latitude'
  const latRaw = item.Latitude ?? item.Lattitude ?? 0;

  return {
    // ID unik dari Back4App (untuk dedup)
    objectId:  item.objectId,
    // Normalisasi nama field → cocok dengan Geotag.jsx & PositionLog.jsx
    lat:       Number(latRaw),
    lon:       Number(item.Longitude    ?? 0),
    cog:       Number(item.COG          ?? 0),
    sog_knot:  Number(item.SOG_Knot     ?? 0),
    sog_kmh:   Number(item.SOG_kmperhours ?? 0),
    x:         Number(item.x            ?? 0),
    y:         Number(item.y            ?? 0),
    code:      item.code  || null,
    date:      item.Date  ?? '-',
    time:      item.Time  ?? '-',
    day:       item.Day   ?? '-',
    // Pertahankan field asli untuk kompatibilitas
    _raw: item,
  };
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export default function useBack4AppData() {
  const [latest, setLatest]   = useState(null);
  const [log, setLog]         = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState(null);

  const resetLog = useCallback(() => {
    setLog([]);
    setLatest(null);
  }, []);

  useEffect(() => {
    if (!BACK4APP_APP_ID || !BACK4APP_REST_KEY) {
      setError('BACK4APP_APP_ID / BACK4APP_REST_KEY belum dikonfigurasi di .env.local');
      return;
    }

    const headers = {
      'X-Parse-Application-Id': BACK4APP_APP_ID,
      'X-Parse-REST-API-Key':   BACK4APP_REST_KEY,
    };

    let active = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${BACK4APP_URL}?order=-createdAt&limit=1`,
          { headers }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();

        if (!active) return;
        setError(null);

        if (!json.results || json.results.length === 0) return;

        const item = normalizeItem(json.results[0]);

        setLatest(item);

        // ─────────────────────────────────────────────────────
        // Reset log jika code = '0125' (robot reset posisi)
        // ─────────────────────────────────────────────────────
        if (item.code === '0125') {
          setLog([item]);
          return;
        }

        setLog((prev) => {
          // Dedup: kalau objectId sudah ada, abaikan
          if (prev.some((p) => p.objectId === item.objectId)) {
            return prev;
          }
          // Tambah ke atas, batasi MAX_LOG baris
          return [item, ...prev].slice(0, MAX_LOG);
        });

      } catch (err) {
        if (!active) return;
        setError(`Gagal fetch Back4App: ${err.message}`);
        console.error('[useBack4AppData]', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    // Langsung fetch sekali, lalu polling
    fetchData();
    const timer = setInterval(fetchData, BACK4APP_POLL_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);   // hanya sekali mount

  return { latest, log, resetLog, isLoading, error };
}
