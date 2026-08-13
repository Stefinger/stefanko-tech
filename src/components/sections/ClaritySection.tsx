'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, spacing } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobSlot } from '@/components/blob/BlobSlot';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* ─── Section shell ────────────────────────────────────────────────────────── */
const Section = styled.section`
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  scroll-margin-top: calc(${spacing.navHeight} + var(--safe-top));
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
  min-width: 0;
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

/* One accent line. CLARITY is the value the section argues for, so it carries
   the pink rather than COMPLEXITY, which is the thing being argued against. */
const HeadlineLinePink = styled(HeadlineLine)`
  color: ${colors.pink};
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
  min-width: 0;
  padding-top: 48px;

  @media (max-width: 991px) {
    padding-top: 24px;
  }
`;

/* ─── ClarityStage — bounded, everything placed relative to it ─────────────── */
/*
 * The stage is the single coordinate system for this section. Its aspect ratio
 * is deliberately kept close to the connector viewBox (500 × 600 = 5:6) at every
 * breakpoint, so the curved arrows keep an even stroke weight and are never
 * visibly sheared by `preserveAspectRatio="none"`.
 *
 * No z-index on ClarityStage — children (ConnectorSVG, DisciplineLabel,
 * BlobSWrap) participate individually in the root stacking context.
 */
const ClarityStage = styled.div`
  position: relative;
  width: 100%;
  /* One ratio at EVERY breakpoint. The label ring and its arrows are defined in
     the 500 × 600 connector space, so any change of ratio would stretch the ring
     unevenly and reintroduce the inconsistent gaps this layout exists to fix. */
  aspect-ratio: 5 / 6;
  /*
   * Capped by WIDTH, not height. A max-height would squash the stage away from
   * 5:6 on large screens and shear every connector, because the SVG uses
   * preserveAspectRatio="none". Capping the width keeps the ratio exact at all
   * sizes, so stroke weights stay even and arrowheads stay square.
   */
  max-width: 700px;
  margin-inline: auto;

  @media (max-width: 991px) {
    max-width: 460px;
    margin-top: 16px;
  }

  @media (max-width: 767px) {
    max-width: none;
  }
`;

/* Blob S slot — centred in stage.
   Width is tuned against the label columns so the S body and the labels each
   own their own band of the stage and never sit on top of each other.
   filter creates a stacking context at z-index: auto — below canvas (z-index: 20).
   The persistent canvas blob renders above this slot's static SVG fallback. */
const BlobSWrap = styled.div`
  position: absolute;
  width: 50%;
  aspect-ratio: 500 / 660;
  top: 9%;
  left: 50%;
  transform: translateX(-50%);
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));
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
   Anchored to the stage edge they belong to (left: 0 or right: 0) rather than
   to a hand-tuned percentage, so they hold their column at every width and can
   never drift over the Blob S or out of the stage. */
interface DisciplineLabelProps {
  $align: 'left' | 'right' | 'center';
  /* Distance of the label's INNER edge from the matching stage edge */
  $posPct: string;
  $topPct: string;
}

/*
 * Labels sit on a ring around the Blob S rather than in two flat columns.
 *
 * Each one is anchored by the edge that faces the blob, a fixed distance from
 * its own arrow, so the gaps stay consistent at every viewport size.
 *
 * Three labels use a smaller gap than the rest. PRODUCT THINKING, AI and
 * BUSINESS sit on near-horizontal rays (or wrap to two lines), so their whole
 * gap is spent on a single axis and reads larger than the same measurement on
 * the diagonal rays. TECHNOLOGY and DESIGN are the reference: the smaller
 * numeric gap on those three is what makes all seven look equal.
 *
 * All seven share one neutral cream tone. The pink and lime accents were
 * removed so the ring reads as a single system instead of two highlighted
 * disciplines plus five quiet ones.
 */
const DisciplineLabel = styled.p<DisciplineLabelProps>`
  position: absolute;
  top: ${({ $topPct }) => $topPct};
  ${({ $align, $posPct }) => {
    if ($align === 'left')  return `left: ${$posPct}; text-align: left;`;
    if ($align === 'right') return `right: ${$posPct}; text-align: right;`;
    return `left: ${$posPct}; transform: translateX(-50%); text-align: center;`;
  }}
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: clamp(11px, 1.05vw, 13px);
  line-height: 1.35;
  letter-spacing: 0.13em;
  color: ${colors.creamBody};
  pointer-events: none;
  max-width: 21%;
  z-index: 30;

  @media (max-width: 991px) {
    font-size: 11px;
    letter-spacing: 0.1em;
    max-width: 25%;
  }

  @media (max-width: 767px) {
    font-size: 9.5px;
    letter-spacing: 0.07em;
    max-width: 28%;
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

  /*
   * The copy stays LEFT-aligned; only its vertical placement is corrected.
   *
   * Vertical padding is deliberately ZERO here. Percentage padding resolves
   * against the containing block's WIDTH, not its height, so on a 420 × 147
   * bubble a "6% / 14%" split was spending 84 px of vertical padding inside a
   * 147 px box — which is why tuning those numbers moved the text unpredictably.
   *
   * With no vertical padding the flex centring is exact, and using gap rather
   * than a margin on the label means the content box wraps the ink with no
   * trailing space to throw the centre off. The small translate is the only
   * optical correction, lifting the block a couple of pixels off centre.
   */
  .note-content {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 7px;
    padding: 0 15%;
    text-align: left;
    transform: translateY(-2px);
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
`;

