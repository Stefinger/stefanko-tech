'use client';
import Link from 'next/link';
import styled from 'styled-components';
import { colors, fonts, motion, strokes } from '@/styles/tokens';
import { SHAPE_CLOUD } from '@/components/ui/blobShapes';
import { useLocale, useMessages } from '@/lib/i18n/LocaleProvider';
import {
  localeLabel,
  localeName,
  localePath,
  locales,
  otherLocale,
  switchToLabel,
  LOCALE_COOKIE,
  type Locale,
} from '@/lib/i18n/config';

/**
 * The language control.
 *
 * Desktop and mobile deliberately differ, because they sit in different rooms.
 *
 *   • DESKTOP (`variant="nav"`) shows BOTH languages — EN CZ — with the active
 *     one marked. It lives with the navigation links and is set in the same
 *     type, so it reads as navigation rather than as a second button competing
 *     with "Start a project".
 *
 *   • MOBILE (`variant="menu"`) keeps the organic cloud showing the language you
 *     can move TO. In the opened menu it sits beside the primary CTA with room
 *     around it, where a bordered control is the right weight and a two-item
 *     text pair would read as a stray fragment.
 *
 * Route behaviour is identical in both: EN → `/`, CZ → `/cs`. Never `/en`.
 */

/* ─── Desktop: a pair of language links ─────────────────────────────────── */

const Pair = styled.div`
  display: flex;
  align-items: center;
  /* Paired with the 5 px of horizontal padding on each link below, this lands
     the visual spacing at ~15 px while keeping each target over 24 px wide. */
  gap: 10px;
  flex-shrink: 0;
`;

/*
 * Set in the navigation type, one step down in size and tracked out, so the pair
 * reads as a quiet sibling of the nav links rather than as a control.
 *
 * The active locale carries brand pink; the inactive one sits in the muted tone
 * already used for section labels and the scroll hint, and brightens to cream on
 * hover. Pink is reserved for "this is the current language", so hover never
 * borrows it — the two states can't be confused.
 */
const LangLink = styled(Link)<{ $active: boolean }>`
  position: relative;
  display: inline-block;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 0.08em;
  text-decoration: none;
  color: ${({ $active }) => ($active ? colors.pink : colors.muted)};
  transition: color ${motion.hoverDuration} ${motion.hoverEase};
  /* Keeps the 13px text on a comfortable pointer target without adding a box:
     a two-letter label measures ~23 px, which is under the 24 px minimum on its
     own, so the padding carries it to ~29 x 30. */
  padding: 6px 5px;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ $active }) => ($active ? colors.pink : colors.cream)};
    }
  }

  &:focus-visible {
    outline: none;
    color: ${({ $active }) => ($active ? colors.pink : colors.cream)};
  }
  /* Focus needs a visible mark of its own, since colour alone carries the
     active state here. */
  &:focus-visible::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background-color: ${colors.cream};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/* Thin muted divider between the two languages — what stops "EN CZ" from
   reading as one word at this size. */
const Divider = styled.span`
  display: block;
  width: 1px;
  height: 11px;
  background-color: ${colors.muted};
  opacity: 0.4;
  flex-shrink: 0;
`;

/* ─── Mobile menu: the organic cloud, unchanged ─────────────────────────── */

const Label = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 1;
  letter-spacing: 0.06em;
  color: ${colors.cream};
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

const MenuSwitchLink = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 62px;
  height: 54px;
  box-sizing: border-box;
  text-decoration: none;
  cursor: pointer;

  &:hover ${Fill},
  &:focus-visible ${Fill} {
    opacity: 1;
    transform: scale(1);
  }
  &:hover ${Outline} path,
  &:focus-visible ${Outline} path {
    stroke-opacity: 0;
  }
  &:hover ${Label},
  &:focus-visible ${Label} {
    color: ${colors.darkGreen};
  }
  &:focus-visible {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    ${Fill}, ${Label}, ${Outline} path {
      transition: none;
    }
  }
`;

interface LanguageSwitchProps {
  /** `menu` is the variant used inside the opened mobile navigation. */
  variant?: 'nav' | 'menu';
  className?: string;
  onNavigate?: () => void;
}

/**
 * Records an explicit choice for one year.
 *
 * Nothing redirects on it: `/` always renders English and `/cs` always renders
 * Czech, so a shared link can never open in a language the recipient did not
 * ask for. The cookie exists so the preference is known, not so it can
 * override a URL.
 */
function rememberLocale(target: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitch({ variant = 'nav', className, onNavigate }: LanguageSwitchProps) {
  const locale = useLocale();
  const t = useMessages();

  /* ── Mobile menu — organic cloud pointing at the other language ── */
  if (variant === 'menu') {
    const target = otherLocale(locale);
    return (
      <MenuSwitchLink
        href={localePath(target)}
        className={className}
        onClick={() => {
          rememberLocale(target);
          onNavigate?.();
        }}
        hrefLang={target}
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
        <Label>{localeLabel[target]}</Label>
      </MenuSwitchLink>
    );
  }

  /* ── Desktop — both languages, active one marked ── */
  return (
    <Pair className={className} role="group" aria-label={t.nav.languageGroupLabel}>
      {locales.map((l, i) => {
        const active = l === locale;
        return (
          <span key={l} style={{ display: 'contents' }}>
            {i > 0 && <Divider aria-hidden="true" />}
            <LangLink
              href={localePath(l)}
              $active={active}
              onClick={() => rememberLocale(l)}
              hrefLang={l}
              lang={l}
              aria-current={active ? 'page' : undefined}
              aria-label={active ? localeName[l] : switchToLabel[l]}
            >
              {localeLabel[l]}
            </LangLink>
          </span>
        );
      })}
    </Pair>
  );
}
