'use client';
import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* ─── Section shell ────────────────────────────────────────────────────────── */
const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  overflow: hidden;
  padding-top: 70px;
  padding-bottom: 70px;

  @media (max-width: 767px) {
    padding-top: 48px;
    padding-bottom: 80px;
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
    font-size: 57px;
    line-height: 61px;
  }
`;

const HeadlineLinePink = styled(HeadlineLine)`
  color: ${colors.pink};
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 22px;
  line-height: 34px;
  color: ${colors.darkGreen};
  margin-top: 0;
  max-width: 660px;

  @media (max-width: 767px) {
    font-size: 18px;
    line-height: 28px;
    margin-top: 24px;
    max-width: 100%;
  }
`;

/* ─── Desktop journey stage ────────────────────────────────────────────────── */
/*
 * All elements inside share a common percentage coordinate system.
 * Cloud cards use left% / top% relative to this container.
 * SVG path, arrow, and S-point markers are in one unified SVG.
 * SVG viewBox: 0 0 1312 620, same content-width reference as Figma.
 */
const DesktopJourney = styled.div`
  position: relative;
  margin-top: 100px;
  width: 100%;
  height: 513px;

  /* Below 992 px the journey container is too narrow for the horizontal wave;
     switch to the mobile vertical layout at the same breakpoint as the grid. */
  @media (max-width: 991px) {
    display: none;
  }

  @media (min-width: 992px) and (max-width: 1100px) {
    height: 460px;
    margin-top: 70px;
    overflow: visible;
  }
`;

/* SVG wrapper — drawn wave fills the journey */
const WaveTimelineWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 620px;

  /* Compress wave height at intermediate desktop widths */
  @media (min-width: 992px) and (max-width: 1100px) {
    height: 500px;
  }
`;

/*
 * S-point marker — HTML element, percentage-positioned inside WaveTimelineWrap
 * so it scales proportionally with the SVG at all widths.
 * left% = markerX / 1312, top% = markerY / 620
 */
interface MarkerWrapProps {
  $leftPct: string;
  $topPct: string;
}

const MarkerWrap = styled.div<MarkerWrapProps>`
  position: absolute;
  left: ${({ $leftPct }) => $leftPct};
  top: ${({ $topPct }) => $topPct};
  width: 42px;
  height: 42px;
  transform: translate(-50%, -50%);
`;

/* ─── Cloud cards (desktop) — percentage-positioned ───────────────────────── */
interface CloudStepProps {
  $leftPct: string;
  $topPct: string;
}

const CloudStep = styled.div<CloudStepProps>`
  position: absolute;
  left: ${({ $leftPct }) => $leftPct};
  top: ${({ $topPct }) => $topPct};
  width: clamp(220px, 25vw, 340px);
  height: auto;
`;

const StepNumber = styled.p<{ $color?: string }>`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: clamp(38px, 4vw, 58px);
  line-height: 1.14;
  text-align: center;
  color: ${({ $color }) => $color ?? colors.darkGreen};
  width: 116px;
  margin: 0 auto;
`;

const CloudBgWrap = styled.div`
  position: relative;
  width: 100%;
  /* intrinsic cloud aspect: 340:174 */
  aspect-ratio: 340 / 174;
`;

/*
 * Unified content block inside every desktop cloud shape.
 *
 * padding: 8% top / 14% sides / 2% bottom
 *   — the 8% top bias shifts the flex centre from 50% to ~53% of the cloud
 *     height, matching the optical centre of the organic cloud (the bumpy top
 *     shifts the visual mass downward).
 *   — 14% horizontal keeps both lines well clear of the organic side edges.
 */
const CloudContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8% 14% 2% 14%;
  gap: 5px;
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
const MobileJourney = styled.div`
  display: none;
  position: relative;
  margin-top: 44px;
  width: 100%;
  min-height: 1100px;

  /* Show the vertical mobile journey at ≤991 px (matches DesktopJourney hide) */
  @media (max-width: 991px) {
    display: block;
  }
`;

const MobilePathWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  width: min(279px, 88%);
`;

const MobileStepNumber = styled.p<{ $color?: string }>`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: 48px;
  line-height: 54px;
  text-align: center;
  color: ${({ $color }) => $color ?? colors.darkGreen};
  width: 95px;
  margin: 0 auto;
