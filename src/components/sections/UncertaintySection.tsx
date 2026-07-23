'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

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
  top:  ${({ $desktopTop  }) => $desktopTop};

  ${media.mobile} {
    left: ${({ $mobileLeft }) => $mobileLeft};
    top:  ${({ $mobileTop  }) => $mobileTop};
  }
`;

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

// Deterministic per-blob entrance offsets (y) and scatter destinations
const blobEntranceY  = [22, -18, 20, -16, 18, -20] as const;
const blobScatterX   = [-38,  48, -44,  52, -36,  44] as const;
const blobScatterY   = [-52,  42, -42,  54, -58,  50] as const;
// Drift: alternating up/down with different durations
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
    const blobs    = Array.from(section.querySelectorAll('[data-u-blob]')) as HTMLElement[];

    const driftAmp   = isMobile ? 3 : 5;
    const scatterMul = isMobile ? 0.55 : 1;

    // Track drift tweens so they can be killed before scatter
    let driftTweens: gsap.core.Tween[] = [];

    // ── Section entrance: label + headline + body ─────────────────────────────
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
      },
      defaults: { ease: 'power2.out' },
    })
      .from(label, { opacity: 0, y: -10, duration: 0.5 })
      .from(lines, { opacity: 0, y: isMobile ? 20 : 36, duration: isMobile ? 0.5 : 0.65, stagger: 0.12 }, '-=0.3')
      .from(body,  { opacity: 0, y: isMobile ? 14 : 22, duration: 0.55 }, '-=0.25');

    // ── Question blob stagger entrance ────────────────────────────────────────
    ScrollTrigger.create({
      trigger: section,
      start: 'top 72%',
      once: true,
      onEnter: () => {
        const entranceTl = gsap.timeline({
          onComplete: () => {
            // Start continuous drift after all blobs have entered
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

        entranceTl.from(blobs, {
          opacity: 0,
          y: (i: number) => blobEntranceY[i] ?? 20,
          scale: 0.88,
          duration: isMobile ? 0.45 : 0.55,
          stagger: 0.09,
          ease: 'back.out(1.3)',
        });
      },
    });

    // ── Blob scatter on section exit ──────────────────────────────────────────
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
          scale: 0.84,
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
            // Restart drift
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
      <LabelWrap data-u-label="">
        <SectionLabel color={colors.darkGreen}>{`02  /  UNCERTAINTY`}</SectionLabel>
      </LabelWrap>

      <Headline data-u-headline="">
        <HeadlineLine>AN IDEA IS ONLY</HeadlineLine>
        <HeadlineLine>THE START.</HeadlineLine>
      </Headline>

      <BodyText data-u-body="">
        The first job is not to build. It is to understand
        <br />
        what should be built.
      </BodyText>

      <BlobsArea aria-hidden="true">
        {questions.map((q, i) => (
          <QuestionBlobWrap
            key={i}
            data-u-blob=""
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
