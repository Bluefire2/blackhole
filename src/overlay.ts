// Overlay UI management

export interface OverlayMetrics {
  fps?: number;
  resolution?: string;
  pitch?: number;
  yaw?: number;
  distance?: number;
  time?: number;
  distanceToHorizon?: number;
  orbitalVelocity?: number;
  fov?: number;
  maxRaySteps?: number;
}

export class Overlay {
  private element: HTMLDivElement;

  constructor(elementId: string = 'overlay') {
    const el = document.getElementById(elementId);
    if (!el) {
      throw new Error(`Overlay element with id "${elementId}" not found`);
    }
    this.element = el as HTMLDivElement;
  }

  setText(text: string): void {
    this.element.textContent = text;
  }

  setError(message: string): void {
    this.element.textContent = `Error: ${message}`;
    this.element.style.color = '#f00';
  }

  setInfo(message: string): void {
    this.element.textContent = message;
    this.element.style.color = '#0f0';
  }

  setMetrics(metrics: OverlayMetrics): void {
    const lines: string[] = [];
    
    // Line 1: Basic info
    const basicInfo: string[] = [];
    if (metrics.resolution) basicInfo.push(metrics.resolution);
    if (metrics.pitch !== undefined) basicInfo.push(`Pitch: ${metrics.pitch.toFixed(1)}°`);
    if (metrics.yaw !== undefined) basicInfo.push(`Yaw: ${metrics.yaw.toFixed(1)}°`);
    if (metrics.distance !== undefined) basicInfo.push(`Dist: ${metrics.distance.toFixed(1)} RS`);
    if (basicInfo.length > 0) lines.push(basicInfo.join(' | '));

    // Line 2: Physics metrics
    const physicsInfo: string[] = [];
    if (metrics.distanceToHorizon !== undefined) {
      physicsInfo.push(`Dist to Horizon: ${metrics.distanceToHorizon.toFixed(2)} RS`);
    }
    if (metrics.orbitalVelocity !== undefined) {
      physicsInfo.push(`Orbital v: ${metrics.orbitalVelocity.toFixed(3)} RS/s`);
    }
    if (metrics.fov !== undefined) {
      physicsInfo.push(`FOV: ${(metrics.fov * 180 / Math.PI).toFixed(1)}°`);
    }
    if (physicsInfo.length > 0) lines.push(physicsInfo.join(' | '));

    // Line 3: Performance & simulation
    const perfInfo: string[] = [];
    if (metrics.fps !== undefined) {
      perfInfo.push(`FPS: ${metrics.fps.toFixed(1)}`);
    }
    if (metrics.maxRaySteps !== undefined) {
      perfInfo.push(`Max Steps: ${metrics.maxRaySteps}`);
    }
    if (metrics.time !== undefined) {
      perfInfo.push(`Time: ${metrics.time.toFixed(1)}s`);
    }
    if (perfInfo.length > 0) lines.push(perfInfo.join(' | '));

    this.element.innerHTML = lines.join('<br>');
    this.element.style.color = '#0f0';
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}

