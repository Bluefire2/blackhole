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
  spin?: number;
  frameDragOmega?: number;
}

export class Overlay {
  private element: HTMLDivElement;
  private contentElement: HTMLDivElement;
  private toggleBtn: HTMLButtonElement;
  private collapsed: boolean = false;

  // Persistent containers for each section
  private sectionSystem: HTMLDivElement;
  private sectionCamera: HTMLDivElement;
  private sectionPosition: HTMLDivElement;
  private sectionPhysics: HTMLDivElement;

  // Cache for last rendered HTML content to avoid unnecessary DOM updates
  private lastHtmlSystem: string = '';
  private lastHtmlCamera: string = '';
  private lastHtmlPosition: string = '';
  private lastHtmlPhysics: string = '';

  constructor(elementId: string = 'overlay') {
    const el = document.getElementById(elementId);
    if (!el) {
      throw new Error(`Overlay element with id "${elementId}" not found`);
    }
    this.element = el as HTMLDivElement;

    // Initialize the fixed structure
    // Added a small gap to overlay-content via inline style for cleaner separation
    this.element.innerHTML = `
      <div id="overlay-header">
        <span style="color: rgba(0,255,255,0.7); font-size: 0.8em; letter-spacing: 2px;">HUD</span>
        <button class="overlay-toggle-btn">HIDE</button>
      </div>
      <div id="overlay-content" style="display: flex; flex-direction: column; gap: 4px;"></div>
    `;

    this.contentElement = this.element.querySelector('#overlay-content') as HTMLDivElement;
    this.toggleBtn = this.element.querySelector('.overlay-toggle-btn') as HTMLButtonElement;

    // Initialize section containers
    this.sectionSystem = document.createElement('div');
    this.sectionCamera = document.createElement('div');
    this.sectionPosition = document.createElement('div');
    this.sectionPhysics = document.createElement('div');

    this.contentElement.appendChild(this.sectionSystem);
    this.contentElement.appendChild(this.sectionCamera);
    this.contentElement.appendChild(this.sectionPosition);
    this.contentElement.appendChild(this.sectionPhysics);

    this.toggleBtn.addEventListener('click', () => this.toggle());
  }

  private toggle(): void {
    this.collapsed = !this.collapsed;
    this.element.classList.toggle('collapsed', this.collapsed);
    this.toggleBtn.textContent = this.collapsed ? 'SHOW' : 'HIDE';
  }

  setText(text: string): void {
    // For simple text updates, just clear custom sections and show text in system section
    this.sectionSystem.textContent = text;
    this.sectionCamera.innerHTML = '';
    this.sectionPosition.innerHTML = '';
    this.sectionPhysics.innerHTML = '';
  }

  setError(message: string): void {
    this.sectionSystem.innerHTML = `<div style="color: #f00">Error: ${message}</div>`;
  }

  setInfo(message: string): void {
    this.sectionSystem.innerHTML = `<div style="color: #0f0">${message}</div>`;
  }

  /**
   * Updates a specific section container. Only writes to DOM if content changed.
   */
  private updateSection(
    container: HTMLDivElement,
    title: string,
    content: string,
    lastHtml: string,
  ): string {
    if (!content) {
      if (container.style.display !== 'none') {
        container.style.display = 'none';
        container.innerHTML = '';
      }
      return '';
    }

    // Wrap content in the standard section structure
    const newHtml = `
      <div class="overlay-section">
        <div class="overlay-section-title">${title}</div>
        ${content}
      </div>`;

    if (newHtml !== lastHtml) {
      container.innerHTML = newHtml;
      container.style.display = 'block';
      return newHtml;
    }

    // Ensure it's visible if it exists (in case it was hidden)
    if (container.style.display === 'none') {
      container.style.display = 'block';
    }

    return lastHtml;
  }

  setMetrics(metrics: OverlayMetrics): void {
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

    // --- SYSTEM ---
    let systemContent = '';
    if (metrics.fps !== undefined) systemContent += row('FPS', metrics.fps.toFixed(1));
    if (metrics.time !== undefined) systemContent += row('Sim Time', metrics.time.toFixed(1), 's');
    if (metrics.resolution) systemContent += row('Res', metrics.resolution);
    if (metrics.maxRaySteps !== undefined) systemContent += row('Max Steps', metrics.maxRaySteps.toString());

    this.lastHtmlSystem = this.updateSection(
      this.sectionSystem, 'System', systemContent, this.lastHtmlSystem,
    );

    // --- CAMERA ---
    let cameraContent = '';
    if (metrics.fov !== undefined) cameraContent += row('FOV', (metrics.fov * 180 / Math.PI).toFixed(1), '°');
    if (metrics.pitch !== undefined) cameraContent += row('Pitch', metrics.pitch.toFixed(1), '°');
    if (metrics.yaw !== undefined) cameraContent += row('Yaw', metrics.yaw.toFixed(1), '°');
    if (metrics.roll !== undefined) cameraContent += row('Roll', metrics.roll.toFixed(1), '°');

    this.lastHtmlCamera = this.updateSection(
      this.sectionCamera, 'Camera', cameraContent, this.lastHtmlCamera,
    );

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

    this.lastHtmlPosition = this.updateSection(
      this.sectionPosition, 'Position', posContent, this.lastHtmlPosition,
    );

    // --- PHYSICS ---
    let physicsContent = '';
    if (metrics.metric) {
      let metricDisplay = metrics.metric;
      // Note: Because we only update DOM when string changes, these links will persist
      // long enough to be clickable unless metric/state changes rapidly.
      if (metricDisplay === 'Schwarzschild') {
        metricDisplay = '<a href="https://en.wikipedia.org/wiki/Schwarzschild_metric" target="_blank" rel="noopener noreferrer">Schwarzschild</a>';
      } else if (metricDisplay === 'Kerr') {
        metricDisplay = '<a href="https://en.wikipedia.org/wiki/Kerr_metric" target="_blank" rel="noopener noreferrer">Kerr</a>';
      }
      physicsContent += row('Metric', metricDisplay);
      if (metrics.frameDragOmega !== undefined) {
        physicsContent += row('Frame Drag Ω', metrics.frameDragOmega.toFixed(4), 'rad/s');
      }
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

    this.lastHtmlPhysics = this.updateSection(
      this.sectionPhysics, 'Physics', physicsContent, this.lastHtmlPhysics,
    );
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}

