struct VSOut {
  @builtin(position) position : vec4f
};

const MAX_STEPS : i32 = 300;
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
  showDebugCircles : f32,

  camFwd     : vec3f,
  maxSteps   : f32,

  camRight   : vec3f,
  stepScale  : f32,

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

// --- Flow Noise / Advection-Regeneration ---
// Solves the "infinite winding" problem where streaks get too thin over time.
// We blend two noise layers that reset periodically.

fn getDiskNoise(hit : vec3f, r : f32, time : f32) -> f32 {
    // "Flow Noise" or Advection-Regeneration technique.
    // Problem: If we simply rotate the noise domain by theta = -omega * t, the differential rotation
    // (omega varies with r) causes the spiral to "wind up" infinitely. The phase difference between
    // two radii grows linearly with time: dTheta = (omega1 - omega2) * t.
    // This makes the streaks get thinner and thinner until they look like high-frequency static.
    
    // Solution: We use two overlapping noise layers that reset periodically.
    // As one layer approaches its maximum "winding age" and is about to snap back, it fades out.
    // Meanwhile, a second layer (offset by half a period) fades in.
    
    let period = 20.0; // Duration (seconds) before the noise resets to avoid over-winding.
    let omega = 2.0 * pow(max(r, R_INNER), -0.5); // Keplerian angular velocity (v ~ 1/sqrt(r))
    
    // Base spiral shape (logarithmic spiral).
    // We add this constant offset so that even when the time-dependent rotation is near 0 (just reset),
    // the pattern still looks like a spiral, not radial spokes.
    let baseAngle = 3.0 * log(r);

    // --- Layer 1 ---
    // phase1 goes from 0.0 to 1.0 over 'period' seconds.
    let phase1 = fract(time / period);
    
    // Triangle wave weight: starts at 0, goes to 1, back to 0.
    // This ensures the layer is invisible when it "snaps" from phase 1.0 back to 0.0.
    let weight1 = 1.0 - abs(2.0 * phase1 - 1.0); 
    
    // "Age" of the distortion. We center it (-0.5 to 0.5) so the distortion is minimal at peak weight.
    let age1 = (phase1 - 0.5) * period; 
    let theta1 = -omega * age1 + baseAngle;
    
    let c1 = cos(theta1); let s1 = sin(theta1);
    let rot1 = vec2f(hit.x * c1 - hit.z * s1, hit.x * s1 + hit.z * c1);
    let n1 = fbm2(rot1 * 0.5);

    // --- Layer 2 ---
    // Offset by 0.5 (half a period) so it's at peak weight when Layer 1 is resetting.
    let phase2 = fract((time / period) + 0.5);
    let weight2 = 1.0 - abs(2.0 * phase2 - 1.0);
    let age2 = (phase2 - 0.5) * period;
    let theta2 = -omega * age2 + baseAngle;

    let c2 = cos(theta2); let s2 = sin(theta2);
    let rot2 = vec2f(hit.x * c2 - hit.z * s2, hit.x * s2 + hit.z * c2);
    let n2 = fbm2(rot2 * 0.5);

    // Blend the two layers. The weights naturally sum to 1.0 (triangle waves offset by 0.5).
    let wTotal = weight1 + weight2;
    return (n1 * weight1 + n2 * weight2) / wTotal;
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

    // --- Coherent turbulent streaks (Flow Noise) ---
    let turb = getDiskNoise(hit, r, uniforms.time);
    let turbShaped = pow(turb, 1.2);

    brightness = brightness * (0.6 + 0.7 * turbShaped);

    // Re-introduce noiseUV for edge distortion (rigid rotation to avoid winding)
    let omegaEdge = 2.0 * pow(R_OUTER, -0.5);
    let thetaEdge = -omegaEdge * uniforms.time * 0.5;
    let ce = cos(thetaEdge);
    let se = sin(thetaEdge);
    let rotX = hit.x * ce - hit.z * se;
    let rotZ = hit.x * se + hit.z * ce;
    let noiseUV = vec2f(rotX, rotZ) * 0.5;

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

// Helper to calculate acceleration at a given position/velocity state
// Schwarzschild Geodesic Equation: a = -1.5 * rs * (x cross v)^2 / r^5 * x
fn getAccelSchwarzschild(p : vec3f, v : vec3f) -> vec3f {
  let r2 = dot(p, p);
  let r = sqrt(r2);
  let L = cross(p, v);
  let L2 = dot(L, L);
  return -1.5 * RS * L2 / (r2 * r2 * r) * p;
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
  
  // Horizon radius for Schwarzschild
  let horizonRad = RS;

  // Ray marching loop with RK4 Integration
  let maxSteps = i32(uniforms.maxSteps);
  for (var i : i32 = 0; i < MAX_STEPS; i = i + 1) {
    if (i >= maxSteps) {
      break;
    }
    let r2 = dot(pos, pos);
    let r  = sqrt(r2);

    // 1. Event Horizon Check
    // 1. Event Horizon Check
    if (r < horizonRad) {
      // Black hole blocks everything behind it
      transmittance = 0.0;
      break;
    }

    // 2. Adaptive Step Size
    // Step size needs to be small near the disk plane to capture secondary images
    let baseDt = max(0.05, 0.1 * r);
    
    // When close to disk plane (y≈0), reduce step size dramatically
    let distToPlane = abs(pos.y);
    let planeFactor = smoothstep(0.0, 0.5, distToPlane); // 0 at plane, 1 at y=0.5
    let dt = baseDt * mix(0.05, 1.0, planeFactor) * uniforms.stepScale; // 5% step size at plane

    // 3. RK4 Integration Steps
    // Runge-Kutta 4 is a 4th-order method for solving ODEs.
    
    // k1
    let v1 = dir;
    let a1 = getAccelSchwarzschild(pos, v1);

    // k2
    let p2 = pos + v1 * (0.5 * dt);
    let v2 = dir + a1 * (0.5 * dt);
    let a2 = getAccelSchwarzschild(p2, v2);

    // k3
    let p3 = pos + v2 * (0.5 * dt);
    let v3 = dir + a2 * (0.5 * dt);
    let a3 = getAccelSchwarzschild(p3, v3);

    // k4
    let p4 = pos + v3 * dt;
    let v4 = dir + a3 * dt;
    let a4 = getAccelSchwarzschild(p4, v4);

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
  var finalColor = vec4f(accumulatedColor + transmittance * sky, 1.0);

  // --- Debug Circles (Billboarded / Head-on) ---
  if (uniforms.showDebugCircles > 0.5) {
      // Intersect initial camera ray with plane passing through origin, normal = camFwd
      // Plane: P . N = 0 (since it passes through origin)
      // Ray: P = O + t*D
      // (O + t*D) . N = 0  =>  O.N + t*(D.N) = 0  =>  t = - (O.N) / (D.N)
      
      // Re-calculate initial direction
      let initialDir = normalize(uniforms.camFwd
              + ndc.x * halfX * uniforms.camRight
              + ndc.y * halfY * uniforms.camUp);

      let denom = dot(initialDir, uniforms.camFwd);
      
      if (abs(denom) > 0.001) {
          let tPlane = -dot(uniforms.camPos, uniforms.camFwd) / denom;
          
          if (tPlane > 0.0) {
              let hitPlane = uniforms.camPos + tPlane * initialDir;
              let rPlane = length(hitPlane);
              
              // Circle thickness
              let thickness = 0.05 * rPlane; 
              let w = 0.1;

              // Red Circle at RS (2.0)
              let dRS = abs(rPlane - RS);
              let alphaRS = smoothstep(w, 0.0, dRS);
              finalColor = mix(finalColor, vec4f(1.0, 0.0, 0.0, 1.0), alphaRS);

              // Green Circle at ISCO (3 * RS = 6.0)
              let ISCO = 3.0 * RS;
              let dISCO = abs(rPlane - ISCO);
              let alphaISCO = smoothstep(w, 0.0, dISCO);
              finalColor = mix(finalColor, vec4f(0.0, 1.0, 0.0, 1.0), alphaISCO);
          }
      }
  }

  return finalColor;
}

