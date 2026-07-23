'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';

const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  overflow: hidden;
  min-height: 1291px;
  padding-top: 70px;
  padding-left: 64px;
  padding-right: 64px;
  /* Figma: journey ends at 1221, section is 1291 → 70 px below journey. */
  padding-bottom: 70px;

  ${media.mobile} {
    min-height: 1500px;
    padding-top: 48px;
    padding-left: 24px;
    padding-right: 24px;
    /* Figma mobile: journey ends at 1420, section is 1500 → 80 px below. */
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
  /* Figma desktop: headline at section-y 175; label bottom ≈ 88 → gap 87 px. */
  margin-top: 87px;

  ${media.mobile} {
    /* Figma mobile: headline at section-y 110; label bottom ≈ 66 → gap 44 px. */
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
  /* Figma: body starts at same y as headline bottom (no gap) → margin-top 0. */
  margin-top: 0;
  max-width: 660px;

  ${media.mobile} {
    font-size: 18px;
    line-height: 28px;
    /* Figma mobile: body at 318, headline bottom at 293 → gap 25 px. */
    margin-top: 25px;
    max-width: 100%;
  }
`;

/* Desktop: horizontal S-curve wave timeline.
   Figma: outer container h=513 px at section-y 708; wave SVG inside is 620 px
   (overflows downward — clipped by Section overflow:hidden at section bottom). */
const DesktopJourney = styled.div`
  position: relative;
  /* Figma: journey at 708; body bottom ≈ 569 → gap 139 px. */
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

/* Wave SVG is 620 px tall inside the 513 px journey container.
   The 107 px overflow is invisible (clipped by Section). */
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

/* Cloud step card */
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

/* Container for the timeline S-point marker */
const TimelineSPointWrap = styled.div<{ $left: string; $top: string }>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  width: 42px;
  height: 42px;
`;

/* Mobile: vertical winding path.
   Figma mobile: journey at section-y 390; body bottom ≈ 346 → gap 44 px. */
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

/* Wrapper for the mobile journey SVG used with next/image fill */
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
    /* Desktop positioning within the 1312×620 journey area */
    left: '13px',
    top: '-50px',
    subtextLeft: '164px',
    subtextTop: '157px',
    /* Mobile positioning */
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

export function DecisionsSection() {
  return (
    <Section>
      <SectionLabel color={colors.darkGreen}>{`04  /  DECISIONS`}</SectionLabel>

      <Headline>
        <HeadlineLine>PRODUCTS ARE</HeadlineLine>
        <HeadlineLine>BUILT THROUGH</HeadlineLine>
        <HeadlineLinePink>DECISIONS.</HeadlineLinePink>
      </Headline>

      <BodyText>
        What to build matters. What not to build matters just as much.
      </BodyText>

      {/* Desktop horizontal wave journey */}
      <DesktopJourney aria-hidden="true">
        <WaveTimelineWrap>
          <Image
            src="/assets/wave-timeline.svg"
            alt=""
            fill
            unoptimized
            style={{ objectFit: 'fill' }}
          />
        </WaveTimelineWrap>

        {cloudSteps.map((step, i) => (
          <CloudStep key={i} $left={step.left} $top={step.top}>
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
          <TimelineSPointWrap key={i} $left={pt.left} $top={pt.top}>
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
      <MobileJourney>
        <MobilePathWrap>
          <Image
            src="/assets/decision-journey-mobile.svg"
            alt=""
            fill
            unoptimized
            aria-hidden={true}
            style={{ objectFit: 'fill' }}
          />
        </MobilePathWrap>

        {cloudSteps.map((step, i) => (
          <MobileCloudStep key={i} $left={step.mobileLeft} $top={step.mobileTop}>
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
