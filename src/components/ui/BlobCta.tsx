'use client';
import styled, { css, keyframes } from 'styled-components';
import { colors, fonts, motion } from '@/styles/tokens';
import {
  SHAPE_PRIMARY,
  SHAPE_OUTLINE_LIGHT,
  SHAPE_OUTLINE_DARK,
  SHAPE_NAV,
  type BlobShape,
} from './blobShapes';

/**
 * The single CTA component for the whole site.
 *
 * Replaces the previous split between fixed-pixel desktop buttons and separate
 * full-bleed mobile blob wrappers. One component now covers every context:
 *
 *  • The button is sized by its LABEL plus symmetrical padding, at every
 *    breakpoint. Mobile CTAs are no longer stretched edge-to-edge — they keep
 *    the same horizontal proportion logic as the desktop Hero buttons.
 *  • The organic silhouette is drawn twice from one path: the resting shape and
 *    an oversized transparent copy that blooms into place on hover. See the
 *    motion block below for the full hover treatment.
 *  • Strokes are non-scaling, so an outline stays an even hairline however far
 *    the box is stretched by the label.
 */

export type BlobCtaVariant = 'primary' | 'outlineLight' | 'outlineDark' | 'nav';
export type BlobCtaSize = 'lg' | 'md' | 'sm';

interface VariantSpec {
  shape: BlobShape;
  /** Resting outline colour — omitted for the filled primary */
  stroke?: string;
  strokeOpacity?: number;
  /** Outline opacity while hovered. Defaults to strengthening; set 0 to
   *  dissolve the outline so a filled hover state has a clean silhouette. */
  strokeHoverOpacity?: number;
  /** Resting fill — the primary is filled at rest, outlines are not */
  restFill?: string;
  /** Colour that floods the silhouette on hover */
  hoverFill: string;
  label: string;
  hoverLabel: string;
}

const VARIANTS: Record<BlobCtaVariant, VariantSpec> = {
  // Filled pink — brand #FF6FAE at rest AND on hover, at full opacity.
  //
  // The hover response deliberately comes from contrast and shape rather than
  // from a second pink: the label flips white → dark green (2.2:1 → 6.2:1
  // against the fill) while the silhouette breathes. Earlier versions tried a
  // paler tint and then a deeper one; both were wrong — the first read as the
  // button fading, and the second introduced a colour outside the palette.
  primary: {
    shape: SHAPE_PRIMARY,
    restFill: colors.pink,
    hoverFill: colors.pink,
    label: colors.white,
    hoverLabel: colors.darkGreen,
  },
  // Cream outline on dark green — Hero / Final CTA secondary.
  outlineLight: {
    shape: SHAPE_OUTLINE_LIGHT,
    stroke: colors.cream,
    strokeOpacity: 0.45,
    hoverFill: colors.cream,
    label: colors.creamBody,
    hoverLabel: colors.darkGreen,
  },
  // Dark-green outline on cream — Proof.
  outlineDark: {
    shape: SHAPE_OUTLINE_DARK,
    stroke: colors.darkGreen,
    strokeOpacity: 0.45,
    hoverFill: colors.darkGreen,
    label: colors.darkGreen,
    hoverLabel: colors.cream,
  },
  // Compact navbar outline. Fills brand pink on hover — and its cream outline
  // fades to nothing as it does, so the pink silhouette is clean rather than
  // ringed by a pale stroke. `strokeHoverOpacity: 0` drives that.
  nav: {
    shape: SHAPE_NAV,
    stroke: colors.cream,
    strokeOpacity: 0.4,
    strokeHoverOpacity: 0,
    hoverFill: colors.pink,
    label: colors.cream,
    hoverLabel: colors.darkGreen,
  },
};

/*
 * The organic outline traces close to the box edge, so the gap between the
 * label and the border IS the box padding. lg and md are both opened up on
 * each axis — the outline buttons in particular were reading as tight around
 * their labels. `sm` is left alone: it is the navbar CTA, which is approved.
 */
