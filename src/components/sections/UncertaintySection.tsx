'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* ─── Section shell ────────────────────────────────────────────────────────── */
const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  padding-top: 68px;
  padding-bottom: 80px;

  ${media.mobile} {
    padding-top: 48px;
    padding-bottom: 60px;
  }
`;

const LabelWrap = styled.div``;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.darkGreen};
  margin-top: 142px;
  max-width: 560px;

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
  font-size: 130px;
  line-height: 136px;

  ${media.mobile} {
    font-size: 54px;
    line-height: 58px;
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
  margin-top: 96px;
  max-width: 520px;

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
    max-width: 480px;
  }
`;

/* ─── Desktop blobs (hidden on mobile) ────────────────────────────────────── */
const DesktopBlobsArea = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  ${media.mobile} {
    display: none;
  }
`;

interface DesktopBlobWrapProps {
  $left: string;
  $top: string;
}

const DesktopBlobWrap = styled.div<DesktopBlobWrapProps>`
  position: absolute;
  left: ${({ $left }) => $left};
  top: ${({ $top }) => $top};
  width: 280px;
  height: 112px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 769px) and (max-width: 1100px) {
    width: 220px;
    height: 88px;
  }
`;

/* ─── Mobile blob stage (hidden on desktop) ────────────────────────────────── */
const MobileQuestionStage = styled.div`
  display: none;
  position: relative;
  width: 100%;
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
  display: flex;
  align-items: center;
  justify-content: center;
  /* Blob SVG intrinsic size: 137.2 × 54.88 */
  width: 137px;
  height: 55px;
`;

const BlobImgWrap = styled.div<{ $rotation: string }>`
  position: absolute;
  inset: 0;
  transform: rotate(${({ $rotation }) => $rotation});
`;

interface QuestionLabelProps {
  $rotation: string;
  $color?: string;
  $desktopFontSize?: string;
  $mobileFontSize?: string;
}

const QuestionLabel = styled.p<QuestionLabelProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${({ $rotation }) => $rotation});
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: ${({ $desktopFontSize }) => $desktopFontSize ?? '26px'};
  line-height: 1.2;
  text-align: center;
  color: ${({ $color }) => $color ?? colors.cream};
  pointer-events: none;
  /* Desktop: nowrap — 280px blob provides sufficient space */
  white-space: nowrap;

  ${media.mobile} {
    font-size: ${({ $mobileFontSize }) => $mobileFontSize ?? '18px'};
    /* Mobile: allow wrap with per-item font sizes to fit 137px blob */
    white-space: normal;
    max-width: 108px;
    word-break: keep-all;
    overflow-wrap: normal;
  }
`;

/* ─── Bottom rule ──────────────────────────────────────────────────────────── */
const RuleWrap = styled.div`
  margin-top: 0;
  height: 1px;
  overflow: hidden;

  ${media.mobile} {
    margin-top: 36px;
  }
`;

const MobileTagline = styled.p`
  display: none;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
  color: ${colors.darkGreen};
  margin-top: 28px;

  ${media.mobile} {
    display: block;
  }
`;

/* ─── Config ────────────────────────────────────────────────────────────────── */
const questions = [
  {
    src: '/assets/question-0.svg',
    srcMobile: '/assets/question-0-mobile.svg',
    label: 'WHO?',
    labelColor: colors.cream,
    rotation: '-9deg',
    /* desktop: percentage-left + px-top relative to section */
    desktopLeft: '53.7%',
    desktopTop: '159px',
    /* mobile: stage-relative (stage starts ~352px below section top) */
    mobileLeft: '6.2%',
    mobileTop: '59px',
    desktopFontSize: '26px',
    mobileFontSize: '20px',
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
    mobileTop: '75px',
    desktopFontSize: '26px',
    mobileFontSize: '20px',
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
    mobileTop: '205px',
    desktopFontSize: '26px',
    mobileFontSize: '20px',
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
    mobileTop: '163px',
    desktopFontSize: '26px',
    mobileFontSize: '16px',
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
    mobileTop: '314px',
    desktopFontSize: '26px',
    mobileFontSize: '17px',
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
    mobileTop: '326px',
    desktopFontSize: '26px',
    mobileFontSize: '14px',
  },
];

