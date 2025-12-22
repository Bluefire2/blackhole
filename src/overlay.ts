// Overlay UI management

export interface OverlayMetrics {
  fps?: number;
  resolution?: string;
  pitch?: number;
  yaw?: number;
  roll?: number;
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
    // Generate structured HTML for HUD layout
    let html = '';

    // Helper to create a row
    const row = (label: string, value: string, unit: string = '', valueClass: string = '') => {
      return `
        <div class="overlay-row">
          <span class="overlay-label">${label}</span>
          <span>
            <span class="overlay-value ${valueClass}">${value}</span>
            ${unit ? `<span class="overlay-unit">${unit}</span>` : ''}
          </span>
        </div>`;
    };

    // Helper to create a section
    const section = (title: string, content: string) => {
      if (!content) return '';
      return `
        <div class="overlay-section">
          <div class="overlay-section-title">${title}</div>
          ${content}
        </div>`;
    };

    // --- SYSTEM ---
    let systemContent = '';
    if (metrics.fps !== undefined) systemContent += row('FPS', metrics.fps.toFixed(1));
    if (metrics.time !== undefined) systemContent += row('Sim Time', metrics.time.toFixed(1), 's');
    if (metrics.resolution) systemContent += row('Res', metrics.resolution);
    if (metrics.maxRaySteps !== undefined) systemContent += row('Max Steps', metrics.maxRaySteps.toString());
    html += section('System', systemContent);

    // --- CAMERA ---
    let cameraContent = '';
    if (metrics.fov !== undefined) cameraContent += row('FOV', (metrics.fov * 180 / Math.PI).toFixed(1), '°');
    if (metrics.pitch !== undefined) cameraContent += row('Pitch', metrics.pitch.toFixed(1), '°');
    if (metrics.yaw !== undefined) cameraContent += row('Yaw', metrics.yaw.toFixed(1), '°');
    if (metrics.roll !== undefined) cameraContent += row('Roll', metrics.roll.toFixed(1), '°');
    html += section('Camera', cameraContent);

    // --- POSITION ---
    let posContent = '';
    if (metrics.distance !== undefined) posContent += row('Distance', metrics.distance.toFixed(2), 'Rₛ');
    if (metrics.distanceToHorizon !== undefined) {
      const val = metrics.distanceToHorizon;
      let style = '';
      if (val < 0.1) style = 'danger';
      else if (val < 0.5) style = 'warning';
      posContent += row('Dist to Horizon', val.toFixed(3), 'Rₛ', style);
    }
    html += section('Position', posContent);

    // --- PHYSICS ---
    let physicsContent = '';
    if (metrics.metric) {
      let metricDisplay = metrics.metric;
      if (metricDisplay === 'Schwarzschild') {
        metricDisplay = '<a href="https://jila.colorado.edu/~ajsh/bh/schwp.html" target="_blank" rel="noopener noreferrer">Schwarzschild</a>';
      }
      physicsContent += row('Metric', metricDisplay);
    }
    if (metrics.orbitalVelocity !== undefined) physicsContent += row('Orbital Vel', metrics.orbitalVelocity.toFixed(3), 'c');
    if (metrics.gForce !== undefined) physicsContent += row('Local g', metrics.gForce.toFixed(3), 'c²/Rₛ');
    if (metrics.timeDilation !== undefined) physicsContent += row('Time Dilation', metrics.timeDilation.toFixed(4));
    if (metrics.redshift !== undefined) {
      if (isFinite(metrics.redshift)) {
        physicsContent += row('Redshift z', (metrics.redshift >= 0 ? '+' : '') + metrics.redshift.toFixed(4));
      } else {
        physicsContent += row('Redshift z', '∞');
      }
    }
    html += section('Physics', physicsContent);

    this.element.innerHTML = html;
    // Remove direct style setting so CSS takes over
    this.element.style.color = '';
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}

