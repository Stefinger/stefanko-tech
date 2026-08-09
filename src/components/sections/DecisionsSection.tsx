'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobSceneSlot } from '@/components/blob/BlobSceneSlot';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* ─── Section shell ────────────────────────────────────────────────────────── */
const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  overflow: hidden;
  padding-top: 70px;
  padding-bottom: 88px;

  @media (max-width: 767px) {
    padding-top: 48px;
    padding-bottom: 72px;
  }
`;

/* Everything readable sits above the fixed Blob S canvas (z-index: 20) */
const Content = styled.div`
  position: relative;
  z-index: 30;
`;

/* ─── Blob S ────────────────────────────────────────────────────────────────
 *
 * Desktop: the upper-right corner, in the open space beside the headline and
 * well above the timeline. Sitting near the roadmap competed with the path and
 * its markers for attention; up here it supports the section without touching
 * the point system at all.
 */
const BlobOverlay = styled(SiteContainer)`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const BlobOverlayInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const BlobSlotWrap = styled.div`
  position: absolute;
  right: 0;
  top: 6%;
  width: 17%;
  max-width: 230px;
  aspect-ratio: 590 / 780;

  @media (max-width: 991px) {
    left: -8%;
    right: auto;
    bottom: 4%;
    width: 46%;
    max-width: none;
  }
`;

