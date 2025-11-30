// Utility functions

export const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export const deg2rad = (d: number) => d * Math.PI / 180;

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { width: w, height: h };
}

