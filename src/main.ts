// Main entry point
/// <reference types="@webgpu/types" />

import { createCamera } from './camera';
import { initWebGPU } from './webgpu-setup';
import { startRenderLoop, setStepScale, setUseNoiseTexture, setMetric, type MetricType } from './renderer';
import { Overlay } from './overlay';
import { setRenderScale } from './utils';

async function main() {
  const canvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;

  if (!canvas) {
    throw new Error('gpu-canvas not found');
  }

  // Create overlay manager
  const overlay = new Overlay();
  overlay.setText('Initializing...');

  // Hook up performance-related UI sliders if present
  const renderScaleInput = document.getElementById('render-scale') as HTMLInputElement | null;
  const renderScaleValue = document.getElementById('render-scale-value') as HTMLSpanElement | null;

  if (renderScaleInput && renderScaleValue) {
    const applyRenderScale = (value: number) => {
      if (Number.isFinite(value)) {
        setRenderScale(value);
        renderScaleValue.textContent = `${Math.round(value * 100)}%`;
      }
    };

    const initial = Number(renderScaleInput.value || '1');
    applyRenderScale(initial);

    renderScaleInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const v = Number(target.value);
      applyRenderScale(v);
    });
  }

  const stepScaleInput = document.getElementById('step-scale') as HTMLInputElement | null;
  const stepScaleValue = document.getElementById('step-scale-value') as HTMLSpanElement | null;

  if (stepScaleInput && stepScaleValue) {
    const applyStepScale = (value: number) => {
      if (Number.isFinite(value)) {
        setStepScale(value);
        stepScaleValue.textContent = `${value.toFixed(1)}×`;
      }
    };

    const initial = Number(stepScaleInput.value || '1');
    applyStepScale(initial);

    stepScaleInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const v = Number(target.value);
      applyStepScale(v);
    });
  }

  const noiseTextureInput = document.getElementById('use-noise-texture') as HTMLInputElement | null;
  if (noiseTextureInput) {
    // Import dynamically to avoid circular dependency if needed, or just use the imported function
    // We already imported setUseNoiseTexture? No, we need to import it.
    // I'll assume I need to add it to the import list at the top first.
    // Wait, I can't edit imports here easily without replacing the whole file or top chunk.
    // I'll just add the listener here and update imports in a separate step if needed.
    // Actually, I should check if I imported it. I didn't.
    // I will add the listener code here, and then update the import.

    noiseTextureInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      setUseNoiseTexture(target.checked);
    });
  }

  // --- Metric & Spin Controls ---
  // Replaced select with radio buttons: name='metric'
  const spinSlider = document.getElementById('spin-slider') as HTMLInputElement | null;
  const spinValue = document.getElementById('spin-value') as HTMLSpanElement | null;
  const spinRow = document.getElementById('spin-row') as HTMLDivElement | null;
  const metricInputs = document.querySelectorAll('input[name="metric"]');

  if (spinSlider && spinValue && spinRow && metricInputs.length > 0) {
    const update = () => {
      // Find checked radio
      let metric: MetricType = 'Schwarzschild';
      for (const input of metricInputs) {
        if ((input as HTMLInputElement).checked) {
          metric = (input as HTMLInputElement).value as MetricType;
        }
      }

      const spin = Number(spinSlider.value);

      setMetric(metric, spin);

      // Update UI state
      spinValue.textContent = spin.toFixed(2);
      if (metric === 'Kerr') {
        spinRow.style.display = 'grid';
      } else {
        spinRow.style.display = 'none';
      }
    };

    // Initial state
    update();

    // Listen to changes on all radio buttons
    metricInputs.forEach(input => {
      input.addEventListener('change', update);
    });
    spinSlider.addEventListener('input', update);
  }

  // Handle interaction hint and cursor
  const interactionHint = document.getElementById('interaction-hint');
  const dismissHint = () => {
    if (interactionHint) {
      interactionHint.classList.add('fade-out');
      setTimeout(() => interactionHint.remove(), 500); // Remove after transition
    }
    // Remove listeners after first use
    window.removeEventListener('mousedown', dismissHint);
    window.removeEventListener('touchstart', dismissHint);
    window.removeEventListener('keydown', dismissHint);
  };

  window.addEventListener('mousedown', dismissHint);
  window.addEventListener('touchstart', dismissHint);
  window.addEventListener('keydown', dismissHint);

  // Cursor state
  canvas.addEventListener('mousedown', () => canvas.classList.add('grabbing'));
  canvas.addEventListener('mouseup', () => canvas.classList.remove('grabbing'));
  canvas.addEventListener('mouseleave', () => canvas.classList.remove('grabbing'));

  // Create camera and set up controls
  const camera = createCamera(canvas);

  // Initialize WebGPU
  const resources = await initWebGPU(canvas, overlay);

  // Start render loop
  await startRenderLoop(canvas, overlay, resources, camera);
}

// Wait for DOM to be ready
function handleError(err: any) {
  console.error('Initialization error:', err);
  try {
    const overlay = new Overlay();
    const errorMsg = err instanceof Error ? err.message : String(err);
    overlay.setError(`Init error: ${errorMsg}`);
  } catch {
    // If overlay can't be created, at least log to console
    console.error('Failed to create overlay for error display');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    main().catch(handleError);
  });
} else {
  main().catch(handleError);
}
