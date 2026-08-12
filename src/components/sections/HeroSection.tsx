'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import styled from 'styled-components';
import { colors, fonts, spacing } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobCta } from '@/components/ui/BlobCta';
import { BlobSlot } from '@/components/blob/BlobSlot';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* ─── Section shell ──────────────────────────────────────────────────────────
 *
 * The hero is a single-screen composition: `min-height: 100svh` plus a flex
 * column that centres the grid means the whole story block (label → headline →
 * body → CTAs) is always inside the first viewport, on a 13" laptop as well as
 * on a wide desktop. Every vertical gap below is a viewport-relative clamp
 * rather than a fixed pixel value, which is what keeps it fitting.
 *
 * `svh` (small viewport height) is used deliberately so mobile browsers do not
 * push the CTAs under the collapsing URL bar.
 */
const Section = styled.section`
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: calc(${spacing.navHeight} + clamp(12px, 2.4vh, 40px) + var(--safe-top));
  padding-bottom: clamp(72px, 11vh, 132px);

  @media (max-width: 991px) {
    justify-content: flex-start;
    padding-top: calc(${spacing.navHeight} + 24px + var(--safe-top));
    padding-bottom: 72px;
  }

  @media (max-width: 767px) {
    padding-top: calc(${spacing.navHeightMobile} + 20px + var(--safe-top));
    padding-bottom: 64px;
  }
`;

/* ─── Responsive two-column → single-column grid ───────────────────────── */
/* align-items: center balances the headline block against the Blob S column on
   large screens instead of letting the blob hang from the top. */
const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  column-gap: clamp(24px, 3vw, 56px);
  align-items: center;

  /* lg (992–1199 px): tighter but still two columns */
  @media (min-width: 992px) and (max-width: 1199px) {
    grid-template-columns: 1fr minmax(0, 380px);
    column-gap: 24px;
  }

  /* Below lg: single column stacked */
  @media (max-width: 991px) {
    display: flex;
    flex-direction: column;
  }
`;

/* Text column — above canvas (z-index: 20) so headline and CTAs remain interactive */
const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 30;
  min-width: 0;
`;

const LabelWrap = styled.div`
  margin-bottom: 0;
`;

const Headline = styled.h1`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  /* Viewport-relative so the hero still fits on short laptop screens */
  margin-top: clamp(28px, 6.4vh, 104px);

  @media (max-width: 991px) {
    margin-top: 26px;
  }
`;

/* Headline scale is capped by viewport HEIGHT as well as width — on a short
   wide screen a 138 px headline would push the CTAs out of the first screen. */
const HeadlineLineWhite = styled.span`
  display: block;
  font-size: min(clamp(80px, 9.58vw, 138px), 15.5vh);
  line-height: 1.044;
  color: ${colors.cream};

  @media (max-width: 991px) {
    font-size: clamp(66px, 9.4vw, 92px);
    line-height: 1.06;
  }

  @media (max-width: 767px) {
    font-size: clamp(52px, 15vw, 66px);
    line-height: 1.06;
  }

  @media (min-width: 992px) and (max-width: 1199px) {
    font-size: min(clamp(80px, 9vw, 116px), 15vh);
  }
`;

const HeadlineLinePink = styled(HeadlineLineWhite)`
  color: ${colors.pink};
`;

/* ─── Blob S slot — narrow screens (mobile + narrow tablet, <992 px) ───── */
/* filter creates a stacking context at z-index: auto — below canvas (z-index: 20) */
const BlobNarrowWrap = styled.div`
  display: none;
  justify-content: center;
  margin-top: clamp(16px, 3vh, 32px);
  filter: drop-shadow(0px 14px 10px rgba(8, 46, 38, 0.42));

  @media (max-width: 991px) {
    display: flex;
  }
`;

/* Sized from viewport HEIGHT, like the desktop slot: on a 768 × 1024 tablet a
   width-driven blob was 450 px tall and pushed the CTAs off the first screen. */
const BlobNarrowInner = styled.div`
  position: relative;
  height: clamp(190px, 31svh, 330px);
  max-width: 62vw;
  /* Maintain 590:780 aspect ratio */
  aspect-ratio: 590 / 780;
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 22px;
  line-height: 34px;
  color: ${colors.creamBody};
  margin-top: clamp(22px, 3.6vh, 56px);
  max-width: 520px;

  @media (max-width: 991px) {
    font-size: 18px;
    line-height: 28px;
    margin-top: 28px;
    max-width: 100%;
  }
`;

/* ─── CTA row ────────────────────────────────────────────────────────────────
 * Both CTAs are content-width at every breakpoint and separated by a real gap.
 * The previous layout nested the secondary blob 34 px INTO the primary, which
 * left the two labels almost touching, and swapped in full-bleed pill variants
 * below 992 px. Now the pair simply wraps to a left-aligned column on narrow
 * screens, keeping the same horizontal proportions as on desktop.
 */
const CtaRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: clamp(26px, 4.4vh, 68px);

  /* Below 992 px the pair is treated as one centred stack. */
  @media (max-width: 991px) {
    flex-direction: column;
    align-items: center;
    gap: 14px;
    margin-top: 34px;
  }
