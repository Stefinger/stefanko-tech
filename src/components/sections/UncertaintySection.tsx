'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobSceneSlot } from '@/components/blob/BlobSceneSlot';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* ─── Section shell ────────────────────────────────────────────────────────── */
/*
 * min-height guarantees the bounded question stage always fits inside the
 * section. Previously the desktop clouds were positioned in raw pixels against
 * a section sized only by its text, so the lowest two clouds spilled into the
 * Clarity section below.
 */
const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  overflow: hidden;
  padding-top: 68px;
  padding-bottom: 80px;

  ${media.mobile} {
    padding-top: 48px;
    padding-bottom: 60px;
  }

  @media (min-width: 769px) and (max-width: 991px) {
    min-height: 920px;
  }

  @media (min-width: 992px) {
    min-height: 1010px;
  }
`;

/* Text and clouds sit above the fixed Blob S canvas (z-index: 20) */
const Content = styled.div`
  position: relative;
  z-index: 30;
`;

const LabelWrap = styled.div``;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.darkGreen};
  margin-top: 100px;
  /*
   * The measure is capped as a PERCENTAGE as well as in pixels, so the headline
   * always wraps before it can reach the question-cloud stage (which starts at
   * 47 %). A flat 560 px measure fitted at 1440 but ran straight into the
   * clouds at 992–1200 px, where the display size is still large.
   */
  max-width: min(560px, 43%);

  ${media.mobile} {
    margin-top: 60px;
    max-width: 100%;
  }

  @media (min-width: 769px) and (max-width: 1100px) {
    margin-top: 80px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-size: clamp(96px, 9vw, 130px);
  line-height: 1.045;

  ${media.mobile} {
    font-size: clamp(44px, 13.8vw, 54px);
    line-height: 1.075;
  }

  @media (min-width: 769px) and (max-width: 1100px) {
    font-size: clamp(70px, 9vw, 110px);
    line-height: 1.05;
  }
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 22px;
  line-height: 34px;
  color: ${colors.darkGreen};
  margin-top: 68px;
  max-width: min(520px, 43%);

  ${media.mobile} {
    font-size: 18px;
    line-height: 28px;
    margin-top: 36px;
    max-width: 100%;
  }

  @media (min-width: 769px) and (max-width: 1100px) {
    font-size: 18px;
    line-height: 28px;
    margin-top: 60px;
  }
`;

/* ─── Blob S slot ───────────────────────────────────────────────────────────
 *
 * Moved out from under the question clouds. Sitting behind them made both
 * elements harder to read and buried the object in the busiest part of the
 * section. It now occupies the open lower-left quadrant — below the supporting
 * copy, left of the cloud stage — so the blob and the questions each own their
 * own half of the composition.
 */
/*
 * Overlay layers use the SiteContainer geometry so absolutely-positioned
 * artwork lines up with the text grid at every width, including screens wider
 * than the 1440 px content cap.
 *
 * Two separate overlays are needed because they belong on opposite sides of the
 * fixed Blob S canvas (z-index: 20): the blob layer paints below it, the cloud
 * layer paints above it.
 */
const OverlayContainer = styled(SiteContainer)`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const CloudOverlayContainer = styled(OverlayContainer)`
  z-index: 30;
`;

/* Normal-flow child of the container → correctly inset by its padding, and the
   positioning reference for everything placed inside it. */
const OverlayInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const BlobSlotWrap = styled.div`
  position: absolute;
  left: 0;
  bottom: 2%;
  width: 16%;
  max-width: 210px;
  aspect-ratio: 590 / 780;
  pointer-events: none;

  /*
   * On mobile the cloud stage spans the full column, so the blob takes the
   * bottom-right corner instead — below the questions, beside the tagline.
   * It bleeds sideways past the viewport edge but never below the section:
   * the fixed canvas ignores section overflow, so a negative bottom offset
   * would hang the blob over the next section rather than cropping it.
   */
  ${media.mobile} {
    left: auto;
    right: -22%;
    bottom: 0;
    width: 56%;
    max-width: 300px;
  }
`;

/* ─── Desktop question stage ──────────────────────────────────────────────── */
/*
 * A bounded stage occupying the right side of the content grid. Every cloud is
 * placed with a 0–1 fraction of the FREE space (stage size minus cloud size),
 * so a cloud can never leave the stage, never collide with the section below
 * and never overflow the right gutter — at any viewport width.
 */
const DesktopBlobsArea = styled.div`
  position: absolute;
  left: 47%;
  right: 0;
  top: 110px;
  bottom: 96px;
  /*
   * The clouds are placed as fractions of the stage's free space, so the stage
   * height IS the vertical spread. Capping it pulls the six clouds into a
   * tighter constellation instead of letting them stretch down the full section.
   */
  max-height: 620px;

  ${media.mobile} {
    display: none;
  }

  @media (min-width: 1400px) {
    left: 50%;
  }
