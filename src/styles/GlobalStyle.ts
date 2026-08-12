import { createGlobalStyle } from 'styled-components';
import { colors, fonts } from './tokens';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    /* Resolves to 0px everywhere except iOS Safari with viewport-fit=cover,
       so it can be added unconditionally without affecting desktop. */
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
  }

  html {
    height: 100%;
    /* Paints the top inset dark green before any component mounts, so there is
       no frame in which Safari can show a lighter colour above the navbar. */
    background-color: ${colors.darkGreen};
    /* scroll-behavior is intentionally NOT set to smooth globally.
       Global smooth-scroll causes the browser to animate from scrollY=0
       on a fresh direct load at #about or #contact, showing the Hero for
       ~0.8-0.9 s before the target section arrives.
       User-initiated anchor navigation uses explicit scrollIntoView() calls
       in Navbar.tsx and therefore remains smooth. */
    scroll-behavior: auto;
  }

  html, body {
    max-width: 100vw;
    overflow-x: hidden;
  }

  body {
    background-color: ${colors.darkGreen};
    color: ${colors.cream};
    font-family: ${fonts.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100%;
  }

  a {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  img, svg {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    /* scroll-behavior: auto is already the global default; kept for clarity */
    html {
      scroll-behavior: auto;
    }
  }
`;
