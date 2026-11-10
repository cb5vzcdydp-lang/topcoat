import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException, ChecksumException, FormatException } from "@zxing/library";

const formats = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E];

type ScannerOptions = {
  video: HTMLVideoElement;
  onCode: (code: string) => void;
  onReady: (track: MediaStreamTrack) => void;
  onError: (message: string) => void;
};

/** Own the stream and frame loop together so a decoder failure cannot leave a dead preview. */
export function startBarcodeScanner({ video, onCode, onReady, onError }: ScannerOptions) {
  let stopped = false;
  let stream: MediaStream | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const reader = new BrowserMultiFormatReader(new Map<DecodeHintType, unknown>([
    [DecodeHintType.POSSIBLE_FORMATS, formats],
    [DecodeHintType.TRY_HARDER, true],
  ]));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  let rotated = false;

  function stop() {
    stopped = true;
    clearTimeout(timer);
    stream?.getTracks().forEach(track => track.stop());
    if (stream && video.srcObject === stream) {
      video.pause();
      video.srcObject = null;
    }
  }

  async function start() {
    try {
      if (!navigator.mediaDevices?.getUserMedia || !context) {
        throw new Error("Camera scanning is unavailable in this browser. Enter the barcode below.");
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      // Permissions can resolve after the user closes the scanner.
      if (stopped) { stop(); return; }
      const track = stream.getVideoTracks()[0];
      track.addEventListener("ended", () => {
        if (stopped) return;
        stop();
        onError("The camera disconnected. Restart the scanner or enter the barcode below.");
      }, { once: true });
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await video.play();
      if (stopped) { stop(); return; }
      onReady(track);

      // Native support varies across mobile browsers. ZXing always remains available.
      let detector: { detect: (source: HTMLCanvasElement) => Promise<{ rawValue: string }[]> } | undefined;
      const Detector = (window as any).BarcodeDetector;
      if (Detector) {
        void Promise.resolve().then(async () => {
          const supported: string[] = await Detector.getSupportedFormats();
          const retail = supported.filter(f => ["ean_13", "ean_8", "upc_a", "upc_e"].includes(f));
          if (!stopped && retail.length) detector = new Detector({ formats: retail });
        }).catch(() => { /* The bundled decoder handles unsupported native formats. */ });
      }

      let frameFailures = 0;
      let decoderFailures = 0;
      async function scanFrame() {
        if (stopped) return;
        if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
          try {
            // Alternate orientation so a vertical barcode also reads in portrait mode.
            const width = video.videoWidth, height = video.videoHeight;
            canvas.width = rotated ? height : width;
            canvas.height = rotated ? width : height;
            context!.save();
            if (rotated) { context!.translate(height, 0); context!.rotate(Math.PI / 2); }
            context!.drawImage(video, 0, 0, width, height);
            context!.restore();
            rotated = !rotated;
            frameFailures = 0;
          } catch {
            if (++frameFailures >= 10) {
              stop(); onError("The camera frames could not be read. Restart the scanner or enter the barcode below."); return;
            }
            timer = setTimeout(scanFrame, 150); return;
          }
          let code: string | undefined;
          try { code = reader.decodeFromCanvas(canvas).getText(); decoderFailures = 0; }
          catch (error) {
            // A missing/blurred barcode is normal; a broken decoder must be visible.
            if (error instanceof NotFoundException || error instanceof ChecksumException || error instanceof FormatException) decoderFailures = 0;
            else decoderFailures++;
          }
          if (!code && detector) {
            try {
              const active = detector;
              // A broken native detector must never stall the fallback scan loop.
              const codes = await Promise.race([
                active.detect(canvas),
                new Promise<null>(resolve => setTimeout(() => resolve(null), 200)),
              ]);
              if (codes === null) detector = undefined;
              else code = codes.find(c => /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(c.rawValue))?.rawValue;
            } catch { detector = undefined; }
          }
          if (stopped) return;
          if (code && /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) {
            stop();
            onCode(code);
            return;
          }
          if (decoderFailures >= 10 && !detector) {
            stop(); onError("Barcode decoding could not continue. Restart the scanner or enter the barcode below."); return;
          }
        }
        timer = setTimeout(scanFrame, 150);
      }
      void scanFrame();
    } catch (error) {
      if (stopped) return;
      stop();
      const name = (error as Error).name;
      onError(name === "NotAllowedError"
        ? "Camera access was denied. Allow camera access in your browser settings, or enter the barcode below."
        : name === "NotFoundError"
          ? "No camera was found. Enter the barcode below."
          : "The camera could not start. Close other camera apps and try again, or enter the barcode below.");
    }
  }
  void start();
  return stop;
}
