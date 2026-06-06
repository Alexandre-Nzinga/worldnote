import { useEffect, useMemo, useState } from "react";

type LuminanceResult = {
  /** 0..1 (0=black, 1=white) */
  luminance: number | null;
  /** True when the image is dark enough to prefer light text. */
  isDark: boolean | null;
};

const DEFAULT_THRESHOLD = 0.48;
const SAMPLE_SIZE = 32;

const cache = new Map<string, number>();

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function srgbToLinear(channel01: number) {
  // WCAG relative luminance conversion
  return channel01 <= 0.04045
    ? channel01 / 12.92
    : ((channel01 + 0.055) / 1.055) ** 2.4;
}

async function computeLuminance(src: string): Promise<number | null> {
  if (!src) return null;
  const cached = cache.get(src);
  if (cached != null) return cached;

  // Loading into a canvas can fail (tainted canvas / cross-origin). In that
  // case, we return null and let callers fall back.
  try {
    const img = new Image();
    // Best-effort: may be ignored for file:// / asset://
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.loading = "eager";

    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = src;
    });

    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(loaded, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

    let sum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = (data[i + 3] ?? 255) / 255;
      if (a < 0.05) continue;
      const r = srgbToLinear((data[i] ?? 0) / 255);
      const g = srgbToLinear((data[i + 1] ?? 0) / 255);
      const b = srgbToLinear((data[i + 2] ?? 0) / 255);
      // Relative luminance (linear)
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sum += y;
      count += 1;
    }

    const luminance = clamp01(count > 0 ? sum / count : 0.5);
    cache.set(src, luminance);
    return luminance;
  } catch {
    return null;
  }
}

export function useImageLuminance(
  src: string | undefined,
  options?: { threshold?: number; enabled?: boolean },
): LuminanceResult {
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;
  const enabled = options?.enabled ?? true;
  const [luminance, setLuminance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLuminance(null);

    if (!src || !enabled) {
      return;
    }

    void computeLuminance(src).then((result) => {
      if (!cancelled) {
        setLuminance(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, src]);

  return useMemo(() => {
    if (luminance == null) {
      return { luminance: null, isDark: null };
    }
    return { luminance, isDark: luminance < threshold };
  }, [luminance, threshold]);
}
