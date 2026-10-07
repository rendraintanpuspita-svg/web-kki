const fmt = (value, digits) =>
  value === undefined || value === null ? "-" : Number(value).toFixed(digits);

function PositionLog({ log = [], onReset }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-slate-900 p-4">

      <div className="flex shrink-0 items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Position Log
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Riwayat lintasan terekam ({log.length})
          </p>
        </div>

        <button
          onClick={onReset}
          className="rounded-lg bg-slate-800 px-3 py-1 text-xs hover:bg-slate-700 transition"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-auto">

        <table className="w-full text-left text-xs">

          <thead className="sticky top-0 bg-slate-900">
            <tr className="border-b border-white/10 text-slate-400">
              <th className="px-2 py-2">Time</th>
              <th className="px-2 py-2">Position X</th>
              <th className="px-2 py-2">Position Y</th>
              <th className="px-2 py-2">Latitude</th>
              <th className="px-2 py-2">Longitude</th>
              <th className="px-2 py-2">SOG</th>
              <th className="px-2 py-2">COG</th>
              <th className="px-2 py-2">Heading</th>
            </tr>
          </thead>

          <tbody>
            {log.length === 0 ? (
              <tr className="text-slate-500">
                <td colSpan={8} className="px-2 py-4 text-center">
                  Menunggu data...
                </td>
              </tr>
            ) : (
              log.map((row) => (
                <tr
                  key={`${row.seq}-${row.time}`}
                  className="border-b border-white/5 text-slate-300"
                >
                  <td className="px-2 py-2">{row.time}</td>
                  <td className="px-2 py-2">{fmt(row.x, 1)}</td>
                  <td className="px-2 py-2">{fmt(row.y, 1)}</td>
                  <td className="px-2 py-2">{fmt(row.lat, 6)}</td>
                  <td className="px-2 py-2">{fmt(row.lon, 6)}</td>
                  <td className="px-2 py-2">{fmt(row.sog_knot, 2)}</td>
                  <td className="px-2 py-2">{fmt(row.cog, 1)}</td>
                  <td className="px-2 py-2">{fmt(row.heading, 1)}</td>
                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default PositionLog;