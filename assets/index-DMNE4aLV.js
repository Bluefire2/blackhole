(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const f of document.querySelectorAll('link[rel="modulepreload"]'))n(f);new MutationObserver(f=>{for(const d of f)if(d.type==="childList")for(const r of d.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(f){const d={};return f.integrity&&(d.integrity=f.integrity),f.referrerPolicy&&(d.referrerPolicy=f.referrerPolicy),f.crossOrigin==="use-credentials"?d.credentials="include":f.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function n(f){if(f.ep)return;f.ep=!0;const d=s(f);fetch(f.href,d)}})();const M=(o,e,s)=>Math.min(Math.max(o,e),s),L=o=>o*Math.PI/180;let T=1;function Y(o){T=M(o,.25,1)}function U(o){const e=Math.max(1,window.devicePixelRatio||1),s=Math.round(o.clientWidth*e*T),n=Math.round(o.clientHeight*e*T);return(o.width!==s||o.height!==n)&&(o.width=s,o.height=n),{width:s,height:n}}function $(o){const e={yaw:0,pitch:L(4.5),radius:18,fovY:Math.PI/3,roll:0,update:r=>{}},s={q:!1,e:!1};window.addEventListener("keydown",r=>{r.key.toLowerCase()==="q"&&(s.q=!0),r.key.toLowerCase()==="e"&&(s.e=!0)}),window.addEventListener("keyup",r=>{r.key.toLowerCase()==="q"&&(s.q=!1),r.key.toLowerCase()==="e"&&(s.e=!1)});let n=!1,f=0,d=0;return o.addEventListener("mousedown",r=>{n=!0,f=r.clientX,d=r.clientY}),window.addEventListener("mouseup",()=>{n=!1}),window.addEventListener("mousemove",r=>{if(!n)return;const u=r.clientX-f,l=r.clientY-d;f=r.clientX,d=r.clientY;const c=.005;e.yaw+=u*c,e.pitch+=l*c;const t=L(89.5);e.pitch=M(e.pitch,-t,t)}),o.addEventListener("wheel",r=>{r.preventDefault(),e.radius*=Math.exp(r.deltaY*.001),e.radius=M(e.radius,2.5,100)},{passive:!1}),e.update=r=>{s.q&&(e.roll-=1*r),s.e&&(e.roll+=1*r)},e}function X(o){const e=Math.cos(o.yaw),s=Math.sin(o.yaw),n=Math.cos(o.pitch),f=Math.sin(o.pitch),d=o.radius,r=[0,0,0],u=[d*s*n,d*f,d*e*n];let l=[r[0]-u[0],r[1]-u[1],r[2]-u[2]];{const a=Math.hypot(l[0],l[1],l[2])||1;l=[l[0]/a,l[1]/a,l[2]/a]}const c=[0,1,0];let t=[c[1]*l[2]-c[2]*l[1],c[2]*l[0]-c[0]*l[2],c[0]*l[1]-c[1]*l[0]];{const a=Math.hypot(t[0],t[1],t[2])||1;t=[t[0]/a,t[1]/a,t[2]/a]}let i=[l[1]*t[2]-l[2]*t[1],l[2]*t[0]-l[0]*t[2],l[0]*t[1]-l[1]*t[0]];{const a=Math.hypot(i[0],i[1],i[2])||1;i=[i[0]/a,i[1]/a,i[2]/a]}if(o.roll!==0){const a=Math.cos(o.roll),h=Math.sin(o.roll),m=[t[0]*a+i[0]*h,t[1]*a+i[1]*h,t[2]*a+i[2]*h],p=[-t[0]*h+i[0]*a,-t[1]*h+i[1]*a,-t[2]*h+i[2]*a];t=m,i=p}return{camPos:u,camFwd:l,camRight:t,camUp:i}}const W=`struct VSOut {
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
    let photonSphereFactor = smoothstep(0.0, 1.0, distToPhotonSphere); 
    
    // Combine factors: we want small steps if EITHER we are near the plane OR near the photon sphere
    let detailFactor = min(planeFactor, photonSphereFactor);
    
    // Allow step size to go down to 0.2% near critical regions
    let dt = baseDt * mix(0.002, 1.0, detailFactor) * uniforms.stepScale;

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
`,K=W;class A{element;contentElement;toggleBtn;collapsed=!1;constructor(e="overlay"){const s=document.getElementById(e);if(!s)throw new Error(`Overlay element with id "${e}" not found`);this.element=s,this.element.innerHTML=`
      <div id="overlay-header">
        <span style="color: rgba(0,255,255,0.7); font-size: 0.8em; letter-spacing: 2px;">HUD</span>
        <button class="overlay-toggle-btn">HIDE</button>
      </div>
      <div id="overlay-content"></div>
    `,this.contentElement=this.element.querySelector("#overlay-content"),this.toggleBtn=this.element.querySelector(".overlay-toggle-btn"),this.toggleBtn.addEventListener("click",()=>this.toggle())}toggle(){this.collapsed=!this.collapsed,this.element.classList.toggle("collapsed",this.collapsed),this.toggleBtn.textContent=this.collapsed?"SHOW":"HIDE"}setText(e){this.contentElement.textContent=e}setError(e){this.contentElement.textContent=`Error: ${e}`,this.contentElement.style.color="#f00"}setInfo(e){this.contentElement.textContent=e,this.contentElement.style.color="#0f0"}setMetrics(e){let s="";const n=(c,t,i="",a="")=>`
        <div class="overlay-row">
          <span class="overlay-label">${c}</span>
          <span>
            <span class="overlay-value ${a}">${t}</span>
            ${i?`<span class="overlay-unit">${i}</span>`:""}
          </span>
        </div>`,f=(c,t)=>t?`
        <div class="overlay-section">
          <div class="overlay-section-title">${c}</div>
          ${t}
        </div>`:"";let d="";e.fps!==void 0&&(d+=n("FPS",e.fps.toFixed(1))),e.time!==void 0&&(d+=n("Sim Time",e.time.toFixed(1),"s")),e.resolution&&(d+=n("Res",e.resolution)),e.maxRaySteps!==void 0&&(d+=n("Max Steps",e.maxRaySteps.toString())),s+=f("System",d);let r="";e.fov!==void 0&&(r+=n("FOV",(e.fov*180/Math.PI).toFixed(1),"°")),e.pitch!==void 0&&(r+=n("Pitch",e.pitch.toFixed(1),"°")),e.yaw!==void 0&&(r+=n("Yaw",e.yaw.toFixed(1),"°")),e.roll!==void 0&&(r+=n("Roll",e.roll.toFixed(1),"°")),s+=f("Camera",r);let u="";if(e.distance!==void 0&&(u+=n("Distance",e.distance.toFixed(2),"Rₛ")),e.distanceToHorizon!==void 0){const c=e.distanceToHorizon;let t="";c<.1?t="danger":c<.5&&(t="warning"),u+=n("Dist to Horizon",c.toFixed(3),"Rₛ",t)}s+=f("Position",u);let l="";if(e.metric){let c=e.metric;c==="Schwarzschild"&&(c='<a href="https://en.wikipedia.org/wiki/Schwarzschild_metric" target="_blank" rel="noopener noreferrer">Schwarzschild</a>'),l+=n("Metric",c)}e.orbitalVelocity!==void 0&&(l+=n("Orbital Vel",e.orbitalVelocity.toFixed(3),"c")),e.gForce!==void 0&&(l+=n("Local g",e.gForce.toFixed(3),"c²/Rₛ")),e.timeDilation!==void 0&&(l+=n("Time Dilation",e.timeDilation.toFixed(4))),e.redshift!==void 0&&(isFinite(e.redshift)?l+=n("Redshift z",(e.redshift>=0?"+":"")+e.redshift.toFixed(4)):l+=n("Redshift z","∞")),s+=f("Physics",l),this.contentElement.innerHTML=s,this.contentElement.style.color=""}getElement(){return this.element}}function Z(o){const s=new Uint8Array(1048576),n=new Uint8Array(512),f=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];for(let t=0;t<256;t++)n[256+t]=n[t]=f[t];function d(t){return t*t*t*(t*(t*6-15)+10)}function r(t,i,a){return i+t*(a-i)}function u(t,i,a,h){const m=t&15,p=m<8?i:a,v=m<4?a:m==12||m==14?i:h;return((m&1)==0?p:-p)+((m&2)==0?v:-v)}function l(t,i,a){const h=Math.floor(t)&255,m=Math.floor(i)&255,p=Math.floor(a)&255;t-=Math.floor(t),i-=Math.floor(i),a-=Math.floor(a);const v=d(t),w=d(i),y=d(a),b=n[h]+m,S=n[b]+p,E=n[b+1]+p,g=n[h+1]+m,I=n[g]+p,R=n[g+1]+p;return r(y,r(w,r(v,u(n[S],t,i,a),u(n[I],t-1,i,a)),r(v,u(n[E],t,i-1,a),u(n[R],t-1,i-1,a))),r(w,r(v,u(n[S+1],t,i,a-1),u(n[I+1],t-1,i,a-1)),r(v,u(n[E+1],t,i-1,a-1),u(n[R+1],t-1,i-1,a-1))))}for(let t=0;t<512;t++)for(let i=0;i<512;i++){let h=0,m=.5,p=1;for(let y=0;y<4;y++){const b=i*.05*p,S=t*.05*p;h+=m*l(b,S,0),m*=.5,p*=2}const v=Math.floor((h+1)*.5*255),w=(t*512+i)*4;s[w]=v,s[w+1]=v,s[w+2]=v,s[w+3]=255}const c=o.createTexture({size:[512,512],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});return o.queue.writeTexture({texture:c},s,{bytesPerRow:512*4},{width:512,height:512}),c}async function j(o,e){if(!("gpu"in navigator))throw e.setError("WebGPU not supported in this browser."),new Error("WebGPU not supported in this browser.");const s=await navigator.gpu.requestAdapter();if(!s)throw e.setError("No GPU adapter found."),new Error("No GPU adapter found.");const n=await s.requestDevice();n.addEventListener("uncapturederror",h=>{const p=h.error.message;console.error("WebGPU Uncaptured Error:",p),e.setError(`GPU Error: ${p}`)});const d=n.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),r=Z(n),u=n.createSampler({magFilter:"linear",minFilter:"linear",mipmapFilter:"linear",addressModeU:"repeat",addressModeV:"repeat"}),l=n.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT|GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]}),c=n.createPipelineLayout({bindGroupLayouts:[l]}),t=n.createBindGroup({layout:l,entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:r.createView()},{binding:2,resource:u}]}),i=o.getContext("webgpu");if(!i)throw e.setError("Could not get webgpu context."),new Error("Could not get webgpu context.");const a=navigator.gpu.getPreferredCanvasFormat();return i.configure({device:n,format:a,alphaMode:"opaque"}),{device:n,context:i,uniformBuffer:d,bindGroup:t,pipelineLayout:c,canvasFormat:a}}async function J(o,e,s,n,f){const d=o.createShaderModule({code:K}),r=await d.getCompilationInfo();if(r.messages.length>0){let u=!1;for(const l of r.messages)console.log(`Shader ${l.type}: ${l.message} at line ${l.lineNum}`),l.type==="error"&&(u=!0);if(u)throw new Error("Shader compilation failed. Check console for details.")}return o.createRenderPipeline({layout:e,vertex:{module:d,entryPoint:"vs_main"},fragment:{module:d,entryPoint:"fs_main",targets:[{format:s}]},primitive:{topology:"triangle-list"}})}let D=1e3,q=1,G=!1;function Q(o){q=Math.min(2,Math.max(.5,o))}function ee(o){G=o}async function te(o,e,s,n){U(o);const f=await J(s.device,s.pipelineLayout,s.canvasFormat);let d=performance.now(),r=0;const u=[],l=30,c=2,t=6;function i(){const a=performance.now(),h=(a-d)/1e3;d=a,u.push(h),u.length>l&&u.shift(),r=1/(u.reduce((x,F)=>x+F,0)/u.length),n.update(h);const{camPos:p,camFwd:v,camRight:w,camUp:y}=X(n),{width:b,height:S}=U(o),E=performance.now()/1e3,g=Math.hypot(p[0],p[1],p[2]),R=(g-c)/c,_=g>1.5*c?Math.sqrt(c/(2*g)):0;let C=0;if(g>c){const x=2*g*g*Math.sqrt(1-c/g);x>1e-4?C=c/x:C=1/0}else C=1/0;let k=0;g>c?k=Math.sqrt(1-c/g):g>0&&(k=0);let N=1/0;if(g>c&&t>c){const x=1-c/g,F=1-c/t;x>0&&(N=Math.sqrt(x/F)-1)}else g<=c&&(N=1/0);e.setMetrics({resolution:`${b}x${S}`,pitch:n.pitch*180/Math.PI,yaw:n.yaw*180/Math.PI,roll:n.roll*180/Math.PI,distance:g/c,time:E,distanceToHorizon:R,orbitalVelocity:_,gForce:C,fov:n.fovY,maxRaySteps:D,fps:r,timeDilation:k,redshift:N,metric:"Schwarzschild"});const H=new Float32Array([b,S,E,n.fovY,p[0],p[1],p[2],0,v[0],v[1],v[2],D,w[0],w[1],w[2],q,y[0],y[1],y[2],G?1:0]);s.device.queue.writeBuffer(s.uniformBuffer,0,H);const z=s.device.createCommandEncoder(),V=s.context.getCurrentTexture().createView(),P=z.beginRenderPass({colorAttachments:[{view:V,loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:1}}]});P.setPipeline(f),P.setBindGroup(0,s.bindGroup),P.draw(3,1,0,0),P.end(),s.device.queue.submit([z.finish()]),requestAnimationFrame(i)}requestAnimationFrame(i)}async function B(){const o=document.getElementById("gpu-canvas");if(!o)throw new Error("gpu-canvas not found");const e=new A;e.setText("Initializing...");const s=document.getElementById("render-scale"),n=document.getElementById("render-scale-value");if(s&&n){const i=h=>{Number.isFinite(h)&&(Y(h),n.textContent=`${Math.round(h*100)}%`)},a=Number(s.value||"1");i(a),s.addEventListener("input",h=>{const m=h.target,p=Number(m.value);i(p)})}const f=document.getElementById("step-scale"),d=document.getElementById("step-scale-value");if(f&&d){const i=h=>{Number.isFinite(h)&&(Q(h),d.textContent=`${h.toFixed(1)}×`)},a=Number(f.value||"1");i(a),f.addEventListener("input",h=>{const m=h.target,p=Number(m.value);i(p)})}const r=document.getElementById("use-noise-texture");r&&r.addEventListener("change",i=>{const a=i.target;ee(a.checked)});const u=document.getElementById("interaction-hint"),l=()=>{u&&(u.classList.add("fade-out"),setTimeout(()=>u.remove(),500)),window.removeEventListener("mousedown",l),window.removeEventListener("touchstart",l),window.removeEventListener("keydown",l)};window.addEventListener("mousedown",l),window.addEventListener("touchstart",l),window.addEventListener("keydown",l),o.addEventListener("mousedown",()=>o.classList.add("grabbing")),o.addEventListener("mouseup",()=>o.classList.remove("grabbing")),o.addEventListener("mouseleave",()=>o.classList.remove("grabbing"));const c=$(o),t=await j(o,e);await te(o,e,t,c)}function O(o){console.error("Initialization error:",o);try{const e=new A,s=o instanceof Error?o.message:String(o);e.setError(`Init error: ${s}`)}catch{console.error("Failed to create overlay for error display")}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{B().catch(O)}):B().catch(O);
