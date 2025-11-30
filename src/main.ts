// Main entry point
/// <reference types="@webgpu/types" />

import { createCamera } from './camera';
import { initWebGPU } from './webgpu-setup';
import { startRenderLoop } from './renderer';
import { Overlay } from './overlay';

async function main() {
  const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

  if (!canvas) {
    throw new Error("gpu-canvas not found");
  }

  // Create overlay manager
  const overlay = new Overlay();
  overlay.setText("Initializing...");

  // Create camera and set up controls
  const camera = createCamera(canvas);

  // Initialize WebGPU
  const resources = await initWebGPU(canvas, overlay);

  // Start render loop
  startRenderLoop(canvas, overlay, resources, camera);
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
