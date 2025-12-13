// Render loop and frame function

/// <reference types="@webgpu/types" />

import { resizeCanvasToDisplaySize } from './utils';
import { calculateCameraVectors } from './camera';
import type { CameraState } from './camera';
import { createPipeline } from './webgpu-setup';
import type { WebGPUResources } from './webgpu-setup';
import { Overlay } from './overlay';

// Whether to show ISCO/event horizon circles for debugging.
export const showDebugCircles = false;

// Ray marching step controls
const MAX_STEPS_HARD_LIMIT = 800;
const MIN_STEPS = 100;

let currentMaxSteps = 600;
let currentStepScale = 1;
let useNoiseTexture = true;

export function setMaxSteps(steps: number) {
  const clamped = Math.min(
    MAX_STEPS_HARD_LIMIT,
    Math.max(MIN_STEPS, Math.floor(steps)),
  );
  currentMaxSteps = clamped;
}

export function getMaxSteps() {
  return currentMaxSteps;
}

export function setStepScale(scale: number) {
  // 1.0 = default quality; >1 uses larger steps (faster, less accurate)
  // Clamp to a modest range to avoid extreme artifacts.
  const clamped = Math.min(2, Math.max(0.5, scale));
  currentStepScale = clamped;
}

export function setUseNoiseTexture(enabled: boolean) {
  useNoiseTexture = enabled;
}

export async function startRenderLoop(
  canvas: HTMLCanvasElement,
  overlay: Overlay,
  resources: WebGPUResources,
  camera: CameraState,
) {
  const { width, height } = resizeCanvasToDisplaySize(canvas);
  const pipeline = await createPipeline(
    resources.device,
    resources.pipelineLayout,
    resources.canvasFormat,
    width,
    height,
  );

  // FPS tracking
  let lastFrameTime = performance.now();
  let fps = 0;
  const frameTimeHistory: number[] = [];
  const fpsHistorySize = 30; // Average over last 30 frames

  // Black hole parameters (matching shader.wgsl)
  const RS = 2.0; // Schwarzschild radius
  const R_INNER = 6.0; // Accretion disk inner radius (ISCO) - UPDATED to match shader

  function frame() {
    const currentTime = performance.now();
    const frameDelta = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    // Update FPS using rolling average
    frameTimeHistory.push(frameDelta);
    if (frameTimeHistory.length > fpsHistorySize) {
      frameTimeHistory.shift();
    }
    const avgFrameTime = frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length;
    fps = 1.0 / avgFrameTime;

    const { camPos, camFwd, camRight, camUp } = calculateCameraVectors(camera);

    const { width, height } = resizeCanvasToDisplaySize(canvas);
    const time = performance.now() / 1000;

    // Calculate distance to event horizon
    const camDistance = Math.hypot(camPos[0], camPos[1], camPos[2]);
    const horizonRadius = RS;
    const distanceToHorizon = (camDistance - horizonRadius) / RS;

    const orbitalVelocity = camDistance > 1.5 * RS ? Math.sqrt(RS / (2.0 * camDistance)) : 0;

    let gForce = 0;
    if (camDistance > RS) {
      // Local proper acceleration: a = GM / (r^2 * sqrt(1 - Rs/r))
      // In our units: GM = Rs/2, so a = (Rs/2) / (r^2 * sqrt(1 - Rs/r))
      // a = Rs / (2 * r^2 * sqrt(1 - Rs/r))
      const denom = 2.0 * camDistance * camDistance * Math.sqrt(1.0 - RS / camDistance);
      if (denom > 0.0001) {
        gForce = RS / denom;
      } else {
        gForce = Infinity;
      }
    } else {
      gForce = Infinity;
    }

    let timeDilation = 0;
    if (camDistance > RS) {
      timeDilation = Math.sqrt(1 - RS / camDistance);
    } else if (camDistance > 0) {
      timeDilation = 0;
    }

    let redshift = Infinity;
    if (camDistance > RS && R_INNER > RS) {
      const factorObs = 1 - RS / camDistance;
      const factorEmit = 1 - RS / R_INNER;
      if (factorEmit > 0 && factorObs > 0) {
        redshift = Math.sqrt(factorObs / factorEmit) - 1;
      }
    } else if (camDistance <= RS) {
      redshift = Infinity;
    }

    overlay.setMetrics({
      resolution: `${width}x${height}`,
      pitch: camera.pitch * 180 / Math.PI,
      yaw: camera.yaw * 180 / Math.PI,
      distance: camDistance / RS,
      time: time,
      distanceToHorizon: distanceToHorizon,
      orbitalVelocity: orbitalVelocity,
      gForce: gForce,
      fov: camera.fovY,
      maxRaySteps: currentMaxSteps,
      fps: fps,
      timeDilation: timeDilation,
      redshift: redshift,
      metric: 'Schwarzschild',
    });

    const uniformData = new Float32Array([
      width, height, time, camera.fovY,
      camPos[0], camPos[1], camPos[2], showDebugCircles ? 1.0 : 0.0,
      camFwd[0], camFwd[1], camFwd[2], currentMaxSteps,
      camRight[0], camRight[1], camRight[2], currentStepScale,
      camUp[0], camUp[1], camUp[2], useNoiseTexture ? 1.0 : 0.0,
    ]);
    resources.device.queue.writeBuffer(resources.uniformBuffer, 0, uniformData);

    const encoder = resources.device.createCommandEncoder();
    const textureView = resources.context.getCurrentTexture().createView();

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, resources.bindGroup);
    pass.draw(3, 1, 0, 0);
    pass.end();

    resources.device.queue.submit([encoder.finish()]);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