const InteractionText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: ${colors.creamBody};
`;

/* Breakpoint mirrors BlobJourneyCanvas's `enablePointer` query (min-width: 992
   plus a fine pointer): below that the blob does not react to a cursor, so the
   note must not claim it does. */
const DesktopOnly = styled.span`
  @media (max-width: 991px) { display: none; }
`;
const MobileOnly = styled.span`
  display: none;
  @media (max-width: 991px) { display: inline; }
`;

/* ─── Data ──────────────────────────────────────────────────────────────────── */
/*
 * Variant B connectors.
 *
 * Each discipline is joined to the Blob S by a curved, art-directed arrow drawn
 * in the stage's own 500 × 600 coordinate space. Each `d` string carries the
 * curve *and* its arrowhead in one path, so a single stroke-dasharray reveal
 * draws the whole connector including the tip — the arrows are never a separate
 * decorative element that can fall out of sync.
 *
 * `weight` marks the two disciplines that carry brand accent colour (AI = pink,
 * BUSINESS = lime); the rest stay quiet so the composition keeps one hierarchy.
 */
const disciplineLabels = [
  {
    text: 'PRODUCT THINKING',
    align: 'right' as const,
    /* Sits one step farther out than the rest: the two-line label reads as
       crowding its arrow at the shared gap. */
    posPct: '65.71%',
    topPct: '3.32%',
    d: 'M182 47.6 C177.9 68.1 184.5 84.1 202 95.6 M196.6 86.6 L202 95.6 L191.6 94.2',
  },
  {
    text: 'RESEARCH',
    align: 'left' as const,
    posPct: '62.98%',
    topPct: '3.45%',
    d: 'M314.9 41.4 C298.3 54.1 292.7 70.5 298.3 90.6 M300.2 80.3 L298.3 90.6 L291.3 82.8',
  },
  {
    text: 'AI',
    align: 'left' as const,
    posPct: '83.62%',
    topPct: '26.34%',
    d: 'M410.5 167.1 C390.3 161.7 374 167.4 361.4 184.1 M370.7 179.3 L361.4 184.1 L363.4 173.8',
  },
  {
    text: 'UX',
    align: 'left' as const,
    posPct: '76.32%',
    topPct: '57.45%',
    d: 'M381.6 340.9 C376.9 320.5 364.3 308.7 343.7 305.3 M352.2 311.4 L343.7 305.3 L353.7 302.3',
  },
  {
    text: 'DESIGN',
    align: 'center' as const,
    posPct: '52.04%',
    topPct: '70.62%',
    d: 'M260.2 415.2 C271.4 397.5 270.8 380.2 258.6 363.2 M260.4 373.6 L258.6 363.2 L267.8 368.2',
  },
  {
    text: 'TECHNOLOGY',
    align: 'right' as const,
    posPct: '72.94%',
    topPct: '59.58%',
    d: 'M135.3 352.9 C155.6 347.8 167.2 335 170.1 314.2 M164.3 322.9 L170.1 314.2 L173.4 324.2',
  },
  {
    text: 'BUSINESS',
    align: 'right' as const,
    posPct: '82.69%',
    topPct: '29.09%',
    d: 'M94.3 182.9 C108.5 198.3 125.3 202.3 144.9 195 M134.5 194 L144.9 195 L137.7 202.6',
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
    const connectors  = Array.from(
      section.querySelectorAll<SVGPathElement>('[data-c-connector]'),
    );
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
    /*
     * Each connector path carries its curve AND its arrowhead, so a single
     * stroke-dashoffset sweep draws the line and lands the arrow tip on the
     * Blob S — the motion reads as the discipline reaching the product, which
     * is the point of the section.
     */
    connectors.forEach(path => {
      const len = path.getTotalLength();
      /* Dash shorter than the gap, so the repeat can never reach back onto the
         path and paint a fragment before the draw starts — see DecisionsSection. */
      gsap.set(path, {
        strokeDasharray: `${len} ${len + 30}`,
        strokeDashoffset: len + 15,
        opacity: 1,
      });
    });

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
      /* Connectors draw themselves toward the Blob S */
      .to(connectors, {
        strokeDashoffset: 0,
        duration: isMobile ? 0.4 : 0.52,
        stagger: 0.06,
        ease: 'power2.inOut',
      }, '-=0.18')
      /* All seven discipline labels enter */
      /* Opacity only: the centred label uses translateX(-50%), and a GSAP `y`
         tween would take over `transform` and drop that centring. */
      .from(disciplines, {
        opacity: 0,
        duration: 0.24,
        stagger: 0.035,
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
              <HeadlineLinePink>CLARITY</HeadlineLinePink>
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
                <BlobSlot slotKey="clarity" mobile="local" />
              </BlobSWrap>

              {/* Curved connectors — z-index: 30, above canvas (z-index: 20) */}
              <ConnectorSVG
                viewBox="0 0 500 600"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {disciplineLabels.map((d) => (
                  <path
                    key={d.text}
                    data-c-connector=""
                    d={d.d}
                    fill="none"
                    stroke={colors.cream}
                    strokeOpacity={0.45}
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </ConnectorSVG>

              {/* Discipline labels — z-index: 30, above canvas (z-index: 20) */}
              {disciplineLabels.map((d) => (
                <DisciplineLabel
                  key={d.text}
                  data-c-discipline=""
                  $align={d.align}
                  $posPct={d.posPct}
                  $topPct={d.topPct}
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
                Blob S turns with scroll inside its own section. No hover or
                device orientation dependency.
              </MobileOnly>
            </InteractionText>
          </div>
        </InteractionNote>
      </SiteContainer>
    </Section>
  );
}
