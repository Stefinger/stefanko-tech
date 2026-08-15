'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { colors, fonts, media, motion, strokes } from '@/styles/tokens';
import { setMenuOpen } from '@/lib/menuOpenState';
import { BlobCta } from '@/components/ui/BlobCta';
import { LanguageSwitch } from '@/components/layout/LanguageSwitch';
import { SHAPE_NAV, SHAPE_CLOUD } from '@/components/ui/blobShapes';
import { useLocale, useMessages } from '@/lib/i18n/LocaleProvider';
import { localePath } from '@/lib/i18n/config';

/* ─── Wave SVG notes ────────────────────────────────────────────────────────
   The wave is always rendered and is always part of the navbar — it is never
   animated as a separate element and there is no divider line anywhere in the
   header. Over the dark-green hero the fill matches the background, so the
   navbar merges into the hero. Once cream content scrolls underneath, the
   complete organic edge becomes visible.

   A second, pink wave sits *behind* the dark-green one. It is not a copy of the
   dark wave nudged down — it is its own path, derived by pushing every point of
   the dark wave down in proportion to how far that point already dips, so the
   pink band is thin under the crests and thick under the troughs. That variable
   thickness is what gives it the poured quality. It renders at full opacity —
   a translucent pink read as washed out against the cream sections — and stays
   fully transparent at the top of the page so the navbar still merges into the
   dark-green hero.

   Desktop: content row 80 px + wave 28 px = 108 px total visual height
   Mobile:  content row 68 px + wave 22 px =  90 px total visual height       */

const NavHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  overflow: visible;
  pointer-events: none;
  /* No border, no box-shadow, no divider — the wave is the only bottom edge. */
`;

/*
 * Dark-green backdrop for the top of the page.
 *
 * An exact-height fill of the iOS inset is not enough, and that is why a light
 * strip survived the first attempt. Three separate things can briefly expose
 * the area above the navbar on iPhone, and none of them are a wrong inset
 * value:
 *
 *   1. While Safari's chrome collapses or expands, a position:fixed element is
 *      not repositioned in lockstep with the visual viewport — the header lags
 *      by a few pixels and whatever sits behind it shows through above.
 *   2. env(safe-area-inset-top) itself changes during that transition, so a
 *      layer sized to exactly the inset is briefly the wrong height.
 *   3. At DPR 3 a layer that ends exactly where the wave begins can leave a
 *      sub-pixel seam.
 *
 * So the backdrop is deliberately oversized rather than exact: it starts far
 * above the viewport and ends well inside the navbar, behind the solid top of
 * the wave. There is no state in which a gap can open, because there is no edge
 * near the top of the screen to expose. Off iOS --safe-top is 0 and the whole
 * layer sits above the viewport apart from the part hidden behind the wave, so
 * desktop renders identically.
 */
const TOP_BACKDROP_OVERSHOOT = 240; // px above the viewport top
const TOP_BACKDROP_BLEED = 40;      // px down into the wave's solid band

const NavTopBackdrop = styled.div`
  position: absolute;
  top: -${TOP_BACKDROP_OVERSHOOT}px;
  left: 0;
  right: 0;
  height: calc(
    ${TOP_BACKDROP_OVERSHOOT}px + var(--safe-top) + ${TOP_BACKDROP_BLEED}px
  );
  background-color: ${colors.darkGreen};
  pointer-events: none;
  z-index: 0;
`;

/* Everything visible starts below the inset. Being positioned also makes it the
   containing block for the wave layers, so they inherit the offset. The z-index
   keeps the whole navbar above the backdrop that bleeds up behind it. */
const NavShell = styled.div`
  position: relative;
  z-index: 1;
  margin-top: var(--safe-top);
`;

/* Original viewBox kept; height reduced from 149 px → 108 px (shallower wave). */
const DesktopWave = styled.svg`
  display: none;
  width: 100%;
  height: 108px;
  overflow: visible;

  ${media.aboveMobile} {
    display: block;
  }
`;

/* Original viewBox kept; height reduced from 112 px → 90 px. */
const MobileWave = styled.svg`
  display: block;
  width: 100%;
  height: 90px;
  overflow: visible;

  ${media.aboveMobile} {
    display: none;
  }
`;

/* Shared positioning so both wave layers stack pixel-exactly. */
const WaveLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  line-height: 0;
  overflow: visible;
`;

