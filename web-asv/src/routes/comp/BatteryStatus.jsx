function BatteryStatus() {
  return (
    <div className="h-full rounded-xl border border-white/10 bg-slate-900 p-5">

      <h2 className="text-lg font-semibold">
        Battery Status
      </h2>

      <div className="mt-6">
        <p className="text-4xl font-bold">
          -
        </p>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-700">
        <div
          className="h-2 rounded-full bg-emerald-400"
          style={{ width: "0%" }}
        />
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-400">
        <span>Voltage</span>
        <span> V</span>
      </div>

    </div>
  );
}

export default BatteryStatus;