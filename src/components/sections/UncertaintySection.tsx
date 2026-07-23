'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';

const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  overflow: hidden;
  min-height: 1030px;
  padding-top: 68px;
  padding-left: 64px;
  padding-right: 64px;
  padding-bottom: 80px;

  ${media.mobile} {
    min-height: 898px;
    padding-top: 48px;
    padding-left: 24px;
    padding-right: 24px;
    padding-bottom: 60px;
  }

  ${media.tablet} {
    padding-left: 40px;
    padding-right: 40px;
  }
`;

const LabelWrap = styled.div`
  margin-bottom: 0;
`;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.darkGreen};
  margin-top: 142px;

  ${media.mobile} {
    margin-top: 60px;
  }

  ${media.tablet} {
    margin-top: 80px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-size: 130px;
  line-height: 136px;

  ${media.mobile} {
    font-size: 54px;
    line-height: 58px;
  }

  ${media.tablet} {
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
  margin-top: 96px;
  max-width: 520px;

  ${media.mobile} {
    font-size: 18px;
    line-height: 28px;
    margin-top: 36px;
    max-width: 100%;
  }

  ${media.tablet} {
    font-size: 18px;
    line-height: 28px;
    margin-top: 60px;
    max-width: 480px;
  }
`;

/* Question blobs: absolutely positioned within the section.
   Desktop positions are from Figma 19:3 at 1440px width.
   Mobile positions are from Figma 113:3 at 390px width.
   We use percentage-based left to allow fluid scaling between breakpoints.
   Top values are set at approximate pixel positions. */

const BlobsArea = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

interface QuestionBlobProps {
  $desktopLeft: string;
  $desktopTop: string;
  $mobileLeft: string;
  $mobileTop: string;
  $rotation: string;
}

const QuestionBlobWrap = styled.div<QuestionBlobProps>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  left: ${({ $desktopLeft }) => $desktopLeft};
  top: ${({ $desktopTop }) => $desktopTop};

  ${media.mobile} {
    left: ${({ $mobileLeft }) => $mobileLeft};
    top: ${({ $mobileTop }) => $mobileTop};
  }
`;

/* Wrapper for desktop question blob — hidden on mobile */
const DesktopBlobWrap = styled.div<{ $rotation: string }>`
  position: relative;
  width: 280px;
  height: 112px;
  flex-shrink: 0;
  transform: rotate(${({ $rotation }) => $rotation});

  ${media.mobile} {
    display: none;
  }
`;

/* Wrapper for mobile question blob — hidden on desktop */
const MobileBlobWrap = styled.div<{ $rotation: string }>`
  display: none;
  position: relative;
  width: 137px;
  height: 55px;
  flex-shrink: 0;
  transform: rotate(${({ $rotation }) => $rotation});

  ${media.mobile} {
    display: block;
  }
`;

interface QuestionLabelProps {
  $rotation: string;
  $color?: string;
}

const QuestionLabel = styled.p<QuestionLabelProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${({ $rotation }) => $rotation});
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: 26px;
  line-height: 32px;
  text-align: center;
  color: ${({ $color }) => $color ?? colors.cream};
  pointer-events: none;
  white-space: nowrap;

  ${media.mobile} {
    font-size: 21px;
    line-height: 24px;
  }
`;

const RuleLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 64px;
  right: 64px;
  overflow: hidden;
  height: 1px;

  ${media.mobile} {
    left: 24px;
    right: 24px;
    bottom: 86px;
  }
`;

const MobileTagline = styled.p`
  display: none;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: ${colors.darkGreen};

  ${media.mobile} {
    display: block;
    position: absolute;
    bottom: 29px;
    left: 24px;
    right: 24px;
  }
`;

const questions = [
  {
    src: '/assets/question-0.svg',
    srcMobile: '/assets/question-0-mobile.svg',
    label: 'WHO?',
    labelColor: colors.cream,
    rotation: '-9deg',
    desktopLeft: '53.7%',
    desktopTop: '159px',
    mobileLeft: '6.2%',
    mobileTop: '411px',
  },
  {
    src: '/assets/question-1.svg',
    srcMobile: '/assets/question-1-mobile.svg',
    label: 'WHY?',
    labelColor: colors.darkGreen,
    rotation: '6deg',
    desktopLeft: '73.3%',
    desktopTop: '231px',
    mobileLeft: '55.2%',
    mobileTop: '427px',
  },
  {
    src: '/assets/question-2.svg',
    srcMobile: '/assets/question-2-mobile.svg',
    label: 'WHAT?',
    labelColor: colors.cream,
    rotation: '12deg',
    desktopLeft: '49.4%',
    desktopTop: '402px',
    mobileLeft: '3.6%',
    mobileTop: '557px',
  },
  {
    src: '/assets/question-3.svg',
    srcMobile: '/assets/question-3-mobile.svg',
    label: 'FOR WHOM?',
    labelColor: colors.cream,
    rotation: '-17deg',
    desktopLeft: '68.7%',
    desktopTop: '502px',
    mobileLeft: '56.7%',
    mobileTop: '515px',
  },
  {
    src: '/assets/question-4.svg',
    srcMobile: '/assets/question-4-mobile.svg',
    label: 'WHY NOW?',
    labelColor: colors.darkGreen,
    rotation: '-5deg',
    desktopLeft: '51.0%',
    desktopTop: '691px',
    mobileLeft: '6.2%',
    mobileTop: '666px',
  },
  {
    src: '/assets/question-5.svg',
    srcMobile: '/assets/question-5-mobile.svg',
    label: 'WHAT MATTERS?',
    labelColor: colors.cream,
    rotation: '9deg',
    desktopLeft: '69.6%',
    desktopTop: '799px',
    mobileLeft: '54.5%',
    mobileTop: '678px',
  },
];

export function UncertaintySection() {
  return (
    <Section>
      <LabelWrap>
        <SectionLabel color={colors.darkGreen}>{`02  /  UNCERTAINTY`}</SectionLabel>
      </LabelWrap>

      <Headline>
        <HeadlineLine>AN IDEA IS ONLY</HeadlineLine>
        <HeadlineLine>THE START.</HeadlineLine>
      </Headline>

      <BodyText>
        The first job is not to build. It is to understand
        <br />
        what should be built.
      </BodyText>

      <BlobsArea aria-hidden="true">
        {questions.map((q, i) => (
          <QuestionBlobWrap
            key={i}
            $desktopLeft={q.desktopLeft}
            $desktopTop={q.desktopTop}
            $mobileLeft={q.mobileLeft}
            $mobileTop={q.mobileTop}
            $rotation={q.rotation}
          >
            <DesktopBlobWrap $rotation={q.rotation}>
              <Image src={q.src} alt="" fill unoptimized style={{ objectFit: 'contain' }} />
            </DesktopBlobWrap>
            <MobileBlobWrap $rotation={q.rotation}>
              <Image src={q.srcMobile} alt="" fill unoptimized style={{ objectFit: 'contain' }} />
            </MobileBlobWrap>
            <QuestionLabel $rotation={q.rotation} $color={q.labelColor}>
              {q.label}
            </QuestionLabel>
          </QuestionBlobWrap>
        ))}
      </BlobsArea>

      <RuleLine>
        <Image
          src="/assets/section-rule.svg"
          alt=""
          aria-hidden={true}
          width={1312}
          height={1}
          unoptimized
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </RuleLine>

      <MobileTagline>QUESTIONS BEFORE CODE.</MobileTagline>
    </Section>
  );
}
