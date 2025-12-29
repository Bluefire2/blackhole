(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const p of document.querySelectorAll('link[rel="modulepreload"]'))i(p);new MutationObserver(p=>{for(const c of p)if(c.type==="childList")for(const r of c.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(p){const c={};return p.integrity&&(c.integrity=p.integrity),p.referrerPolicy&&(c.referrerPolicy=p.referrerPolicy),p.crossOrigin==="use-credentials"?c.credentials="include":p.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function i(p){if(p.ep)return;p.ep=!0;const c=t(p);fetch(p.href,c)}})();const H=(o,e,t)=>Math.min(Math.max(o,e),t),O=o=>o*Math.PI/180;let F=1;function te(o){F=H(o,.25,1)}function B(o){const e=Math.max(1,window.devicePixelRatio||1),t=Math.round(o.clientWidth*e*F),i=Math.round(o.clientHeight*e*F);return(o.width!==t||o.height!==i)&&(o.width=t,o.height=i),{width:t,height:i}}function ne(o){const e={yaw:0,pitch:O(4.5),radius:18,fovY:Math.PI/3,roll:0,update:r=>{}},t={q:!1,e:!1};window.addEventListener("keydown",r=>{r.key.toLowerCase()==="q"&&(t.q=!0),r.key.toLowerCase()==="e"&&(t.e=!0)}),window.addEventListener("keyup",r=>{r.key.toLowerCase()==="q"&&(t.q=!1),r.key.toLowerCase()==="e"&&(t.e=!1)});let i=!1,p=0,c=0;return o.addEventListener("mousedown",r=>{i=!0,p=r.clientX,c=r.clientY}),window.addEventListener("mouseup",()=>{i=!1}),window.addEventListener("mousemove",r=>{if(!i)return;const l=r.clientX-p,d=r.clientY-c;p=r.clientX,c=r.clientY;const f=.005;e.yaw+=l*f,e.pitch+=d*f;const n=O(89.5);e.pitch=H(e.pitch,-n,n)}),o.addEventListener("wheel",r=>{r.preventDefault(),e.radius*=Math.exp(r.deltaY*.001),e.radius=H(e.radius,2.5,100)},{passive:!1}),e.update=r=>{t.q&&(e.roll-=1*r),t.e&&(e.roll+=1*r)},e}function ie(o){const e=Math.cos(o.yaw),t=Math.sin(o.yaw),i=Math.cos(o.pitch),p=Math.sin(o.pitch),c=o.radius,r=[0,0,0],l=[c*t*i,c*p,c*e*i];let d=[r[0]-l[0],r[1]-l[1],r[2]-l[2]];{const a=Math.hypot(d[0],d[1],d[2])||1;d=[d[0]/a,d[1]/a,d[2]/a]}const f=[0,1,0];let n=[f[1]*d[2]-f[2]*d[1],f[2]*d[0]-f[0]*d[2],f[0]*d[1]-f[1]*d[0]];{const a=Math.hypot(n[0],n[1],n[2])||1;n=[n[0]/a,n[1]/a,n[2]/a]}let s=[d[1]*n[2]-d[2]*n[1],d[2]*n[0]-d[0]*n[2],d[0]*n[1]-d[1]*n[0]];{const a=Math.hypot(s[0],s[1],s[2])||1;s=[s[0]/a,s[1]/a,s[2]/a]}if(o.roll!==0){const a=Math.cos(o.roll),v=Math.sin(o.roll),g=[n[0]*a+s[0]*v,n[1]*a+s[1]*v,n[2]*a+s[2]*v],m=[-n[0]*v+s[0]*a,-n[1]*v+s[1]*a,-n[2]*v+s[2]*a];n=g,s=m}return{camPos:l,camFwd:d,camRight:n,camUp:s}}const oe=`struct VSOut {
  @builtin(position) position : vec4f
};

const MAX_STEPS : i32 = 1500;
const RS : f32 = 2.0;       // Schwarzschild radius
const R_INNER : f32 = 6.0;  // Accretion disk inner radius (ISCO)
const R_OUTER : f32 = 14.0; // Accretion disk outer radius

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
  useNoiseTexture : f32, // 1.0 = texture, 0.0 = procedural

  metricType : f32, // 0.0 = Schwarzschild, 1.0 = Kerr
  spin       : f32, // a, default 0.9 for Kerr
};

@group(0) @binding(0)
var<uniform> uniforms : Uniforms;

@group(0) @binding(1) var noiseTex : texture_2d<f32>;
@group(0) @binding(2) var noiseSampler : sampler;

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
    
    let period = 20.0; 
    let omega = 2.0 * pow(max(r, R_INNER), -0.5); 
    
    let baseAngle = 3.0 * log(r);

    // --- Layer 1 ---
    let phase1 = fract(time / period);
    let weight1 = 1.0 - abs(2.0 * phase1 - 1.0); 
    let age1 = (phase1 - 0.5) * period; 
    let theta1 = -omega * age1 + baseAngle;
    
    let c1 = cos(theta1); let s1 = sin(theta1);
    
    var n1 : f32;
    if (uniforms.useNoiseTexture > 0.5) {
        let uv1 = vec2f(hit.x * c1 - hit.z * s1, hit.x * s1 + hit.z * c1) * 0.1;
        n1 = textureSampleLevel(noiseTex, noiseSampler, uv1, 0.0).r;
    } else {
        let rot1 = vec2f(hit.x * c1 - hit.z * s1, hit.x * s1 + hit.z * c1);
        n1 = fbm2(rot1 * 0.5);
    }

    // --- Layer 2 ---
    let phase2 = fract((time / period) + 0.5);
    let weight2 = 1.0 - abs(2.0 * phase2 - 1.0);
    let age2 = (phase2 - 0.5) * period;
    let theta2 = -omega * age2 + baseAngle;

    let c2 = cos(theta2); let s2 = sin(theta2);
    
    var n2 : f32;
    if (uniforms.useNoiseTexture > 0.5) {
        let uv2 = vec2f(hit.x * c2 - hit.z * s2, hit.x * s2 + hit.z * c2) * 0.1;
        n2 = textureSampleLevel(noiseTex, noiseSampler, uv2, 0.0).r;
    } else {
        let rot2 = vec2f(hit.x * c2 - hit.z * s2, hit.x * s2 + hit.z * c2);
        n2 = fbm2(rot2 * 0.5);
    }

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
    // We can just sample the texture again with a different scale
    let shapeNoise = textureSampleLevel(noiseTex, noiseSampler, noiseUV * 0.05, 0.0).r; 
    
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

// ---- Kerr Metric Helpers (Kerr-Schild coordinates) ----

fn solve_r_kerr(p : vec3f, a : f32) -> f32 {
  // r^4 - (x^2 + y^2 + z^2 - a^2) r^2 - a^2 z^2 = 0
  let rho2 = dot(p, p);
  // In our coordinates, Y is the axis of rotation (per previous analysis)
  let axisCoord = p.y; 
  let z2 = axisCoord * axisCoord;
  
  let term = rho2 - a * a;
  let disc = term * term + 4.0 * a * a * z2;
  return sqrt(0.5 * (term + sqrt(disc)));
}

struct Derivatives {
  dx_dlambda : vec4f, // velocity (v^mu)
  dp_dlambda : vec4f, // force    (dp_mu/dlambda)
}

fn getKerrDerivatives(pos : vec4f, mom : vec4f, a : f32) -> Derivatives {
    let p3 = pos.yzw; // spatial position
    let r = solve_r_kerr(p3, a);
    
    let r2 = r * r;
    let a2 = a * a;
    let x = p3.x;
    let y = p3.y; // Axis of rotation
    let z = p3.z;
    
    // Metric function f = 2Mr^3 / (r^4 + a^2 y^2) [since y is axis]
    let f_num = RS * r * r * r; 
    let f_den = r2 * r2 + a2 * y * y;
    let f = f_num / f_den;
    
    // Null vector l_mu (covariant) in Kerr-Schild coordinates (Y-axis rotation)
    // l_x = (rx + az) / (r^2 + a^2)
    // l_z = (rz - ax) / (r^2 + a^2)
    // l_y = y / r
    let inv_r2_a2 = 1.0 / (r2 + a2);
    let lx = (r * x + a * z) * inv_r2_a2;
    let lz = (r * z - a * x) * inv_r2_a2;
    let ly = y / r;
    
    let l_vec_cov = vec4f(1.0, lx, ly, lz); 

    // l^mu = eta^uv l_v. eta = diag(-1, 1, 1, 1).
    // so l^0 = -1, l^i = l_i
    let l_upper = vec4f(-1.0, lx, ly, lz);
    
    // P_dot_l = l^u p_u = l^0 p_0 + l^i p_i
    let P_dot_l = dot(l_upper, mom);
    
    // 1. dx/dlambda = p^u - f * (P.l) * l^u
    // p^u = eta^uv p_v.
    let p_upper = vec4f(-mom.x, mom.y, mom.z, mom.w);
    let dx = p_upper - f * P_dot_l * l_upper;
    
    // 2. dp/dlambda = - dH/dx
    // H(x, p) = 0.5 * p^2 - 0.5 * f * (P.l)^2
    // Calculate derivatives via finite differences for robustness.
    // We hold p constant and vary x.
    
    let eps = 0.002;
    let dx_val = vec3f(eps, 0.0, 0.0);
    let dy_val = vec3f(0.0, eps, 0.0);
    let dz_val = vec3f(0.0, 0.0, eps);
    
    // Helper to evaluate H_pot = -0.5 * f * (P.l)^2 at pos p_in
    // We ignore p^2 term as it's constant for partial deriv wrt x.
    
    let H_val = get_H_pot(p3, mom, a);
    let H_px  = get_H_pot(p3 + dx_val, mom, a);
    let H_py  = get_H_pot(p3 + dy_val, mom, a);
    let H_pz  = get_H_pot(p3 + dz_val, mom, a);
    
    let dH_dx = (H_px - H_val) / eps;
    let dH_dy = (H_py - H_val) / eps;
    let dH_dz = (H_pz - H_val) / eps;
    
    let dp = vec4f(0.0, -dH_dx, -dH_dy, -dH_dz);
    
    var out : Derivatives;
    out.dx_dlambda = dx;
    out.dp_dlambda = dp;
    return out;
}

fn get_H_pot(p3 : vec3f, mom : vec4f, a : f32) -> f32 {
    let r = solve_r_kerr(p3, a);
    let r2 = r * r;
    let a2 = a * a;
    let x = p3.x; 
    let y = p3.y;
    let z = p3.z;
    
    let f = (RS * r * r * r) / (r2 * r2 + a2 * y * y);
    
    let inv = 1.0 / (r2 + a2);
    let lx = (r * x + a * z) * inv;
    let lz = (r * z - a * x) * inv;
    let ly = y / r;
    
    let l_upper = vec4f(-1.0, lx, ly, lz);
    let P_dot_l = dot(l_upper, mom);
    
    return -0.5 * f * P_dot_l * P_dot_l;
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
  
  // Decide metric parameters
  let isKerr = (uniforms.metricType > 0.5);
  let spinA = select(0.0, uniforms.spin, isKerr);
  
  // Horizon radius
  // For Schwarzschild: RS (2.0)
  // For Kerr: r+ = M + sqrt(M^2 - a^2). Integrate uses M=1 scale usually, but here RS=2M.
  // M = RS/2 = 1.0. r+ = 1 + sqrt(1 - a^2).
  // If we are consistent with units RS=2.0 implies M=1.0.
  let rPlus = 1.0 + sqrt(max(0.0, 1.0 - spinA * spinA));
  let horizonRad = select(RS, rPlus, isKerr);

  // Initial State for Kerr (Hamiltonian)
  // We need 4-momentum p_mu.
  // For light ray: p^mu dx_mu = 0 (null).
  // At infinity (camera), metric is roughly Minkowski.
  // p_mu = (E, vec_p). E = -p_t. |vec_p| = E.
  // Let's set energy E = 1.0. Then vec_p = dir.
  // So p_mu (covariant) at camera = (-1, dir.x, dir.y, dir.z).
  
  var myPos4 = vec4f(0.0, pos); // t=0
  var myMom4 = vec4f(-1.0, dir);


  // Ray marching loop
  let maxSteps = i32(uniforms.maxSteps);

  if (isKerr) {
      // --- KERR INTEGRATION ---
      // We use Hamiltonian dynamics (H = 1/2 g^uv p_u p_v) instead of the geodesic equation with Christoffel symbols.
      // Reasons:
      // 1. Simplicity: Avoids calculating ~40 non-zero Christoffel symbols for the Kerr metric.
      // 2. Robustness: Only requires the metric function (f) and its spatial derivatives.
      // 3. Universality: The same Hamiltonian framework handles any metric form (Kerr-Schild here) by just swapping the potential H.
      for (var i : i32 = 0; i < MAX_STEPS; i = i + 1) {
        if (i >= maxSteps) { break; }
        
        let p3 = myPos4.yzw;
        let r = solve_r_kerr(p3, spinA);
        
        // 1. Horizon Check
        if (r < horizonRad + 0.05) {
            transmittance = 0.0;
            break; 
        }
        
        // 2. Step size
        // Adaptive based on distance
        let baseDt = max(0.05, 0.05 * r);
        let distToPlane = abs(p3.y);
        let planeFactor = smoothstep(0.0, 0.5, distToPlane);
        
        // For Kerr, photon region is complex (r=1 to 4 depending on spin/grade).
        // Safest is to just reduce step size generally when close to the black hole.
        let distToHole = max(0.0, r - horizonRad);
        
        // Broad region of high precision near the hole
        let holeFactor = smoothstep(0.0, 3.0, distToHole); 
        
        let detail = min(planeFactor, holeFactor);
        let dt = baseDt * mix(0.01, 1.0, detail) * uniforms.stepScale;

        // 3. RK4
        let k1 = getKerrDerivatives(myPos4, myMom4, spinA);
        
        let pos2 = myPos4 + k1.dx_dlambda * (0.5 * dt);
        let mom2 = myMom4 + k1.dp_dlambda * (0.5 * dt);
        let k2 = getKerrDerivatives(pos2, mom2, spinA);
        
        let pos3 = myPos4 + k2.dx_dlambda * (0.5 * dt);
        let mom3 = myMom4 + k2.dp_dlambda * (0.5 * dt);
        let k3 = getKerrDerivatives(pos3, mom3, spinA);
        
        let pos4 = myPos4 + k3.dx_dlambda * dt;
        let mom4 = myMom4 + k3.dp_dlambda * dt;
        let k4 = getKerrDerivatives(pos4, mom4, spinA);
        
        let nextPos4 = myPos4 + (k1.dx_dlambda + 2.0 * k2.dx_dlambda + 2.0 * k3.dx_dlambda + k4.dx_dlambda) * (dt / 6.0);
        let nextMom4 = myMom4 + (k1.dp_dlambda + 2.0 * k2.dp_dlambda + 2.0 * k3.dp_dlambda + k4.dp_dlambda) * (dt / 6.0); // momentum also evolves!
        
        // 4. Disk Intersection
        // The accretion disk lies in the plane y=0 (Kerr-Schild coordinates).
        // Checks crossing of y-component (index 2 of spatial vector, index 2 of 4-pos).
        let curY = myPos4.z;
        let worldY_curr = p3.y;
        let worldY_next = nextPos4.z; // component 2 is y
        
        if (worldY_curr * worldY_next < 0.0) {
             let frac = -worldY_curr / (worldY_next - worldY_curr);
             let hit4 = mix(myPos4, nextPos4, frac);
             let hit = hit4.yzw;
             let d = length(hit); // Simple radius for disk mapping

             if (d > R_INNER && d < R_OUTER) {
                 // Simple texture mapping for now (ignoring visual twisting of the texture itself)
                 
                 let disk = getDiskColor(hit, d);
                 accumulatedColor = accumulatedColor + transmittance * disk.rgb * disk.a;
                 transmittance = transmittance * (1.0 - disk.a);
                 if (transmittance < 0.01) { break; }
             }
        }
        
        myPos4 = nextPos4;
        myMom4 = nextMom4;
        
        // Update generic pos/dir for sky lookup if we break
        pos = myPos4.yzw;
        dir = normalize(myMom4.yzw); // spatial direction
        
        if (r > 100.0) { break; }
      }

  } else {
      // --- SCHWARZSCHILD INTEGRATION (Existing) ---
      for (var i : i32 = 0; i < MAX_STEPS; i = i + 1) {
        if (i >= maxSteps) {
          break;
        }
        let r2 = dot(pos, pos);
        let r  = sqrt(r2);

        // 1. Event Horizon Check
        if (r < horizonRad) {
          transmittance = 0.0;
          break;
        }

        // 2. Adaptive Step Size
        let baseDt = max(0.05, 0.1 * r);
        let distToPlane = abs(pos.y);
        let planeFactor = smoothstep(0.0, 0.5, distToPlane); 
        let distToPhotonSphere = abs(r - 3.0);
        let photonSphereFactor = smoothstep(0.0, 1.0, distToPhotonSphere); 
        let detailFactor = min(planeFactor, photonSphereFactor);
        let dt = baseDt * mix(0.002, 1.0, detailFactor) * uniforms.stepScale;

        // 3. RK4 Integration Steps
        let v1 = dir;
        let a1 = getAccelSchwarzschild(pos, v1);

        let p2 = pos + v1 * (0.5 * dt);
        let v2 = dir + a1 * (0.5 * dt);
        let a2 = getAccelSchwarzschild(p2, v2);

        let p3 = pos + v2 * (0.5 * dt);
        let v3 = dir + a2 * (0.5 * dt);
        let a3 = getAccelSchwarzschild(p3, v3);

        let p4 = pos + v3 * dt;
        let v4 = dir + a3 * dt;
        let a4 = getAccelSchwarzschild(p4, v4);

        let nextPos = pos + (v1 + 2.0 * v2 + 2.0 * v3 + v4) * (dt / 6.0);
        let nextDir = normalize(dir + (a1 + 2.0 * a2 + 2.0 * a3 + a4) * (dt / 6.0));

        // 4. Accretion Disk Intersection (Plane y=0)
        if (pos.y * nextPos.y < 0.0) {
            let frac = -pos.y / (nextPos.y - pos.y);
            let hit = mix(pos, nextPos, frac);
            let d = length(hit);

            if (d > R_INNER && d < R_OUTER) {
                let disk = getDiskColor(hit, d);
                accumulatedColor = accumulatedColor + transmittance * disk.rgb * disk.a;
                transmittance = transmittance * (1.0 - disk.a);

                if (transmittance < 0.01) {
                    break;
                }
            }
        }
        
        pos = nextPos;
        dir = nextDir;

        if (r > 200.0) {
            break;
        }
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
`,re=oe;class Y{element;contentElement;toggleBtn;collapsed=!1;sectionSystem;sectionCamera;sectionPosition;sectionPhysics;lastHtmlSystem="";lastHtmlCamera="";lastHtmlPosition="";lastHtmlPhysics="";constructor(e="overlay"){const t=document.getElementById(e);if(!t)throw new Error(`Overlay element with id "${e}" not found`);this.element=t,this.element.innerHTML=`
      <div id="overlay-header">
        <span style="color: rgba(0,255,255,0.7); font-size: 0.8em; letter-spacing: 2px;">HUD</span>
        <button class="overlay-toggle-btn">HIDE</button>
      </div>
      <div id="overlay-content" style="display: flex; flex-direction: column; gap: 4px;"></div>
    `,this.contentElement=this.element.querySelector("#overlay-content"),this.toggleBtn=this.element.querySelector(".overlay-toggle-btn"),this.sectionSystem=document.createElement("div"),this.sectionCamera=document.createElement("div"),this.sectionPosition=document.createElement("div"),this.sectionPhysics=document.createElement("div"),this.contentElement.appendChild(this.sectionSystem),this.contentElement.appendChild(this.sectionCamera),this.contentElement.appendChild(this.sectionPosition),this.contentElement.appendChild(this.sectionPhysics),this.toggleBtn.addEventListener("click",()=>this.toggle())}toggle(){this.collapsed=!this.collapsed,this.element.classList.toggle("collapsed",this.collapsed),this.toggleBtn.textContent=this.collapsed?"SHOW":"HIDE"}setText(e){this.sectionSystem.textContent=e,this.sectionCamera.innerHTML="",this.sectionPosition.innerHTML="",this.sectionPhysics.innerHTML=""}setError(e){this.sectionSystem.innerHTML=`<div style="color: #f00">Error: ${e}</div>`}setInfo(e){this.sectionSystem.innerHTML=`<div style="color: #0f0">${e}</div>`}updateSection(e,t,i,p){if(!i)return e.style.display!=="none"&&(e.style.display="none",e.innerHTML=""),"";const c=`
      <div class="overlay-section">
        <div class="overlay-section-title">${t}</div>
        ${i}
      </div>`;return c!==p?(e.innerHTML=c,e.style.display="block",c):(e.style.display==="none"&&(e.style.display="block"),p)}setMetrics(e){const t=(l,d,f="",n="")=>`
        <div class="overlay-row">
          <span class="overlay-label">${l}</span>
          <span>
            <span class="overlay-value ${n}">${d}</span>
            ${f?`<span class="overlay-unit">${f}</span>`:""}
          </span>
        </div>`;let i="";e.fps!==void 0&&(i+=t("FPS",e.fps.toFixed(1))),e.time!==void 0&&(i+=t("Sim Time",e.time.toFixed(1),"s")),e.resolution&&(i+=t("Res",e.resolution)),e.maxRaySteps!==void 0&&(i+=t("Max Steps",e.maxRaySteps.toString())),this.lastHtmlSystem=this.updateSection(this.sectionSystem,"System",i,this.lastHtmlSystem);let p="";e.fov!==void 0&&(p+=t("FOV",(e.fov*180/Math.PI).toFixed(1),"°")),e.pitch!==void 0&&(p+=t("Pitch",e.pitch.toFixed(1),"°")),e.yaw!==void 0&&(p+=t("Yaw",e.yaw.toFixed(1),"°")),e.roll!==void 0&&(p+=t("Roll",e.roll.toFixed(1),"°")),this.lastHtmlCamera=this.updateSection(this.sectionCamera,"Camera",p,this.lastHtmlCamera);let c="";if(e.distance!==void 0&&(c+=t("Distance",e.distance.toFixed(2),"Rₛ")),e.distanceToHorizon!==void 0){const l=e.distanceToHorizon;let d="";l<.1?d="danger":l<.5&&(d="warning"),c+=t("Dist to Horizon",l.toFixed(3),"Rₛ",d)}this.lastHtmlPosition=this.updateSection(this.sectionPosition,"Position",c,this.lastHtmlPosition);let r="";if(e.metric){let l=e.metric;l==="Schwarzschild"?l='<a href="https://en.wikipedia.org/wiki/Schwarzschild_metric" target="_blank" rel="noopener noreferrer">Schwarzschild&nbsp;↗</a>':l==="Kerr"&&(l='<a href="https://en.wikipedia.org/wiki/Kerr_metric" target="_blank" rel="noopener noreferrer">Kerr&nbsp;↗</a>'),r+=t("Metric",l),e.frameDragOmega!==void 0&&(r+=t("Frame Drag Ω",e.frameDragOmega.toFixed(4),"rad/s"))}e.orbitalVelocity!==void 0&&(r+=t("Orbital Vel",e.orbitalVelocity.toFixed(3),"c")),e.gForce!==void 0&&(r+=t("Local g",e.gForce.toFixed(3),"c²/Rₛ")),e.timeDilation!==void 0&&(r+=t("Time Dilation",e.timeDilation.toFixed(4))),e.redshift!==void 0&&(isFinite(e.redshift)?r+=t("Redshift z",(e.redshift>=0?"+":"")+e.redshift.toFixed(4)):r+=t("Redshift z","∞")),this.lastHtmlPhysics=this.updateSection(this.sectionPhysics,"Physics",r,this.lastHtmlPhysics)}getElement(){return this.element}}function se(o){const t=new Uint8Array(1048576),i=new Uint8Array(512),p=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];for(let n=0;n<256;n++)i[256+n]=i[n]=p[n];function c(n){return n*n*n*(n*(n*6-15)+10)}function r(n,s,a){return s+n*(a-s)}function l(n,s,a,v){const g=n&15,m=g<8?s:a,u=g<4?a:g==12||g==14?s:v;return((g&1)==0?m:-m)+((g&2)==0?u:-u)}function d(n,s,a){const v=Math.floor(n)&255,g=Math.floor(s)&255,m=Math.floor(a)&255;n-=Math.floor(n),s-=Math.floor(s),a-=Math.floor(a);const u=c(n),h=c(s),x=c(a),b=i[v]+g,P=i[b]+m,E=i[b+1]+m,y=i[v+1]+g,_=i[y]+m,R=i[y+1]+m;return r(x,r(h,r(u,l(i[P],n,s,a),l(i[_],n-1,s,a)),r(u,l(i[E],n,s-1,a),l(i[R],n-1,s-1,a))),r(h,r(u,l(i[P+1],n,s,a-1),l(i[_+1],n-1,s,a-1)),r(u,l(i[E+1],n,s-1,a-1),l(i[R+1],n-1,s-1,a-1))))}for(let n=0;n<512;n++)for(let s=0;s<512;s++){let v=0,g=.5,m=1;for(let x=0;x<4;x++){const b=s*.05*m,P=n*.05*m;v+=g*d(b,P,0),g*=.5,m*=2}const u=Math.floor((v+1)*.5*255),h=(n*512+s)*4;t[h]=u,t[h+1]=u,t[h+2]=u,t[h+3]=255}const f=o.createTexture({size:[512,512],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});return o.queue.writeTexture({texture:f},t,{bytesPerRow:512*4},{width:512,height:512}),f}async function ae(o,e){if(!("gpu"in navigator))throw e.setError("WebGPU not supported in this browser."),new Error("WebGPU not supported in this browser.");const t=await navigator.gpu.requestAdapter();if(!t)throw e.setError("No GPU adapter found."),new Error("No GPU adapter found.");const i=await t.requestDevice();i.addEventListener("uncapturederror",v=>{const m=v.error.message;console.error("WebGPU Uncaptured Error:",m),e.setError(`GPU Error: ${m}`)});const c=i.createBuffer({size:96,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),r=se(i),l=i.createSampler({magFilter:"linear",minFilter:"linear",mipmapFilter:"linear",addressModeU:"repeat",addressModeV:"repeat"}),d=i.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT|GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]}),f=i.createPipelineLayout({bindGroupLayouts:[d]}),n=i.createBindGroup({layout:d,entries:[{binding:0,resource:{buffer:c}},{binding:1,resource:r.createView()},{binding:2,resource:l}]}),s=o.getContext("webgpu");if(!s)throw e.setError("Could not get webgpu context."),new Error("Could not get webgpu context.");const a=navigator.gpu.getPreferredCanvasFormat();return s.configure({device:i,format:a,alphaMode:"opaque"}),{device:i,context:s,uniformBuffer:c,bindGroup:n,pipelineLayout:f,canvasFormat:a}}async function le(o,e,t,i,p){const c=o.createShaderModule({code:re}),r=await c.getCompilationInfo();if(r.messages.length>0){let l=!1;for(const d of r.messages)console.log(`Shader ${d.type}: ${d.message} at line ${d.lineNum}`),d.type==="error"&&(l=!0);if(l)throw new Error("Shader compilation failed. Check console for details.")}return o.createRenderPipeline({layout:e,vertex:{module:c,entryPoint:"vs_main"},fragment:{module:c,entryPoint:"fs_main",targets:[{format:t}]},primitive:{topology:"triangle-list"}})}let q=1e3,V=1,$=!1,N="Schwarzschild",C=.9;function ce(o){V=Math.min(2,Math.max(.5,o))}function de(o){$=o}function pe(o,e=.9){N=o,C=e}function fe(o,e){const t=o[0],i=o[1],p=o[2],c=t*t+i*i+p*p,r=e*e,l=c-r,d=l*l+4*r*i*i;return Math.sqrt(.5*(l+Math.sqrt(d)))}async function me(o,e,t,i){B(o);const p=await le(t.device,t.pipelineLayout,t.canvasFormat);let c=performance.now(),r=0;const l=[],d=30,f=2,n=6;function s(){const a=performance.now(),v=(a-c)/1e3;c=a,l.push(v),l.length>d&&l.shift(),r=1/(l.reduce((w,S)=>w+S,0)/l.length),i.update(v);const{camPos:m,camFwd:u,camRight:h,camUp:x}=ie(i),{width:b,height:P}=B(o),E=performance.now()/1e3,y=Math.hypot(m[0],m[1],m[2]),_=N==="Kerr",R=_?1+Math.sqrt(Math.max(0,1-C*C)):f,X=(y-R)/(_?1:f),W=y>1.5*R?Math.sqrt(f/(2*y)):0;let k=0;if(y>f){const w=2*y*y*Math.sqrt(1-f/y);w>1e-4?k=f/w:k=1/0}else k=1/0;let z=0;y>f?z=Math.sqrt(1-f/y):y>0&&(z=0);let L;if(_){const w=C,S=fe(m,w),J=Math.acos(Math.abs(m[1])/S),A=S*S,I=w*w,Q=Math.sin(J)**2,ee=A-f*S+I,U=(A+I)**2-ee*I*Q;U>1e-4&&(L=f*S*w/U)}let T=1/0;if(y>f&&n>f){const w=1-f/y,S=1-f/n;w>0&&(T=Math.sqrt(w/S)-1)}else y<=f&&(T=1/0);e.setMetrics({resolution:`${b}x${P}`,pitch:i.pitch*180/Math.PI,yaw:i.yaw*180/Math.PI,roll:i.roll*180/Math.PI,distance:y/f,time:E,distanceToHorizon:X,orbitalVelocity:W,gForce:k,fov:i.fovY,maxRaySteps:q,fps:r,timeDilation:z,redshift:T,metric:N,spin:_?C:void 0,frameDragOmega:L});const Z=new Float32Array([b,P,E,i.fovY,m[0],m[1],m[2],0,u[0],u[1],u[2],q,h[0],h[1],h[2],V,x[0],x[1],x[2],$?1:0,_?1:0,C,0,0]);t.device.queue.writeBuffer(t.uniformBuffer,0,Z);const D=t.device.createCommandEncoder(),j=t.context.getCurrentTexture().createView(),M=D.beginRenderPass({colorAttachments:[{view:j,loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:1}}]});M.setPipeline(p),M.setBindGroup(0,t.bindGroup),M.draw(3,1,0,0),M.end(),t.device.queue.submit([D.finish()]),requestAnimationFrame(s)}requestAnimationFrame(s)}async function G(){const o=document.getElementById("gpu-canvas");if(!o)throw new Error("gpu-canvas not found");const e=new Y;e.setText("Initializing...");const t=document.getElementById("render-scale"),i=document.getElementById("render-scale-value");if(t&&i){const m=h=>{Number.isFinite(h)&&(te(h),i.textContent=`${Math.round(h*100)}%`)},u=Number(t.value||"1");m(u),t.addEventListener("input",h=>{const x=h.target,b=Number(x.value);m(b)})}const p=document.getElementById("step-scale"),c=document.getElementById("step-scale-value");if(p&&c){const m=h=>{Number.isFinite(h)&&(ce(h),c.textContent=`${h.toFixed(1)}×`)},u=Number(p.value||"1");m(u),p.addEventListener("input",h=>{const x=h.target,b=Number(x.value);m(b)})}const r=document.getElementById("use-noise-texture");r&&r.addEventListener("change",m=>{const u=m.target;de(u.checked)});const l=document.getElementById("spin-slider"),d=document.getElementById("spin-value"),f=document.getElementById("spin-row"),n=document.querySelectorAll('input[name="metric"]');if(l&&d&&f&&n.length>0){const m=()=>{let u="Schwarzschild";for(const x of n)x.checked&&(u=x.value);const h=Number(l.value);pe(u,h),d.textContent=h.toFixed(2),u==="Kerr"?f.style.display="grid":f.style.display="none"};m(),n.forEach(u=>{u.addEventListener("change",m)}),l.addEventListener("input",m)}const s=document.getElementById("interaction-hint"),a=()=>{s&&(s.classList.add("fade-out"),setTimeout(()=>s.remove(),500)),window.removeEventListener("mousedown",a),window.removeEventListener("touchstart",a),window.removeEventListener("keydown",a)};window.addEventListener("mousedown",a),window.addEventListener("touchstart",a),window.addEventListener("keydown",a),o.addEventListener("mousedown",()=>o.classList.add("grabbing")),o.addEventListener("mouseup",()=>o.classList.remove("grabbing")),o.addEventListener("mouseleave",()=>o.classList.remove("grabbing"));const v=ne(o),g=await ae(o,e);await me(o,e,g,v)}function K(o){console.error("Initialization error:",o);try{const e=new Y,t=o instanceof Error?o.message:String(o);e.setError(`Init error: ${t}`)}catch{console.error("Failed to create overlay for error display")}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{G().catch(K)}):G().catch(K);
