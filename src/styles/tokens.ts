export const colors = {
  darkGreen: '#082e26',
  darkGreenAlt: '#103a32',
  pink: '#ff6fae',
  lime: '#88ff5c',
  cream: '#f4f0ea',
  creamBody: '#e9e2d8',
  creamFaded: '#e8e0d5',
  muted: '#9eaaa5',
  white: '#ffffff',
} as const;

export const fonts = {
  display: 'var(--font-anton), sans-serif',
  body: 'var(--font-geist), sans-serif',
} as const;

// Bootstrap 5 breakpoint values (px)
export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

// Mobile-first min-width media queries
export const mediaUp = {
  sm:  '@media (min-width: 576px)',
  md:  '@media (min-width: 768px)',
  lg:  '@media (min-width: 992px)',
  xl:  '@media (min-width: 1200px)',
  xxl: '@media (min-width: 1400px)',
} as const;

// Legacy helpers — preserved for sections not updated in Responsive Correction A
// (Uncertainty, Clarity, Decisions, Build use these)
export const media = {
  mobile: '@media (max-width: 768px)',
  tablet: '@media (min-width: 769px) and (max-width: 1100px)',
  desktop: '@media (min-width: 1101px)',
  aboveMobile: '@media (min-width: 769px)',
} as const;

export const spacing = {
  desktopPadding: '64px',
  mobilePadding: '24px',
  navHeight: '108px',        // 80 px content row + 28 px wave
  navHeightMobile: '90px',   // 68 px content row + 22 px wave
  containerMax: '1440px',
} as const;

/**
 * Shared interaction motion.
 *
 * One duration and one easing curve across every hover state on the site, so
 * nav links, blob CTAs and proof cards all respond with the same character:
 * quick, damped, no bounce, no glow.
 */
export const motion = {
  hoverDuration: '260ms',
  hoverEase: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
} as const;

export const radius = {
  card: '34px',
  cardMobile: '30px',
} as const;

/**
 * The organic blob OUTLINE, as one value.
 *
 * Every hairline-outlined blob control belongs to a single family: the navbar
 * CTA, the language switcher, the mobile hamburger and the Hero / Final / Proof
 * outline CTAs. They were drawn at three different opacities (0.4, 0.45 and
 * 0.75), which read as three different greys — most visibly in the navbar,
 * where the switcher sits directly beside the CTA.
 *
 * 0.45 is the value the large outline CTAs were approved at, so unifying here
 * leaves them untouched and brings the small utility controls into the family.
 */
export const strokes = {
  blobOutlineOpacity: 0.45,
  blobOutlineWidth: 1.2,
} as const;
