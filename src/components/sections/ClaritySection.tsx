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
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  scroll-margin-top: 100px;
  padding-top: 68px;
  padding-bottom: 80px;

  @media (max-width: 767px) {
    padding-top: 48px;
    padding-bottom: 60px;
  }
`;

/* ─── Top-level grid: 5/12 text + 7/12 stage ──────────────────────────────── */
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 5fr 7fr;
  column-gap: 32px;
  align-items: start;
  margin-top: 0;

  @media (min-width: 992px) and (max-width: 1199px) {
    grid-template-columns: 1fr 1fr;
    column-gap: 24px;
  }

  /* Stack below md */
  @media (max-width: 991px) {
    display: flex;
    flex-direction: column;
  }
`;

/* Text column — above canvas (z-index: 20) */
const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 30;
`;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
  margin-top: 104px;

  @media (max-width: 991px) {
    margin-top: 64px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-size: clamp(72px, 8.2vw, 118px);
  line-height: 1.05;

  @media (max-width: 767px) {
    font-size: 58px;
    line-height: 62px;
  }
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 21px;
  line-height: 33px;
  color: ${colors.creamBody};
  margin-top: 88px;
  max-width: 480px;

  @media (max-width: 991px) {
    font-size: 17px;
    line-height: 27px;
    margin-top: 40px;
    max-width: 100%;
  }
`;

/* ─── Right column (stage + statement) ────────────────────────────────────── */
const StageColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 48px;

  @media (max-width: 991px) {
    padding-top: 24px;
  }
`;

/* ─── ClarityStage — bounded, all labels % relative to it ─────────────────── */
/* No z-index on ClarityStage — children (ConnectorSVG, DisciplineLabel, BlobSWrap)
   participate individually in the root stacking context. */
const ClarityStage = styled.div`
  position: relative;
  width: 100%;
  /* aspect ratio matches blob S proportions with label breathing room */
  aspect-ratio: 5 / 6;
  /* cap height on large screens */
  max-height: 860px;

  @media (max-width: 991px) {
    aspect-ratio: 1 / 1.2;
    max-height: 500px;
    margin-top: 16px;
  }

  @media (max-width: 767px) {
    aspect-ratio: 1 / 1.3;
    max-height: none;
  }
`;

/* Blob S slot — centred in stage.
   filter creates a stacking context at z-index: auto — below canvas (z-index: 20).
   The persistent canvas blob renders above this slot's static SVG fallback. */
const BlobSWrap = styled.div`
  position: absolute;
  /* 68% wide, aspect-ratio preserves height */
  width: 68%;
  aspect-ratio: 500 / 660;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));

  @media (max-width: 767px) {
    width: 62%;
    top: 8%;
  }
`;

/* Connector SVG — above canvas (z-index: 30 > canvas z-index: 20).
   position: absolute, no stacking context parent → competes in root context. */
const ConnectorSVG = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 30;
`;

/* Discipline labels — above canvas (z-index: 30).
   position: absolute inside ClarityStage (no stacking context) → root context. */
interface DisciplineLabelProps {
  $leftPct: string;
  $topPct: string;
  $mobileLeftPct: string;
  $mobileTopPct: string;
  $color: string;
}

const DisciplineLabel = styled.p<DisciplineLabelProps>`
  position: absolute;
  left: ${({ $leftPct }) => $leftPct};
  top: ${({ $topPct }) => $topPct};
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 1.82px;
  color: ${({ $color }) => $color};
  white-space: nowrap;
  pointer-events: none;
  max-width: 30%;
  z-index: 30;

  @media (max-width: 991px) {
    font-size: 11px;
    line-height: 15px;
    letter-spacing: 1.3px;
    left: ${({ $mobileLeftPct }) => $mobileLeftPct};
    top: ${({ $mobileTopPct }) => $mobileTopPct};
    white-space: normal;
    max-width: 28%;
  }

  @media (max-width: 767px) {
    font-size: 10px;
    line-height: 14px;
    letter-spacing: 1.1px;
    max-width: 30%;
  }
`;

