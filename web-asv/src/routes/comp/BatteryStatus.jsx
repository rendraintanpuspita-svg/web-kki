// pct: persentase (0–100), voltage: voltase (V)
function BatteryStatus({ battery }) {
  const pct     = battery?.pct     ?? 0;
  const voltage = battery?.voltage ?? 0;

  // Warna bar: hijau → kuning → merah
  const barColor =
    pct > 50 ? "bg-emerald-400" :
    pct > 20 ? "bg-yellow-400"  :
               "bg-red-500";

  return (
    <div className="h-full rounded-xl border border-white/10 bg-slate-900 p-5">

      <h2 className="text-lg font-semibold">
        Battery Status
      </h2>

      <div className="mt-4">
        <p className="text-4xl font-bold">
          {pct > 0 ? `${pct.toFixed(1)}%` : "–"}
        </p>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-700">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-400">
        <span>Voltage</span>
        <span>{voltage > 0 ? `${voltage.toFixed(2)} V` : "– V"}</span>
      </div>

    </div>
  );
}

export default BatteryStatus;