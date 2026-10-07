const fmt = (value, digits) =>
  value === undefined || value === null ? "-" : Number(value).toFixed(digits);

function Geotag({ data }) {
  const telemetry = [
    ["Date", data?.date ?? "-"],
    ["Time", data?.time ?? "-"],
    ["Latitude", fmt(data?.lat, 6)],
    ["Longitude", fmt(data?.lon, 6)],
    ["Position X", fmt(data?.x, 1)],
    ["Position Y", fmt(data?.y, 1)],
    ["SOG (Knot)", fmt(data?.sog_knot, 2)],
    ["SOG (KM/H)", fmt(data?.sog_kmh, 2)],
    ["COG", fmt(data?.cog, 1)],
    ["Heading", fmt(data?.heading, 1)],
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 p-5">

      <h2 className="text-lg font-semibold mb-5">
        Geotag & Telemetry
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

        {telemetry.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-slate-400">
              {label}
            </p>

            <p className="mt-1 text-sm font-medium">
              {value}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}

export default Geotag;