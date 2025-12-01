// Render loop and frame function

/// <reference types="@webgpu/types" />

import { resizeCanvasToDisplaySize } from './utils';
import { calculateCameraVectors } from './camera';
import type { CameraState } from './camera';
import { createPipeline } from './webgpu-setup';
import type { WebGPUResources } from './webgpu-setup';
import { Overlay } from './overlay';

export function startRenderLoop(
  canvas: HTMLCanvasElement,
  overlay: Overlay,
  resources: WebGPUResources,
  camera: CameraState,
) {
  const { width, height } = resizeCanvasToDisplaySize(canvas);
  const pipeline = createPipeline(
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
  const SPIN = 0.99; // Black hole spin
  const useKerr = false; // Currently using Schwarzschild
  const MAX_STEPS = 200; // Maximum ray marching steps
  const R_INNER = 3.0; // Accretion disk inner radius (for redshift calculation)

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

    // --- Orthonormality debug (kept in code but not displayed) ---
    const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const len = (a: number[]) => Math.hypot(a[0], a[1], a[2]);

    const f = [camFwd[0], camFwd[1], camFwd[2]];
    const r = [camRight[0], camRight[1], camRight[2]];
    const u = [camUp[0], camUp[1], camUp[2]];

    const lf = len(f), lr = len(r), lu = len(u);
    const fr = dot(f, r), fu = dot(f, u), ru = dot(r, u);
    // Debug values available but not displayed - uncomment to use:
    // console.log(`|f|=${lf.toFixed(3)} |r|=${lr.toFixed(3)} |u|=${lu.toFixed(3)}, f·r=${fr.toFixed(3)} f·u=${fu.toFixed(3)} r·u=${ru.toFixed(3)}`);
    const _debug = { lf, lr, lu, fr, fu, ru }; // Keep in scope for debugging
    void _debug; // Suppress unused variable warning

    // Calculate distance to event horizon
    // In geometric units: RS = 2M, where M is the mass
    // For Schwarzschild: horizon is at RS = 2.0
    // The horizon is at 1.0 * RS (since RS itself = 2.0)
    const camDistance = Math.hypot(camPos[0], camPos[1], camPos[2]);
    let horizonRadius: number;
    if (useKerr) {
      // Kerr: rh = (1.0 + sqrt(1.0 - SPIN^2)) * 2.0
      // M = RS/2 = 1.0, so rh = 1.0 + sqrt(1.0 - SPIN^2)
      const rh = 1.0 + Math.sqrt(1.0 - SPIN * SPIN);
      horizonRadius = rh * 2.0;
    } else {
      // Schwarzschild: horizon is at RS = 2.0
      horizonRadius = RS;
    }
    // Distance from camera to horizon, converted to units of RS
    const distanceToHorizon = (camDistance - horizonRadius) / RS;

    // Calculate orbital velocity (Keplerian)
    // From shader: omega = 2.0 * pow(r, -0.5)
    // v = r * omega = r * 2.0 / sqrt(r) = 2.0 * sqrt(r)
    const orbitalVelocity = camDistance > 0 ? 2.0 * Math.sqrt(camDistance) : 0;

    // Calculate time dilation factor
    // For Schwarzschild: dt_proper / dt_coordinate = sqrt(1 - RS/r)
    // This is how much slower time passes at the camera compared to infinity
    let timeDilation = 0;
    if (camDistance > RS) {
      timeDilation = Math.sqrt(1 - RS / camDistance);
    } else if (camDistance > 0) {
      timeDilation = 0; // At or inside horizon, time stops
    }

    // Calculate gravitational redshift
    // For light from accretion disk (at r_emit) observed at camera (at r_obs):
    // z = sqrt((1 - RS/r_obs) / (1 - RS/r_emit)) - 1
    // Using inner disk radius as reference (where most visible light originates)
    let redshift = Infinity;
    if (camDistance > RS && R_INNER > RS) {
      const factorObs = 1 - RS / camDistance;
      const factorEmit = 1 - RS / R_INNER;
      if (factorEmit > 0 && factorObs > 0) {
        redshift = Math.sqrt(factorObs / factorEmit) - 1;
      }
    } else if (camDistance <= RS) {
      redshift = Infinity; // Inside horizon, infinite redshift
    }

    // Update overlay with metrics
    // Convert distance to RS units for display
    overlay.setMetrics({
      resolution: `${width}x${height}`,
      pitch: camera.pitch * 180 / Math.PI,
      yaw: camera.yaw * 180 / Math.PI,
      distance: camDistance / RS, // Convert to RS units
      time: time,
      distanceToHorizon: distanceToHorizon,
      orbitalVelocity: orbitalVelocity,
      fov: camera.fovY,
      maxRaySteps: MAX_STEPS,
      fps: fps,
      timeDilation: timeDilation,
      redshift: redshift,
    });

    // Pack uniforms exactly as your WGSL struct expects (20 floats)
    const uniformData = new Float32Array([
      width, height, time, camera.fovY,
      camPos[0], camPos[1], camPos[2], 0,
      camFwd[0], camFwd[1], camFwd[2], 0,
      camRight[0], camRight[1], camRight[2], 0,
      camUp[0], camUp[1], camUp[2], 0,
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
    pass.draw(3, 1, 0, 0); // draw our fullscreen triangle
    pass.end();

    resources.device.queue.submit([encoder.finish()]);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

