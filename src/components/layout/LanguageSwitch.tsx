'use client';
import Link from 'next/link';
import styled from 'styled-components';
import { colors, fonts, motion, strokes } from '@/styles/tokens';
import { SHAPE_CLOUD } from '@/components/ui/blobShapes';
import { useLocale, useMessages } from '@/lib/i18n/LocaleProvider';
import { localePath, otherLocale, LOCALE_COOKIE } from '@/lib/i18n/config';

/**
 * The language control.
 *
 * ONE button, showing the language you can move TO — `CZ` on the English site,
 * `ENG` on the Czech one — rather than an EN/CZ pair with an active state. It
 * is a utility control, so it is deliberately quieter than the "Start a project"
 * CTA beside it: thin outline, small tracked label, no fill at rest.
 *
 * The silhouette is the SAME organic cloud as the mobile hamburger border
 * (`SHAPE_CLOUD`, from the approved Figma export), not a border-radius pill. Its
 * box is close to the path's native 50.6 × 50 proportion, so the shape is
 * carried over rather than stretched into a different one.
 *
 * The hover response is the navbar CTA's, at a smaller scale: the pink blooms
 * inside the silhouette while the cream outline dissolves, so no pale ring
 * survives under the fill.
 */

const Label = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.06em;
  color: ${colors.cream};
  /* Optical nudge — the cloud rises toward its middle, so a geometrically
     centred label reads as sitting high. Matches BlobCta. */
  transform: translateY(1px);
  transition: color 520ms ${motion.hoverEase};
`;

const Outline = styled.span`
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;

  path {
    stroke: ${colors.cream};
    stroke-opacity: ${strokes.blobOutlineOpacity};
    stroke-width: ${strokes.blobOutlineWidth};
    transition: stroke-opacity 600ms ${motion.hoverEase};
  }
`;

/* Blooms in from slightly oversized, exactly like the CTA fill layer, so the
   colour resolves in place instead of sweeping across a moving edge. */
const Fill = styled.span`
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  opacity: 0;
  transform: scale(1.08);
  transform-origin: 50% 52%;
  transition:
    opacity 520ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 640ms ${motion.hoverEase};
`;

const Shape = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const SwitchLink = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 54px;
  height: 46px;
  box-sizing: border-box;
  text-decoration: none;
  cursor: pointer;

  /* 769–1100 px: the row is at its tightest here, so the control gives back a
     few pixels rather than pushing the CTA toward the edge. */
  @media (min-width: 769px) and (max-width: 1100px) {
    width: 46px;
    height: 40px;

    ${Label} {
      font-size: 11px;
      letter-spacing: 0.04em;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover ${Fill} {
      opacity: 1;
      transform: scale(1);
    }
    &:hover ${Outline} path {
      stroke-opacity: 0;
    }
    &:hover ${Label} {
      color: ${colors.darkGreen};
    }
  }

  &:focus-visible {
    outline: none;
  }
  &:focus-visible ${Fill} {
    opacity: 1;
    transform: scale(1);
  }
  &:focus-visible ${Outline} path {
    stroke-opacity: 0;
  }
  &:focus-visible ${Label} {
    color: ${colors.darkGreen};
  }

  @media (prefers-reduced-motion: reduce) {
    ${Fill}, ${Label}, ${Outline} path {
      transition: none;
    }
  }
`;

/* Larger inside the opened mobile menu, where it sits next to a md-size CTA. */
const MenuSwitchLink = styled(SwitchLink)`
  width: 62px;
  height: 54px;

  ${Label} {
    font-size: 13px;
  }
`;

interface LanguageSwitchProps {
  /** `menu` is the variant used inside the opened mobile navigation. */
  variant?: 'nav' | 'menu';
  className?: string;
  onNavigate?: () => void;
}

export function LanguageSwitch({ variant = 'nav', className, onNavigate }: LanguageSwitchProps) {
  const locale = useLocale();
  const t = useMessages();
  const target = otherLocale(locale);
  const href = localePath(target);

  /*
   * Records an explicit choice for one year.
   *
   * Nothing redirects on it: `/` always renders English and `/cs` always renders
   * Czech, so a shared link can never open in a language the recipient did not
   * ask for. The cookie exists so the preference is known, not so it can
   * override a URL.
   */
  const remember = () => {
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
    onNavigate?.();
  };

  const Component = variant === 'menu' ? MenuSwitchLink : SwitchLink;

  return (
    <Component
      href={href}
      className={className}
      onClick={remember}
      hrefLang={target}
      /* Announced in the language being offered, so it reads correctly to a
         speaker of that language — `lang` tells the screen reader how to say it. */
      lang={target}
      aria-label={t.nav.switchAriaLabel}
    >
      <Outline aria-hidden="true">
        <Shape viewBox={SHAPE_CLOUD.viewBox} preserveAspectRatio="none" fill="none">
          <path
            d={SHAPE_CLOUD.d}
            fill="none"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </Shape>
      </Outline>

      <Fill aria-hidden="true">
        <Shape viewBox={SHAPE_CLOUD.viewBox} preserveAspectRatio="none" fill="none">
          <path d={SHAPE_CLOUD.d} fill={colors.pink} />
        </Shape>
      </Fill>

      <Label>{t.nav.switchLabel}</Label>
    </Component>
  );
}
