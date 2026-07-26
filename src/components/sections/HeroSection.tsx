'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobButton } from '@/components/ui/BlobButton';
import { SecondaryExploreCta } from '@/components/ui/SecondaryExploreCta';
import { BlobSceneSlot } from '@/components/blob/BlobSceneSlot';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* ─── Section shell — full-width background, vertical spacing only ──────── */
const Section = styled.section`
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  min-height: 1072px;
  padding-top: 154px;
  padding-bottom: 80px;

  @media (max-width: 991px) {
    min-height: auto;
    padding-top: 120px;
    padding-bottom: 60px;
  }

  @media (max-width: 767px) {
    padding-top: 106px;
  }
`;

/* ─── Responsive two-column → single-column grid ───────────────────────── */
const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  column-gap: 40px;
  align-items: start;

  /* lg (992–1199 px): tighter but still two columns */
  @media (min-width: 992px) and (max-width: 1199px) {
    grid-template-columns: 1fr minmax(0, 420px);
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
`;

const LabelWrap = styled.div`
  margin-bottom: 36px;

  @media (max-width: 991px) {
    margin-bottom: 0;
  }
`;

const Headline = styled.h1`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  margin-top: 150px;

  @media (max-width: 991px) {
    margin-top: 26px;
  }
`;

const HeadlineLineWhite = styled.span`
  display: block;
  font-size: clamp(80px, 9.58vw, 138px);
  line-height: 1.044;
  color: ${colors.cream};

  @media (max-width: 767px) {
    font-size: 66px;
    line-height: 70px;
  }

  @media (min-width: 992px) and (max-width: 1199px) {
    font-size: clamp(80px, 9vw, 120px);
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
  margin-top: 20px;
  filter: drop-shadow(0px 14px 10px rgba(8, 46, 38, 0.42));

  @media (max-width: 991px) {
    display: flex;
  }
`;

const BlobNarrowInner = styled.div`
  position: relative;
  width: clamp(218px, 55vw, 380px);
  /* Maintain 590:780 aspect ratio */
  aspect-ratio: 590 / 780;
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 22px;
  line-height: 34px;
  color: ${colors.creamBody};
  margin-top: 59px;
  max-width: 520px;

  @media (max-width: 991px) {
    font-size: 18px;
    line-height: 28px;
    margin-top: 32px;
    max-width: 100%;
  }
`;

/* ─── CTA row — flex-wrap prevents overlap at all widths ───────────────── */
const CtaRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0;
  margin-top: 76px;

  /* Below 992 px: vertical stack */
  @media (max-width: 991px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin-top: 40px;
  }
`;

/* Desktop CTA group (≥992 px) — primary blob + overlapping secondary */
const DesktopCtaGroup = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 991px) {
    display: none;
  }
`;

/* Mobile/narrow CTA wrappers (<992 px) — full-width blobs */
const NarrowBlobWrap = styled.div`
  display: none;
  position: relative;
  width: 100%;
  height: 56px;
  align-items: center;
  justify-content: center;

  a {
    position: relative;
    z-index: 1;
    font-family: ${fonts.body};
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    text-align: center;
    text-decoration: none;
  }

  @media (max-width: 991px) {
    display: flex;
  }
`;

const NarrowPrimaryWrap = styled(NarrowBlobWrap)`
  a { color: ${colors.darkGreen}; }
`;

const NarrowSecondaryWrap = styled(NarrowBlobWrap)`
  a {
    color: ${colors.cream};
    white-space: pre-wrap;
  }
`;

/* ─── Blob S slot — desktop right column (≥992 px) ─────────────────────── */
/* filter creates a stacking context at z-index: auto — below canvas (z-index: 20) */
const BlobDesktopWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 66px;
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));

  @media (max-width: 991px) {
    display: none;
  }

  @media (min-width: 992px) and (max-width: 1199px) {
    padding-top: 40px;
  }
`;

const BlobDesktopImgWrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 590px;
  aspect-ratio: 590 / 780;
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
  right: 64px;
  bottom: 58px;
  z-index: 30;

  @media (max-width: 767px) {
    font-size: 10px;
    line-height: 14px;
    letter-spacing: 1.4px;
    right: 24px;
    bottom: 53px;
  }

  @media (min-width: 768px) and (max-width: 991px) {
    right: 32px;
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
                <BlobSceneSlot slotKey="hero-mobile" />
              </BlobNarrowInner>
            </BlobNarrowWrap>

            <BodyText data-hero-body="">
              I connect product thinking, AI, design and technology{' '}
              <DesktopBr />
              to turn raw ideas into real products.
            </BodyText>

            <CtaRow data-hero-cta="">
              {/* Desktop (≥992 px): primary blob + overlapping secondary blob */}
              <DesktopCtaGroup>
                <BlobButton
                  href="#contact"
                  blobSrc="/assets/cta-start-conversation.svg"
                  textColor={colors.white}
                  width={230}
                  height={70}
                  fontSize={16}
                >
                  Start a conversation
                </BlobButton>

                <SecondaryExploreCta href="#proof" />
              </DesktopCtaGroup>

              {/* Narrow (<992 px): full-width stacked blobs */}
              <NarrowPrimaryWrap>
                <Image
                  src="/assets/cta-primary-mobile.svg"
                  alt=""
                  aria-hidden={true}
                  fill
                  unoptimized
                  style={{ objectFit: 'fill', pointerEvents: 'none' }}
                />
                <a href="#contact">Start a conversation</a>
              </NarrowPrimaryWrap>

              <NarrowSecondaryWrap>
                <Image
                  src="/assets/cta-secondary-mobile.svg"
                  alt=""
                  aria-hidden={true}
                  fill
                  unoptimized
                  style={{ objectFit: 'fill', pointerEvents: 'none' }}
                />
                <a href="#proof">{`Explore selected work  ↗`}</a>
              </NarrowSecondaryWrap>
            </CtaRow>
          </TextColumn>

          {/* Desktop blob slot — canvas renders above filter stacking context */}
          <BlobDesktopWrap data-hero-blob-d="">
            <BlobDesktopImgWrap>
              <BlobSceneSlot slotKey="hero-desktop" />
            </BlobDesktopImgWrap>
          </BlobDesktopWrap>
        </HeroGrid>
      </SiteContainer>

      <ScrollHint data-hero-hint="">SCROLL TO SHAPE THE IDEA</ScrollHint>
    </Section>
  );
}
