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

  function frame() {
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

    // Update info display
    const pitchDeg = (camera.pitch * 180 / Math.PI).toFixed(1);
    const yawDeg = (camera.yaw * 180 / Math.PI).toFixed(1);
    overlay.setInfo(
      `WebGPU ok | ${width}x${height} | Pitch: ${pitchDeg}° | Yaw: ${yawDeg}° | Distance: ${camera.radius.toFixed(1)} | Time: ${time.toFixed(1)}s`,
    );

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