const PinkWaveLayer = styled(WaveLayer)<{ $visible: boolean }>`
  z-index: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 520ms ${motion.hoverEase};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const MainWaveLayer = styled(WaveLayer)`
  z-index: 1;
`;

const NavWaveBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;
  pointer-events: none;
  line-height: 0;
`;

/*
 * Content row.
 *
 * The wave's solid band runs from y=0 to roughly 80 % of the wave height, so
 * geometric centring inside a plain flex row makes the whole group sit high in
 * the visible bar. `padding-top` biases the row downward by ~6 px, which gives
 * the "Start a project" blob real breathing room above its top edge instead of
 * having it crowd the top of the navbar.
 */
const NavContentRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 80px;
  padding: 6px 64px 0;
  pointer-events: all;

  ${media.mobile} {
    height: 68px;
    padding: 4px 24px 0;
  }

  ${media.tablet} {
    padding: 6px 40px 0;
  }
`;

const LogoGroup = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  cursor: pointer;
  text-decoration: none;

  @media (hover: hover) and (pointer: fine) {
    &:hover [data-nav-logo-blob] {
      transform: scale(1.08) rotate(-4deg);
    }
  }
`;

const NavBlobSWrap = styled.div`
  position: relative;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  transform-origin: 50% 50%;
  transition: transform ${motion.hoverDuration} ${motion.hoverEase};

  ${media.mobile} {
    width: 26px;
    height: 26px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Wordmark = styled.span`
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: ${colors.cream};

  ${media.mobile} {
    font-size: 14px;
    line-height: 20px;
  }
`;

/* Each link now carries its own padding so the hover cloud has room, so the
   flex gap only has to top up the visual spacing rather than provide all of it. */
const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  margin-right: 24px;

  ${media.mobile} {
    display: none;
  }

  /*
   * 769–1100 px is the tightest the row ever gets: four links, the language
   * control and the CTA all have to fit between the logo and the gutter, in
   * whichever language is longer. The links give back their horizontal padding
   * here — the hover cloud shrinks with them, so the interaction is unchanged.
   */
  ${media.tablet} {
    gap: 0;
    margin-right: 6px;

    a {
      padding-left: 11px;
      padding-right: 11px;
    }
  }
`;

/* Sits between the links and the primary CTA, per the approved navbar order. */
const LangWrap = styled.div`
  flex-shrink: 0;
  margin-right: 12px;

  ${media.mobile} {
    display: none;
  }

  ${media.tablet} {
    margin-right: 6px;
  }
`;

/*
 * Nav link hover.
 *
 * A soft pink cloud settles in behind the hovered link. The blob is the same
 * organic silhouette family as the CTAs, scaled up from 0.82 and faded in over
 * 520 ms with a gentle curve — long enough that moving along the row reads as
 * one shape drifting between links rather than a row of hard on/off switches.
 *
 * Replaces the underline wipe, which was quick and linear and read as a toggle.
 */
