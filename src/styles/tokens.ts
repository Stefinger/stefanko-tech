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

export const spacing = {
  desktopPadding: '64px',
  mobilePadding: '24px',
  navHeight: '104px',
  navHeightMobile: '112px',
} as const;

export const radius = {
  card: '34px',
  cardMobile: '30px',
} as const;

export const media = {
  mobile: '@media (max-width: 768px)',
  tablet: '@media (min-width: 769px) and (max-width: 1100px)',
  desktop: '@media (min-width: 1101px)',
  aboveMobile: '@media (min-width: 769px)',
} as const;