/* ─── Headline ─────────────────────────────────────────────────────────────── */
const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.darkGreen};
  margin-top: 87px;

  @media (max-width: 767px) {
    margin-top: 44px;
  }

  @media (min-width: 768px) and (max-width: 1100px) {
    margin-top: 60px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-size: clamp(60px, 8vw, 116px);
  line-height: 1.04;

  @media (max-width: 767px) {
    font-size: clamp(46px, 14.6vw, 57px);
    line-height: 1.07;
  }
`;

const HeadlineLinePink = styled(HeadlineLine)`
  color: ${colors.pink};
`;

/*
 * Supporting copy sat flush against the headline (margin-top: 0) with no
 * measure limit tuned for the display size above it. It now gets its own
 * breathing room and a measure that keeps it to a single comfortable line on
 * desktop, tracking the headline's left edge.
 */
const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: clamp(18px, 1.6vw, 22px);
  line-height: 1.55;
  color: ${colors.darkGreen};
  margin-top: clamp(20px, 2.4vw, 34px);
  max-width: 680px;

  @media (max-width: 767px) {
    font-size: 18px;
    line-height: 28px;
    margin-top: 22px;
    max-width: 100%;
  }
`;

/* ─── Desktop journey stage ────────────────────────────────────────────────── */
/*
 * ONE coordinate system for the whole stage.
 *
 * Previously the wave lived in a 620 px-tall box that overhung a 513 px journey
 * container, and the cloud cards were positioned against the shorter box with
 * negative percentages. Wave, markers and cards are now all placed against the
 * SAME box, whose aspect ratio tracks the SVG viewBox (1312 × 800 ≈ 1.64) at
 * every width — so `preserveAspectRatio="none"` never visibly shears the curve
 * and nothing drifts apart between breakpoints.
 *
 * The path itself was reshaped for the layout rather than the other way round:
 * it now runs through four explicit nodes, alternating high and low, and each
 * cloud card is centred on its own node with a fixed clearance band.
 */
const DesktopJourney = styled.div`
  position: relative;
  margin-top: clamp(56px, 6vw, 100px);
  width: 100%;
  /* keeps container aspect ≈ 2.12, matching the viewBox */
  height: clamp(400px, 43vw, 620px);

  /* Below 992 px the stage is too narrow for the horizontal wave;
     the vertical mobile journey takes over at the same breakpoint. */
  @media (max-width: 991px) {
    display: none;
  }
`;

const WaveTimelineWrap = styled.div`
  position: absolute;
  inset: 0;
`;

/*
 * S-point markers sit exactly on the path by construction: each node is the
 * shared endpoint of two cubic segments, so its viewBox coordinate is exact and
 * a plain percentage places it with zero error at every width. No runtime
 * getPointAtLength() measurement or ResizeObserver is needed any more.
 */
interface MarkerWrapProps {
  $leftPct: string;
  $topPct: string;
}

const MarkerWrap = styled.div<MarkerWrapProps>`
  position: absolute;
  left: ${({ $leftPct }) => $leftPct};
  top: ${({ $topPct }) => $topPct};
  width: clamp(26px, 2.8vw, 38px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
`;

/* ─── Cloud cards (desktop) — percentage-positioned on the same stage ──────── */
interface CloudStepProps {
  $leftPct: string;
  $topPct: string;
}

const CloudStep = styled.div<CloudStepProps>`
  position: absolute;
  left: ${({ $leftPct }) => $leftPct};
  top: ${({ $topPct }) => $topPct};
  /* percentage width keeps every card centred on its node at all widths */
  width: 22%;
`;

const StepNumber = styled.p<{ $color?: string }>`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: clamp(34px, 3.4vw, 50px);
  line-height: 1.14;
  text-align: center;
  color: ${({ $color }) => $color ?? colors.darkGreen};
  margin: 0 auto 2px;
`;

const CloudBgWrap = styled.div`
  position: relative;
  width: 100%;
  /* intrinsic cloud aspect: 340:174 */
  aspect-ratio: 340 / 174;
`;

/*
 * Content block inside every desktop cloud.
 *
 * Two corrections stack here.
 *
 * The padding split handles the shape: the scalloped upper edge makes a
 * mathematically centred block read as sitting high.
 *
 * `$shiftX` / `$shiftY` handle the CONTENT: a cloud whose supporting line wraps
 * to two lines balances differently from one that fits on a single line, so the
 * one-line clouds (01, 03, 04) need their block lifted to put the bold label
 * back on the optical centre. 02 already reads correctly and is left at zero.
 */
const CloudContent = styled.div<{ $shiftX: string; $shiftY: string }>`
  position: absolute;
  inset: 0;
  transform: translate(${({ $shiftX }) => $shiftX}, ${({ $shiftY }) => $shiftY});
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5% 13% 3%;
  gap: 4px;
  pointer-events: none;
`;

const CloudLabel = styled.p`
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: clamp(14px, 1.5vw, 21px);
  line-height: 1.15;
  text-align: center;
  margin: 0;
`;

const CloudSubtext = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: clamp(10px, 0.9vw, 13px);
  line-height: 1.38;
  text-align: center;
  margin: 0;
`;

/* ─── Mobile vertical journey ──────────────────────────────────────────────── */
/* Capped and centred for the same reason as the Uncertainty stage: the
   alternating card rhythm is designed against a ~390 px column. */
const MobileJourney = styled.div`
  display: none;
  position: relative;
  margin-top: 44px;
  width: 100%;
  max-width: 460px;
  margin-inline: auto;
  height: 1000px;

  /* Show the vertical mobile journey at ≤991 px (matches DesktopJourney hide) */
  @media (max-width: 991px) {
    display: block;
  }
`;

const MobilePathWrap = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

interface MobileCloudStepProps {
  $align: 'left' | 'right';
  $top: string;
}

const MobileCloudStep = styled.div<MobileCloudStepProps>`
  position: absolute;
  top: ${({ $top }) => $top};
  /* right-aligned cards anchor to right edge, left-aligned to left edge */
  ${({ $align }) =>
    $align === 'right'
      ? 'right: 0; left: auto;'
      : 'left: 0; right: auto;'}
  width: min(279px, 82%);
`;

const MobileStepNumber = styled.p<{ $color?: string }>`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: 46px;
  line-height: 1.14;
  text-align: center;
  color: ${({ $color }) => $color ?? colors.darkGreen};
  margin: 0 auto 2px;
`;

const MobileCloudBgWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 279 / 143;
`;

/* Same optical-centre logic as the desktop cloud, scaled for the smaller shape. */
const MobileCloudContent = styled.div<{ $shiftX: string; $shiftY: string }>`
  position: absolute;
  inset: 0;
  transform: translate(${({ $shiftX }) => $shiftX}, ${({ $shiftY }) => $shiftY});
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 7% 11% 4%;
  gap: 3px;
  pointer-events: none;
`;

const MobileCloudLabel = styled.p`
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 15px;
  line-height: 1.15;
  text-align: center;
  margin: 0;
`;

const MobileCloudSubtext = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 11px;
  line-height: 1.38;
  text-align: center;
  margin: 0;
`;

/* ─── Geometry ─────────────────────────────────────────────────────────────── */
/*
 * Timeline nodes in viewBox space (1312 × 800). The path is built so that each
 * of these points is a segment endpoint — i.e. it lies exactly on the curve.
 */
/*
 * The curve was too tall: at 800 units of viewBox height the stage occupied
 * most of a laptop viewport, so the scrubbed draw could not finish before the
 * next step scrolled in. Viewbox height is down to 620 and the peak-to-trough
 * amplitude from 180 to 130, which keeps the whole four-step sequence inside
 * one screen on desktop while preserving the shape of the wave.
 */
const NODES = [
  { x: 170,  y: 245 },
  { x: 500,  y: 375 },
  { x: 830,  y: 245 },
  { x: 1150, y: 375 },
] as const;

const VB_W = 1312;
const VB_H = 620;

const WAVE_D =
  'M20 320 C90 245 130 245 170 245 ' +
  'C300 245 340 375 500 375 ' +
  'C660 375 700 245 830 245 ' +
  'C960 245 1000 375 1150 375 ' +
  'C1230 375 1260 358 1285 332';

/* Chevron aligned to the path's tangent at its end point (1285, 332) */
const ARROW_D = 'M1260 339.2 L1285 332 L1278.8 357.2';

const MOBILE_PATH_D =
  'M195 24 C120 146 275 204 195 320 C110 437 280 515 195 631 C110 753 270 825 195 976';

/* ─── Data ─────────────────────────────────────────────────────────────────── */
/*
 * Desktop placement is derived from the nodes above:
 *   leftPct = nodeX / VB_W − cardWidth/2  (cardWidth = 26 %)
 *   topPct  = 1.875 % for cards above the curve, 65.6 % for cards below it
 * which leaves ≥ 30 px of clearance between every card and the curve at every
 * supported width.
 */
const cloudSteps = [
  {
    number: '01',
    numberColor: colors.darkGreen,
    bgSrc: '/assets/cloud-bg-01.svg',
    bgSrcMobile: '/assets/cloud-bg-01-mobile.svg',
    label: 'REMOVE FRICTION',
    labelColor: colors.cream,
    subtext: 'Make the useful path easier.',
    subtextColor: colors.cream,
    shiftX: '0%',
    shiftY: '-4.5%',
    leftPct: '1.96%',
    topPct: '0.32%',
    mobileAlign: 'left' as const,
    mobileTop: '8px',
  },
  {
    number: '02',
    numberColor: colors.pink,
    bgSrc: '/assets/cloud-bg-02.svg',
    bgSrcMobile: '/assets/cloud-bg-02-mobile.svg',
    label: 'FOCUS ON VALUE',
    labelColor: colors.darkGreen,
    subtext: 'Protect the reason the product should exist.',
    subtextColor: colors.darkGreen,
    shiftX: '0%',
    shiftY: '0%',
    leftPct: '27.11%',
    topPct: '66.6%',
    mobileAlign: 'right' as const,
    mobileTop: '258px',
  },
  {
    number: '03',
    numberColor: colors.darkGreen,
    bgSrc: '/assets/cloud-bg-03.svg',
    bgSrcMobile: '/assets/cloud-bg-03-mobile.svg',
    label: 'BUILD LESS',
    labelColor: colors.cream,
    subtext: 'Ship the smallest useful version.',
    subtextColor: colors.cream,
    shiftX: '0%',
    shiftY: '-4.5%',
    leftPct: '52.26%',
    topPct: '0.32%',
    mobileAlign: 'left' as const,
    mobileTop: '508px',
  },
  {
    number: '04',
    numberColor: colors.lime,
    bgSrc: '/assets/cloud-bg-04.svg',
    bgSrcMobile: '/assets/cloud-bg-04-mobile.svg',
    label: 'LEARN FAST',
    labelColor: colors.darkGreen,
    subtext: 'Use reality to shape the next decision.',
    subtextColor: colors.darkGreen,
    shiftX: '-2.5%',
    shiftY: '-2%',
    leftPct: '76.65%',
    topPct: '66.6%',
    mobileAlign: 'right' as const,
    mobileTop: '758px',
  },
];

/* Scrub progress for the wave-draw timeline. Approximate arc-length fractions
   of the four nodes — used only for animation timing, not for placement. */
const markerProgressDesktop = [0.13, 0.38, 0.63, 0.88] as const;
const cardProgressDesktop   = [0.03, 0.28, 0.53, 0.78] as const;

export function DecisionsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    /* matches DesktopJourney / MobileJourney visibility breakpoint */
    const isMobile = window.matchMedia('(max-width: 991px)').matches;

    const label    = section.querySelector('[data-d-label]');
    const headline = section.querySelector('[data-d-headline]');
    const lines    = headline ? headline.querySelectorAll('span') : [];
    const body     = section.querySelector('[data-d-body]');

    /* headline entrance */
    gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%' },
      defaults: { ease: 'power2.out' },
    })
      .from(label, { opacity: 0, y: -10, duration: 0.45 })
      .from(lines, {
        opacity: 0,
        y: isMobile ? 22 : 36,
        duration: isMobile ? 0.5 : 0.65,
        stagger: 0.1,
      }, '-=0.25')
      .from(body, { opacity: 0, y: isMobile ? 14 : 20, duration: 0.5 }, '-=0.2');

    if (!isMobile) {
      /* ── Desktop: wave draw + markers + cards ─────────────────────────── */
      const mainPath   = section.querySelector<SVGPathElement>('[data-d-wave-main]');
      const arrowPath  = section.querySelector<SVGPathElement>('[data-d-wave-arrow]');
      const journey    = section.querySelector('[data-d-journey-desktop]');
      const cloudEls   = Array.from(section.querySelectorAll('[data-d-cloud]')) as HTMLElement[];
      const markerEls  = Array.from(section.querySelectorAll('[data-d-marker]')) as HTMLElement[];

      if (mainPath && arrowPath && journey) {
        const mainLen  = mainPath.getTotalLength();
        const arrowLen = arrowPath.getTotalLength();

        /*
         * Draw-on setup — the dash GAP has to be longer than the path.
         *
         * A single-value dasharray of `len` means [dash len, gap len], a pattern
         * that repeats every 2·len. Offsetting by len+10 to hide the round
         * linecap therefore pulled the NEXT dash in the repeat back onto the
         * path: the final 10 units of the wave and of the arrow were painted
         * from the very start. That was the stray fragment on screen — not the
         * cap, the repeat.
         *
         * Declaring an explicit dash of `len` followed by a gap of `len + 40`
         * makes the pattern longer than the path, so no repeat can ever reach
         * it. The offset of `len + 20` then parks the single dash entirely off
         * the start, clear of its own round cap.
         */
        const dashSpec = (len: number) => ({
          strokeDasharray: `${len} ${len + 40}`,
          strokeDashoffset: len + 20,
        });
        gsap.set(mainPath,  dashSpec(mainLen));
        gsap.set(arrowPath, dashSpec(arrowLen));

        const waveTl = gsap.timeline({
          scrollTrigger: {
            trigger: journey,
            start: 'top 80%',
            end: 'bottom 78%',
            scrub: 0.8,
          },
        });

        waveTl.to(mainPath,  { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
        waveTl.to(arrowPath, { strokeDashoffset: 0, ease: 'none', duration: 0.08 }, 0.92);

        cloudEls.forEach((el, i) => {
          const pos = cardProgressDesktop[i] ?? 0;
          waveTl.from(el, {
            opacity: 0,
            scale: 0.88,
            y: 18,
            ease: 'back.out(1.4)',
            duration: 0.1,
          }, pos);
        });

        markerEls.forEach((el, i) => {
          const pos = markerProgressDesktop[i] ?? 0;
          waveTl.from(el, {
            scale: 0,
            opacity: 0,
            transformOrigin: 'center center',
            ease: 'back.out(2)',
            duration: 0.05,
          }, pos);
        });
      }
    } else {
      /* ── Mobile: clip-path reveal + cascading cards ───────────────────── */
      const mobileJourney  = section.querySelector('[data-d-journey-mobile]');
      const mobilePathWrap = section.querySelector('[data-d-mobile-path-wrap]');
      const mobileCards    = Array.from(
        section.querySelectorAll('[data-d-mobile-cloud]')
      ) as HTMLElement[];

      if (mobileJourney && mobilePathWrap) {
        gsap.from(mobilePathWrap, {
          clipPath: 'inset(0 0 100% 0)',
          ease: 'none',
          scrollTrigger: {
            trigger: mobileJourney,
            start: 'top 80%',
            end: 'bottom 65%',
            scrub: 0.6,
          },
        });
      }

      if (mobileCards.length > 0 && mobileJourney) {
        gsap.from(mobileCards, {
          opacity: 0,
          y: 20,
          scale: 0.9,
          stagger: 0.15,
          duration: 0.45,
          ease: 'back.out(1.3)',
          scrollTrigger: {
            trigger: mobileJourney,
            start: 'top 75%',
          },
        });
      }
    }
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    /* data-scene-section is read by BlobJourneyController to resolve the scene */
    <Section ref={sectionRef} data-scene-section="decisions">
      {/* Blob S — quiet, below the canvas layer so the timeline stays dominant */}
      <BlobOverlay aria-hidden="true">
        <BlobOverlayInner>
          <BlobSlotWrap>
            <BlobSceneSlot slotKey="decisions" hideFallbackOnMobile />
          </BlobSlotWrap>
        </BlobOverlayInner>
      </BlobOverlay>

      <Content>
        <SiteContainer>
          <div data-d-label="">
            <SectionLabel color={colors.darkGreen}>{`04  /  DECISIONS`}</SectionLabel>
          </div>

          <Headline data-d-headline="">
            <HeadlineLine>PRODUCTS ARE</HeadlineLine>
            <HeadlineLine>BUILT THROUGH</HeadlineLine>
            <HeadlineLinePink>DECISIONS.</HeadlineLinePink>
          </Headline>

          <BodyText data-d-body="">
            What to build matters. What not to build matters just as much.
          </BodyText>

          {/* ── Desktop journey ── */}
          <DesktopJourney aria-hidden="true" data-d-journey-desktop="">
            <WaveTimelineWrap>
              <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                width="100%"
                height="100%"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                overflow="visible"
                style={{ display: 'block' }}
              >
                <path
                  data-d-wave-main=""
                  d={WAVE_D}
                  stroke="#082E26"
                  strokeOpacity="0.6"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  data-d-wave-arrow=""
                  d={ARROW_D}
                  stroke="#082E26"
                  strokeOpacity="0.6"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Markers sit on exact node coordinates — no runtime measurement */}
              {NODES.map((node, i) => (
                <MarkerWrap
                  key={i}
                  data-d-marker=""
                  $leftPct={`${(node.x / VB_W) * 100}%`}
                  $topPct={`${(node.y / VB_H) * 100}%`}
                >
                  <Image
                    src="/assets/timeline-s-point.svg"
                    alt=""
                    fill
                    unoptimized
                    style={{ display: 'block' }}
                  />
                </MarkerWrap>
              ))}
            </WaveTimelineWrap>

            {/* Cloud cards — same coordinate system as the wave and markers */}
            {cloudSteps.map((step, i) => (
              <CloudStep
                key={i}
                data-d-cloud=""
                $leftPct={step.leftPct}
                $topPct={step.topPct}
              >
                <StepNumber $color={step.numberColor}>{step.number}</StepNumber>
                <CloudBgWrap>
                  <Image
                    src={step.bgSrc}
                    alt=""
                    fill
                    unoptimized
                    style={{ objectFit: 'fill' }}
                  />
                  <CloudContent $shiftX={step.shiftX} $shiftY={step.shiftY}>
                    <CloudLabel style={{ color: step.labelColor }}>
                      {step.label}
                    </CloudLabel>
                    <CloudSubtext style={{ color: step.subtextColor }}>
                      {step.subtext}
                    </CloudSubtext>
                  </CloudContent>
                </CloudBgWrap>
              </CloudStep>
            ))}
          </DesktopJourney>

          {/* ── Mobile vertical journey ── */}
          <MobileJourney data-d-journey-mobile="">
            <MobilePathWrap data-d-mobile-path-wrap="">
              <svg
                viewBox="0 0 390 1000"
                width="100%"
                height="100%"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                overflow="visible"
                style={{ display: 'block' }}
              >
                <path
                  d={MOBILE_PATH_D}
                  stroke="#31534B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="5 9"
                />
              </svg>
            </MobilePathWrap>

            {cloudSteps.map((step, i) => (
              <MobileCloudStep
                key={i}
                data-d-mobile-cloud=""
                $align={step.mobileAlign}
                $top={step.mobileTop}
              >
                <MobileStepNumber $color={step.numberColor}>{step.number}</MobileStepNumber>
                <MobileCloudBgWrap>
                  <Image
                    src={step.bgSrcMobile}
                    alt=""
                    fill
                    unoptimized
                    style={{ objectFit: 'fill' }}
                  />
                  <MobileCloudContent $shiftX={step.shiftX} $shiftY={step.shiftY}>
                    <MobileCloudLabel style={{ color: step.labelColor }}>
                      {step.label}
                    </MobileCloudLabel>
                    <MobileCloudSubtext style={{ color: step.subtextColor }}>
                      {step.subtext}
                    </MobileCloudSubtext>
                  </MobileCloudContent>
                </MobileCloudBgWrap>
              </MobileCloudStep>
            ))}
          </MobileJourney>
        </SiteContainer>
      </Content>
    </Section>
  );
}