const NavLinkCloud = styled.span`
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.82);
  transform-origin: 50% 52%;
  transition:
    opacity 520ms cubic-bezier(0.3, 0.1, 0.2, 1),
    transform 520ms cubic-bezier(0.3, 0.1, 0.2, 1);
  will-change: opacity, transform;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const NavLink = styled.a`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${fonts.body};
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${colors.creamBody};
  white-space: nowrap;
  text-decoration: none;
  padding: 10px 18px;
  transition: color 520ms cubic-bezier(0.3, 0.1, 0.2, 1);

  span.nav-link-text {
    position: relative;
    z-index: 1;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${colors.darkGreen};
    }
    &:hover ${NavLinkCloud} {
      opacity: 1;
      transform: scale(1);
    }
  }

  &:focus-visible {
    outline: none;
    color: ${colors.darkGreen};
  }
  &:focus-visible ${NavLinkCloud} {
    opacity: 1;
    transform: scale(1);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/*
 * Previously the CTA was hidden on tablet while the hamburger only appeared
 * below 769 px, which left 769–1100 px with no "Start a project" action at all.
 * The CTA now stays present at every width above the mobile menu breakpoint and
 * simply scales down between 769 and 1100 px.
 */
const NavCtaWrap = styled.div`
  flex-shrink: 0;

  ${media.mobile} {
    display: none;
  }

  ${media.tablet} {
    a {
      height: 46px;
      min-width: 130px;
      padding: 0 22px;
    }
    a .blob-cta-label {
      font-size: 13px;
    }
  }
`;

/* ─── Hamburger ─────────────────────────────────────────────────────────── */

const Hamburger = styled.button<{ $open: boolean }>`
  display: none;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 50px;
  position: relative;
  margin-left: auto;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  ${media.mobile} {
    display: flex;
  }

  /* Organic blob border responds instead of a rectangular focus/hover box */
  [data-hamburger-border] {
    transform-origin: 50% 50%;
    transition:
      transform ${motion.hoverDuration} ${motion.hoverEase},
      opacity ${motion.hoverDuration} ${motion.hoverEase};
    opacity: ${({ $open }) => ($open ? 0 : 1)};
  }

  /*
   * Open state: the outline gives way to a filled pink blob and the bars turn
   * dark green, so the control reads as active rather than as the same outline
   * with a rotated glyph. The fill uses the same organic silhouette, released
   * with a slight overshoot — the same language as the CTA flood.
   */
  [data-hamburger-fill] {
    position: absolute;
    inset: 0;
    display: block;
    transform-origin: 50% 50%;
    transform: scale(${({ $open }) => ($open ? 1 : 0.4)});
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    transition:
      transform 320ms cubic-bezier(0.34, 1.4, 0.5, 1),
      opacity 200ms ${motion.hoverEase};
  }

  @media (prefers-reduced-motion: reduce) {
    [data-hamburger-fill] { transition: none; }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover [data-hamburger-border] {
      transform: scale(1.06) rotate(-3deg);
    }
  }

  &:focus-visible {
    outline: none;
  }
  &:focus-visible [data-hamburger-border] {
    transform: scale(1.06) rotate(-3deg);
  }

  @media (prefers-reduced-motion: reduce) {
    [data-hamburger-border] { transition: none; }
  }
`;

const BurgerLines = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BurgerLine = styled.span<{ $open: boolean; $bottom?: boolean }>`
  width: 20px;
  height: 2px;
  background-color: ${({ $open }) => ($open ? colors.darkGreen : colors.cream)};
  border-radius: 1px;
  display: block;
  transition:
    transform 250ms ease-out,
    background-color 200ms ease-out;

  ${({ $open, $bottom }) =>
    $open &&
    css`
      transform: ${$bottom ? 'translateY(-4px) rotate(-45deg)' : 'translateY(4px) rotate(45deg)'};
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/* ─── Fullscreen mobile menu overlay ────────────────────────────────────── */

const MobileMenuOverlay = styled.div<{ $open: boolean }>`
  display: none;

  ${media.mobile} {
    display: flex;
    flex-direction: column;
    position: fixed;
    inset: 0;
    width: 100%;
    background-color: ${colors.darkGreen};
    z-index: 99;
    /* inset: 0 governs the height. An explicit 100dvh can fall short of the
       visual viewport under viewport-fit=cover and leave a gap at the bottom. */
    padding-top: calc(90px + var(--safe-top)); /* compact navbar + iOS inset */
    padding-left: 24px;
    padding-right: 24px;
    padding-bottom: calc(40px + var(--safe-bottom));
    box-sizing: border-box;

    opacity: ${({ $open }) => ($open ? 1 : 0)};
    transform: translateY(${({ $open }) => ($open ? '0' : '-10px')});
    pointer-events: ${({ $open }) => ($open ? 'all' : 'none')};
    visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
    /* Delay visibility:hidden until transition finishes on close */
    transition:
      opacity 270ms ease-out,
      transform 270ms ease-out,
      visibility 0ms linear ${({ $open }) => ($open ? '0ms' : '270ms')};

    @media (prefers-reduced-motion: reduce) {
      transition:
        opacity 0ms,
        transform 0ms,
        visibility 0ms;
    }
  }
`;

const MenuNavList = styled.nav`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  gap: 4px;
`;

const menuNavBase = `
  font-family: ${fonts.display};
  font-size: clamp(44px, 13.5vw, 58px);
  line-height: 1.12;
  color: ${colors.cream};
  padding: 6px 0;
  display: block;
  text-align: left;
  width: 100%;
`;

/*
 * Expanded-menu link hover — the pink travels across the word, left to right.
 *
 * The label is rendered twice in the same box: cream underneath, pink directly
 * on top. The pink copy is clipped to zero width from its right edge and the
 * clip is released left-to-right, so the colour passes THROUGH the letterforms
 * themselves. Nothing moves, nothing sits behind the text, and the type never
 * shifts position — which is what separates this from an underline, a
 * background pill or a translated word.
 *
 * The pink copy is aria-hidden so the label is announced once.
 */
const MenuNavFill = styled.span`
  position: absolute;
  inset: 0;
  color: ${colors.pink};
  white-space: nowrap;
  pointer-events: none;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 620ms cubic-bezier(0.33, 0.1, 0.2, 1);
  will-change: clip-path;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/* Wraps the two copies so the overlay's containing block is exactly the text. */
const MenuNavLabel = styled.span`
  position: relative;
  display: inline-block;
`;

const MenuNavLink = styled.a`
  ${menuNavBase}
  text-decoration: none;

  @media (hover: hover) and (pointer: fine) {
    &:hover ${MenuNavFill} {
      clip-path: inset(0 0 0 0);
    }
  }

  &:active ${MenuNavFill},
  &:focus-visible ${MenuNavFill} {
    clip-path: inset(0 0 0 0);
  }

  &:focus-visible {
    outline: none;
  }
`;


const MenuCtaWrap = styled.div`
  padding-top: 40px;
  padding-bottom: 16px;
`;

/*
 * Content-width, left-aligned — matches the Hero CTA proportions instead of
 * stretching a pill across the full width of the open menu.
 *
 * The language control shares this row, sitting beside the primary action: it
 * is the other thing you can DO from the open menu, and putting it here keeps
 * the closed navbar uncluttered while never letting it compete with the CTA.
 */
const MenuCtaRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
`;

/* ─── Component ─────────────────────────────────────────────────────────── */

/*
 * Nav items.
 *
 * The scroll target is structural and the label is a translation, so the two
 * are kept apart: `id` is the element the link scrolls to, `key` names the
 * label in the locale dictionary. Both locales therefore drive exactly the same
 * anchors.
 */
const NAV_ITEMS = [
  { id: 'proof', key: 'work' },
  { id: 'build-in-public', key: 'buildInPublic' },
  { id: 'about', key: 'about' },
  { id: 'contact', key: 'contact' },
] as const;

const NAV_CLOUD = SHAPE_NAV;

/* Organic hamburger silhouette — shared with the language switcher, so both
   small utility controls use one shape rather than two similar ones. */
const HAMBURGER_BLOB_D = SHAPE_CLOUD.d;

/* Wave path data — Figma node 104:3, desktop and mobile variants. */
const DESKTOP_WAVE_D =
  'M0 0H1440V120C1360 106 1300 144 1215 132C1135 120 1088 92 1005 110C922 128 865 162 780 144C690 124 645 92 560 108C470 126 430 160 340 146C250 132 190 96 108 112C62 121 30 134 0 128V0Z';
const MOBILE_WAVE_D =
  'M0 0H390V82C365 68 348 105 321 108C291 111 278 73 250 78C220 84 209 113 182 111C153 109 142 72 113 76C84 80 71 112 43 110C24 109 14 93 0 98V0Z';

/* Pink under-waves — see PinkWaveLayer for how these were derived. */
const DESKTOP_PINK_WAVE_D =
  'M0 0H1440V135.2C1360 117.6 1300 165.4 1215 150.3C1135 135.2 1088 100 1005 122.6C922 145.3 865 188 780 165.4C690 140.2 645 100 560 120.1C470 142.7 430 185.5 340 167.9C250 150.3 190 105 108 125.1C62 136.5 30 152.8 0 145.3V0Z';
const MOBILE_PINK_WAVE_D =
  'M0 0H390V92C365 74 348 121.7 321 125.6C291 129.4 278 80.4 250 86.9C220 94.6 209 132 182 129.4C153 126.8 142 79.2 113 84.3C84 89.5 71 130.7 43 128.1C24 126.8 14 106.2 0 112.7V0Z';

export function Navbar() {
  const locale = useLocale();
  const t = useMessages();
  const [isOpen, setIsOpen] = useState(false);
  // Drives the pink under-wave. False at the very top of the page so the navbar
  // merges cleanly into the dark-green hero, as approved in Direction C.
  const [isScrolled, setIsScrolled] = useState(false);
  // Stores the element ID to scroll to after the menu close + scroll-lock
  // cleanup sequence completes. Null means the menu was closed without navigation.
  const pendingTargetRef = useRef<string | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Desktop anchor links — smooth scroll without relying on CSS scroll-behavior.
  // Global scroll-behavior is 'auto' so that direct hash loads (#about, #contact)
  // start at the correct position instantly. This handler provides smooth scrolling
  // for user-initiated clicks on desktop nav links and the desktop CTA.
  const handleNavClick = useCallback(
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', `#${id}`);
      }
    },
    [],
  );

  // Scroll state — identical logic on desktop and mobile, rAF-throttled so it
  // never competes with the Blob S journey scroll handler.
  useEffect(() => {
    let ticking = false;
    const evaluate = () => {
      ticking = false;
      setIsScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(evaluate);
    };
    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openMenu = useCallback(() => setIsOpen(true), []);

  // Explicit close (X button, Escape, hamburger toggle) — no navigation
  const closeMenu = useCallback(() => {
    pendingTargetRef.current = null;
    setIsOpen(false);
    setTimeout(() => hamburgerRef.current?.focus(), 10);
  }, []);

  // Store target, then close. Navigation runs in a dedicated effect AFTER
  // the scroll-lock cleanup, making the sequence deterministic.
  // React guarantees: within a single re-render, all effect cleanups run
  // before any new effect bodies, so the scroll-lock cleanup (effect 1)
  // always completes before the navigation effect (effect 2) fires.
  const menuNavigate = useCallback(
    (elementId: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      pendingTargetRef.current = elementId;
      setIsOpen(false);
    },
    [],
  );

  // Publish open state so the mobile Blob S can pause rendering while the
  // overlay covers the page. This is a render gate only — the blob never uses
  // it to work out where it should be.
  useEffect(() => {
    setMenuOpen(isOpen);
    return () => setMenuOpen(false);
  }, [isOpen]);

  // Effect 1 — scroll lock
  // Cleanup runs first when isOpen flips false, restoring body and scroll.
  useEffect(() => {
    if (!isOpen) return;
    const savedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, savedScrollY);
    };
  }, [isOpen]);

  // Effect 2 — pending navigation
  // Fires after effect 1's cleanup has run, so body scrolling is already restored.
  useEffect(() => {
    if (isOpen) return;
    const target = pendingTargetRef.current;
    if (!target) return;
    pendingTargetRef.current = null;

    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Update hash without triggering the browser's own anchor scroll
      history.replaceState(null, '', `#${target}`);
    }
    setTimeout(() => hamburgerRef.current?.focus(), 10);
  }, [isOpen]);

  // Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const menuEl = menuRef.current;
    if (!menuEl) return;

    const focusable = Array.from(
      menuEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(el => getComputedStyle(el).display !== 'none');

    focusable[0]?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
        return;
      }
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeMenu]);

  return (
    <>
      <NavHeader>
        <NavTopBackdrop aria-hidden="true" />
        <NavShell>
          <NavWaveBg aria-hidden="true">
            {/* Pink under-wave — behind the dark green, fades in once scrolled */}
            <PinkWaveLayer $visible={isScrolled}>
              <DesktopWave
                viewBox="0 0 1440 149.297"
                preserveAspectRatio="none"
                fill="none"
                overflow="visible"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={DESKTOP_PINK_WAVE_D} fill={colors.pink} />
              </DesktopWave>
              <MobileWave
                viewBox="0 0 390 112"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={MOBILE_PINK_WAVE_D} fill={colors.pink} />
              </MobileWave>
            </PinkWaveLayer>

            <MainWaveLayer>
              {/* Desktop wave — Figma node 104:3, original path, height reduced from 149→108 px */}
              <DesktopWave
                viewBox="0 0 1440 149.297"
                preserveAspectRatio="none"
                fill="none"
                overflow="visible"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={DESKTOP_WAVE_D} fill={colors.darkGreen} />
              </DesktopWave>

              {/* Mobile wave — original Figma path, height reduced from 112→90 px */}
              <MobileWave
                viewBox="0 0 390 112"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={MOBILE_WAVE_D} fill={colors.darkGreen} />
              </MobileWave>
            </MainWaveLayer>
          </NavWaveBg>

          <NavContentRow>
            {/* Logo returns to the CURRENT locale's homepage, never to English. */}
            <LogoGroup href={localePath(locale)}>
              <NavBlobSWrap data-nav-logo-blob="">
                <Image
                  src="/assets/blob-s-nav.svg"
                  alt={t.nav.logoAlt}
                  fill
                  unoptimized
                  style={{ objectFit: 'contain' }}
                />
              </NavBlobSWrap>
              <Wordmark>stefanko.tech</Wordmark>
            </LogoGroup>

            <NavLinks>
              {NAV_ITEMS.map(item => (
                <NavLink key={item.id} href={`#${item.id}`} onClick={handleNavClick(item.id)}>
                  <NavLinkCloud aria-hidden="true">
                    <svg
                      viewBox={NAV_CLOUD.viewBox}
                      preserveAspectRatio="none"
                      fill="none"
                      style={{ display: 'block', width: '100%', height: '100%' }}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d={NAV_CLOUD.d} fill={colors.pink} />
                    </svg>
                  </NavLinkCloud>
                  <span className="nav-link-text">{t.nav.items[item.key]}</span>
                </NavLink>
              ))}
            </NavLinks>

            <LangWrap>
              <LanguageSwitch />
            </LangWrap>

            <NavCtaWrap>
              <BlobCta
                href="#contact"
                variant="nav"
                size="sm"
                onClick={handleNavClick('contact')}
              >
                {t.nav.cta}
              </BlobCta>
            </NavCtaWrap>

            <Hamburger
              ref={hamburgerRef}
              $open={isOpen}
              onClick={isOpen ? closeMenu : openMenu}
              aria-label={isOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {/* Filled pink silhouette — revealed when the menu is open */}
              <span data-hamburger-fill="" aria-hidden="true">
                <svg
                  viewBox="0 0 50.6007 50"
                  preserveAspectRatio="none"
                  fill="none"
                  style={{ display: 'block', width: '100%', height: '100%' }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={HAMBURGER_BLOB_D} fill={colors.pink} />
                </svg>
              </span>

              {/* Outline drawn from the SAME path and the SAME stroke token as
                  the language switcher and the CTAs, rather than from a separate
                  SVG file that carried its own opacity and drifted from them. */}
              <span
                data-hamburger-border=""
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, display: 'block' }}
              >
                <svg
                  viewBox={SHAPE_CLOUD.viewBox}
                  preserveAspectRatio="none"
                  fill="none"
                  style={{ display: 'block', width: '100%', height: '100%' }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d={HAMBURGER_BLOB_D}
                    fill="none"
                    stroke={colors.cream}
                    strokeOpacity={strokes.blobOutlineOpacity}
                    strokeWidth={strokes.blobOutlineWidth}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
              <BurgerLines>
                <BurgerLine $open={isOpen} />
                <BurgerLine $open={isOpen} $bottom />
              </BurgerLines>
            </Hamburger>
          </NavContentRow>
        </NavShell>
      </NavHeader>

      {/* Fullscreen mobile navigation overlay */}
      <MobileMenuOverlay
        id="mobile-menu"
        ref={menuRef}
        $open={isOpen}
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.dialogLabel}
      >
        <MenuNavList aria-label={t.nav.mainNavLabel}>
          {NAV_ITEMS.map(item => {
            const label = t.nav.items[item.key];
            return (
              <MenuNavLink key={item.id} href={`#${item.id}`} onClick={menuNavigate(item.id)}>
                <MenuNavLabel>
                  {label}
                  <MenuNavFill aria-hidden="true">{label}</MenuNavFill>
                </MenuNavLabel>
              </MenuNavLink>
            );
          })}
        </MenuNavList>

        <MenuCtaWrap>
          <MenuCtaRow>
            {/* Start a project → #contact */}
            <BlobCta
              href="#contact"
              variant="primary"
              size="md"
              onClick={menuNavigate('contact')}
            >
              {t.nav.cta}
            </BlobCta>

            {/* Closing the menu first stops the scroll lock from surviving the
                route change to the other locale. */}
            <LanguageSwitch variant="menu" onNavigate={closeMenu} />
          </MenuCtaRow>
        </MenuCtaWrap>
      </MobileMenuOverlay>
    </>
  );
}
