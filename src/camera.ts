// Camera state and controls

import { clamp, deg2rad } from './utils';

export interface CameraState {
  yaw: number;
  pitch: number;
  radius: number;
  fovY: number;
  roll: number;
  /**
   * Update internal state (e.g. key-driven banking) independent of frame rate.
   * @param dt Time delta in seconds.
   */
  update: (dt: number) => void;
}

export function createCamera(canvas: HTMLCanvasElement): CameraState {
  const camera: CameraState = {
    yaw: 0,
    pitch: deg2rad(4.5),
    radius: 18.0, // Start outside the disk (R_OUTER is 12.0)
    fovY: Math.PI / 3, // fixed 60°
    roll: 0, // Default roll 0
    update: (_dt: number) => { },
  };

  const keys = {
    q: false,
    e: false,
    Space: false,
  };

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'q') keys.q = true;
    if (e.key.toLowerCase() === 'e') keys.e = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'q') keys.q = false;
    if (e.key.toLowerCase() === 'e') keys.e = false;
  });


  let isDragging = false;
  let lastX = 0, lastY = 0;

  // Drag to rotate
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  window.addEventListener('mousemove', (e) => {
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
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.radius *= Math.exp(e.deltaY * 0.001);                 // smooth zoom
    camera.radius = clamp(camera.radius, 2.5, 100.0);             // Limits: close to horizon -> far away
  }, { passive: false });

  camera.update = (dt: number) => {
    const rollSpeed = 1.0; // radians per second
    if (keys.q) camera.roll -= rollSpeed * dt;
    if (keys.e) camera.roll += rollSpeed * dt;
  };

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

  // Apply Roll: rotate Right and Up around Forward
  if (camera.roll !== 0) {
    const c = Math.cos(camera.roll);
    const s = Math.sin(camera.roll);

    // Standard 2D rotation in the Right-Up plane
    // New Right = Right * cos(roll) + Up * sin(roll)
    // New Up    = -Right * sin(roll) + Up * cos(roll) (CCW rotation)
    // However, "tilt left" usually means rolling CCW.

    const newRight = [
      camRight[0] * c + camUp[0] * s,
      camRight[1] * c + camUp[1] * s,
      camRight[2] * c + camUp[2] * s,
    ];

    const newUp = [
      -camRight[0] * s + camUp[0] * c,
      -camRight[1] * s + camUp[1] * c,
      -camRight[2] * s + camUp[2] * c,
    ];

    camRight = newRight;
    camUp = newUp;
  }

  return { camPos, camFwd, camRight, camUp };
}