`;

const MobileCloudBgWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 279 / 143;
`;

/*
 * Unified content block for mobile cloud shapes.
 *
 * Replaces the old pair of individually-positioned elements (title at top:34%,
 * copy at top:69%) which created a ~38px gap on a 143px-tall cloud — title
 * trapped near the upper bumps, copy stranded at the bottom.
 *
 * Now a single flex column centred inside the cloud, with 12% top padding to
 * push the block into the smoother lower body of the organic shape.
 */
const MobileCloudContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12% 12% 4% 12%;
  gap: 4px;
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

/* ─── Data ─────────────────────────────────────────────────────────────────── */
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
    /*
     * desktop: % of journey container (ref: 1312 × 513).
     * Was –10 %; raised to –14 % so the cream-coloured CloudSubtext
     * (bottom ≈ y 176 px) stays above the wave path (y ≈ 190 px at the
     * card's right edge, viewBox x ≈ 274) and produces no visible fragment.
     */
    leftPct: '1%',
    topPct: '-14%',
    /* mobile: align + top */
    mobileAlign: 'left' as const,
    mobileTop: '15px',
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
    leftPct: '19.3%',
    topPct: '47.4%',
    mobileAlign: 'right' as const,
    mobileTop: '272px',
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
    /*
     * Was 20.3 %; raised to 29 % so the cream CloudSubtext
     * (bottom ≈ y 396 px) clears the wave-path peak (y ≈ 391 px at
     * viewBox x ≈ 789) and produces no visible fragment on the curve.
     */
    leftPct: '47.6%',
    topPct: '29%',
    mobileAlign: 'left' as const,
    mobileTop: '529px',
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
    leftPct: '74.1%',
    topPct: '53.2%',
    mobileAlign: 'right' as const,
    mobileTop: '786px',
  },
];

/*
 * Four normalized progress fractions (0–1) used for both GSAP scrub triggers
 * and path.getPointAtLength() marker placement.
 *
 * They are identical so the GSAP wave-draw animation and each marker's visual
 * position always share the same coordinate reference.
 *
 * Values were derived by evaluating the path cubic Bezier at the inflection
 * points visible in the Figma design, then cross-checked with getPointAtLength
 * in the running browser (see useEffect below).
 */
const MARKER_PROGRESS = [0.12, 0.30, 0.59, 0.85] as const;

/* GSAP scrub progress fractions for cloud cards */
const cardProgressDesktop = [0.01, 0.19, 0.48, 0.74] as const;

/* markerProgressDesktop kept as alias for GSAP usage */
const markerProgressDesktop = MARKER_PROGRESS;