/* ─── Statement + interaction note — above canvas ──────────────────────────── */
const StatementHeadline = styled.h3`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
  font-size: clamp(36px, 3.75vw, 54px);
  line-height: 1.1;
  margin-top: 40px;
  max-width: 580px;
  position: relative;
  z-index: 30;

  @media (max-width: 991px) {
    font-size: clamp(32px, 6vw, 48px);
    margin-top: 32px;
    max-width: 100%;
    text-align: center;
  }

  @media (max-width: 767px) {
    font-size: 34px;
    line-height: 40px;
    margin-top: 36px;
  }
`;

const StatementLine = styled.span`
  display: block;
`;

const InteractionNote = styled.div`
  position: relative;
  margin-top: 48px;
  width: 420px;
  height: 147px;
  max-width: 100%;
  z-index: 30;

  .note-content {
    position: relative;
    z-index: 1;
    padding: 40px 36px;
  }

  @media (max-width: 991px) {
    margin-top: 36px;
    width: 100%;
    height: 162px;
  }

  @media (max-width: 767px) {
    margin-top: 32px;
    height: 162px;
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
`;

const InteractionText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: ${colors.creamBody};
`;

const DesktopOnly = styled.span`
  @media (max-width: 767px) { display: none; }
`;
const MobileOnly = styled.span`
  display: none;
  @media (max-width: 767px) { display: inline; }
