'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styled, { css } from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { BlobButton } from '@/components/ui/BlobButton';

/* ─── Wave SVG notes ────────────────────────────────────────────────────────
   The wave is always rendered. Over the dark-green hero the fill matches the
   background (invisible). Over cream sections the organic edge becomes visible.

   Compact wave: original Figma path data is kept exactly; only the rendered
   height is reduced so the wave sits shallower below the content row.

   Desktop: content row 72 px + wave 28 px = 100 px total visual height
   Mobile:  content row 64 px + wave 22 px = 86 px total visual height        */

const NavHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  overflow: visible;
  pointer-events: none;
`;

/* Original viewBox kept; height reduced from 149 px → 100 px (shallower wave). */
const DesktopWave = styled.svg`
  display: none;
  width: 100%;
  height: 100px;
  overflow: visible;

  ${media.aboveMobile} {
    display: block;
  }
`;

/* Original viewBox kept; height reduced from 112 px → 86 px. */
const MobileWave = styled.svg`
  display: block;
  width: 100%;
  height: 86px;

  ${media.aboveMobile} {
    display: none;
  }
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

const NavContentRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 72px;
  padding: 0 64px;
  pointer-events: all;

  ${media.mobile} {
    height: 64px;
    padding: 0 24px;
  }

  ${media.tablet} {
    padding: 0 40px;
  }
`;

const LogoGroup = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  cursor: pointer;
  text-decoration: none;
`;

const NavBlobSWrap = styled.div`
  position: relative;
  width: 34px;
  height: 34px;
  flex-shrink: 0;

  ${media.mobile} {
    width: 26px;
    height: 26px;
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

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 34px;
  margin-left: auto;
  margin-right: 32px;

  ${media.mobile} {
    display: none;
  }

  ${media.tablet} {
    gap: 20px;
    margin-right: 20px;
  }
`;

const NavLink = styled.a`
  font-family: ${fonts.body};
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${colors.creamBody};
  white-space: nowrap;
  text-decoration: none;
`;

const NavCtaWrap = styled.div`
  flex-shrink: 0;

  ${media.mobile} {
    display: none;
  }

  ${media.tablet} {
    display: none;
  }
`;

/* ─── Hamburger ─────────────────────────────────────────────────────────── */

const Hamburger = styled.button`
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
  background-color: ${colors.cream};
  border-radius: 1px;
  display: block;
  transition: transform 250ms ease-out;

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
    height: 100dvh;
    background-color: ${colors.darkGreen};
    z-index: 99;
    padding-top: 86px; /* clear compact mobile navbar */
    padding-left: 24px;
    padding-right: 24px;
    padding-bottom: 40px;
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

const MenuNavLink = styled.a`
  ${menuNavBase}
  text-decoration: none;

  &:active {
    color: ${colors.pink};
  }
`;


const MenuCtaWrap = styled.div`
  padding-top: 40px;
  padding-bottom: 16px;
`;

const MobileMenuPrimaryBlobWrap = styled.div`
  position: relative;
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;

  a {
    position: relative;
    z-index: 1;
    font-family: ${fonts.body};
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    color: ${colors.darkGreen};
    text-align: center;
    text-decoration: none;
  }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  // Stores the element ID to scroll to after the menu close + scroll-lock
  // cleanup sequence completes. Null means the menu was closed without navigation.
  const pendingTargetRef = useRef<string | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
        <NavWaveBg aria-hidden="true">
          {/* Desktop wave — Figma node 104:3, original path, height reduced from 149→100 px */}
          <DesktopWave
            viewBox="0 0 1440 149.297"
            preserveAspectRatio="none"
            fill="none"
            overflow="visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0H1440V120C1360 106 1300 144 1215 132C1135 120 1088 92 1005 110C922 128 865 162 780 144C690 124 645 92 560 108C470 126 430 160 340 146C250 132 190 96 108 112C62 121 30 134 0 128V0Z"
              fill="#082E26"
            />
          </DesktopWave>

          {/* Mobile wave — original Figma path, height reduced from 112→86 px */}
          <MobileWave
            viewBox="0 0 390 112"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0H390V82C365 68 348 105 321 108C291 111 278 73 250 78C220 84 209 113 182 111C153 109 142 72 113 76C84 80 71 112 43 110C24 109 14 93 0 98V0Z"
              fill="#082E26"
            />
          </MobileWave>
        </NavWaveBg>

        <NavContentRow>
          <LogoGroup href="/">
            <NavBlobSWrap>
              <Image
                src="/assets/blob-s-nav.svg"
                alt="Stefanko.tech"
                fill
                unoptimized
                style={{ objectFit: 'contain' }}
              />
            </NavBlobSWrap>
            <Wordmark>stefanko.tech</Wordmark>
          </LogoGroup>

          <NavLinks>
            <NavLink href="#proof">Work</NavLink>
            <NavLink href="#build-in-public">Build in Public</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </NavLinks>

          <NavCtaWrap>
            <BlobButton
              href="#contact"
              blobSrc="/assets/cta-start-project.svg"
              textColor={colors.cream}
              width={166}
              height={56}
              fontSize={14}
            >
              Start a project
            </BlobButton>
          </NavCtaWrap>

          <Hamburger
            ref={hamburgerRef}
            onClick={isOpen ? closeMenu : openMenu}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <Image
              src="/assets/hamburger-blob-border.svg"
              alt=""
              aria-hidden={true}
              width={52}
              height={50}
              unoptimized
              style={{
                position: 'absolute',
                inset: 0,
                objectFit: 'fill',
                pointerEvents: 'none',
              }}
            />
            <BurgerLines>
              <BurgerLine $open={isOpen} />
              <BurgerLine $open={isOpen} $bottom />
            </BurgerLines>
          </Hamburger>
        </NavContentRow>
      </NavHeader>

      {/* Fullscreen mobile navigation overlay */}
      <MobileMenuOverlay
        id="mobile-menu"
        ref={menuRef}
        $open={isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <MenuNavList aria-label="Main navigation">
          <MenuNavLink href="#proof" onClick={menuNavigate('proof')}>
            Work
          </MenuNavLink>
          <MenuNavLink href="#build-in-public" onClick={menuNavigate('build-in-public')}>
            Build in Public
          </MenuNavLink>
          <MenuNavLink href="#about" onClick={menuNavigate('about')}>
            About
          </MenuNavLink>
          <MenuNavLink href="#contact" onClick={menuNavigate('contact')}>
            Contact
          </MenuNavLink>
        </MenuNavList>

        <MenuCtaWrap>
          <MobileMenuPrimaryBlobWrap>
            <Image
              src="/assets/cta-primary-mobile.svg"
              alt=""
              aria-hidden={true}
              fill
              unoptimized
              style={{ objectFit: 'fill', pointerEvents: 'none' }}
            />
            {/* Start a project → #contact */}
            <a href="#contact" onClick={menuNavigate('contact')}>
              Start a project
            </a>
          </MobileMenuPrimaryBlobWrap>
        </MenuCtaWrap>
      </MobileMenuOverlay>
    </>
  );
}
