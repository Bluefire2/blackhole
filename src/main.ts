// src/main.ts
/// <reference types="@webgpu/types" />

// We'll grab the canvas, ask the browser for a WebGPU device, and render a test pattern.

const overlayEl = document.getElementById("overlay") as HTMLDivElement;
const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

// --- Mouse-driven camera state ---
let yaw = 0;          // radians, left/right
let pitch = 0;        // radians, up/down (clamped)
let cameraRadius = 14.0; // Start outside the disk (R_OUTER is 12.0)
let isDragging = false;
let lastX = 0, lastY = 0;
let fovY = Math.PI / 3; // fixed 60°

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const deg2rad = (d: number) => d * Math.PI / 180;

// Drag to rotate
canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
window.addEventListener("mouseup", () => { isDragging = false; });
window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;

  const sens = 0.005;             // rad per pixel
  yaw += dx * sens;
  pitch += dy * sens;
  const limit = deg2rad(89.5);    // avoid gimbal flip
  pitch = clamp(pitch, -limit, limit);
});

// Wheel to zoom Distance (radius)
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  cameraRadius *= Math.exp(e.deltaY * 0.001);                 // smooth zoom
  cameraRadius = clamp(cameraRadius, 2.5, 100.0);             // Limits: close to horizon -> far away
}, { passive: false });


if (!canvas) {
  throw new Error("gpu-canvas not found");
}