const SIZES: Record<BlobCtaSize, { h: number; hMobile: number; pad: number; padMobile: number; font: number; fontMobile: number; min: number }> = {
  lg: { h: 86, hMobile: 70, pad: 58, padMobile: 42, font: 16, fontMobile: 15, min: 220 },
  md: { h: 74, hMobile: 64, pad: 48, padMobile: 36, font: 15, fontMobile: 14, min: 200 },
  sm: { h: 52, hMobile: 48, pad: 26, padMobile: 22, font: 14, fontMobile: 13, min: 140 },
};

/*
 * Outline variants need more room than the filled primary at the same size.
 * A stroke sits exactly on the box edge, so the label reads as crowding it,
 * while a filled shape carries visual mass that pushes the eye inward. These
 * boosts are what make an outline button and a filled button of the same size
 * look equally comfortable side by side.
 */
const OUTLINE_BOOST = { h: 8, hMobile: 6, pad: 10, padMobile: 6 } as const;

/*
 * CTA hover — three quiet responses layered, no single dominant gesture.
 *
 *   1. TENSION  the silhouette breathes anisotropically: it widens a fraction
 *               while flattening, then narrows while rising, then settles.
 *               Because the two axes move out of phase this reads as an organic
 *               shape under tension rather than as a button being scaled up.
 *   2. COLOUR   the fill does not sweep or wipe. It blooms — slightly oversized
 *               and transparent, easing down onto the silhouette as it fades in.
 *               There is no moving edge anywhere, so nothing can look abrupt.
 *   3. BORDER   the outline gains weight and opacity, so an outline button has a
 *               response of its own rather than only being a container for the
 *               fill. Variants whose hover fill is opaque invert this and fade
 *               the outline away instead, leaving a clean filled silhouette.
 *
 * Everything runs between 600 ms and 1.4 s. Nothing overshoots.
 */
const blobBreath = keyframes`
  0%   { transform: scale(1, 1); }
  28%  { transform: scale(1.024, 0.988); }
  58%  { transform: scale(0.996, 1.016); }
  100% { transform: scale(1, 1); }
`;

const ShapeStack = styled.span`
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  transform-origin: 50% 54%;
  will-change: transform;
`;

/*
 * The bloom.
 *
 * Sits a few percent oversized and fully transparent at rest, then fades in as
 * it eases down to its true size. The colour therefore arrives everywhere at
 * once and simply resolves — the previous centre-out clip had a visible
 * travelling front, which is what kept reading as a mechanical fill.
 */
const FillLayer = styled.span`
  position: absolute;
  inset: 0;
  display: block;
  opacity: 0;
  transform: scale(1.07);
  transform-origin: 50% 54%;
  transition:
    opacity 640ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 820ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: opacity, transform;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/* Stroke values live in CSS, not on the attribute, so they can transition. */
const OutlineLayer = styled.span<{ $stroke: string; $strokeOpacity: number }>`
  position: absolute;
  inset: 0;
  display: block;

  path {
    stroke: ${({ $stroke }) => $stroke};
    stroke-opacity: ${({ $strokeOpacity }) => $strokeOpacity};
    stroke-width: 1.2;
    transition:
      stroke-opacity 600ms cubic-bezier(0.22, 0.61, 0.36, 1),
      stroke-width 600ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    path { transition: none; }
  }
`;

const ShapeSvg = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
`;

interface AnchorProps {
  $size: BlobCtaSize;
  $outline: boolean;
  $strokeHoverOpacity: number;
  $strokeHoverWidth: string;
  $label: string;
  $hoverLabel: string;
  $fullWidth: boolean;
}

