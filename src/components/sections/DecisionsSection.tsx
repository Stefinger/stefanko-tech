'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  overflow: hidden;
  min-height: 1291px;
  padding-top: 70px;
  padding-left: 64px;
  padding-right: 64px;
  padding-bottom: 70px;

  ${media.mobile} {
    min-height: 1500px;
    padding-top: 48px;
    padding-left: 24px;
    padding-right: 24px;
    padding-bottom: 80px;
  }

  ${media.tablet} {
    padding-left: 40px;
    padding-right: 40px;
    padding-bottom: 60px;
  }
`;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.darkGreen};
  margin-top: 87px;

  ${media.mobile} {
    margin-top: 44px;
  }

  ${media.tablet} {
    margin-top: 60px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-size: 116px;
  line-height: 120px;

  ${media.mobile} {
    font-size: 57px;
    line-height: 61px;
  }

  ${media.tablet} {
    font-size: clamp(64px, 8vw, 100px);
    line-height: 1.04;
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

  ${media.mobile} {
    font-size: 18px;
    line-height: 28px;
    margin-top: 25px;
    max-width: 100%;
  }
`;

const DesktopJourney = styled.div`
  position: relative;
  margin-top: 139px;
  width: 100%;
  height: 513px;

  ${media.mobile} {
    display: none;
  }

  ${media.tablet} {
    height: auto;
    min-height: 500px;
    margin-top: 80px;
    overflow: visible;
  }
`;

const WaveTimelineWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 620px;

  ${media.tablet} {
    height: 500px;
  }
`;

interface CloudStepProps {
  $left: string;
  $top: string;
}

const CloudStep = styled.div<CloudStepProps>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  width: 340px;
  height: 240px;

  ${media.tablet} {
    width: 260px;
    height: 196px;
    transform: scale(0.82);
    transform-origin: top left;
  }
`;

const StepNumber = styled.p<{ $color?: string }>`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: 58px;
  line-height: 66px;
  text-align: center;
  color: ${({ $color }) => $color ?? colors.darkGreen};
  width: 116px;
  margin: 0 auto;
`;

const CloudBgWrap = styled.div`
  position: relative;
  width: 340px;
  height: 174px;
  margin-top: 0;
`;

const CloudLabel = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  text-align: center;
  width: 224px;
`;

const CloudSubtext = styled.p<{ $left: string; $top: string }>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 15px;
  line-height: 22px;
  text-align: center;
  width: 224px;
  transform: translateX(-50%);
`;

const TimelineSPointWrap = styled.div<{ $left: string; $top: string }>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  width: 42px;
  height: 42px;
`;

const MobileJourney = styled.div`
  display: none;
  position: relative;
  margin-top: 44px;
  width: 100%;
  min-height: 1030px;

  ${media.mobile} {
    display: block;
  }
`;

/* Clip-path animation is applied to this wrapper to reveal the path from top to bottom. */
const MobilePathWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1030px;
`;

interface MobileCloudStepProps {
  $left: string;
  $top: string;
}

const MobileCloudStep = styled.div<MobileCloudStepProps>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  width: 279px;
  height: 197px;
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
  width: 279px;
  height: 143px;
`;

const MobileCloudLabel = styled.p`
  position: absolute;
  top: 34%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 18px;
  line-height: 23px;
  text-align: center;
  width: 184px;
