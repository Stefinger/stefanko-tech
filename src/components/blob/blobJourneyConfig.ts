// ── Scene types and configuration ────────────────────────────────────────────
//
// The Blob S is a persistent journey object: it is present from the top of the
// page to the bottom. It is never hidden between sections — only its size,
// position, rotation and depth change, so the whole homepage reads as one
// continuous transformation of the same object.
//
// `depthScale` multiplies the mesh's Z extent. Values were pulled back from the
// deep-3D pass: enough Z everywhere that the blob never reads as a flat pink
// silhouette, without the over-modelled look that pass produced.
//
// Presence rhythm (per polish brief):
//   Hero        — strongest, dimensional, cursor-reactive
//   Uncertainty — present but pushed back, behind the question clouds
//   Clarity     — the centre of the composition, front-facing
//   Decisions   — small, offset into a corner
//   Build       — behind the layered cards
//   Proof       — small marginal presence
//   Final CTA   — prominent again, confident and stable
//
// Presence is now expressed through SIZE and PLACEMENT rather than opacity.
// Every scene renders the blob at full solid pink; the "quiet" sections simply
// give it a smaller slot pushed to an edge. Fading the blob made it read as
// washed out rather than restrained.

export type SceneName =
  | 'hero'
  | 'uncertainty'
  | 'clarity'
  | 'decisions'
  | 'build'
  | 'proof'
  | 'final'
  | 'hidden';

export interface BlobSceneConfig {
  opacity: number;
  rotationX: number;  // base rotation in radians
  rotationY: number;
  rotationZ: number;
  depthScale: number;   // mesh.scale.z = xyScale * depthScale
  visualScale: number;  // extra multiplier on top of slot-measured scale
  idleAmount: number;   // 0–1 breathing idle amplitude
  pointerAmount: number; // 0–1 cursor tilt amplitude (desktop hero only)
  /**
   * Scenes where the travelling blob does not belong on a phone. The controller
   * drives opacity to 0 for these below MOBILE_MAX_W; because the mesh lerps
   * opacity it fades out before the section arrives and fades back in after it,
   * rather than popping. Slot geometry is untouched, so nothing reflows.
   */
  skipOnMobile?: boolean;
}

/** Viewport width at or below which `skipOnMobile` applies. Matches the
 *  breakpoint at which both sections switch to their own mobile layouts. */
export const MOBILE_MAX_W = 768;

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
    depthScale: 1.05,
    visualScale: 1.0,
    idleAmount: 1.0,
    pointerAmount: 1.0,
  },
  uncertainty: {
    // The idea has not taken shape yet: turned well away from the viewer and
    // sitting behind the question clouds on the cream stage.
    opacity: 1,
    rotationX: 0.1,
    rotationY: -0.34,
    rotationZ: -0.14,
    depthScale: 0.88,
    visualScale: 1.0,
    idleAmount: 0.85,
    pointerAmount: 0,
    skipOnMobile: true,
  },
  clarity: {
    // Settled into the stage, but never dead-flat: a small residual tilt keeps
    // the extrusion visible so the object still reads as a solid here.
    opacity: 1,
    rotationX: -0.035,
    rotationY: 0.07,
    rotationZ: 0.015,
    depthScale: 0.72,
    visualScale: 1.0,
    idleAmount: 0.14,
    pointerAmount: 0,
  },
  decisions: {
    // The object steps aside into a corner while the timeline leads
    opacity: 1,
    rotationX: -0.04,
    rotationY: 0.3,
    rotationZ: 0.1,
    depthScale: 0.95,
    visualScale: 1.0,
    idleAmount: 0.5,
    pointerAmount: 0,
    skipOnMobile: true,
  },
  build: {
    // Sits behind the layered product cards, slight counter-tilt
    opacity: 1,
    rotationX: 0.06,
    rotationY: -0.26,
    rotationZ: -0.08,
    depthScale: 1.02,
    visualScale: 1.0,
    idleAmount: 0.4,
    pointerAmount: 0,
  },
  proof: {
    // A small marginal presence next to the real product proof
    opacity: 1,
    rotationX: -0.03,
    rotationY: 0.22,
    rotationZ: 0.06,
    depthScale: 0.9,
    visualScale: 1.0,
    idleAmount: 0.5,
    pointerAmount: 0,
  },
  final: {
    // Dimensional again, subtly tilted, confident and stable
    opacity: 1,
    rotationX: -0.06,
    rotationY: -0.09,
    rotationZ: 0.02,
    depthScale: 1.15,
    visualScale: 1.0,
    idleAmount: 0.3,
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

// Slot keys — the hero has two slots to handle desktop / mobile layouts
export type SlotKey =
  | 'hero-desktop'
  | 'hero-mobile'
  | 'uncertainty'
  | 'clarity'
  | 'decisions'
  | 'build'
  | 'proof'
  | 'final';

// Scenes in document order. The controller uses this list to resolve the
// active scene from scroll position, so coverage is gapless: the blob always
// belongs to exactly one section.
export const SCENE_ORDER: readonly Exclude<SceneName, 'hidden'>[] = [
  'hero',
  'uncertainty',
  'clarity',
  'decisions',
  'build',
  'proof',
  'final',
] as const;

export function getSlotKeyForScene(scene: SceneName, vpW: number): SlotKey | null {
  if (scene === 'hidden') return null;
  if (scene === 'hero') return vpW >= 992 ? 'hero-desktop' : 'hero-mobile';
  return scene;
}

// ── Idle and pointer motion constants ─────────────────────────────────────────
export const IDLE_Y_AMP = 0.04;   // radians breathing on Y
export const IDLE_Z_AMP = 0.02;   // radians breathing on Z
export const POINTER_X_MAX = 0.18; // max pointer tilt X
export const POINTER_Y_MAX = 0.22; // max pointer tilt Y
