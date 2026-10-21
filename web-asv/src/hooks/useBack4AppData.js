import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BACK4APP_URL,
  BACK4APP_APP_ID,
  BACK4APP_REST_KEY,
  BACK4APP_POLL_MS,
  MAX_LOG,
  DATA_SOURCE,
} from '../config';

function normalizeItem(item) {
  const latRaw = item.Latitude ?? item.Lattitude ?? 0;
  return {
    objectId:  item.objectId,
    createdAt: item.createdAt,
    lat:       Number(latRaw),
    lon:       Number(item.Longitude      ?? 0),
    cog:       Number(item.COG            ?? 0),
    sog_knot:  Number(item.SOG_Knot       ?? 0),
    sog_kmh:   Number(item.SOG_kmperhours ?? 0),
    x:         Number(item.x              ?? 0),
    y:         Number(item.y              ?? 0),
    code:      item.code || null,
    date:      item.Date ?? '-',
    time:      item.Time ?? '-',
    day:       item.Day  ?? '-',
    _raw: item,
  };
}

export default function useBack4AppData() {
  const [latest, setLatest]       = useState(null);
  const [log, setLog]             = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  const [isStale, setIsStale]     = useState(true);

  // createdAt terakhir yang sudah diproses
  const sinceRef = useRef(null);

  const resetLog = useCallback(() => {
    setLog([]);
    setLatest(null);
  }, []);

  useEffect(() => {
    // Mode rosbridge → tidak perlu polling cloud
    if (DATA_SOURCE !== 'back4app') return;

    if (!BACK4APP_APP_ID || !BACK4APP_REST_KEY) {
      setError('BACK4APP_APP_ID / BACK4APP_REST_KEY belum dikonfigurasi di .env.local');
      return;
    }

    const headers = {
      'X-Parse-Application-Id': BACK4APP_APP_ID,
      'X-Parse-REST-API-Key':   BACK4APP_REST_KEY,
    };

    let active = true;
    const STALE_MS = 15000;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Pertama: 1 baris terbaru. Berikutnya: semua baris yang lebih baru
        // dari yang terakhir dilihat (urut lama → baru).
        let url;
        if (sinceRef.current) {
          const where = encodeURIComponent(JSON.stringify({
            createdAt: { $gt: { __type: 'Date', iso: sinceRef.current } },
          }));
          url = `${BACK4APP_URL}?order=createdAt&limit=100&where=${where}`;
        } else {
          url = `${BACK4APP_URL}?order=-createdAt&limit=1`;
        }

        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!active) return;
        setError(null);

        const rows = json.results ?? [];
        if (rows.length > 0) {
          const items = rows.map(normalizeItem);
          sinceRef.current = rows[rows.length - 1].createdAt;
          setLatest(items[items.length - 1]);

          setLog((prev) => {
            let next = prev;
            for (const it of items) {
              if (it.code === '0125') {
                next = [it];                       // robot reset → log baru
              } else if (!next.some((p) => p.objectId === it.objectId)) {
                next = [it, ...next].slice(0, MAX_LOG);
              }
            }
            return next;
          });
        }

        if (sinceRef.current) {
          setIsStale(Date.now() - new Date(sinceRef.current).getTime() > STALE_MS);
        }
      } catch (err) {
        if (!active) return;
        setError(`Gagal fetch Back4App: ${err.message}`);
        console.error('[useBack4AppData]', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchData();
    const timer = setInterval(fetchData, BACK4APP_POLL_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { latest, log, resetLog, isLoading, error, isStale };
}