(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const t of r)if(t.type==="childList")for(const c of t.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function i(r){const t={};return r.integrity&&(t.integrity=r.integrity),r.referrerPolicy&&(t.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?t.credentials="include":r.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(r){if(r.ep)return;r.ep=!0;const t=i(r);fetch(r.href,t)}})();const E=(n,e,i)=>Math.min(Math.max(n,e),i),O=n=>n*Math.PI/180;let N=1;function V(n){N=E(n,.25,1)}function D(n){const e=Math.max(1,window.devicePixelRatio||1),i=Math.round(n.clientWidth*e*N),o=Math.round(n.clientHeight*e*N);return(n.width!==i||n.height!==o)&&(n.width=i,n.height=o),{width:i,height:o}}function X(n){const e={yaw:0,pitch:O(4.5),radius:18,fovY:Math.PI/3};let i=!1,o=0,r=0;return n.addEventListener("mousedown",t=>{i=!0,o=t.clientX,r=t.clientY}),window.addEventListener("mouseup",()=>{i=!1}),window.addEventListener("mousemove",t=>{if(!i)return;const c=t.clientX-o,h=t.clientY-r;o=t.clientX,r=t.clientY;const a=.005;e.yaw+=c*a,e.pitch+=h*a;const l=O(89.5);e.pitch=E(e.pitch,-l,l)}),n.addEventListener("wheel",t=>{t.preventDefault(),e.radius*=Math.exp(t.deltaY*.001),e.radius=E(e.radius,2.5,100)},{passive:!1}),e}function W(n){const e=Math.cos(n.yaw),i=Math.sin(n.yaw),o=Math.cos(n.pitch),r=Math.sin(n.pitch),t=n.radius,c=[0,0,0],h=[t*i*o,t*r,t*e*o];let a=[c[0]-h[0],c[1]-h[1],c[2]-h[2]];{const d=Math.hypot(a[0],a[1],a[2])||1;a=[a[0]/d,a[1]/d,a[2]/d]}const l=[0,1,0];let s=[l[1]*a[2]-l[2]*a[1],l[2]*a[0]-l[0]*a[2],l[0]*a[1]-l[1]*a[0]];{const d=Math.hypot(s[0],s[1],s[2])||1;s=[s[0]/d,s[1]/d,s[2]/d]}let f=[a[1]*s[2]-a[2]*s[1],a[2]*s[0]-a[0]*s[2],a[0]*s[1]-a[1]*s[0]];{const d=Math.hypot(f[0],f[1],f[2])||1;f=[f[0]/d,f[1]/d,f[2]/d]}return{camPos:h,camFwd:a,camRight:s,camUp:f}}const j=`struct VSOut {
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

`,K=j;class A{element;constructor(e="overlay"){const i=document.getElementById(e);if(!i)throw new Error(`Overlay element with id "${e}" not found`);this.element=i}setText(e){this.element.textContent=e}setError(e){this.element.textContent=`Error: ${e}`,this.element.style.color="#f00"}setInfo(e){this.element.textContent=e,this.element.style.color="#0f0"}setMetrics(e){const i=[],o=[];e.resolution&&o.push(e.resolution),e.pitch!==void 0&&o.push(`Pitch: ${e.pitch.toFixed(1)}°`),e.yaw!==void 0&&o.push(`Yaw: ${e.yaw.toFixed(1)}°`),e.distance!==void 0&&o.push(`Dist: ${e.distance.toFixed(1)} RS`),o.length>0&&i.push(o.join(" | "));const r=[];e.distanceToHorizon!==void 0&&r.push(`Dist to Horizon: ${e.distanceToHorizon.toFixed(2)} RS`),e.orbitalVelocity!==void 0&&r.push(`Orbital v: ${e.orbitalVelocity.toFixed(3)} RS/s`),e.fov!==void 0&&r.push(`FOV: ${(e.fov*180/Math.PI).toFixed(1)}°`),r.length>0&&i.push(r.join(" | "));const t=[];e.timeDilation!==void 0&&t.push(`Time Dilation: ${e.timeDilation.toFixed(4)}`),e.redshift!==void 0&&(isFinite(e.redshift)?t.push(`Redshift z: ${e.redshift>=0?"+":""}${e.redshift.toFixed(4)}`):t.push("Redshift z: ∞")),t.length>0&&i.push(t.join(" | "));const c=[];e.fps!==void 0&&c.push(`FPS: ${e.fps.toFixed(1)}`),e.maxRaySteps!==void 0&&c.push(`Max Steps: ${e.maxRaySteps}`),e.time!==void 0&&c.push(`Time: ${e.time.toFixed(1)}s`),c.length>0&&i.push(c.join(" | ")),this.element.innerHTML=i.join("<br>"),this.element.style.color="#0f0"}getElement(){return this.element}}async function Z(n,e){if(!("gpu"in navigator))throw e.setError("WebGPU not supported in this browser."),new Error("WebGPU not supported in this browser.");const i=await navigator.gpu.requestAdapter();if(!i)throw e.setError("No GPU adapter found."),new Error("No GPU adapter found.");const o=await i.requestDevice(),t=o.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),c=o.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{}}]}),h=o.createPipelineLayout({bindGroupLayouts:[c]}),a=o.createBindGroup({layout:c,entries:[{binding:0,resource:{buffer:t}}]}),l=n.getContext("webgpu");if(!l)throw e.setError("Could not get webgpu context."),new Error("Could not get webgpu context.");const s=navigator.gpu.getPreferredCanvasFormat();return l.configure({device:o,format:s,alphaMode:"opaque"}),{device:o,context:l,uniformBuffer:t,bindGroup:a,pipelineLayout:h,canvasFormat:s}}function J(n,e,i,o,r){const t=n.createShaderModule({code:K});return n.createRenderPipeline({layout:e,vertex:{module:t,entryPoint:"vs_main"},fragment:{module:t,entryPoint:"fs_main",targets:[{format:i}]},primitive:{topology:"triangle-list"}})}let B=200,q=1;function Q(n){q=Math.min(2,Math.max(.5,n))}function ee(n,e,i,o){D(n);const r=J(i.device,i.pipelineLayout,i.canvasFormat);let t=performance.now(),c=0;const h=[],a=30,l=2,s=3;function f(){const d=performance.now(),_=(d-t)/1e3;t=d,h.push(_),h.length>a&&h.shift(),c=1/(h.reduce((u,m)=>u+m,0)/h.length);const{camPos:g,camFwd:v,camRight:y,camUp:w}=W(o),{width:z,height:F}=D(n),M=performance.now()/1e3,x=(u,m)=>u[0]*m[0]+u[1]*m[1]+u[2]*m[2],S=u=>Math.hypot(u[0],u[1],u[2]),R=[v[0],v[1],v[2]],C=[y[0],y[1],y[2]],P=[w[0],w[1],w[2]];S(R),S(C),S(P),x(R,C),x(R,P),x(C,P);const p=Math.hypot(g[0],g[1],g[2]),$=(p-l)/l,G=p>0?2*Math.sqrt(p):0;let k=0;p>l?k=Math.sqrt(1-l/p):p>0&&(k=0);let I=1/0;if(p>l&&s>l){const u=1-l/p,m=1-l/s;u>0&&(I=Math.sqrt(u/m)-1)}else p<=l&&(I=1/0);e.setMetrics({resolution:`${z}x${F}`,pitch:o.pitch*180/Math.PI,yaw:o.yaw*180/Math.PI,distance:p/l,time:M,distanceToHorizon:$,orbitalVelocity:G,fov:o.fovY,maxRaySteps:B,fps:c,timeDilation:k,redshift:I});const Y=new Float32Array([z,F,M,o.fovY,g[0],g[1],g[2],0,v[0],v[1],v[2],B,y[0],y[1],y[2],q,w[0],w[1],w[2],0]);i.device.queue.writeBuffer(i.uniformBuffer,0,Y);const T=i.device.createCommandEncoder(),H=i.context.getCurrentTexture().createView(),b=T.beginRenderPass({colorAttachments:[{view:H,loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:1}}]});b.setPipeline(r),b.setBindGroup(0,i.bindGroup),b.draw(3,1,0,0),b.end(),i.device.queue.submit([T.finish()]),requestAnimationFrame(f)}requestAnimationFrame(f)}async function L(){const n=document.getElementById("gpu-canvas");if(!n)throw new Error("gpu-canvas not found");const e=new A;e.setText("Initializing...");const i=document.getElementById("render-scale"),o=document.getElementById("render-scale-value");if(i&&o){const a=s=>{Number.isFinite(s)&&(V(s),o.textContent=`${Math.round(s*100)}%`)},l=Number(i.value||"1");a(l),i.addEventListener("input",s=>{const f=s.target,d=Number(f.value);a(d)})}const r=document.getElementById("step-scale"),t=document.getElementById("step-scale-value");if(r&&t){const a=s=>{Number.isFinite(s)&&(Q(s),t.textContent=`${s.toFixed(1)}×`)},l=Number(r.value||"1");a(l),r.addEventListener("input",s=>{const f=s.target,d=Number(f.value);a(d)})}const c=X(n),h=await Z(n,e);ee(n,e,h,c)}function U(n){console.error("Initialization error:",n);try{const e=new A,i=n instanceof Error?n.message:String(n);e.setError(`Init error: ${i}`)}catch{console.error("Failed to create overlay for error display")}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{L().catch(U)}):L().catch(U);
