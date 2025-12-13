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
  gForce?: number;
  fov?: number;
  maxRaySteps?: number;
  timeDilation?: number;
  redshift?: number;
  metric?: string;
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
    if (metrics.fov !== undefined) {
      basicInfo.push(`FOV: ${(metrics.fov * 180 / Math.PI).toFixed(1)}°`);
    }
    if (metrics.pitch !== undefined) basicInfo.push(`Pitch: ${metrics.pitch.toFixed(1)}°`);
    if (metrics.yaw !== undefined) basicInfo.push(`Yaw: ${metrics.yaw.toFixed(1)}°`);
    if (metrics.distance !== undefined) basicInfo.push(`Dist: ${metrics.distance.toFixed(1)} Rₛ`);
    if (basicInfo.length > 0) lines.push(basicInfo.join(' | '));

    // Line 2: Physics metrics
    const physicsInfo: string[] = [];
    if (metrics.metric) {
      physicsInfo.push(`Metric: ${metrics.metric}`);
    }
    if (metrics.distanceToHorizon !== undefined) {
      physicsInfo.push(`Dist to Horizon: ${metrics.distanceToHorizon.toFixed(2)} Rₛ`);
    }
    if (metrics.orbitalVelocity !== undefined) {
      physicsInfo.push(`Orbital v: ${metrics.orbitalVelocity.toFixed(3)} c`);
    }
    if (physicsInfo.length > 0) lines.push(physicsInfo.join(' | '));

    // Line 3: Relativistic effects
    const relativisticInfo: string[] = [];
    if (metrics.gForce !== undefined) {
      relativisticInfo.push(`Local g: ${metrics.gForce.toFixed(3)} c²/Rₛ`);
    }
    if (metrics.timeDilation !== undefined) {
      relativisticInfo.push(`Time Dilation: ${metrics.timeDilation.toFixed(4)}`);
    }
    if (metrics.redshift !== undefined) {
      if (isFinite(metrics.redshift)) {
        relativisticInfo.push(`Redshift z: ${metrics.redshift >= 0 ? '+' : ''}${metrics.redshift.toFixed(4)}`);
      } else {
        relativisticInfo.push('Redshift z: ∞');
      }
    }
    if (relativisticInfo.length > 0) lines.push(relativisticInfo.join(' | '));

    // Line 4: Performance & simulation
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

