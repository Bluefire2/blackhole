// WebGPU initialization and pipeline setup

/// <reference types="@webgpu/types" />

import { shaderCode } from './shader';
import { Overlay } from './overlay';

export interface WebGPUResources {
  device: GPUDevice;
  context: GPUCanvasContext;
  uniformBuffer: GPUBuffer;
  bindGroup: GPUBindGroup;
  pipelineLayout: GPUPipelineLayout;
  canvasFormat: GPUTextureFormat;
}

export async function initWebGPU(
  canvas: HTMLCanvasElement,
  overlay: Overlay
): Promise<WebGPUResources> {
  if (!("gpu" in navigator)) {
    overlay.setError("WebGPU not supported in this browser.");
    throw new Error("WebGPU not supported in this browser.");
  }

  // 1. Get adapter (physical-ish GPU)
  const adapter = await (navigator as any).gpu.requestAdapter();
  if (!adapter) {
    overlay.setError("No GPU adapter found.");
    throw new Error("No GPU adapter found.");
  }

  // 2. Get logical device
  const device = await adapter.requestDevice();

  // --- Uniform buffer setup ---
  const uniformBufferSize = 80; // 20 floats × 4 bytes
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Describe what our uniforms look like (slot 0, visible to fragment shader)
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {},
      },
    ],
  });

  // The pipeline layout references this bind group layout
  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  // Create the actual bind group, linking our uniform buffer to binding 0
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: uniformBuffer },
      },
    ],
  });

  // 3. Get WebGPU context from canvas
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  if (!context) {
    overlay.setError("Could not get webgpu context.");
    throw new Error("Could not get webgpu context.");
  }

  // Pick a texture format the browser likes
  const canvasFormat = (navigator as any).gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: canvasFormat,
    alphaMode: "opaque",
  });

  return {
    device,
    context,
    uniformBuffer,
    bindGroup,
    pipelineLayout,
    canvasFormat,
  };
}

export function createPipeline(
  device: GPUDevice,
  pipelineLayout: GPUPipelineLayout,
  canvasFormat: GPUTextureFormat,
  width: number,
  height: number
): GPURenderPipeline {
  const sizedShaderModule = device.createShaderModule({
    code: shaderCode,
  });

  return device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: sizedShaderModule,
      entryPoint: "vs_main",
    },
    fragment: {
      module: sizedShaderModule,
      entryPoint: "fs_main",
      targets: [{ format: canvasFormat }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });
}