async function initWebGPU() {
  if (!("gpu" in navigator)) {
    overlayEl.textContent = "WebGPU not supported in this browser.";
    throw new Error("WebGPU not supported in this browser.");
  }

  // 1. Get adapter (physical-ish GPU)
  const adapter = await (navigator as any).gpu.requestAdapter();
  if (!adapter) {
    overlayEl.textContent = "No GPU adapter found.";
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
    overlayEl.textContent = "Could not get webgpu context.";
    throw new Error("Could not get webgpu context.");
  }

  // Pick a texture format the browser likes
  const canvasFormat = (navigator as any).gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: canvasFormat,
    alphaMode: "opaque",
  });

  // 4. Create a pipeline that shades each pixel with a simple gradient.
  // We'll use a fullscreen triangle trick: no vertex buffer, just 3 verts in shader.

  // We want the fragment shader to know the canvas size. Easiest day-1 hack:
  // we'll recreate the pipeline any time the canvas resizes, for now.
  // For first version, let's just grab size now:
  function createPipeline(width: number, height: number) {
    // We recompile the shader with constants baked in.
    const sizedShaderModule = device.createShaderModule({
      code: `
    struct VSOut {
      @builtin(position) position : vec4f
    };

    const MAX_STEPS : i32 = 200;
    const RS : f32 = 2.0;       // Schwarzschild radius
    const R_INNER : f32 = 3.0;  // Accretion disk inner radius
    const R_OUTER : f32 = 12.0; // Accretion disk outer radius

    // Fullscreen triangle (no vertex buffers)
    @vertex
    fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VSOut {
      var pos = array<vec2f, 3>(
        vec2f(-1.0, -1.0),
        vec2f( 3.0, -1.0),
        vec2f(-1.0,  3.0)
      );
      let xy = pos[vertexIndex];
    
      var out : VSOut;
      out.position = vec4f(xy, 0.0, 1.0);
      return out;
    }
    
    // ---- Uniforms ----
    struct Uniforms {
      resolution : vec2f,
      time       : f32,
      fovY       : f32,
    
      camPos     : vec3f,
      _pad0      : f32,
    
      camFwd     : vec3f,
      _pad1      : f32,
    
      camRight   : vec3f,
      _pad2      : f32,
    
      camUp      : vec3f,
      _pad3      : f32,
    };
    
    @group(0) @binding(0)
    var<uniform> uniforms : Uniforms;
    
    fn saturate(x : f32) -> f32 {
      return clamp(x, 0.0, 1.0);
    }
    
    // --- Noise helpers ---
    fn hash1(p : vec2f) -> f32 {
      let h = dot(p, vec2f(127.1, 311.7));
      return fract(sin(h) * 43758.5453123);
    }
    
    fn valueNoise2(p : vec2f) -> f32 {
      let i = floor(p);
      let f = fract(p);
      let u = f * f * (3.0 - 2.0 * f);
      let a = hash1(i);
      let b = hash1(i + vec2f(1.0, 0.0));
      let c = hash1(i + vec2f(0.0, 1.0));
      let d = hash1(i + vec2f(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    
    fn fbm2(p : vec2f) -> f32 {
      var sum : f32 = 0.0;
      var amp : f32 = 0.5;
      var freq : f32 = 1.0;
      for (var i : i32 = 0; i < 3; i = i + 1) {
        sum = sum + amp * valueNoise2(p * freq);
        freq = freq * 2.0;
        amp  = amp * 0.5;
      }
      return sum;
    }
    
    struct RingResult {
      brightness : f32,
      baseColor  : vec3f,
    }
    
    fn applyHotInnerRing(r : f32, rInner : f32, brightness : f32, baseColor : vec3f) -> RingResult {
      // --- Hot inner ring centered at rInner ---
      let ringWidth : f32 = 0.4; 
      let ringX = (r - rInner) / ringWidth;        
      let ringProfile = exp(-ringX * ringX);      
    
      let ringStrength : f32 = 2.5;               
      let newBrightness = brightness + ringStrength * ringProfile;
    
      let ringColorBoost = vec3f(1.0, 1.0, 0.98);
      let newBaseColor = mix(baseColor, ringColorBoost, saturate(ringProfile));
    
      var result : RingResult;
      result.brightness = newBrightness;
      result.baseColor = newBaseColor;
      return result;
    }

    fn getDiskColor(hit : vec3f, r : f32) -> vec4f {
        let rNorm = (r - R_INNER) / (R_OUTER - R_INNER);
        let rNormClamped = saturate(rNorm);

        // Inner bright, outer dim
        var brightness = pow(1.0 - rNormClamped, 1.0);

        let innerCol = vec3f(1.0, 0.98, 0.95);
        let midCol   = vec3f(1.0, 0.8, 0.5);
        let outerCol = vec3f(0.9, 0.4, 0.2);

        let t1 = saturate(rNormClamped * 2.0);
        let t2 = saturate((rNormClamped - 0.5) * 2.0);
        let colorInnerMid = mix(innerCol, midCol, t1);
        var baseColor     = mix(colorInnerMid, outerCol, t2);

        // Apply hot inner ring effect
        let ringResult = applyHotInnerRing(r, R_INNER, brightness, baseColor);
        brightness = ringResult.brightness;
        baseColor = ringResult.baseColor;

        // --- Coherent turbulent streaks ---
        // We want the noise to rotate with the disk (Keplerian flow).
        // Instead of polar coords (which have seams), we rotate the domain.
        
        let omega = 2.0 * pow(max(r, R_INNER), -0.5);
        let theta = -omega * uniforms.time * 0.5;
        let c = cos(theta);
        let s = sin(theta);
        
        // Rotate the hit point in the XZ plane
        let rotX = hit.x * c - hit.z * s;
        let rotZ = hit.x * s + hit.z * c;
        
        let noiseUV = vec2f(rotX, rotZ) * 0.5; // Scale texture
        
        let turb = fbm2(noiseUV);
        let turbShaped = pow(turb, 1.2);

        brightness = brightness * (0.6 + 0.7 * turbShaped);

        // --- Edge Treatment ---
        // 1. Perturb the radius for the fade calculation using noise
        // We only want to distort the OUTER edge. The inner edge should remain stable
        // to avoid "detached rings" spawning inside the hole.
        
        // Use a lower frequency noise for the shape distortion so it looks like "lobes"
        let shapeNoise = fbm2(noiseUV * 0.3); 
        
        // Ramp up noise influence from 0 at inner edge to full at outer edge
        let noiseStrength = smoothstep(0.2, 0.8, rNorm); 
        let distortion = (shapeNoise - 0.5) * 0.5 * noiseStrength; // Increased distortion amp
        
        let rPerturbed = rNorm + distortion;

        // 2. Soft alpha fade with plateau
        // Inner edge: smoothstep(0.0, 0.2, ...) -> softer start
        // Outer edge: smoothstep(1.0, 0.8, ...) -> softer end
        let edgeFade = smoothstep(0.0, 0.2, rPerturbed) * smoothstep(1.0, 0.8, rPerturbed);
        
        // Power curve to keep main body opaque
        let opacityCurve = pow(edgeFade, 0.2);
        
        let alpha = opacityCurve * 0.95; 

        // Boost brightness slightly (uncoupled from fade)
        brightness = max(brightness, 0.05) * 1.5;

        return vec4f(baseColor * brightness, alpha);
    }

    fn getSkyColor(dir : vec3f) -> vec3f {
       let tSky = 0.5 * (dir.y + 1.0);
       let skyTop    = vec3f(0.02, 0.05, 0.10);  // dark blue
       let skyBottom = vec3f(0.0, 0.0, 0.0);     // black
       return mix(skyBottom, skyTop, tSky);
    }

    // Toggle between Schwarzschild and Kerr
    const useKerr : bool = false; 
    const SPIN : f32 = 0.99; // Black hole spin (0.0 to 1.0)

    // Helper to calculate acceleration at a given position/velocity state
    // Schwarzschild Geodesic Equation: a = -1.5 * rs * (x cross v)^2 / r^5 * x
    fn getAccelSchwarzschild(p : vec3f, v : vec3f) -> vec3f {
      let r2 = dot(p, p);
      let r = sqrt(r2);
      let L = cross(p, v);
      let L2 = dot(L, L);
      return -1.5 * RS * L2 / (r2 * r2 * r) * p;
    }

    // Kerr Geodesic Equation (Hamiltonian formulation)
    // We use a simplified 3D state (pos, vel) but implicitly track 4D structure
    // This is an approximation suitable for visual ray marching
    fn getAccelKerr(p : vec3f, v : vec3f) -> vec3f {
        // Kerr metric parameters
        let a = SPIN;
        let a2 = a * a;
        let x = p.x; let y = p.y; let z = p.z;
        let rho2 = x*x + y*y + z*z; // Approximation for r^2 at large distances
        
        // Accurate r calculation for Kerr (Boyer-Lindquist r)
        // r^2 - 2Mr + a^2 = 0 is horizon. 
        // We need to invert x^2 + y^2 + z^2 = r^2 + a^2 sin^2 theta
        // This is complex, so we use a numerical approximation or simplified Hamiltonian
        // For visual raymarching, we can use the "Kerr-Schild" like derivatives or 
        // simply integrate the geodesic equation components directly.
        
        // Let's use the effective potential approach for the acceleration vector
        // A robust way for shaders is to compute the Christoffel symbol terms 
        // only for the dominant terms or use a numerical derivative of the Hamiltonian.
        
        // Numerical Derivative Approach (Finite Difference)
        // H = 0.5 * g^uv * p_u * p_v = 0 (for photons)
        // We want dx/dlambda = dH/dp, dp/dlambda = -dH/dx
        
        // Since implementing full Kerr metric inverse is heavy, we'll use a 
        // high-quality approximation for the "force" term:
        // F = - M/r^3 * (r - 3/2 * rs) ... this is Schwarzschild.
        
        // For Kerr, the "drag" term is key.
        // Frame dragging: dphi/dt = -g_tphi / g_phiphi ~ 2Mar / (r^2+a^2)^2
        
        // We will add a rotational term to the velocity update.
        let r = length(p);
        let r3 = r*r*r;
        let r5 = r3*r*r;
        
        // Base Schwarzschild gravity
        let L = cross(p, v);
        let L2 = dot(L, L);
        let grav = -1.5 * RS * L2 / r5 * p;
        
        // Frame dragging (simplified Lense-Thirring effect)
        // This effectively "twists" the space around the Z axis
        // Force ~ J x v / r^4
        let J = vec3f(0.0, 1.0, 0.0) * a * RS; // Angular momentum vector
        let drag = 3.0 * cross(J, cross(p, v)) / r5;
        
        return grav + drag;
    }
    
    // ---- Fragment: Schwarzschild Ray Marching ----
    @fragment
    fn fs_main(@builtin(position) fragCoord : vec4f) -> @location(0) vec4f {
      let res  = uniforms.resolution;
    
      // Pixel center → NDC [-1,1], +Y up
      let px   = (fragCoord.x + 0.5) / res.x;
      let py   = (fragCoord.y + 0.5) / res.y;
      let ndc  = vec2f(px * 2.0 - 1.0, 1.0 - py * 2.0);
    
      // Build world-space ray direction
      let aspect = res.x / res.y;
      let halfY  = tan(0.5 * uniforms.fovY);
      let halfX  = halfY * aspect;
    
      var dir = uniforms.camFwd
              + ndc.x * halfX * uniforms.camRight
              + ndc.y * halfY * uniforms.camUp;
      dir = normalize(dir);
      var pos = uniforms.camPos;

      var accumulatedColor = vec3f(0.0);
      var transmittance = 1.0;
      
      // Horizon radius depends on spin
      // r+ = M + sqrt(M^2 - a^2). M = RS/2 = 1.0.
      let rh = 1.0 + sqrt(1.0 - SPIN * SPIN);
      let horizonRad = select(RS, rh * 2.0, useKerr); // *2 because our RS=2 units

      // Ray marching loop with RK4 Integration
      for (var i : i32 = 0; i < MAX_STEPS; i = i + 1) {
        let r2 = dot(pos, pos);
        let r  = sqrt(r2);

        // 1. Event Horizon Check
        if (r < horizonRad) {
          // Black hole blocks everything behind it
          return vec4f(accumulatedColor, 1.0);
        }

        // 2. Adaptive Step Size
        // Step size needs to be small near the disk plane to capture secondary images
        let baseDt = max(0.05, 0.1 * r);
        
        // When close to disk plane (y≈0), reduce step size dramatically
        let distToPlane = abs(pos.y);
        let planeFactor = smoothstep(0.0, 0.5, distToPlane); // 0 at plane, 1 at y=0.5
        let dt = baseDt * mix(0.05, 1.0, planeFactor); // 5% step size at plane

        // 3. RK4 Integration Steps
        // Runge-Kutta 4 is a 4th-order method for solving ODEs.
        
        // k1
        let v1 = dir;
        let a1 = select(getAccelSchwarzschild(pos, v1), getAccelKerr(pos, v1), useKerr);

        // k2
        let p2 = pos + v1 * (0.5 * dt);
        let v2 = dir + a1 * (0.5 * dt);
        let a2 = select(getAccelSchwarzschild(p2, v2), getAccelKerr(p2, v2), useKerr);

        // k3
        let p3 = pos + v2 * (0.5 * dt);
        let v3 = dir + a2 * (0.5 * dt);
        let a3 = select(getAccelSchwarzschild(p3, v3), getAccelKerr(p3, v3), useKerr);

        // k4
        let p4 = pos + v3 * dt;
        let v4 = dir + a3 * dt;
        let a4 = select(getAccelSchwarzschild(p4, v4), getAccelKerr(p4, v4), useKerr);

        // Combine weighted average
        let nextPos = pos + (v1 + 2.0 * v2 + 2.0 * v3 + v4) * (dt / 6.0);
        let nextDir = normalize(dir + (a1 + 2.0 * a2 + 2.0 * a3 + a4) * (dt / 6.0));

        // 4. Accretion Disk Intersection (Plane y=0)
        // Check if we crossed the plane y=0 in this step
        // We add a small tolerance check to avoid grazing artifacts
        if (pos.y * nextPos.y < 0.0) {
            // Linear interpolation to find exact hit point
            let frac = -pos.y / (nextPos.y - pos.y);
            let hit = mix(pos, nextPos, frac);
            let d = length(hit);

            if (d > R_INNER && d < R_OUTER) {
                let disk = getDiskColor(hit, d);
                
                // Accumulate emission: color * alpha * transmittance
                accumulatedColor = accumulatedColor + transmittance * disk.rgb * disk.a;
                // Attenuate background light
                transmittance = transmittance * (1.0 - disk.a);

                if (transmittance < 0.01) {
                    break;
                }
            }
        }
        
        // Prevent self-intersection artifacts for rays skimming the disk
        // If we are very close to the disk but didn't cross it (grazing), 
        // we might need to be careful not to step "over" it and back without registering.
        // But for now, the crossing check is robust enough if step size is small.

        pos = nextPos;
        dir = nextDir;

        // Escape condition
        if (r > 30.0) {
            break;
        }
      }

      // If we escaped, add sky color attenuated by disk
      let sky = getSkyColor(dir);
      return vec4f(accumulatedColor + transmittance * sky, 1.0);
    }
    `,
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

  // Handle resize: we want canvas pixels to match its CSS size
  function resizeCanvasToDisplaySize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { width: w, height: h };
  }

  let { width, height } = resizeCanvasToDisplaySize();
  let pipeline = createPipeline(width, height);

  // Basic render loop
  function frame() {
    // Forward from yaw/pitch
    // === Orbit camera around the origin ===

    // Yaw/pitch already maintained by mouse handlers
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);

    // Distance from target (origin).
    const radius = cameraRadius;

    // Target point (where the black hole will live later)
    const target = [0, 0, 0] as const;

    // Camera position on a sphere of radius `radius` around the origin
    const camPos = [
      radius * sy * cp,   // x
      radius * sp,        // y
      radius * cy * cp,   // z
    ] as const;

    // Forward = look from camPos toward target (origin)
    let camFwd = [
      target[0] - camPos[0],
      target[1] - camPos[1],
      target[2] - camPos[2],
    ];
    // normalize forward
    {
      const l = Math.hypot(camFwd[0], camFwd[1], camFwd[2]) || 1;
      camFwd = [camFwd[0] / l, camFwd[1] / l, camFwd[2] / l];
    }

    // Right = normalize( worldUp × forward )
    const worldUp = [0, 1, 0] as const;
    let camRight = [
      worldUp[1] * camFwd[2] - worldUp[2] * camFwd[1],
      worldUp[2] * camFwd[0] - worldUp[0] * camFwd[2],
      worldUp[0] * camFwd[1] - worldUp[1] * camFwd[0],
    ];
    {
      const l = Math.hypot(camRight[0], camRight[1], camRight[2]) || 1;
      camRight = [camRight[0] / l, camRight[1] / l, camRight[2] / l];
    }

    // Up = normalize( forward × right )
    let camUp = [
      camFwd[1] * camRight[2] - camFwd[2] * camRight[1],
      camFwd[2] * camRight[0] - camFwd[0] * camRight[2],
      camFwd[0] * camRight[1] - camFwd[1] * camRight[0],
    ];
    {
      const l = Math.hypot(camUp[0], camUp[1], camUp[2]) || 1;
      camUp = [camUp[0] / l, camUp[1] / l, camUp[2] / l];
    }

    // debug start
    const { width, height } = resizeCanvasToDisplaySize(); // (rounds DPR)
    // --- Orthonormality debug ---
    const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const len = (a: number[]) => Math.hypot(a[0], a[1], a[2]);

    const f = [camFwd[0], camFwd[1], camFwd[2]];
    const r = [camRight[0], camRight[1], camRight[2]];
    const u = [camUp[0], camUp[1], camUp[2]];

    const lf = len(f), lr = len(r), lu = len(u);
    const fr = dot(f, r), fu = dot(f, u), ru = dot(r, u);

    overlayEl.textContent =
      `WebGPU ok | ${width}x${height}\n` +
      `| |f|=${lf.toFixed(3)} |r|=${lr.toFixed(3)} |u|=${lu.toFixed(3)}\n` +
      `| f·r=${fr.toFixed(3)} f·u=${fu.toFixed(3)} r·u=${ru.toFixed(3)}`;

    // debug end

    // Pack uniforms exactly as your WGSL struct expects (20 floats)
    const time = performance.now() / 1000;
    const uniformData = new Float32Array([
      width, height, time, fovY,
      camPos[0], camPos[1], camPos[2], 0,
      camFwd[0], camFwd[1], camFwd[2], 0,
      camRight[0], camRight[1], camRight[2], 0,
      camUp[0], camUp[1], camUp[2], 0,
    ]);
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    const encoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup); // <--- bind our uniforms here
    pass.draw(3, 1, 0, 0); // draw our fullscreen triangle
    pass.end();

    device.queue.submit([encoder.finish()]);

    // overlayEl.textContent = `WebGPU ok | ${width}x${height}`;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

initWebGPU().catch((err) => {
  console.error(err);
  overlayEl.textContent = "Init error: " + err;
});
