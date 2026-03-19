/**
 * SRP: Client-side journal video compression via canvas + MediaRecorder (target max byte size).
 */
const MAX_DIMENSION = 1280;
const MIN_VIDEO_BITRATE = 150_000;
const MAX_VIDEO_BITRATE = 5_000_000;
const FALLBACK_AUDIO_BITRATE = 96_000;
const COMPRESSION_HEADROOM = 0.92;
const BITRATE_ATTEMPT_FACTORS = [0.95, 0.75, 0.55];

export class JournalVideoUploadError extends Error {}

export async function compressVideoForUpload(
  file: File,
  maxBytes: number
): Promise<File> {
  if (!supportsVideoCompression()) {
    throw new JournalVideoUploadError(
      "Video is too large (max 50MB), and this browser cannot compress videos automatically."
    );
  }

  const duration = await getVideoDuration(file);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new JournalVideoUploadError(
      "Could not read video metadata for compression."
    );
  }

  const outputMimeType = getSupportedRecorderMimeType();
  if (!outputMimeType) {
    throw new JournalVideoUploadError(
      "Video is too large (max 50MB), and this browser does not support automatic video compression."
    );
  }
  const targetTotalBitrate = Math.max(
    MIN_VIDEO_BITRATE + FALLBACK_AUDIO_BITRATE,
    Math.floor((maxBytes * 8 * COMPRESSION_HEADROOM) / duration)
  );

  let bestResult: File | null = null;
  for (const factor of BITRATE_ATTEMPT_FACTORS) {
    const targetBitrate = clamp(
      Math.floor(targetTotalBitrate * factor),
      MIN_VIDEO_BITRATE,
      MAX_VIDEO_BITRATE
    );
    const audioBitrate = Math.min(FALLBACK_AUDIO_BITRATE, targetBitrate / 4);
    const videoBitrate = Math.max(
      MIN_VIDEO_BITRATE,
      targetBitrate - audioBitrate
    );

    try {
      const compressed = await transcodeWithMediaRecorder(file, {
        mimeType: outputMimeType,
        videoBitsPerSecond: Math.floor(videoBitrate),
        audioBitsPerSecond: Math.floor(audioBitrate),
      });

      if (!bestResult || compressed.size < bestResult.size) {
        bestResult = compressed;
      }

      if (compressed.size <= maxBytes) {
        return compressed;
      }
    } catch {
      // Continue to lower-quality attempts if an encoder setting fails.
    }
  }

  if (bestResult && bestResult.size <= maxBytes) {
    return bestResult;
  }

  throw new JournalVideoUploadError(
    "Video is too large (max 50MB) and could not be compressed enough automatically."
  );
}

function supportsVideoCompression(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined"
  );
}

function getSupportedRecorderMimeType(): string {
  const preferredMimeTypes = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (const mimeType of preferredMimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return "";
}

async function getVideoDuration(file: File): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.src = "";
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Could not load video metadata."));
    };
  });
}

interface TranscodeOptions {
  mimeType: string;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
}

interface VideoCaptureStreamElement extends HTMLVideoElement {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
}

async function transcodeWithMediaRecorder(
  file: File,
  options: TranscodeOptions
): Promise<File> {
  return await new Promise<File>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = objectUrl;
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    let animationFrameId: number | null = null;
    let stopTimeoutId: number | null = null;
    let recorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let settled = false;

    const cleanup = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (stopTimeoutId !== null) {
        window.clearTimeout(stopTimeoutId);
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      video.pause();
      video.src = "";
      URL.revokeObjectURL(objectUrl);
    };

    const rejectOnce = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    const resolveOnce = (output: File) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(output);
    };

    const stopRecorderSafely = () => {
      if (!recorder || recorder.state === "inactive") return;
      try {
        recorder.requestData();
      } catch {
        // requestData is optional; continue to stop.
      }
      window.setTimeout(() => {
        if (!recorder || recorder.state === "inactive") return;
        recorder.stop();
      }, 120);
    };

    video.onerror = () => {
      rejectOnce("Could not decode video for compression.");
    };

    video.onloadedmetadata = async () => {
      const { width, height } = getScaledDimensions(
        video.videoWidth || 1280,
        video.videoHeight || 720
      );
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        rejectOnce("Could not create compression canvas.");
        return;
      }

      stream = canvas.captureStream(30);
      if (!stream) {
        rejectOnce("Could not create compression stream.");
        return;
      }

      try {
        const sourceVideo = video as VideoCaptureStreamElement;
        const sourceStream =
          sourceVideo.captureStream?.() ?? sourceVideo.mozCaptureStream?.();
        if (sourceStream) {
          sourceStream
            .getAudioTracks()
            .forEach((track: MediaStreamTrack) => stream?.addTrack(track));
        }
      } catch {
        // Audio capture may fail in some browsers; continue with video-only output.
      }

      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond: options.videoBitsPerSecond,
        audioBitsPerSecond: options.audioBitsPerSecond,
      };
      if (options.mimeType) {
        recorderOptions.mimeType = options.mimeType;
      }

      try {
        recorder = new MediaRecorder(stream, recorderOptions);
      } catch {
        rejectOnce("Could not initialize video compressor.");
        return;
      }

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onerror = () => {
        rejectOnce("Video compression failed.");
      };
      recorder.onstop = () => {
        const resolvedMimeType =
          recorder?.mimeType || options.mimeType || "video/webm";
        const outputBlob = new Blob(chunks, { type: resolvedMimeType });
        if (outputBlob.size === 0) {
          rejectOnce("Video compression produced an empty file.");
          return;
        }
        const extension = resolvedMimeType.includes("webm") ? "webm" : "mp4";
        const outputName = replaceFileExtension(file.name, extension);
        const output = new File([outputBlob], outputName, {
          type: resolvedMimeType,
        });
        resolveOnce(output);
      };

      const drawFrame = () => {
        context.drawImage(video, 0, 0, width, height);
        if (!video.paused && !video.ended) {
          animationFrameId = requestAnimationFrame(drawFrame);
        }
      };

      video.onended = () => {
        stopRecorderSafely();
      };

      recorder.start(1000);
      drawFrame();
      const fallbackStopMs = Math.max(
        7_000,
        Math.ceil(
          (Number.isFinite(video.duration) ? video.duration : 120) * 1000
        ) + 4_000
      );
      stopTimeoutId = window.setTimeout(() => {
        stopRecorderSafely();
      }, fallbackStopMs);

      try {
        await video.play();
      } catch {
        rejectOnce("Could not start video playback for compression.");
      }
    };
  });
}

function getScaledDimensions(
  width: number,
  height: number
): {
  width: number;
  height: number;
} {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { width, height };
  }

  const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
  return {
    width: Math.max(2, Math.floor(width * scale)),
    height: Math.max(2, Math.floor(height * scale)),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function replaceFileExtension(fileName: string, extension: string): string {
  const lastDot = fileName.lastIndexOf(".");
  const baseName = lastDot === -1 ? fileName : fileName.slice(0, lastDot);
  return `${baseName}.${extension}`;
}
