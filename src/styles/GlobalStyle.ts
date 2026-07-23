import { createGlobalStyle } from 'styled-components';
import { colors, fonts } from './tokens';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    height: 100%;
    scroll-behavior: smooth;
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
    html {
      scroll-behavior: auto;
    }
  }
`;