`;

interface DesktopBlobWrapProps {
  $leftFrac: number;
  $topFrac: number;
}

const CLOUD_W = 'clamp(186px, 19.4vw, 280px)';
const CLOUD_H = 'clamp(74px, 7.76vw, 112px)';

const DesktopBlobWrap = styled.div<DesktopBlobWrapProps>`
  position: absolute;
  width: ${CLOUD_W};
  height: ${CLOUD_H};
  /* fraction of the free space → always inside the stage */
  left: calc(${({ $leftFrac }) => $leftFrac} * (100% - ${CLOUD_W}));
  top: calc(${({ $topFrac }) => $topFrac} * (100% - ${CLOUD_H}));
`;

/* ─── Mobile blob stage (hidden on desktop) ────────────────────────────────── */
/* Cloud placement inside this stage is proportional to a ~390 px design.
   Capping and centring the stage keeps that arrangement intact across the whole
   mobile range rather than smearing the clouds to the outer edges at 768 px. */
const MobileQuestionStage = styled.div`
  display: none;
  position: relative;
  width: 100%;
  max-width: 420px;
  margin-inline: auto;
  height: 390px;
  margin-top: 48px;
  pointer-events: none;

  ${media.mobile} {
    display: block;
  }
`;

interface MobileBlobItemProps {
  $left: string;
  $top: string;
}

const MobileBlobItem = styled.div<MobileBlobItemProps>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  /* Blob SVG intrinsic size: 137.2 × 54.88 */
  width: 137px;
  height: 55px;
`;

/* Tilt layer — carries the cloud's base rotation AND the gentle rotational
   drift. Both the blob artwork and its label are children, so they always
   tilt together and can never separate. GSAP owns this element's transform. */
const CloudTilt = styled.div`
  position: absolute;
  inset: 0;
`;

const BlobImgWrap = styled.div`
  position: absolute;
  inset: 0;
`;

interface QuestionLabelProps {
  $color?: string;
  $desktopFontSize?: string;
  $mobileFontSize?: string;
}

const QuestionLabel = styled.p<QuestionLabelProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: ${({ $desktopFontSize }) => $desktopFontSize ?? 'clamp(17px, 1.8vw, 26px)'};
  line-height: 1.2;
  text-align: center;
  color: ${({ $color }) => $color ?? colors.cream};
  pointer-events: none;
  /* Desktop: nowrap — the cloud always provides sufficient space */
  white-space: nowrap;

  ${media.mobile} {
    font-size: ${({ $mobileFontSize }) => $mobileFontSize ?? '18px'};
    /* Mobile: allow wrap with per-item font sizes to fit the 137px blob */
    white-space: normal;
    max-width: 108px;
    word-break: keep-all;
    overflow-wrap: normal;
  }
`;

const MobileTagline = styled.p`
  display: none;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: ${colors.darkGreen};
  margin-top: 36px;

  ${media.mobile} {
    display: block;
  }
