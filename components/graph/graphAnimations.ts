export const CAMERA_START_Z = 14;
export const CAMERA_END_Z = 9.5;
export const CAMERA_MIN_Z = 4;
export const CAMERA_MAX_Z = 22;
export const CAMERA_LERP_MS = 2400;
export const HOVER_SCALE = 1.35;
export const SPAWN_DURATION_MS = 700;

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function bottleneckPulse(t: number): number {
  return 0.55 + 0.35 * Math.sin(t * Math.PI);
}

export const PULSE_SPEED = 0.8;
export const PULSE_MIN_SCALE = 1.0;
export const PULSE_MAX_SCALE = 1.15;
export const PULSE_OPACITY = 0.15;
