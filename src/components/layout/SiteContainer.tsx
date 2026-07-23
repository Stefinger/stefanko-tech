import styled from 'styled-components';

/**
 * Shared responsive content container (Bootstrap 5 inspired).
 *
 * Sections keep their full-width background color.
 * Wrap inner content in SiteContainer to align it to the same horizontal grid.
 *
 * Max content width: 1440 px (Figma content area x=64 to x=1376 at 1440 px).
 * On screens wider than 1440 px the container centres and does not stretch further.
 *
 * Horizontal gutters by breakpoint:
 *   xs / sm  (<768 px):  24 px
 *   md       (768+ px):  32 px
 *   lg       (992+ px):  48 px
 *   xl       (1200+ px): 56 px
 *   xxl      (1400+ px): 64 px
 */
export const SiteContainer = styled.div`
  width: 100%;
  max-width: 1440px;
  margin-inline: auto;
  box-sizing: border-box;
  padding-inline: 24px;

  @media (min-width: 768px) {
    padding-inline: 32px;
  }

  @media (min-width: 992px) {
    padding-inline: 48px;
  }

  @media (min-width: 1200px) {
    padding-inline: 56px;
  }

  @media (min-width: 1400px) {
    padding-inline: 64px;
  }
`;
