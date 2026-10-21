/**
 * CaptureUnderwater.jsx
 * =====================
 * Menampilkan gambar hasil capture kamera underwater.
 *
 * Props:
 *   src       : string — URL gambar (dari useCaptureImages hook)
 *               Contoh: http://IP:2601/images/ubox1.jpg?t=1234567890
 *   base64Img : string — fallback base64 dari rosbridge (opsional)
 *
 * Prioritas: src > base64Img > placeholder
 */

const FALLBACK = '/underwater.jpg';

function CaptureUnderwater({ src, base64Img }) {
  const imgSrc = src
    ? src
    : base64Img
    ? `data:image/jpeg;base64,${base64Img}`
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-slate-900 p-4">

      <h2 className="mb-3 shrink-0 text-lg font-semibold">
        Capture Underwater
      </h2>

      <div className="min-h-0 flex-1 rounded-lg bg-black border border-white/10
                      flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt="Underwater capture"
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK;
            }}
          />
        ) : (
          <p className="text-sm text-slate-500">
            Menunggu gambar underwater...
          </p>
        )}
      </div>

    </div>
  );
}

export default CaptureUnderwater;