// base64Img: string base64 JPEG dari /asv/video1
function VideoStreaming({ base64Img }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-slate-900 p-4">

      <h2 className="mb-3 shrink-0 text-lg font-semibold">
        Video Streaming
      </h2>

      <div className="min-h-0 flex-1 rounded-lg bg-black border border-white/10 flex items-center justify-center overflow-hidden">

        {base64Img ? (
          <img
            src={`data:image/jpeg;base64,${base64Img}`}
            alt="Video stream"
            className="h-full w-full object-contain"
          />
        ) : (
          <p className="text-sm text-slate-500">
            Menunggu video stream...
          </p>
        )}

      </div>

    </div>
  );
}

export default VideoStreaming;