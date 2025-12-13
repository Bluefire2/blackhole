(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const c of document.querySelectorAll('link[rel="modulepreload"]'))n(c);new MutationObserver(c=>{for(const o of c)if(o.type==="childList")for(const f of o.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&n(f)}).observe(document,{childList:!0,subtree:!0});function i(c){const o={};return c.integrity&&(o.integrity=c.integrity),c.referrerPolicy&&(o.referrerPolicy=c.referrerPolicy),c.crossOrigin==="use-credentials"?o.credentials="include":c.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(c){if(c.ep)return;c.ep=!0;const o=i(c);fetch(c.href,o)}})();const M=(s,e,i)=>Math.min(Math.max(s,e),i),U=s=>s*Math.PI/180;let z=1;function Y(s){z=M(s,.25,1)}function O(s){const e=Math.max(1,window.devicePixelRatio||1),i=Math.round(s.clientWidth*e*z),n=Math.round(s.clientHeight*e*z);return(s.width!==i||s.height!==n)&&(s.width=i,s.height=n),{width:i,height:n}}function H(s){const e={yaw:0,pitch:U(4.5),radius:18,fovY:Math.PI/3};let i=!1,n=0,c=0;return s.addEventListener("mousedown",o=>{i=!0,n=o.clientX,c=o.clientY}),window.addEventListener("mouseup",()=>{i=!1}),window.addEventListener("mousemove",o=>{if(!i)return;const f=o.clientX-n,u=o.clientY-c;n=o.clientX,c=o.clientY;const d=.005;e.yaw+=f*d,e.pitch+=u*d;const l=U(89.5);e.pitch=M(e.pitch,-l,l)}),s.addEventListener("wheel",o=>{o.preventDefault(),e.radius*=Math.exp(o.deltaY*.001),e.radius=M(e.radius,2.5,100)},{passive:!1}),e}function X(s){const e=Math.cos(s.yaw),i=Math.sin(s.yaw),n=Math.cos(s.pitch),c=Math.sin(s.pitch),o=s.radius,f=[0,0,0],u=[o*i*n,o*c,o*e*n];let d=[f[0]-u[0],f[1]-u[1],f[2]-u[2]];{const a=Math.hypot(d[0],d[1],d[2])||1;d=[d[0]/a,d[1]/a,d[2]/a]}const l=[0,1,0];let t=[l[1]*d[2]-l[2]*d[1],l[2]*d[0]-l[0]*d[2],l[0]*d[1]-l[1]*d[0]];{const a=Math.hypot(t[0],t[1],t[2])||1;t=[t[0]/a,t[1]/a,t[2]/a]}let r=[d[1]*t[2]-d[2]*t[1],d[2]*t[0]-d[0]*t[2],d[0]*t[1]-d[1]*t[0]];{const a=Math.hypot(r[0],r[1],r[2])||1;r=[r[0]/a,r[1]/a,r[2]/a]}return{camPos:u,camFwd:d,camRight:t,camUp:r}}const W=`struct VSOut {
  @builtin(position) position : vec4f
};

const MAX_STEPS : i32 = 800;
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
    // AND near the photon sphere (r=3.0) where light bending is extreme.
    let baseDt = max(0.05, 0.1 * r);
    
    // Factor 1: Proximity to disk plane (y=0)
    let distToPlane = abs(pos.y);
    let planeFactor = smoothstep(0.0, 0.5, distToPlane); 
    
    // Factor 2: Proximity to Photon Sphere (r=3.0)
    // Reduce step size significantly when r is near 3.0
    let distToPhotonSphere = abs(r - 3.0);
    let photonSphereFactor = smoothstep(0.0, 2.0, distToPhotonSphere); // 0 at r=3, 1 at r=5
    
    // Combine factors: we want small steps if EITHER we are near the plane OR near the photon sphere
    let detailFactor = min(planeFactor, photonSphereFactor);
    
    // Allow step size to go down to 1% near critical regions
    let dt = baseDt * mix(0.01, 1.0, detailFactor) * uniforms.stepScale;

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
    // Use a radius comfortably larger than the maximum camera radius (camera is clamped to 100.0).
    // This ensures we still integrate geodesics when the observer is far away.
    if (r > 200.0) {
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
`,j=W;class L{element;constructor(e="overlay"){const i=document.getElementById(e);if(!i)throw new Error(`Overlay element with id "${e}" not found`);this.element=i}setText(e){this.element.textContent=e}setError(e){this.element.textContent=`Error: ${e}`,this.element.style.color="#f00"}setInfo(e){this.element.textContent=e,this.element.style.color="#0f0"}setMetrics(e){const i=[],n=[];e.resolution&&n.push(e.resolution),e.fov!==void 0&&n.push(`FOV: ${(e.fov*180/Math.PI).toFixed(1)}°`),e.pitch!==void 0&&n.push(`Pitch: ${e.pitch.toFixed(1)}°`),e.yaw!==void 0&&n.push(`Yaw: ${e.yaw.toFixed(1)}°`),e.distance!==void 0&&n.push(`Dist: ${e.distance.toFixed(1)} Rₛ`),n.length>0&&i.push(n.join(" | "));const c=[];e.metric&&c.push(`Metric: ${e.metric}`),e.distanceToHorizon!==void 0&&c.push(`Dist to Horizon: ${e.distanceToHorizon.toFixed(2)} Rₛ`),e.orbitalVelocity!==void 0&&c.push(`Orbital v: ${e.orbitalVelocity.toFixed(3)} c`),c.length>0&&i.push(c.join(" | "));const o=[];e.gForce!==void 0&&o.push(`Local g: ${e.gForce.toFixed(3)} c²/Rₛ`),e.timeDilation!==void 0&&o.push(`Time Dilation: ${e.timeDilation.toFixed(4)}`),e.redshift!==void 0&&(isFinite(e.redshift)?o.push(`Redshift z: ${e.redshift>=0?"+":""}${e.redshift.toFixed(4)}`):o.push("Redshift z: ∞")),o.length>0&&i.push(o.join(" | "));const f=[];e.fps!==void 0&&f.push(`FPS: ${e.fps.toFixed(1)}`),e.maxRaySteps!==void 0&&f.push(`Max Steps: ${e.maxRaySteps}`),e.time!==void 0&&f.push(`Time: ${e.time.toFixed(1)}s`),f.length>0&&i.push(f.join(" | ")),this.element.innerHTML=i.join("<br>"),this.element.style.color="#0f0"}getElement(){return this.element}}function K(s){const i=new Uint8Array(1048576),n=new Uint8Array(512),c=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];for(let t=0;t<256;t++)n[256+t]=n[t]=c[t];function o(t){return t*t*t*(t*(t*6-15)+10)}function f(t,r,a){return r+t*(a-r)}function u(t,r,a,m){const v=t&15,h=v<8?r:a,g=v<4?a:v==12||v==14?r:m;return((v&1)==0?h:-h)+((v&2)==0?g:-g)}function d(t,r,a){const m=Math.floor(t)&255,v=Math.floor(r)&255,h=Math.floor(a)&255;t-=Math.floor(t),r-=Math.floor(r),a-=Math.floor(a);const g=o(t),w=o(r),y=o(a),b=n[m]+v,x=n[b]+h,R=n[b+1]+h,p=n[m+1]+v,I=n[p]+h,C=n[p+1]+h;return f(y,f(w,f(g,u(n[x],t,r,a),u(n[I],t-1,r,a)),f(g,u(n[R],t,r-1,a),u(n[C],t-1,r-1,a))),f(w,f(g,u(n[x+1],t,r,a-1),u(n[I+1],t-1,r,a-1)),f(g,u(n[R+1],t,r-1,a-1),u(n[C+1],t-1,r-1,a-1))))}for(let t=0;t<512;t++)for(let r=0;r<512;r++){let m=0,v=.5,h=1;for(let y=0;y<4;y++){const b=r*.05*h,x=t*.05*h;m+=v*d(b,x,0),v*=.5,h*=2}const g=Math.floor((m+1)*.5*255),w=(t*512+r)*4;i[w]=g,i[w+1]=g,i[w+2]=g,i[w+3]=255}const l=s.createTexture({size:[512,512],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});return s.queue.writeTexture({texture:l},i,{bytesPerRow:512*4},{width:512,height:512}),l}async function Z(s,e){if(!("gpu"in navigator))throw e.setError("WebGPU not supported in this browser."),new Error("WebGPU not supported in this browser.");const i=await navigator.gpu.requestAdapter();if(!i)throw e.setError("No GPU adapter found."),new Error("No GPU adapter found.");const n=await i.requestDevice();n.addEventListener("uncapturederror",m=>{const h=m.error.message;console.error("WebGPU Uncaptured Error:",h),e.setError(`GPU Error: ${h}`)});const o=n.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),f=K(n),u=n.createSampler({magFilter:"linear",minFilter:"linear",mipmapFilter:"linear",addressModeU:"repeat",addressModeV:"repeat"}),d=n.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT|GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]}),l=n.createPipelineLayout({bindGroupLayouts:[d]}),t=n.createBindGroup({layout:d,entries:[{binding:0,resource:{buffer:o}},{binding:1,resource:f.createView()},{binding:2,resource:u}]}),r=s.getContext("webgpu");if(!r)throw e.setError("Could not get webgpu context."),new Error("Could not get webgpu context.");const a=navigator.gpu.getPreferredCanvasFormat();return r.configure({device:n,format:a,alphaMode:"opaque"}),{device:n,context:r,uniformBuffer:o,bindGroup:t,pipelineLayout:l,canvasFormat:a}}async function J(s,e,i,n,c){const o=s.createShaderModule({code:j}),f=await o.getCompilationInfo();if(f.messages.length>0){let u=!1;for(const d of f.messages)console.log(`Shader ${d.type}: ${d.message} at line ${d.lineNum}`),d.type==="error"&&(u=!0);if(u)throw new Error("Shader compilation failed. Check console for details.")}return s.createRenderPipeline({layout:e,vertex:{module:o,entryPoint:"vs_main"},fragment:{module:o,entryPoint:"fs_main",targets:[{format:i}]},primitive:{topology:"triangle-list"}})}let D=600,G=1,$=!0;function Q(s){G=Math.min(2,Math.max(.5,s))}function ee(s){$=s}async function te(s,e,i,n){O(s);const c=await J(i.device,i.pipelineLayout,i.canvasFormat);let o=performance.now(),f=0;const u=[],d=30,l=2,t=6;function r(){const a=performance.now(),m=(a-o)/1e3;o=a,u.push(m),u.length>d&&u.shift(),f=1/(u.reduce((S,T)=>S+T,0)/u.length);const{camPos:h,camFwd:g,camRight:w,camUp:y}=X(n),{width:b,height:x}=O(s),R=performance.now()/1e3,p=Math.hypot(h[0],h[1],h[2]),C=(p-l)/l,q=p>1.5*l?Math.sqrt(l/(2*p)):0;let P=0;if(p>l){const S=2*p*p*Math.sqrt(1-l/p);S>1e-4?P=l/S:P=1/0}else P=1/0;let N=0;p>l?N=Math.sqrt(1-l/p):p>0&&(N=0);let F=1/0;if(p>l&&t>l){const S=1-l/p,T=1-l/t;S>0&&(F=Math.sqrt(S/T)-1)}else p<=l&&(F=1/0);e.setMetrics({resolution:`${b}x${x}`,pitch:n.pitch*180/Math.PI,yaw:n.yaw*180/Math.PI,distance:p/l,time:R,distanceToHorizon:C,orbitalVelocity:q,gForce:P,fov:n.fovY,maxRaySteps:D,fps:f,timeDilation:N,redshift:F,metric:"Schwarzschild"});const _=new Float32Array([b,x,R,n.fovY,h[0],h[1],h[2],0,g[0],g[1],g[2],D,w[0],w[1],w[2],G,y[0],y[1],y[2],$?1:0]);i.device.queue.writeBuffer(i.uniformBuffer,0,_);const k=i.device.createCommandEncoder(),V=i.context.getCurrentTexture().createView(),E=k.beginRenderPass({colorAttachments:[{view:V,loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:1}}]});E.setPipeline(c),E.setBindGroup(0,i.bindGroup),E.draw(3,1,0,0),E.end(),i.device.queue.submit([k.finish()]),requestAnimationFrame(r)}requestAnimationFrame(r)}async function A(){const s=document.getElementById("gpu-canvas");if(!s)throw new Error("gpu-canvas not found");const e=new L;e.setText("Initializing...");const i=document.getElementById("render-scale"),n=document.getElementById("render-scale-value");if(i&&n){const l=r=>{Number.isFinite(r)&&(Y(r),n.textContent=`${Math.round(r*100)}%`)},t=Number(i.value||"1");l(t),i.addEventListener("input",r=>{const a=r.target,m=Number(a.value);l(m)})}const c=document.getElementById("step-scale"),o=document.getElementById("step-scale-value");if(c&&o){const l=r=>{Number.isFinite(r)&&(Q(r),o.textContent=`${r.toFixed(1)}×`)},t=Number(c.value||"1");l(t),c.addEventListener("input",r=>{const a=r.target,m=Number(a.value);l(m)})}const f=document.getElementById("use-noise-texture");f&&f.addEventListener("change",l=>{const t=l.target;ee(t.checked)});const u=H(s),d=await Z(s,e);await te(s,e,d,u)}function B(s){console.error("Initialization error:",s);try{const e=new L,i=s instanceof Error?s.message:String(s);e.setError(`Init error: ${i}`)}catch{console.error("Failed to create overlay for error display")}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{A().catch(B)}):A().catch(B);
