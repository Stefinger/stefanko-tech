'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { BlobButton } from '@/components/ui/BlobButton';

/* The wave SVG is always rendered; it disappears over the dark-green hero because
   fill colour matches the hero, and becomes visible when cream sections scroll underneath.
   Desktop and mobile use separate SVG paths to preserve their organic proportions. */

const NavHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  overflow: visible;
  pointer-events: none;
`;

/* Desktop wave — exact Figma geometry from node 104:3 (file uzpgsTDcrVr6HdblOxIE5d).
   viewBox 0 0 1440 149.297; wave floor at Y=120, max tip at Y=162 (overflow visible).
   Asset also stored at public/assets/navbar-wave-desktop.svg. */
const DesktopWave = styled.svg`
  display: none;
  width: 100%;
  height: 149px;
  overflow: visible;
  ${media.aboveMobile} {
    display: block;
  }
`;

/* Mobile wave — viewBox 390×112, original Figma path. */
const MobileWave = styled.svg`
  display: block;
  width: 100%;
  height: 112px;
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
    height: 68px;
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

  .burger-lines {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .burger-line {
    width: 20px;
    height: 2px;
    background-color: ${colors.cream};
    border-radius: 1px;
    display: block;
  }
`;

export function Navbar() {
  return (
    <NavHeader>
      <NavWaveBg aria-hidden="true">
        {/* Desktop wave — Figma node 104:3, exact geometry, not derived from mobile path */}
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

        {/* Mobile wave — original Figma path at 390×112 */}
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
          <NavLink href="#proof">Build in Public</NavLink>
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

        <Hamburger aria-label="Open menu">
          <Image
            src="/assets/hamburger-blob-border.svg"
            alt=""
            aria-hidden={true}
            width={52}
            height={50}
            unoptimized
            style={{ position: 'absolute', inset: 0, objectFit: 'fill', pointerEvents: 'none' }}
          />
          <div className="burger-lines" aria-hidden="true">
            <span className="burger-line" />
            <span className="burger-line" />
          </div>
        </Hamburger>
      </NavContentRow>
    </NavHeader>
  );
}
