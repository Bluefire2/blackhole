// Utility functions

export const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export const deg2rad = (d: number) => d * Math.PI / 180;

// Global render scale (0.25–1). 1 = full resolution, lower = fewer pixels (faster).
let renderScale = 1;

export function setRenderScale(scale: number) {
  // Clamp to a reasonable range to avoid accidental extremes
  renderScale = clamp(scale, 0.25, 1);
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = Math.round(canvas.clientWidth * dpr * renderScale);
  const h = Math.round(canvas.clientHeight * dpr * renderScale);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { width: w, height: h };
}

