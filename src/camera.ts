// Camera state and controls

import { clamp, deg2rad } from './utils';

export interface CameraState {
  yaw: number;
  pitch: number;
  radius: number;
  fovY: number;
}

export function createCamera(canvas: HTMLCanvasElement): CameraState {
  const camera: CameraState = {
    yaw: 0,
    pitch: 0.2,
    radius: 14.0, // Start outside the disk (R_OUTER is 12.0)
    fovY: Math.PI / 3, // fixed 60°
  };

  let isDragging = false;
  let lastX = 0, lastY = 0;

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
    lastX = e.clientX; 
    lastY = e.clientY;

    const sens = 0.005;             // rad per pixel
    camera.yaw += dx * sens;
    camera.pitch += dy * sens;
    const limit = deg2rad(89.5);    // avoid gimbal flip
    camera.pitch = clamp(camera.pitch, -limit, limit);
  });

  // Wheel to zoom Distance (radius)
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    camera.radius *= Math.exp(e.deltaY * 0.001);                 // smooth zoom
    camera.radius = clamp(camera.radius, 2.5, 100.0);             // Limits: close to horizon -> far away
  }, { passive: false });

  return camera;
}

export function calculateCameraVectors(camera: CameraState) {
  const cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw);
  const cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch);

  // Distance from target (origin).
  const radius = camera.radius;

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

  return { camPos, camFwd, camRight, camUp };
}

