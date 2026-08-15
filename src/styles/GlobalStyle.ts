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

  /*
   * Czech display headlines — extra room above every line.
   *
   * The condensed display type is set at a line-height of 1.03–1.075, which
   * measures out to ZERO gap between consecutive line boxes. That is fine for
   * English: uppercase Latin has nothing above the cap height, so the tightness
   * is exactly what gives the headlines their density.
   *
   * Czech uppercase does have something up there. Á Č Ď Ě Í Ř Š Ť Ú Ů Ý Ž all
   * carry a mark that sits above the caps, in the band the tight leading has
   * already spent — so the accents of one line crowd the line above it and, at
   * the top of a section, press against whatever precedes the headline.
   *
   * The correction is line-height, not padding, and not font-size.
   *
   * Padding on the line spans was tried first and is NOT sufficient: each line
   * is its own block, so padding does separate one span from the next — but a
   * span that WRAPS produces two visual lines inside a single box, and padding
   * cannot reach between them. Measured, that left the Final CTA at 390 px
   * ("STOJÍ VÁŠ / NÁPAD") at -2.2 px, i.e. the accent of NÁPAD genuinely
   * overlapping the line above it.
   *
   * line-height governs baseline-to-baseline distance, so it lifts EVERY line
   * box apart — wrapped lines included — with one declaration.
   *
   * 1.19 is an optical value, arrived at by looking rather than by metrics.
   * 1.15 was the point where nothing collided any more (accent ascent plus the
   * previous line's descent measures ~1.11 em), but 2-4 px of clearance still
   * read as glued together at display sizes. 1.19 roughly doubles the tightest
   * gaps to 4-9 px, which separates the rows without loosening the block —
   * sizes, weight, tracking and the type scale are all untouched.
   *
   * Scoped to the Czech lang attribute, so English renders byte-identical and
   * keeps its own per-component leading.
   *
   * The Clarity statement gets its own value. It is set tighter than the rest
   * relative to its size (1.1 on desktop, 1.176 at 390 px), so it needs a little
   * more than the others to read with the same air: 1.21.
   */
  html[lang="cs"] {
    [data-hero-headline] > span,
    [data-u-headline] > span,
    [data-c-headline] > span,
    [data-d-headline] > span,
    [data-b-headline] > span,
    [data-b-headline-pink] > span,
    [data-p-headline] > span,
    [data-f-headline] > span,
    /* The Proof card headlines are br-separated inside an h3 rather than one
       span per line, so the selector above never reached them — which left
       SKUTEČNÝ / DIGITÁLNÍ / PRODUKT at its base 1.103 and actually overlapping
       by 0.3 px. All three cards take the same value so they stay consistent
       with each other on the page. */
    [data-p-card] h3 {
      line-height: 1.19;
    }

    [data-c-statement] > span {
      line-height: 1.21;
    }
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