`;

const MobileCloudSubtext = styled.p`
  position: absolute;
  top: 69%;
  left: 50%;
  transform: translateX(-50%);
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  width: 184px;
`;

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
    left: '13px',
    top: '-50px',
    subtextLeft: '164px',
    subtextTop: '157px',
    mobileLeft: '24px',
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
    left: '253px',
    top: '243px',
    subtextLeft: '164px',
    subtextTop: '157px',
    mobileLeft: '82px',
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
    left: '625px',
    top: '104px',
    subtextLeft: '164px',
    subtextTop: '157px',
    mobileLeft: '24px',
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
    left: '972px',
    top: '273px',
    subtextLeft: '164px',
    subtextTop: '157px',
    mobileLeft: '82px',
    mobileTop: '786px',
  },
];

const sPoints = [
  { left: '153px', top: '221px' },
  { left: '390px', top: '173px' },
  { left: '772px', top: '372px' },
  { left: '1109px', top: '206px' },
];

// x-progress fractions for each cloud card (card left / 1312 total width)
const cardProgressDesktop = [0.01, 0.19, 0.48, 0.74] as const;
// x-progress fractions for each S-marker
const markerProgressDesktop = [0.10, 0.28, 0.57, 0.83] as const;

export function DecisionsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // Common elements
    const label    = section.querySelector('[data-d-label]');
    const headline = section.querySelector('[data-d-headline]');
    const lines    = headline ? headline.querySelectorAll('span') : [];
    const body     = section.querySelector('[data-d-body]');

    // ── Label + headline + body entrance ─────────────────────────────────────
    gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%' },
      defaults: { ease: 'power2.out' },
    })
      .from(label, { opacity: 0, y: -10, duration: 0.45 })
      .from(lines, { opacity: 0, y: isMobile ? 22 : 36, duration: isMobile ? 0.5 : 0.65, stagger: 0.1 }, '-=0.25')
      .from(body,  { opacity: 0, y: isMobile ? 14 : 20, duration: 0.5 }, '-=0.2');

    if (!isMobile) {
      // ── Desktop: wave stroke-dashoffset draw + cards + markers ──────────────
      const mainPath  = section.querySelector<SVGPathElement>('[data-d-wave-main]');
      const arrowPath = section.querySelector<SVGPathElement>('[data-d-wave-arrow]');
      const desktopJourney = section.querySelector('[data-d-journey-desktop]');
      const cloudEls  = Array.from(section.querySelectorAll('[data-d-cloud]')) as HTMLElement[];
      const markerEls = Array.from(section.querySelectorAll('[data-d-marker]')) as HTMLElement[];

      if (mainPath && arrowPath && desktopJourney) {
        const mainLen  = mainPath.getTotalLength();
        const arrowLen = arrowPath.getTotalLength();

        // Set initial hidden state
        gsap.set(mainPath,  { strokeDasharray: mainLen,  strokeDashoffset: mainLen  });
        gsap.set(arrowPath, { strokeDasharray: arrowLen, strokeDashoffset: arrowLen });

        // Single scrub timeline: path draws left-to-right, cards + markers
        // pop in at the proportional progress when the wave reaches them
        const waveTl = gsap.timeline({
          scrollTrigger: {
            trigger: desktopJourney,
            start: 'top 70%',
            end: 'bottom 62%',
            scrub: 0.8,
          },
        });

        // Main S-curve draws from 0 → 100% progress (ease: none = linear scrub)
        waveTl.to(mainPath,  { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
        // Arrow tail appears near the end
        waveTl.to(arrowPath, { strokeDashoffset: 0, ease: 'none', duration: 0.08 }, 0.92);

        // Cloud cards pop in at their horizontal position along the path
        cloudEls.forEach((el, i) => {
          const pos = cardProgressDesktop[i] ?? 0;
          waveTl.from(el, { opacity: 0, scale: 0.88, y: 18, ease: 'back.out(1.4)', duration: 0.08 }, pos);
        });

        // S-markers scale in just before their corresponding cloud
        markerEls.forEach((el, i) => {
          const pos = markerProgressDesktop[i] ?? 0;
          waveTl.from(el, { scale: 0, opacity: 0, ease: 'back.out(2)', duration: 0.05 }, pos);
        });
      }
    } else {
      // ── Mobile: clip-path reveal top-to-bottom + cascading cards ─────────────
      const mobileJourney  = section.querySelector('[data-d-journey-mobile]');
      const mobilePathWrap = section.querySelector('[data-d-mobile-path-wrap]');
      const mobileCards    = Array.from(section.querySelectorAll('[data-d-mobile-cloud]')) as HTMLElement[];

      if (mobileJourney && mobilePathWrap) {
        // Reveal path from top to bottom as user scrolls through mobile journey
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

      // Mobile cloud cards cascade in sequence
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

      {/* Desktop horizontal wave journey */}
      <DesktopJourney aria-hidden="true" data-d-journey-desktop="">
        <WaveTimelineWrap>
          {/* Inline SVG replaces <Image> so GSAP can animate stroke-dashoffset.
              Geometry is preserved exactly from the original wave-timeline.svg asset. */}
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
            <g>
              {/* Main S-curve — draws left to right via stroke-dashoffset */}
              <path
                data-d-wave-main=""
                d="M36 367.739C148.432 213.182 283.35 175.415 407.025 194.589C564.43 217.831 620.646 388.656 789.294 390.98C969.185 393.304 1042.27 189.941 1275 209.696"
                stroke="#082E26"
                strokeOpacity="0.6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Arrow tail at path end */}
              <path
                data-d-wave-arrow=""
                d="M1267 182C1280 189 1292 197 1302 207C1291 214 1281 223 1273 234"
                stroke="#082E26"
                strokeOpacity="0.6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </WaveTimelineWrap>

        {cloudSteps.map((step, i) => (
          <CloudStep key={i} data-d-cloud="" $left={step.left} $top={step.top}>
            <StepNumber $color={step.numberColor}>{step.number}</StepNumber>
            <CloudBgWrap>
              <Image
                src={step.bgSrc}
                alt=""
                fill
                unoptimized
                style={{ objectFit: 'fill' }}
              />
              <CloudLabel style={{ color: step.labelColor }}>{step.label}</CloudLabel>
            </CloudBgWrap>
            <CloudSubtext
              $left={step.subtextLeft}
              $top={step.subtextTop}
              style={{ color: step.subtextColor }}
            >
              {step.subtext}
            </CloudSubtext>
          </CloudStep>
        ))}

        {sPoints.map((pt, i) => (
          <TimelineSPointWrap key={i} data-d-marker="" $left={pt.left} $top={pt.top}>
            <Image
              src="/assets/timeline-s-point.svg"
              alt=""
              fill
              unoptimized
              style={{ objectFit: 'contain' }}
            />
          </TimelineSPointWrap>
        ))}
      </DesktopJourney>

      {/* Mobile vertical winding journey */}
      <MobileJourney data-d-journey-mobile="">
        <MobilePathWrap data-d-mobile-path-wrap="">
          {/* Inline SVG for clip-path reveal animation (top → bottom as user scrolls).
              Geometry preserved from decision-journey-mobile.svg. */}
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
            <g>
              <path
                d="M195 25C120 150 275 210 195 330C110 450 280 530 195 650C110 775 270 850 195 1005"
                stroke="#31534B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="5 9"
              />
            </g>
          </svg>
        </MobilePathWrap>

        {cloudSteps.map((step, i) => (
          <MobileCloudStep key={i} data-d-mobile-cloud="" $left={step.mobileLeft} $top={step.mobileTop}>
            <MobileStepNumber $color={step.numberColor}>{step.number}</MobileStepNumber>
            <MobileCloudBgWrap>
              <Image
                src={step.bgSrcMobile}
                alt=""
                fill
                unoptimized
                style={{ objectFit: 'fill' }}
              />
              <MobileCloudLabel style={{ color: step.labelColor }}>
                {step.label}
              </MobileCloudLabel>
              <MobileCloudSubtext style={{ color: step.subtextColor }}>
                {step.subtext}
              </MobileCloudSubtext>
            </MobileCloudBgWrap>
          </MobileCloudStep>
        ))}
      </MobileJourney>
    </Section>
  );
}