`;

/* ─── Blob S slot — desktop right column (≥992 px) ─────────────────────── */
/* filter creates a stacking context at z-index: auto — below canvas (z-index: 20) */
const BlobDesktopWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));

  @media (max-width: 991px) {
    display: none;
  }
`;

/* Sized from viewport HEIGHT first, so the blob stays fully inside the single
   hero screen and keeps its visual weight against the headline on wide monitors. */
const BlobDesktopImgWrap = styled.div`
  position: relative;
  height: clamp(360px, 62svh, 660px);
  max-width: 100%;
  aspect-ratio: 590 / 780;

  @media (min-width: 992px) and (max-width: 1199px) {
    height: clamp(320px, 52svh, 500px);
  }
`;

const DesktopBr = styled.br`
  @media (max-width: 991px) {
    display: none;
  }
`;

/* z-index: 30 ensures scroll hint stays above the fixed canvas (z-index: 20) */
const ScrollHint = styled.p`
  font-family: ${fonts.body};
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 1.8px;
  color: ${colors.muted};
  text-align: right;
  position: absolute;
  /* Aligned to the SiteContainer gutter at every breakpoint */
  right: 24px;
  bottom: clamp(28px, 4.6vh, 58px);
  z-index: 30;

  @media (max-width: 767px) {
    font-size: 10px;
    line-height: 14px;
    letter-spacing: 1.4px;
  }

  @media (min-width: 768px) {
    right: 32px;
  }

  @media (min-width: 992px) {
    right: 48px;
  }

  @media (min-width: 1200px) {
    right: 56px;
  }

  @media (min-width: 1400px) {
    right: 64px;
  }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.matchMedia('(max-width: 991px)').matches;

    const label    = section.querySelector('[data-hero-label]');
    const headline = section.querySelector('[data-hero-headline]');
    const lines    = headline ? headline.querySelectorAll('span') : [];
    const body     = section.querySelector('[data-hero-body]');
    const cta      = section.querySelector('[data-hero-cta]');
    const blobN    = section.querySelector('[data-hero-blob-n]');
    const hint     = section.querySelector('[data-hero-hint]');

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.from(label, { opacity: 0, y: -10, duration: 0.5 })
      .from(lines, {
        opacity: 0,
        y: isMobile ? 22 : 42,
        duration: isMobile ? 0.55 : 0.7,
        stagger: 0.13,
      }, '-=0.25');

    // Narrow blob slot enters between headline and body on mobile
    if (isMobile && blobN) {
      tl.from(blobN, { opacity: 0, scale: 0.94, duration: 0.6 }, '-=0.1');
    }

    tl.from(body, { opacity: 0, y: isMobile ? 16 : 26, duration: 0.6 }, '-=0.25')
      .from(cta,  { opacity: 0, y: isMobile ? 12 : 18, duration: 0.5 }, '-=0.3');

    // Desktop blob slot (data-hero-blob-d) is now handled by the persistent canvas;
    // no separate GSAP animation needed for it.

    if (hint) {
      gsap.to(hint, {
        opacity: 0,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100',
          scrub: 0.4,
        },
      });
    }
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    /* data-scene-section used by BlobJourneyController to set up ScrollTrigger */
    <Section ref={sectionRef} data-scene-section="hero">
      <SiteContainer>
        <HeroGrid>
          <TextColumn>
            <LabelWrap data-hero-label="">
              <SectionLabel>{`01  /  RAW IDEA`}</SectionLabel>
            </LabelWrap>

            <Headline data-hero-headline="">
              <HeadlineLineWhite>FROM IDEA</HeadlineLineWhite>
              <HeadlineLinePink>TO PRODUCT.</HeadlineLinePink>
            </Headline>

            {/* Mobile blob slot — canvas renders above filter stacking context */}
            <BlobNarrowWrap data-hero-blob-n="">
              <BlobNarrowInner>
                <BlobSlot slotKey="hero-mobile" mobile="local" />
              </BlobNarrowInner>
            </BlobNarrowWrap>

            <BodyText data-hero-body="">
              I connect product thinking, AI, design and technology{' '}
              <DesktopBr />
              to turn raw ideas into real products.
            </BodyText>

            <CtaRow data-hero-cta="">
              <BlobCta href="#contact" variant="primary" size="lg">
                Start a conversation
              </BlobCta>

              <BlobCta href="#proof" variant="outlineLight" size="lg">
                Explore selected work&nbsp;↗
              </BlobCta>
            </CtaRow>
          </TextColumn>

          {/* Desktop blob slot — canvas renders above filter stacking context */}
          <BlobDesktopWrap data-hero-blob-d="">
            <BlobDesktopImgWrap>
              <BlobSlot slotKey="hero-desktop" mobile="none" />
            </BlobDesktopImgWrap>
          </BlobDesktopWrap>
        </HeroGrid>
      </SiteContainer>

      <ScrollHint data-hero-hint="">SCROLL TO SHAPE THE IDEA</ScrollHint>
    </Section>
  );
}
