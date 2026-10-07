function CaptureSurface() {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-slate-900 p-4">

      <h2 className="mb-3 shrink-0 text-lg font-semibold">
        Capture Surface
      </h2>

      <div className="min-h-0 flex-1 rounded-lg bg-black border border-white/10 flex items-center justify-center overflow-hidden">

        <p className="text-sm text-slate-500">
          Surface Camera
        </p>

      </div>

    </div>
  );
}

export default CaptureSurface;