const Anchor = styled.a<AnchorProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
  cursor: pointer;
  text-decoration: none;
  /* Sized by the label, never stretched by its container */
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  ${({ $size, $outline }) => {
    const s = SIZES[$size];
    const b = $outline && $size !== 'sm' ? OUTLINE_BOOST : { h: 0, hMobile: 0, pad: 0, padMobile: 0 };
    return css`
      height: ${s.h + b.h}px;
      min-width: ${s.min}px;
      padding: 0 ${s.pad + b.pad}px;

      .blob-cta-label {
        font-size: ${s.font}px;
      }

      @media (max-width: 767px) {
        height: ${s.hMobile + b.hMobile}px;
        min-width: ${Math.round(s.min * 0.86)}px;
        padding: 0 ${s.padMobile + b.padMobile}px;

        .blob-cta-label {
          font-size: ${s.fontMobile}px;
        }
      }
    `;
  }}

  .blob-cta-label {
    position: relative;
    z-index: 1;
    font-family: ${fonts.body};
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
    white-space: nowrap;
    color: ${({ $label }) => $label};
    /* Optical nudge: every organic silhouette here rises toward its middle, so
       a geometrically centred label reads as crowding the top border. */
    transform: translateY(1px);
    transition: color 520ms ${motion.hoverEase};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover ${ShapeStack} {
      animation: ${blobBreath} 1400ms cubic-bezier(0.4, 0, 0.25, 1);
    }
    &:hover ${FillLayer} {
      opacity: 1;
      transform: scale(1);
    }
    &:hover ${OutlineLayer} path {
      stroke-opacity: ${({ $strokeHoverOpacity }) => $strokeHoverOpacity};
      stroke-width: ${({ $strokeHoverWidth }) => $strokeHoverWidth};
    }
    &:hover .blob-cta-label {
      color: ${({ $hoverLabel }) => $hoverLabel};
    }
  }

  &:focus-visible {
    outline: none;
  }
  &:focus-visible ${ShapeStack} {
    animation: ${blobBreath} 1400ms cubic-bezier(0.4, 0, 0.25, 1);
  }
  &:focus-visible ${FillLayer} {
    opacity: 1;
    transform: scale(1);
  }
  &:focus-visible ${OutlineLayer} path {
    stroke-opacity: ${({ $strokeHoverOpacity }) => $strokeHoverOpacity};
    stroke-width: ${({ $strokeHoverWidth }) => $strokeHoverWidth};
  }
  &:focus-visible .blob-cta-label {
    color: ${({ $hoverLabel }) => $hoverLabel};
  }

  @media (prefers-reduced-motion: reduce) {
    .blob-cta-label { transition: none; }
    &:hover ${ShapeStack},
    &:focus-visible ${ShapeStack} { animation: none; }
  }
`;

export interface BlobCtaProps {
  children: React.ReactNode;
  href: string;
  variant?: BlobCtaVariant;
  size?: BlobCtaSize;
  /** Opt in to stretching — used only where a container genuinely requires it. */
  fullWidth?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function BlobCta({
  children,
  href,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  className,
  onClick,
}: BlobCtaProps) {
  const spec = VARIANTS[variant];
  const { shape } = spec;

  return (
    <Anchor
      href={href}
      className={className}
      onClick={onClick}
      $size={size}
      $outline={Boolean(spec.stroke)}
      /* Outlines normally strengthen on hover. A variant that fills opaquely
         instead dissolves its outline, so no pale ring survives under the fill. */
      $strokeHoverOpacity={spec.strokeHoverOpacity ?? 0.85}
      $strokeHoverWidth={spec.strokeHoverOpacity === 0 ? '1.2' : '1.7'}
      $label={spec.label}
      $hoverLabel={spec.hoverLabel}
      $fullWidth={fullWidth}
    >
      <ShapeStack aria-hidden="true">
        {/* Resting silhouette: filled for the primary, outlined otherwise */}
        <OutlineLayer
          $stroke={spec.stroke ?? 'none'}
          $strokeOpacity={spec.strokeOpacity ?? 1}
        >
          <ShapeSvg viewBox={shape.viewBox} preserveAspectRatio="none" fill="none">
            <path
              d={shape.d}
              fill={spec.restFill ?? 'none'}
              vectorEffect="non-scaling-stroke"
            />
          </ShapeSvg>
        </OutlineLayer>

        {/* Blooming silhouette — transparent and oversized until hover */}
        <FillLayer>
          <ShapeSvg viewBox={shape.viewBox} preserveAspectRatio="none" fill="none">
            <path d={shape.d} fill={spec.hoverFill} />
          </ShapeSvg>
        </FillLayer>
      </ShapeStack>

      <span className="blob-cta-label">{children}</span>
    </Anchor>
  );
}
