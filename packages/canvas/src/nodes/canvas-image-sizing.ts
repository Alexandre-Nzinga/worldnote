export const CANVAS_IMAGE_DEFAULT_WIDTH = 320;
export const CANVAS_IMAGE_DEFAULT_HEIGHT = 240;
export const CANVAS_IMAGE_MIN_WIDTH = 128;
export const CANVAS_IMAGE_MIN_HEIGHT = 96;
export const CANVAS_IMAGE_MAX_WIDTH = 720;
export const CANVAS_IMAGE_MAX_HEIGHT = 540;

export function canvasImageNodeStyle(
  width?: number,
  height?: number,
): { width: number; height: number } {
  return {
    width: width ?? CANVAS_IMAGE_DEFAULT_WIDTH,
    height: height ?? CANVAS_IMAGE_DEFAULT_HEIGHT,
  };
}

/** Fit node bounds to the image aspect ratio, clamped to min/max canvas image size. */
export function canvasImageNodeStyleForNaturalSize(
  naturalWidth: number,
  naturalHeight: number,
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return canvasImageNodeStyle();
  }

  const aspect = naturalWidth / naturalHeight;
  let width = Math.min(naturalWidth, CANVAS_IMAGE_MAX_WIDTH);
  let height = width / aspect;

  if (height > CANVAS_IMAGE_MAX_HEIGHT) {
    height = CANVAS_IMAGE_MAX_HEIGHT;
    width = height * aspect;
  }
  if (width < CANVAS_IMAGE_MIN_WIDTH) {
    width = CANVAS_IMAGE_MIN_WIDTH;
    height = width / aspect;
  }
  if (height < CANVAS_IMAGE_MIN_HEIGHT) {
    height = CANVAS_IMAGE_MIN_HEIGHT;
    width = height * aspect;
  }

  return { width: Math.round(width), height: Math.round(height) };
}
