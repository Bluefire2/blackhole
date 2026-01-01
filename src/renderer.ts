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
const MAX_STEPS_HARD_LIMIT = 1500;
const MIN_STEPS = 100;

let currentMaxSteps = 1000;
let currentStepScale = 1;
let useNoiseTexture = false;
let useRedshift = true; // Default to true

export function setUseRedshift(enabled: boolean) {
  useRedshift = enabled;
}

// Metric state
export type MetricType = 'Schwarzschild' | 'Kerr';
let currentMetric: MetricType = 'Schwarzschild'; // Default to Schwarzschild
let currentSpin = 0.9;

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

export function setMetric(type: MetricType, spin = 0.9) {
  currentMetric = type;
  currentSpin = spin;
}

export function getMetricState() {
  return { type: currentMetric, spin: currentSpin };
}

function solve_r_kerr(p: Float32Array | number[] | readonly number[], a: number): number {
  // r^4 - (rho^2 - a^2)r^2 - a^2 y^2 = 0
  // p is [x, y, z]
  const x = p[0];
  const y = p[1]; // y is axis of rotation
  const z = p[2];

  const rho2 = x * x + y * y + z * z;
  const a2 = a * a;

  const term = rho2 - a2;
  const disc = term * term + 4.0 * a2 * y * y;
  return Math.sqrt(0.5 * (term + Math.sqrt(disc)));
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

    // Update camera state (banking)
    camera.update(frameDelta);

    const { camPos, camFwd, camRight, camUp } = calculateCameraVectors(camera);

    const { width, height } = resizeCanvasToDisplaySize(canvas);
    const time = performance.now() / 1000;

    // Calculate distance to event horizon
    const camDistance = Math.hypot(camPos[0], camPos[1], camPos[2]);
    const isKerr = currentMetric === 'Kerr';
    const horizonRadius = isKerr
      ? 1.0 + Math.sqrt(Math.max(0, 1.0 - currentSpin * currentSpin)) // r+ = M + sqrt(M^2-a^2), M=1 scale implicitly
      : RS;

    // Note: RS=2.0 implies M=1.0 in our units if G=c=1.

    const distanceToHorizon = (camDistance - horizonRadius) / (isKerr ? 1.0 : RS); // rough normalized dist

    const orbitalVelocity = camDistance > 1.5 * horizonRadius ? Math.sqrt(RS / (2.0 * camDistance)) : 0; // Approx for Kerr too

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

    // Frame Dragging (Omega)
    let omega = undefined;
    if (isKerr) {
      const a = currentSpin;
      const r = solve_r_kerr(camPos, a);
      const theta = Math.acos(Math.abs(camPos[1]) / r); // approx theta from axis (y-axis)

      const r2 = r * r;
      const a2 = a * a;
      const sin2Th = Math.sin(theta) ** 2;
      const delta = r2 - RS * r + a2; // using RS=2M -> 2r

      const denom = (r2 + a2) ** 2 - delta * a2 * sin2Th;

      if (denom > 0.0001) {
        omega = (RS * r * a) / denom; // 2M r a / A
      }
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
      roll: camera.roll * 180 / Math.PI,
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
      metric: currentMetric,
      spin: isKerr ? currentSpin : undefined,
      frameDragOmega: omega,
    });

    // Uniform buffer layout (std140 alignment rules):
    // 0: resolution (vec2)
    // 2: time (f32)
    // 3: fovY (f32)
    // 4: camPos (vec3)
    // 7: showDebugCircles (f32)
    // 8: camFwd (vec3)
    // 11: maxSteps (f32)
    // 12: camRight (vec3)
    // 15: stepScale (f32)
    // 16: camUp (vec3)
    // 19: useNoiseTexture (f32)
    // 20: metricType (f32)
    // 21: spin (f32)
    // 22: useRedshift (f32)
    // 23: padding (f32)
    // Total: 24 floats (96 bytes) -> aligned to 16 bytes.

    const uniformData = new Float32Array([
      width, height, // resolution
      time,           // time
      camera.fovY,    // fovY

      camPos[0], camPos[1], camPos[2], // camPos
      showDebugCircles ? 1.0 : 0.0,    // showDebugCircles

      camFwd[0], camFwd[1], camFwd[2], // camFwd
      currentMaxSteps,                 // maxSteps

      camRight[0], camRight[1], camRight[2], // camRight
      currentStepScale,                      // stepScale

      camUp[0], camUp[1], camUp[2],          // camUp
      useNoiseTexture ? 1.0 : 0.0,           // useNoiseTexture

      isKerr ? 1.0 : 0.0,                    // metricType
      currentSpin,                           // spin
      useRedshift ? 1.0 : 0.0,               // useRedshift
      0.0,                                    // padding
    ]); resources.device.queue.writeBuffer(
      resources.uniformBuffer,
      0,
      uniformData.buffer,
      uniformData.byteOffset,
      uniformData.byteLength,
    );

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
