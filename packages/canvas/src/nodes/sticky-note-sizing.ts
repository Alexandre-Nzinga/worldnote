export const STICKY_NOTE_DEFAULT_WIDTH = 280;
export const STICKY_NOTE_DEFAULT_HEIGHT = 160;
export const STICKY_NOTE_MIN_WIDTH = 180;
export const STICKY_NOTE_MIN_HEIGHT = 120;
export const STICKY_NOTE_MAX_WIDTH = 560;
export const STICKY_NOTE_MAX_HEIGHT = 480;

export function stickyNoteNodeStyle(
  width?: number,
  height?: number,
): { width: number; height: number } {
  return {
    width: width ?? STICKY_NOTE_DEFAULT_WIDTH,
    height: height ?? STICKY_NOTE_DEFAULT_HEIGHT,
  };
}