`;

/* ─── Config ────────────────────────────────────────────────────────────────── */
/*
 * desktopLeftFrac / desktopTopFrac are 0–1 fractions of the stage's free space.
 * They preserve the approved Figma arrangement (relative spread and rhythm)
 * while making it fully resolution-independent.
 */
const questions = [
  {
    src: '/assets/question-0.svg',
    srcMobile: '/assets/question-0-mobile.svg',
    label: 'WHO?',
    labelColor: colors.cream,
    rotation: -9,
    desktopLeftFrac: 0.14,
    desktopTopFrac: 0,
    mobileLeft: '6.2%',
    mobileTop: '59px',
    mobileFontSize: '20px',
  },
  {
    src: '/assets/question-1.svg',
    srcMobile: '/assets/question-1-mobile.svg',
    label: 'WHY?',
    labelColor: colors.darkGreen,
    rotation: 6,
    desktopLeftFrac: 0.89,
    desktopTopFrac: 0.1125,
    mobileLeft: '55.2%',
    mobileTop: '75px',
    mobileFontSize: '20px',
  },
  {
    src: '/assets/question-2.svg',
    srcMobile: '/assets/question-2-mobile.svg',
    label: 'WHAT?',
    labelColor: colors.cream,
    rotation: 12,
    desktopLeftFrac: 0,
    desktopTopFrac: 0.38,
    mobileLeft: '3.6%',
    mobileTop: '205px',
    mobileFontSize: '20px',
  },
  {
    src: '/assets/question-3.svg',
    srcMobile: '/assets/question-3-mobile.svg',
    label: 'FOR WHOM?',
    labelColor: colors.cream,
    rotation: -17,
    desktopLeftFrac: 0.72,
    desktopTopFrac: 0.536,
    mobileLeft: '56.7%',
    mobileTop: '163px',
    mobileFontSize: '16px',
  },
  {
    src: '/assets/question-4.svg',
    srcMobile: '/assets/question-4-mobile.svg',
    label: 'WHY NOW?',
    labelColor: colors.darkGreen,
    rotation: -5,
    desktopLeftFrac: 0.04,
    desktopTopFrac: 0.831,
    mobileLeft: '6.2%',
    mobileTop: '314px',
    mobileFontSize: '17px',
  },
  {
    src: '/assets/question-5.svg',
    srcMobile: '/assets/question-5-mobile.svg',
    label: 'WHAT MATTERS?',
    labelColor: colors.cream,
    rotation: 9,
    desktopLeftFrac: 0.75,
    desktopTopFrac: 1,
    mobileLeft: '54.5%',
    mobileTop: '326px',
    mobileFontSize: '14px',
  },
];

/* deterministic per-blob animation values */
const blobEntranceY  = [22, -18, 20, -16, 18, -20] as const;
const blobScatterX   = [-38,  48, -44,  52, -36,  44] as const;
const blobScatterY   = [-52,  42, -42,  54, -58,  50] as const;
/*
 * Drift.
 *
 * Each cloud now wanders on BOTH axes, and its horizontal and vertical periods
 * are deliberately incommensurate (≈2.6–3.6 s against ≈3.5–4.8 s). Because the
 * two oscillations never re-sync, the resulting path is an open Lissajous curve
 * rather than a repeating bob — which is what makes the clouds read as drifting
 * fish instead of ticking metronomes. Amplitudes are up roughly 2×, and the
 * slow rotational sway stays under 3 degrees so it never tips into chaos.
 */
const blobDriftAmp   = [ 11,  -9,  12, -10,   9, -12] as const;
const blobDriftDur   = [2.9, 3.4, 2.6, 3.1, 3.6, 2.8] as const;
const blobDriftX     = [ -7,   8,  -6,   9,  -8,   7] as const;
const blobDriftXDur  = [4.3, 3.8, 4.6, 4.1, 3.5, 4.8] as const;
const blobDriftDelay = [0,   0.3, 0.6, 0.9, 0.45, 0.15] as const;
const blobTiltAmp    = [2.6, -2.2, 1.9, -2.8, 2.3, -2.0] as const;
const blobTiltDur    = [4.4, 5.1, 4.7, 5.4, 4.1, 4.9] as const;

export function UncertaintySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const label    = section.querySelector('[data-u-label]');
    const headline = section.querySelector('[data-u-headline]');
    const lines    = headline ? headline.querySelectorAll('span') : [];
    const body     = section.querySelector('[data-u-body]');

    /* select only the currently-visible blob set */
    const blobs = Array.from(
      section.querySelectorAll(isMobile ? '[data-u-blob-mobile]' : '[data-u-blob-desktop]')
    ) as HTMLElement[];

    /* the tilt layer inside each visible cloud */
    const tilts = blobs
      .map(el => el.querySelector<HTMLElement>('[data-u-tilt]'))
      .filter((el): el is HTMLElement => el !== null);

    /* Mobile keeps the same character at roughly half the travel — the clouds
       sit much closer together there, so full amplitude would read as collision. */
    const driftMul   = isMobile ? 0.5 : 1;
    const tiltMul    = isMobile ? 0.55 : 1;
    const scatterMul = isMobile ? 0.45 : 1;

    let driftTweens: gsap.core.Tween[] = [];
    let tiltTweens: gsap.core.Tween[] = [];

    const startIdle = () => {
      driftTweens = blobs.flatMap((el, i) => [
        gsap.to(el, {
          y: (blobDriftAmp[i] ?? 10) * driftMul,
          duration: blobDriftDur[i] ?? 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: blobDriftDelay[i] ?? 0,
        }),
        gsap.to(el, {
          x: (blobDriftX[i] ?? 7) * driftMul,
          duration: blobDriftXDur[i] ?? 4.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: (blobDriftDelay[i] ?? 0) * 0.6,
        }),
      ]);
      tiltTweens = tilts.map((el, i) => {
        const base = questions[i]?.rotation ?? 0;
        return gsap.to(el, {
          rotation: base + (blobTiltAmp[i] ?? 1.5) * tiltMul,
          duration: blobTiltDur[i] ?? 3.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: (blobDriftDelay[i] ?? 0) * 1.6,
          overwrite: 'auto',
        });
      });
    };

    const stopIdle = () => {
      driftTweens.forEach(t => t.kill());
      tiltTweens.forEach(t => t.kill());
      driftTweens = [];
      tiltTweens = [];
    };

    /* label + headline + body entrance */
    gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%' },
      defaults: { ease: 'power2.out' },
    })
      .from(label, { opacity: 0, y: -10, duration: 0.5 })
      .from(lines, {
        opacity: 0,
        y: isMobile ? 20 : 36,
        duration: isMobile ? 0.5 : 0.65,
        stagger: 0.12,
      }, '-=0.3')
      .from(body, { opacity: 0, y: isMobile ? 14 : 22, duration: 0.55 }, '-=0.25');

    /* blob stagger entrance */
    ScrollTrigger.create({
      trigger: section,
      start: 'top 72%',
      once: true,
      onEnter: () => {
        gsap.timeline({ onComplete: startIdle }).from(blobs, {
          opacity: 0,
          y: (i: number) => blobEntranceY[i] ?? 20,
          /* calmer on mobile: smaller scale change */
          scale: isMobile ? 0.93 : 0.88,
          duration: isMobile ? 0.4 : 0.55,
          stagger: 0.09,
          ease: 'back.out(1.1)',
        });
      },
    });

    /* scatter on section exit */
    ScrollTrigger.create({
      trigger: section,
      start: 'bottom 68%',
      onLeave: () => {
        stopIdle();
        gsap.to(blobs, {
          opacity: 0,
          x: (i: number) => (blobScatterX[i] ?? -40) * scatterMul,
          y: (i: number) => (blobScatterY[i] ?? -50) * scatterMul,
          scale: 0.88,
          stagger: 0.045,
          duration: 0.45,
          ease: 'power2.in',
          overwrite: 'auto',
        });
      },
      onEnterBack: () => {
        gsap.to(blobs, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          stagger: 0.04,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
          onComplete: startIdle,
        });
      },
    });

    return stopIdle;
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    /* data-scene-section is read by BlobJourneyController to resolve the scene */
    <Section ref={sectionRef} data-scene-section="uncertainty">
      {/* Blob S — behind the clouds, low presence (below the canvas layer) */}
      <OverlayContainer aria-hidden="true">
        <OverlayInner>
          <BlobSlotWrap>
            <BlobSceneSlot slotKey="uncertainty" hideFallbackOnMobile />
          </BlobSlotWrap>
        </OverlayInner>
      </OverlayContainer>

      {/* Desktop clouds — bounded stage, fractional placement (above the canvas) */}
      <CloudOverlayContainer aria-hidden="true">
        <OverlayInner>
          <DesktopBlobsArea>
            {questions.map((q, i) => (
              <DesktopBlobWrap
                key={i}
                data-u-blob-desktop=""
                $leftFrac={q.desktopLeftFrac}
                $topFrac={q.desktopTopFrac}
              >
                <CloudTilt data-u-tilt="" style={{ transform: `rotate(${q.rotation}deg)` }}>
                  <BlobImgWrap>
                    <Image
                      src={q.src}
                      alt=""
                      fill
                      unoptimized
                      style={{ objectFit: 'contain' }}
                    />
                  </BlobImgWrap>
                  <QuestionLabel $color={q.labelColor} $mobileFontSize={q.mobileFontSize}>
                    {q.label}
                  </QuestionLabel>
                </CloudTilt>
              </DesktopBlobWrap>
            ))}
          </DesktopBlobsArea>
        </OverlayInner>
      </CloudOverlayContainer>

      <Content>
        <SiteContainer>
          <LabelWrap data-u-label="">
            <SectionLabel color={colors.darkGreen}>{`02  /  UNCERTAINTY`}</SectionLabel>
          </LabelWrap>

          <Headline data-u-headline="">
            <HeadlineLine>AN IDEA IS ONLY</HeadlineLine>
            <HeadlineLine>THE START.</HeadlineLine>
          </Headline>

          <BodyText data-u-body="">
            The first job is not to build. It is to understand
            {' '}what should be built.
          </BodyText>

          {/* Mobile clouds — bounded stage below body text, hidden on desktop */}
          <MobileQuestionStage aria-hidden="true">
            {questions.map((q, i) => (
              <MobileBlobItem
                key={i}
                data-u-blob-mobile=""
                $left={q.mobileLeft}
                $top={q.mobileTop}
              >
                <CloudTilt data-u-tilt="" style={{ transform: `rotate(${q.rotation}deg)` }}>
                  <BlobImgWrap>
                    <Image
                      src={q.srcMobile}
                      alt=""
                      fill
                      unoptimized
                      style={{ objectFit: 'contain' }}
                    />
                  </BlobImgWrap>
                  <QuestionLabel $color={q.labelColor} $mobileFontSize={q.mobileFontSize}>
                    {q.label}
                  </QuestionLabel>
                </CloudTilt>
              </MobileBlobItem>
            ))}
          </MobileQuestionStage>

          <MobileTagline>QUESTIONS BEFORE CODE.</MobileTagline>
        </SiteContainer>
      </Content>
    </Section>
  );
}
