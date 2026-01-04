// WebGPU initialization and pipeline setup

/// <reference types="@webgpu/types" />

import { shaderCode } from './shader';

export interface WebGPUResources {
  device: GPUDevice;
  context: GPUCanvasContext;
  uniformBuffer: GPUBuffer;
  bindGroup: GPUBindGroup;
  pipelineLayout: GPUPipelineLayout;
  canvasFormat: GPUTextureFormat;
}

// --- Noise Generation ---
function createNoiseTexture(device: GPUDevice): GPUTexture {
  const size = 512;
  const data = new Uint8Array(size * size * 4);

  // Simple value noise generator
  const p = new Uint8Array(512);
  const permutation = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
  for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];

  // Smootherstep function (6t^5 - 15t^4 + 10t^3) for zero derivative at endpoints
  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }

  // Linear interpolation: a + t * (b - a)
  function lerp(t: number, a: number, b: number) { return a + t * (b - a); }

  // Computes dot product of a pseudo-random gradient vector (picked by hash) and input vector (x,y,z)
  function grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
    return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
  }

  function noise(x: number, y: number, z: number) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
      lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
    lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
      lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const scale = 0.05;
      let n = 0;
      let amp = 0.5;
      let freq = 1.0;
      for (let k = 0; k < 4; k++) {
        const nx = x * scale * freq;
        const ny = y * scale * freq;
        n += amp * noise(nx, ny, 0);
        amp *= 0.5;
        freq *= 2.0;
      }

      const val = Math.floor((n + 1) * 0.5 * 255);

      const i = (y * size + x) * 4;
      data[i] = val;   // R
      data[i + 1] = val; // G
      data[i + 2] = val; // B
      data[i + 3] = 255; // A
    }
  }

  const texture = device.createTexture({
    size: [size, size],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  device.queue.writeTexture(
    { texture },
    data,
    { bytesPerRow: size * 4 },
    { width: size, height: size },
  );

  return texture;
}

export async function initWebGPU(
  canvas: HTMLCanvasElement,
): Promise<WebGPUResources> {
  if (!('gpu' in navigator)) {
    throw new Error('WebGPU not supported in this browser.');
  }

  // 1. Get adapter (physical-ish GPU)
  const adapter = await (navigator as any).gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No GPU adapter found.');
  }

  // 2. Get logical device
  const device = await adapter.requestDevice();

  device.addEventListener('uncapturederror', (event: Event) => {
    const errorEvent = event as GPUUncapturedErrorEvent;
    const msg = errorEvent.error.message;
    console.error('WebGPU Uncaptured Error:', msg);
  });

  // --- Uniform buffer setup ---
  // Adjusted for added metricType + spin + padding
  const uniformBufferSize = 96; // 24 floats × 4 bytes (was 80)
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // --- Noise Texture Setup ---
  const noiseTexture = createNoiseTexture(device);
  const noiseSampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    mipmapFilter: 'linear',
    addressModeU: 'repeat',
    addressModeV: 'repeat',
  });

  // Describe what our uniforms look like (slot 0, visible to fragment shader)
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
        buffer: { type: 'uniform' },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {},
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
      {
        binding: 1,
        resource: noiseTexture.createView(),
      },
      {
        binding: 2,
        resource: noiseSampler,
      },
    ],
  });

  // 3. Get WebGPU context from canvas
  const context = canvas.getContext('webgpu') as GPUCanvasContext;
  if (!context) {
    throw new Error('Could not get webgpu context.');
  }

  // Pick a texture format the browser likes
  const canvasFormat = (navigator as any).gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: canvasFormat,
    alphaMode: 'opaque',
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

export async function createPipeline(
  device: GPUDevice,
  pipelineLayout: GPUPipelineLayout,
  canvasFormat: GPUTextureFormat,
  _width: number,
  _height: number,
): Promise<GPURenderPipeline> {
  const sizedShaderModule = device.createShaderModule({
    code: shaderCode,
  });

  const compilationInfo = await sizedShaderModule.getCompilationInfo();
  if (compilationInfo.messages.length > 0) {
    let hadError = false;
    for (const msg of compilationInfo.messages) {
      console.log(`Shader ${msg.type}: ${msg.message} at line ${msg.lineNum}`);
      if (msg.type === 'error') hadError = true;
    }
    if (hadError) {
      throw new Error('Shader compilation failed. Check console for details.');
    }
  }

  return device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: sizedShaderModule,
      entryPoint: 'vs_main',
    },
    fragment: {
      module: sizedShaderModule,
      entryPoint: 'fs_main',
      targets: [{ format: canvasFormat }],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });
}

