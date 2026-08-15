/**
 * Organic CTA blob geometry, inlined from the approved Figma exports in
 * `public/assets/`.
 *
 * The shapes are inlined rather than referenced as <img> because every CTA now
 * renders the SAME path twice — once as an outline and once as a fill — so the
 * hover state can flood the inside of the button with its own silhouette. That
 * is only possible when the path data is available to the renderer.
 *
 * Every viewBox is stretched with preserveAspectRatio="none", which is how the
 * Figma exports are authored: the organic proportions are preserved by the
 * shape itself, not by the box. Strokes use vector-effect="non-scaling-stroke"
 * so the outline stays an even hairline no matter how far the box is stretched.
 */

export interface BlobShape {
  viewBox: string;
  d: string;
}

/** Filled pink primary — Figma `cta-start-conversation` */
export const SHAPE_PRIMARY: BlobShape = {
  viewBox: '0 0 210.052 64.704',
  d: 'M19.0384 10.3492C37.9573 -0.0561779 62.5519 11.2952 88.0924 3.72761C116.471 -3.83996 140.119 9.40328 163.768 1.83571C185.525 -4.78591 201.606 7.51139 208.228 22.6465C213.903 35.8898 206.336 51.0249 185.525 58.5925C160.93 66.16 135.39 56.7006 109.849 62.3763C81.4708 68.0519 50.2546 62.3763 28.4978 55.7546C7.68702 50.079 -3.66433 37.7817 1.0654 24.5384C5.79513 11.2952 9.57891 14.133 19.0384 10.3492Z',
};

/** Outline for dark backgrounds — Figma `cta-explore-work-light` */
export const SHAPE_OUTLINE_LIGHT: BlobShape = {
  viewBox: '0 0 291 77',
  d: 'M52.1793 17.2586C76.2621 3.98276 102.352 18.5862 129.445 9.2931C156.538 5.50447e-07 182.628 15.931 209.721 6.63793C234.807 -1.32759 252.869 15.931 258.89 31.8621C264.91 47.7931 256.883 63.7241 234.807 70.3621C206.71 77 179.617 66.3793 152.524 73.0172C122.421 79.6552 86.2966 73.0172 62.2138 65.0517C38.131 58.4138 26.0897 46.4655 29.1 31.8621C32.1103 17.2586 40.1379 21.2414 52.1793 17.2586Z',
};

/** Outline for cream backgrounds — Figma `cta-explore-work-dark` */
export const SHAPE_OUTLINE_DARK: BlobShape = {
  viewBox: '0 0 224.851 53.16',
  d: 'M23.3684 9.90803C46.5409 0.252862 71.6443 10.8736 97.7133 4.11493C123.782 -2.64369 148.886 8.94252 174.955 2.1839C199.093 -3.60921 216.472 8.94252 222.265 20.5287C228.058 32.1149 220.334 43.7011 199.093 48.5287C172.058 53.3563 145.989 45.6322 119.92 50.4598C90.9547 55.2873 56.196 50.4598 33.0236 44.6667C9.8512 39.8391 -1.735 31.1494 1.16155 20.5287C4.0581 9.90804 11.7822 12.8046 23.3684 9.90803Z',
};

/**
 * Compact cloud — the hamburger's organic border, from
 * `public/assets/hamburger-blob-border.svg`.
 *
 * Inlined here because two controls now share it: the mobile hamburger (which
 * renders it as an outline at rest and as a pink fill when the menu is open)
 * and the language switcher. Both are small utility controls, so they use the
 * same silhouette rather than the wider CTA blobs.
 */
export const SHAPE_CLOUD: BlobShape = {
  viewBox: '0 0 50.6007 50',
  d: 'M13.4035 43.0382C6.7659 42.4708 2.2658 36.6838 4.06584 30.6698C1.36577 25.904 4.06584 20.0035 9.12845 18.4149C8.00343 11.947 13.6286 6.61383 19.7037 7.86202C23.1913 2.52886 31.629 2.7558 34.779 8.31591C40.4042 6.38689 46.0293 10.9258 45.3543 16.8263C50.6419 19.3226 51.6544 26.9252 47.1543 30.5563C48.1668 37.1377 42.3167 42.6978 36.0166 41.6765C31.629 47.1232 23.0788 47.4636 18.3537 42.4708C16.7786 43.0382 15.0911 43.1517 13.4035 43.0382Z',
};

/** Compact navbar outline — Figma `cta-start-project` */
export const SHAPE_NAV: BlobShape = {
  viewBox: '0 0 160.014 50.1499',
  d: 'M17.9238 7.88139C35.3031 -0.808268 51.7169 8.8469 71.0273 3.0538C93.2342 -3.70482 109.648 5.95035 128.958 2.08828C145.372 -1.77379 155.993 9.81242 158.889 21.3986C161.786 32.9848 153.096 42.64 133.786 46.5021C112.544 50.3641 90.3376 42.64 71.0273 47.4676C48.8204 52.2952 27.579 48.4331 13.0962 39.7435C0.544495 32.0193 -2.35206 21.3986 3.44105 13.6745C9.23415 5.95035 10.1997 9.81242 17.9238 7.88139Z',
};
