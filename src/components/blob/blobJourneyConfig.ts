// ── Scene types and configuration ────────────────────────────────────────────

export type SceneName = 'hero' | 'clarity' | 'final' | 'hidden';

export interface BlobSceneConfig {
  opacity: number;
  rotationX: number;  // base rotation in radians
  rotationY: number;
  rotationZ: number;
  depthScale: number;   // mesh.scale.z = xyScale * depthScale
  visualScale: number;  // extra multiplier on top of slot-measured scale
  idleAmount: number;   // 0–1 breathing idle amplitude
  pointerAmount: number; // 0–1 cursor tilt amplitude (desktop hero only)
}

export const SCENE_CONFIGS: Record<SceneName, BlobSceneConfig> = {
  hidden: {
    opacity: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    depthScale: 1,
    visualScale: 1,
    idleAmount: 0,
    pointerAmount: 0,
  },
  hero: {
    // Dimensional, slightly free, recognisable S with gentle tilt
    opacity: 1,
    rotationX: -0.05,
    rotationY: 0.08,
    rotationZ: 0.02,
    depthScale: 1.0,
    visualScale: 1.0,
    idleAmount: 1.0,
    pointerAmount: 1.0,
  },
  clarity: {
    // Front-facing, stable, shallow — settled into the stage
    opacity: 1,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    depthScale: 0.62,
    visualScale: 1.0,
    idleAmount: 0.1,
    pointerAmount: 0,
  },
  final: {
    // Dimensional again, subtly tilted, confident and stable
    opacity: 1,
    rotationX: -0.06,
    rotationY: -0.09,
    rotationZ: 0.02,
    depthScale: 1.1,
    visualScale: 1.0,
    idleAmount: 0.25,
    pointerAmount: 0,
  },
};

// ── Camera and coordinate constants ──────────────────────────────────────────

// The blob geometry is built from SVG viewBox 0 0 590 780.
// After geo.scale(0.01, 0.01, 0.01) it is ~5.9 × 7.8 world units.
// Setting PX_PER_WU = 100 means: 1 world unit = 100 viewport pixels.
// So the geometry's natural pixel size matches the SVG viewBox (590 × 780 px).
export const PX_PER_WU = 100;

// Natural bounding-box of the blob SVG path (viewBox dimensions)
export const BLOB_NATURAL_W = 590;
export const BLOB_NATURAL_H = 780;

// Slot keys — two hero slots to handle desktop / mobile responsive layout
export type SlotKey = 'hero-desktop' | 'hero-mobile' | 'clarity' | 'final';

export function getSlotKeyForScene(scene: SceneName, vpW: number): SlotKey {
  if (scene === 'hero') return vpW >= 992 ? 'hero-desktop' : 'hero-mobile';
  if (scene === 'clarity') return 'clarity';
  return 'final';
}

// ── Idle and pointer motion constants ─────────────────────────────────────────
export const IDLE_Y_AMP = 0.04;   // radians breathing on Y
export const IDLE_Z_AMP = 0.02;   // radians breathing on Z
export const POINTER_X_MAX = 0.18; // max pointer tilt X
export const POINTER_Y_MAX = 0.22; // max pointer tilt Y