/* deterministic per-blob animation values */
const blobEntranceY  = [22, -18, 20, -16, 18, -20] as const;
const blobScatterX   = [-38,  48, -44,  52, -36,  44] as const;
const blobScatterY   = [-52,  42, -42,  54, -58,  50] as const;
const blobDriftAmp   = [ 5,   -5,   5,  -5,   5,  -5] as const;
const blobDriftDur   = [2.1, 2.5, 1.9, 2.3, 2.6, 2.0] as const;
const blobDriftDelay = [0,   0.3, 0.6, 0.9, 0.45, 0.15] as const;

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

    const driftAmp   = isMobile ? 3 : 5;
    const scatterMul = isMobile ? 0.45 : 1;

    let driftTweens: gsap.core.Tween[] = [];

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
        const tl = gsap.timeline({
          onComplete: () => {
            driftTweens = blobs.map((el, i) =>
              gsap.to(el, {
                y: (blobDriftAmp[i] ?? 5) * (driftAmp / 5),
                duration: blobDriftDur[i] ?? 2.2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: blobDriftDelay[i] ?? 0,
              })
            );
          },
        });

        tl.from(blobs, {
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
        driftTweens.forEach(t => t.kill());
        driftTweens = [];
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
          onComplete: () => {
            driftTweens = blobs.map((el, i) =>
              gsap.to(el, {
                y: (blobDriftAmp[i] ?? 5) * (driftAmp / 5),
                duration: blobDriftDur[i] ?? 2.2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: blobDriftDelay[i] ?? 0,
                overwrite: 'auto',
              })
            );
          },
        });
      },
    });
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    <Section ref={sectionRef}>
      {/* Desktop blobs — position: absolute relative to section, hidden on mobile */}
      <DesktopBlobsArea aria-hidden="true">
        {questions.map((q, i) => (
          <DesktopBlobWrap
            key={i}
            data-u-blob-desktop=""
            $left={q.desktopLeft}
            $top={q.desktopTop}
          >
            <BlobImgWrap $rotation={q.rotation} style={{ transform: `rotate(${q.rotation})` }}>
              <Image
                src={q.src}
                alt=""
                fill
                unoptimized
                style={{ objectFit: 'contain' }}
              />
            </BlobImgWrap>
            <QuestionLabel
              $rotation={q.rotation}
              $color={q.labelColor}
              $desktopFontSize={q.desktopFontSize}
              $mobileFontSize={q.mobileFontSize}
            >
              {q.label}
            </QuestionLabel>
          </DesktopBlobWrap>
        ))}
      </DesktopBlobsArea>

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

        {/* Mobile blobs — bounded stage below body text, hidden on desktop */}
        <MobileQuestionStage aria-hidden="true">
          {questions.map((q, i) => (
            <MobileBlobItem
              key={i}
              data-u-blob-mobile=""
              $left={q.mobileLeft}
              $top={q.mobileTop}
            >
              <BlobImgWrap $rotation={q.rotation}>
                <Image
                  src={q.srcMobile}
                  alt=""
                  fill
                  unoptimized
                  style={{ objectFit: 'contain' }}
                />
              </BlobImgWrap>
              <QuestionLabel
                $rotation={q.rotation}
                $color={q.labelColor}
                $desktopFontSize={q.desktopFontSize}
                $mobileFontSize={q.mobileFontSize}
              >
                {q.label}
              </QuestionLabel>
            </MobileBlobItem>
          ))}
        </MobileQuestionStage>

        <RuleWrap>
          <Image
            src="/assets/section-rule.svg"
            alt=""
            aria-hidden={true}
            width={1312}
            height={1}
            unoptimized
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </RuleWrap>

        <MobileTagline>QUESTIONS BEFORE CODE.</MobileTagline>
      </SiteContainer>
    </Section>
  );
}
