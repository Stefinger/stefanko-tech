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
  navHeight: '100px',        // compact: 72 px content + 28 px wave
  navHeightMobile: '86px',   // compact: 64 px content + 22 px wave
  containerMax: '1440px',
} as const;

export const radius = {
  card: '34px',
  cardMobile: '30px',
} as const;
