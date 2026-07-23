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
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  scroll-margin-top: 100px;
  min-height: 1183px;
  padding-top: 68px;
  padding-left: 64px;
  padding-right: 64px;
  padding-bottom: 68px;

  ${media.mobile} {
    min-height: 1250px;
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 560px 1fr;
  column-gap: 32px;
  align-items: start;

  ${media.mobile} {
    display: flex;
    flex-direction: column;
  }

  ${media.tablet} {
    grid-template-columns: 1fr 1fr;
  }
`;

const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
  margin-top: 104px;

  ${media.mobile} {
    margin-top: 64px;
  }

  ${media.tablet} {
    margin-top: 80px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-size: 118px;
  line-height: 124px;

  ${media.mobile} {
    font-size: 58px;
    line-height: 62px;
  }

  ${media.tablet} {
    font-size: clamp(70px, 8vw, 100px);
    line-height: 1.05;
  }
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 21px;
  line-height: 33px;
  color: ${colors.creamBody};
  margin-top: 88px;
  max-width: 520px;

  ${media.mobile} {
    font-size: 17px;
    line-height: 27px;
    margin-top: 40px;
    max-width: 100%;
  }

  ${media.tablet} {
    font-size: 18px;
    line-height: 28px;
    margin-top: 60px;
  }
`;

const StatementHeadline = styled.h3`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
  font-size: 54px;
  line-height: 60px;
  margin-top: 174px;
  max-width: 600px;

  ${media.mobile} {
    font-size: 34px;
    line-height: 40px;
    margin-top: 60px;
    max-width: 100%;
  }

  ${media.tablet} {
    font-size: 40px;
    line-height: 46px;
    margin-top: 100px;
  }
`;

const StatementLine = styled.span`
  display: block;
`;

const InteractionNote = styled.div`
  position: absolute;
  left: 70px;
  top: 968px;
  width: 420px;
  height: 147px;

  .note-content {
    position: relative;
    z-index: 1;
    padding: 42px 40px;
  }

  ${media.mobile} {
    position: static;
    width: 100%;
    height: 162px;
    margin-top: 47px;
  }

  ${media.tablet} {
    left: 40px;
    width: 380px;
  }
`;

const InteractionLabel = styled.p`
  font-family: ${fonts.body};
  font-weight: 700;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.5px;
  color: #33d966;
  text-transform: uppercase;
  margin-bottom: 8px;

  ${media.mobile} {
    color: ${colors.lime};
    font-size: 10px;
  }
`;

const InteractionText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #bfd1c7;

  ${media.mobile} {
    color: ${colors.creamBody};
  }
`;

const DesktopOnly = styled.span`
  ${media.mobile} { display: none; }
`;

const MobileOnly = styled.span`
  display: none;
  ${media.mobile} { display: inline; }
`;

const BlobColumn = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 60px;
  padding-left: 44px;

  ${media.mobile} {
    padding-top: 32px;
    padding-left: 0;
    align-items: center;
  }

  ${media.tablet} {
    padding-top: 40px;
    padding-left: 0;
    align-items: center;
  }
`;

const BlobSImgWrap = styled.div`
  position: relative;
  width: 500px;
  height: 660px;
  flex-shrink: 0;
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));

  ${media.mobile} {
    width: 240px;
    height: 317px;
  }

  ${media.tablet} {
    width: 380px;
    height: 502px;
  }
`;

interface DisciplineLabelProps {
  $desktopLeft: string;
  $desktopTop: string;
  $mobileLeft: string;
  $mobileTop: string;
  $color?: string;
}

const DisciplineLabel = styled.p<DisciplineLabelProps>`
  position: absolute;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 1.82px;
  color: ${({ $color }) => $color ?? colors.cream};
  white-space: nowrap;
  pointer-events: none;

  left: ${({ $desktopLeft }) => $desktopLeft};
  top:  ${({ $desktopTop  }) => $desktopTop};

  ${media.mobile} {
    font-size: 10px;
    line-height: 14px;
    letter-spacing: 1.2px;
    left: ${({ $mobileLeft }) => $mobileLeft};
    top:  ${({ $mobileTop  }) => $mobileTop};
  }
`;

const DisciplineLabelsArea = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const disciplineLabels = [
  { text: 'PRODUCT THINKING', color: colors.cream,  desktopLeft: '675px', desktopTop: '180px', mobileLeft: '24px',  mobileTop: '455px' },
  { text: 'RESEARCH',         color: colors.muted,  desktopLeft: '1120px',desktopTop: '290px', mobileLeft: '258px', mobileTop: '500px' },
  { text: 'AI',               color: colors.pink,   desktopLeft: '1195px',desktopTop: '525px', mobileLeft: '300px', mobileTop: '610px' },
  { text: 'UX',               color: colors.cream,  desktopLeft: '1030px',desktopTop: '760px', mobileLeft: '274px', mobileTop: '780px' },
  { text: 'DESIGN',           color: colors.muted,  desktopLeft: '650px', desktopTop: '850px', mobileLeft: '24px',  mobileTop: '805px' },
  { text: 'TECHNOLOGY',       color: colors.cream,  desktopLeft: '470px', desktopTop: '680px', mobileLeft: '24px',  mobileTop: '670px' },
  { text: 'BUSINESS',         color: colors.lime,   desktopLeft: '470px', desktopTop: '400px', mobileLeft: '24px',  mobileTop: '555px' },
];

export function ClaritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const label      = section.querySelector('[data-c-label]');
    const headline   = section.querySelector('[data-c-headline]');
    const lines      = headline ? headline.querySelectorAll('span') : [];
    const body       = section.querySelector('[data-c-body]');
    const blob       = section.querySelector('[data-c-blob]');
    const disciplines = Array.from(section.querySelectorAll('[data-c-discipline]'));
    const note       = section.querySelector('[data-c-note]');
    const statement  = section.querySelector('[data-c-statement]');
    const stmtLines  = statement ? statement.querySelectorAll('span') : [];

    // ── Main entrance timeline ────────────────────────────────────────────────
    // Fires when section enters from below. Elements animate to their Phase 2
    // positions which are exactly the approved Figma coordinates.
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 72%',
      },
      defaults: { ease: 'power2.out' },
    })
      .from(label, { opacity: 0, y: -10, duration: 0.45 })
      .from(lines, {
        opacity: 0,
        y: isMobile ? 20 : 34,
        duration: isMobile ? 0.5 : 0.65,
        stagger: 0.1,
      }, '-=0.25')
      .from(body, { opacity: 0, y: isMobile ? 14 : 20, duration: 0.55 }, '-=0.2')
      // Blob S enters from slight scale
      .from(blob, { opacity: 0, scale: 0.96, duration: 0.75 }, '<0.05')
      // Discipline labels stagger sequentially into exact Phase 2 positions
      .from(disciplines, {
        opacity: 0,
        y: isMobile ? 10 : 14,
        duration: 0.45,
        stagger: 0.13,
        ease: 'power2.out',
      }, '-=0.3')
      // Interaction note
      .from(note, { opacity: 0, y: isMobile ? 12 : 18, duration: 0.5 }, '-=0.25')
      // Statement headline ("I DON'T JUST WRITE CODE. / I CONNECT THE PIECES.")
      .from(stmtLines, {
        opacity: 0,
        y: isMobile ? 14 : 22,
        duration: 0.55,
        stagger: 0.12,
        ease: 'power2.out',
      }, '-=0.2');
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    <Section id="about" ref={sectionRef}>
      <LabelWrap data-c-label="">
        <SectionLabel>{`03  /  CLARITY BEFORE COMPLEXITY`}</SectionLabel>
      </LabelWrap>

      <ContentGrid>
        <TextColumn>
          <Headline data-c-headline="">
            <HeadlineLine>CLARITY</HeadlineLine>
            <HeadlineLine>BEFORE</HeadlineLine>
            <HeadlineLine>COMPLEXITY.</HeadlineLine>
          </Headline>

          <BodyText data-c-body="">
            Find the real problem. Remove what does not matter.
            <br />
            Then connect every discipline around one clear direction.
          </BodyText>
        </TextColumn>

        <BlobColumn>
          <BlobSImgWrap data-c-blob="">
            <Image
              src="/assets/blob-s-clarity.svg"
              alt="Stefanko.tech S — clarity"
              fill
              unoptimized
              style={{ objectFit: 'contain' }}
            />
          </BlobSImgWrap>

          <StatementHeadline data-c-statement="">
            <StatementLine>I DON&apos;T JUST WRITE CODE.</StatementLine>
            <StatementLine>I CONNECT THE PIECES.</StatementLine>
          </StatementHeadline>
        </BlobColumn>
      </ContentGrid>

      <InteractionNote data-c-note="">
        <Image
          src="/assets/interaction-note-border.svg"
          alt=""
          aria-hidden={true}
          fill
          unoptimized
          style={{ objectFit: 'fill', pointerEvents: 'none' }}
        />
        <div className="note-content">
          <InteractionLabel>
            <DesktopOnly>INTERACTION</DesktopOnly>
            <MobileOnly>MOBILE INTERACTION</MobileOnly>
          </InteractionLabel>
          <InteractionText>
            <DesktopOnly>3D Blob S tilts and reacts toward the cursor.</DesktopOnly>
            <MobileOnly>Blob S reacts to scroll progress. No hover or device orientation dependency.</MobileOnly>
          </InteractionText>
        </div>
      </InteractionNote>

      <DisciplineLabelsArea aria-hidden="true">
        {disciplineLabels.map((label) => (
          <DisciplineLabel
            key={label.text}
            data-c-discipline=""
            $desktopLeft={label.desktopLeft}
            $desktopTop={label.desktopTop}
            $mobileLeft={label.mobileLeft}
            $mobileTop={label.mobileTop}
            $color={label.color}
          >
            {label.text}
          </DisciplineLabel>
        ))}
      </DisciplineLabelsArea>
    </Section>
  );
}