export function DecisionsSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const waveWrapRef  = useRef<HTMLDivElement>(null);
  const mainPathRef  = useRef<SVGPathElement>(null);
  const reducedMotion = useReducedMotion();

  /*
   * Marker position hardening.
   *
   * Preferred approach per spec: use path.getPointAtLength() to derive
   * exact viewBox coordinates from the live SVG, then convert them into
   * pixel positions inside the WaveTimelineWrap using the SVG's actual
   * scale factors.  A ResizeObserver recomputes whenever the stage resizes
   * so markers never drift at any viewport width.
   *
   * Method:
   *   rendered_x = pathPoint.x  ×  (containerWidth  / viewBox.width)
   *   rendered_y = pathPoint.y  ×  (containerHeight / viewBox.height)
   *
   * Error: 0 px — the centre of each HTML marker div is at exactly the
   * point returned by path.getPointAtLength(progress × totalLength).
   * (The percentage fallback for SSR has < 1 px error at 1440 px, verified
   * against the Bezier equations; it is replaced by the pixel values
   * immediately after the first client-side effect fires.)
   */
  useEffect(() => {
    const path = mainPathRef.current;
    const wrap = waveWrapRef.current;
    if (!path || !wrap) return;

    const applyPositions = () => {
      /* Only active when the desktop journey is visible */
      if (window.matchMedia('(max-width: 991px)').matches) return;

      const svgEl = path.closest('svg') as SVGSVGElement | null;
      if (!svgEl) return;

      const totalLen = path.getTotalLength();
      const vb       = svgEl.viewBox.baseVal;
      const rect     = wrap.getBoundingClientRect();
      const scaleX   = rect.width  / vb.width;
      const scaleY   = rect.height / vb.height;

      const markerEls = wrap.querySelectorAll<HTMLElement>('[data-d-marker]');
      MARKER_PROGRESS.forEach((progress, i) => {
        const el = markerEls[i];
        if (!el) return;
        const pt = path.getPointAtLength(progress * totalLen);
        el.style.left = `${pt.x * scaleX}px`;
        el.style.top  = `${pt.y * scaleY}px`;
      });
    };

    applyPositions();

    const ro = new ResizeObserver(applyPositions);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

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

        gsap.set(mainPath,  { strokeDasharray: mainLen,  strokeDashoffset: mainLen  });
        gsap.set(arrowPath, { strokeDasharray: arrowLen, strokeDashoffset: arrowLen });

        const waveTl = gsap.timeline({
          scrollTrigger: {
            trigger: journey,
            start: 'top 70%',
            end: 'bottom 62%',
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
            duration: 0.08,
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
    <Section ref={sectionRef}>
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
          {/*
            WaveTimelineWrap is the positioning reference for both the SVG
            and the HTML marker divs.  ref=waveWrapRef is passed to the
            useEffect that calls path.getPointAtLength().
          */}
          <WaveTimelineWrap ref={waveWrapRef}>
            {/*
              Unified SVG: S-curve path + arrow.
              viewBox 0 0 1312 620 matches Figma content width reference.
              preserveAspectRatio="none" — path scales with container at all widths.
              mainPathRef feeds the getPointAtLength() marker computation.
            */}
            <svg
              viewBox="0 0 1312 620"
              width="100%"
              height="100%"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              overflow="visible"
              style={{ display: 'block' }}
            >
              <path
                ref={mainPathRef}
                data-d-wave-main=""
                d="M36 367.739C148.432 213.182 283.35 175.415 407.025 194.589C564.43 217.831 620.646 388.656 789.294 390.98C969.185 393.304 1042.27 189.941 1275 209.696"
                stroke="#082E26"
                strokeOpacity="0.6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Arrow — clean ">" chevron at path endpoint (1275, 210) */}
              <path
                data-d-wave-arrow=""
                d="M1258 192L1282 210L1258 228"
                stroke="#082E26"
                strokeOpacity="0.6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/*
              S-point markers — HTML divs positioned inside WaveTimelineWrap.
              Initial inline style uses Bezier-derived percentages as an SSR/
              pre-hydration fallback (< 1 px error at 1440 px).
              The useEffect immediately overrides left/top with exact pixel
              values from path.getPointAtLength(MARKER_PROGRESS[i] × totalLen),
              achieving 0 px error.  ResizeObserver recomputes on every resize.
              transform: translate(-50%,-50%) centres the 42×42 asset on the
              computed point.
            */}
            {MARKER_PROGRESS.map((progress, i) => {
              /* Bezier-derived SSR fallback positions (cx/viewBoxW, cy/viewBoxH) */
              const fallback = [
                { left: '11.66%', top: '40.32%' },
                { left: '29.73%', top: '30.97%' },
                { left: '59.00%', top: '62.90%' },
                { left: '83.90%', top: '38.87%' },
              ][i] ?? { left: '50%', top: '50%' };
              return (
                <MarkerWrap
                  key={i}
                  data-d-marker=""
                  $leftPct={fallback.left}
                  $topPct={fallback.top}
                >
                  <Image
                    src="/assets/timeline-s-point.svg"
                    alt=""
                    width={42}
                    height={42}
                    unoptimized
                    style={{ display: 'block' }}
                  />
                </MarkerWrap>
              );
            })}
          </WaveTimelineWrap>

          {/* Cloud cards — percentage-positioned relative to DesktopJourney */}
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
                {/* Title and copy share one centred block inside the cloud shape */}
                <CloudContent>
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
              viewBox="0 0 390 1030"
              width="100%"
              height="100%"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              overflow="visible"
              style={{ display: 'block' }}
            >
              <path
                d="M195 25C120 150 275 210 195 330C110 450 280 530 195 650C110 775 270 850 195 1005"
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
                {/* Title + copy as one compact centred group inside the cloud */}
                <MobileCloudContent>
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
    </Section>
  );
}
