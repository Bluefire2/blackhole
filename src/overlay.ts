// Overlay UI management

export class Overlay {
  private element: HTMLDivElement;

  constructor(elementId: string = "overlay") {
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

  getElement(): HTMLDivElement {
    return this.element;
  }
}

