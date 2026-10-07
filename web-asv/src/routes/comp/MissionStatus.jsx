const missions = [
  "Start",
  "Floating Ball",
  "Mission Surface",
  "Mission Underwater",
  "Docking",
];

// step = index misi yang sedang berjalan (0-4). null = belum ada data.
function MissionStatus({ step = null }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-slate-900 p-5">

      <h2 className="mb-5 shrink-0 text-lg font-semibold">
        Mission Status
      </h2>

      <div className="min-h-0 flex-1 overflow-y-auto space-y-3">

        {missions.map((mission, index) => {
          const done = step !== null && index < step;
          const active = step !== null && index === step;

          const circle = done
            ? "bg-emerald-500"
            : active
            ? "bg-blue-500 animate-pulse"
            : "bg-slate-700";

          return (
            <div key={mission} className="flex items-center gap-3">

              <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm ${circle}`}>
                {done ? "✓" : index + 1}
              </div>

              <p className={`text-sm ${active ? "font-semibold text-white" : "text-slate-300"}`}>
                {mission}
              </p>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default MissionStatus;