`;

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const disciplineLabels = [
  {
    text: 'PRODUCT THINKING',
    color: colors.cream,
    leftPct: '8%',
    topPct: '6%',
    mobileLeftPct: '2%',
    mobileTopPct: '2%',
    lineFrom: { x: 28, y: 9 },
    lineTo: { x: 36, y: 18 },
  },
  {
    text: 'RESEARCH',
    color: colors.muted,
    leftPct: '75%',
    topPct: '19%',
    mobileLeftPct: '63%',
    mobileTopPct: '16%',
    lineFrom: { x: 75, y: 21 },
    lineTo: { x: 66, y: 28 },
  },
  {
    text: 'AI',
    color: colors.pink,
    leftPct: '88%',
    topPct: '46%',
    mobileLeftPct: '74%',
    mobileTopPct: '46%',
    lineFrom: { x: 88, y: 48 },
    lineTo: { x: 80, y: 50 },
  },
  {
    text: 'UX',
    color: colors.cream,
    leftPct: '77%',
    topPct: '72%',
    mobileLeftPct: '70%',
    mobileTopPct: '71%',
    lineFrom: { x: 77, y: 73 },
    lineTo: { x: 70, y: 70 },
  },
  {
    text: 'DESIGN',
    color: colors.muted,
    leftPct: '5%',
    topPct: '86%',
    mobileLeftPct: '2%',
    mobileTopPct: '84%',
    lineFrom: { x: 14, y: 87 },
    lineTo: { x: 27, y: 80 },
  },
  {
    text: 'TECHNOLOGY',
    color: colors.cream,
    leftPct: '2%',
    topPct: '60%',
    mobileLeftPct: '2%',
    mobileTopPct: '62%',
    lineFrom: { x: 18, y: 62 },
    lineTo: { x: 24, y: 60 },
  },
  {
    text: 'BUSINESS',
    color: colors.lime,
    leftPct: '4%',
    topPct: '33%',
    mobileLeftPct: '2%',
    mobileTopPct: '40%',
    lineFrom: { x: 16, y: 36 },
    lineTo: { x: 27, y: 42 },
  },
];

export function ClaritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    const label       = section.querySelector('[data-c-label]');
    const headline    = section.querySelector('[data-c-headline]');
    const lines       = headline ? headline.querySelectorAll('span') : [];
    const body        = section.querySelector('[data-c-body]');
    const connectors  = Array.from(section.querySelectorAll('[data-c-connector]'));
    const disciplines = Array.from(section.querySelectorAll('[data-c-discipline]'));
    const note        = section.querySelector('[data-c-note]');
    const statement   = section.querySelector('[data-c-statement]');
    const stmtLines   = statement ? statement.querySelectorAll('span') : [];

    /*
     * The Blob S (data-c-blob) is no longer animated here — the persistent
     * canvas handles its fade-in timing via ScrollTrigger in BlobJourneyController.
     *
     * Order: label → headline → body → connectors → labels → note → statement.
     */
    gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 80%' },
      defaults: { ease: 'power2.out' },
    })
      .from(label, { opacity: 0, y: -6, duration: 0.2 })
      .from(lines, {
        opacity: 0,
        y: isMobile ? 10 : 16,
        duration: isMobile ? 0.32 : 0.42,
        stagger: 0.06,
      }, '-=0.1')
      .from(body, { opacity: 0, y: isMobile ? 6 : 10, duration: 0.32 }, '-=0.1')
      /* Connector lines reveal */
      .from(connectors, {
        opacity: 0,
        duration: 0.22,
        stagger: 0.025,
      }, '-=0.18')
      /* All seven discipline labels enter */
      .from(disciplines, {
        opacity: 0,
        y: isMobile ? 4 : 6,
        duration: 0.22,
        stagger: 0.03,
      }, '-=0.08')
      .from(note, { opacity: 0, y: 8, duration: 0.22 }, '-=0.06')
      .from(stmtLines, {
        opacity: 0,
        y: isMobile ? 6 : 10,
        duration: 0.28,
        stagger: 0.07,
      }, '-=0.1');
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    /* data-scene-section used by BlobJourneyController */
    <Section id="about" ref={sectionRef} data-scene-section="clarity">
      <SiteContainer>
        <div data-c-label="">
          <SectionLabel>{`03  /  CLARITY BEFORE COMPLEXITY`}</SectionLabel>
        </div>

        <ContentGrid>
          {/* ── Text column ── */}
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

          {/* ── Stage column ── */}
          <StageColumn>
            <ClarityStage>
              {/* Blob S slot — canvas renders above via z-index: 20 > filter: auto */}
              <BlobSWrap data-c-blob="">
                <BlobSceneSlot slotKey="clarity" />
              </BlobSWrap>

              {/* Connector lines — z-index: 30, above canvas (z-index: 20) */}
              <ConnectorSVG
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {disciplineLabels.map((d) => (
                  <line
                    key={d.text}
                    data-c-connector=""
                    x1={d.lineFrom.x}
                    y1={d.lineFrom.y}
                    x2={d.lineTo.x}
                    y2={d.lineTo.y}
                    stroke={colors.muted}
                    strokeWidth="0.5"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                ))}
              </ConnectorSVG>

              {/* Discipline labels — z-index: 30, above canvas (z-index: 20) */}
              {disciplineLabels.map((d) => (
                <DisciplineLabel
                  key={d.text}
                  data-c-discipline=""
                  $leftPct={d.leftPct}
                  $topPct={d.topPct}
                  $mobileLeftPct={d.mobileLeftPct}
                  $mobileTopPct={d.mobileTopPct}
                  $color={d.color}
                >
                  {d.text}
                </DisciplineLabel>
              ))}
            </ClarityStage>

            <StatementHeadline data-c-statement="">
              <StatementLine>I DON&apos;T JUST WRITE CODE.</StatementLine>
              <StatementLine>I CONNECT THE PIECES.</StatementLine>
            </StatementHeadline>
          </StageColumn>
        </ContentGrid>

        {/* Interaction note — z-index: 30 via styled component */}
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
              <MobileOnly>
                Blob S reacts to scroll progress. No hover or device orientation dependency.
              </MobileOnly>
            </InteractionText>
          </div>
        </InteractionNote>
      </SiteContainer>
    </Section>
  );
}
