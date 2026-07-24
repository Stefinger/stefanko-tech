'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import styled from 'styled-components';
import { colors, fonts } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* ─── Section shell ────────────────────────────────────────────────────────── */
const Section = styled.section`
  background-color: ${colors.darkGreenAlt};
  position: relative;
  overflow: hidden;
  padding-top: 72px;
  padding-bottom: 80px;

  @media (max-width: 767px) {
    padding-top: 48px;
    padding-bottom: 60px;
  }
`;

/* ─── Two-column grid ──────────────────────────────────────────────────────── */
const ContentGrid = styled.div`
  display: grid;
  /* text 5/12, stage 7/12 */
  grid-template-columns: 5fr 7fr;
  column-gap: 32px;
  align-items: start;

  /* At xxl (≥1400 px, SiteContainer padding=64px, content=1312px):
     lock text column to the original Figma 560 px to prevent
     "TO BE USED." from wrapping to 3 lines at the max headline size. */
  @media (min-width: 1400px) {
    grid-template-columns: 560px 1fr;
  }

  @media (min-width: 992px) and (max-width: 1199px) {
    grid-template-columns: 1fr 1fr;
    column-gap: 24px;
  }

  @media (max-width: 991px) {
    display: flex;
    flex-direction: column;
  }
`;

const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

const Headline = styled.h2`
  margin-top: 108px;

  @media (max-width: 767px) {
    margin-top: 62px;
  }

  @media (min-width: 768px) and (max-width: 991px) {
    margin-top: 60px;
  }
`;

const HeadlinePink = styled.h2`
  margin-top: 53px;

  @media (max-width: 767px) {
    margin-top: 26px;
  }

  @media (min-width: 768px) and (max-width: 991px) {
    margin-top: 36px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: clamp(64px, 8.6vw, 124px);
  line-height: 1.03;
  color: ${colors.cream};

  @media (max-width: 767px) {
    font-size: 58px;
    line-height: 62px;
  }
`;

const HeadlineLinePink = styled(HeadlineLine)`
  color: ${colors.pink};
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 21px;
  line-height: 33px;
  color: ${colors.creamFaded};
  margin-top: 50px;
  max-width: 520px;

  @media (max-width: 767px) {
    font-size: 17px;
    line-height: 27px;
    margin-top: 32px;
    max-width: 100%;
  }
`;

/* ─── Assembly stage — bounded, all slabs % relative to it ─────────────────── */
/*
 * All slab left/top values are percentages of AssemblyStage.
 * Slab width is 73% of stage (matches 560/763 desktop and 263/342 mobile ratios).
 * Slab aspect-ratio 560:820 preserved at all widths.
 *
 * On desktop the back slab intentionally bleeds -16% left into the grid gap —
 * this matches the Figma design. Section overflow:hidden clips any excess.
 *
 * On mobile (<768px) the back slab uses left:0 to prevent viewport overflow.
 */
const AssemblyStage = styled.div`
  position: relative;
  width: 100%;
  height: 1020px;
  margin-top: 0;
  /* overflow visible so rotated cards don't self-clip */
  overflow: visible;

  @media (min-width: 992px) and (max-width: 1199px) {
    height: 800px;
  }

  @media (max-width: 991px) {
    height: 600px;
    margin-top: 48px;
  }

  @media (max-width: 767px) {
    height: 480px;
    margin-top: 48px;
  }
`;

interface SlabProps {
  $bg: string;
  $rotation: string;
  $leftPct: string;
  $topPct: string;
  $mobileLeft: string;
  $mobileTop: string;
}

const Slab = styled.div<SlabProps>`
  position: absolute;
  background-color: ${({ $bg }) => $bg};
  border-radius: 40px;
  box-shadow: 0px 24px 38px 0px rgba(8, 46, 38, 0.3);
  transform: rotate(${({ $rotation }) => $rotation});
  /* 73% of stage width, aspect 560:820 */
  width: 73%;
  aspect-ratio: 560 / 820;
  left: ${({ $leftPct }) => $leftPct};
  top: ${({ $topPct }) => $topPct};

  /*
   * At ≤991 px the ContentGrid stacks to a single column, so the stage is
   * full-container-width.  Three changes:
   * 1. Fix width to 263 px (Figma mobile slab size) — this bounds the
   *    rotation AABB so a 10-deg card stays within the SiteContainer gutter.
   * 2. Switch to mobile left/top (no negative left offset).
   * 3. Reduce corner radius and shadow to mobile spec.
   */
  @media (max-width: 991px) {
    width: 263px;
    aspect-ratio: 263 / 385;
    border-radius: 19px;
    box-shadow: 0px 11px 18px 0px rgba(8, 46, 38, 0.3);
    left: ${({ $mobileLeft }) => $mobileLeft};
    top: ${({ $mobileTop }) => $mobileTop};
  }
`;

/*
 * Labels are siblings of slabs (rendered after all slabs → higher paint order).
 * Positioned stage-relative in the VISIBLE STRIP of their card:
 *   PROBLEM   — top 80 px of back slab exposed above middle slab
 *   EXPERIENCE — top 41 px of middle slab exposed above front slab
 *   PRODUCT   — front slab fully visible
 */
interface SlabLabelProps {
  $rotation: string;
  $desktopLeft: string;
  $desktopTop: string;
  $lgTop?: string;
  $mobileLeft: string;
  $mobileTop: string;
  $color: string;
}

const SlabLabel = styled.p<SlabLabelProps>`
  position: absolute;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 2.08px;
  color: ${({ $color }) => $color};
  /* rotate with the slab's angle */
  transform: rotate(${({ $rotation }) => $rotation});
  left: ${({ $desktopLeft }) => $desktopLeft};
  top: ${({ $desktopTop }) => $desktopTop};
  pointer-events: none;
  white-space: nowrap;

  /* 992–1199 px: stage height is 800 px, so slab strip centres differ from the
     default 1020 px reference.  Override only the labels that would fall
     outside their exposed strip at 800 px. */
  @media (min-width: 992px) and (max-width: 1199px) {
    ${({ $lgTop }) => $lgTop ? `top: ${$lgTop};` : ''}
  }

  /* Mirror the Slab breakpoint so label follows its slab */
  @media (max-width: 991px) {
    left: ${({ $mobileLeft }) => $mobileLeft};
    top: ${({ $mobileTop }) => $mobileTop};
    font-size: 8px;
    letter-spacing: 1.2px;
    line-height: 12px;
  }
`;

/* ─── Slab config ───────────────────────────────────────────────────────────── */
/*
 * desktopLeft / topPct: % of AssemblyStage (1020 px tall reference at ≥1200 px)
 * mobileLeft: px relative to AssemblyStage (no negative offsets)
 * mobileTop: px relative to AssemblyStage
 *
 * All topPct values shifted down by 3.6 % vs previous version to introduce a
 * deliberate top safe area that keeps the back slab and its PROBLEM label clear
 * of the fixed navbar at all tested widths (390, 768, 992, 1024, 1200, 1440 px).
 *
 * Label desktop top values — centre of each slab's exposed strip:
 *   PROBLEM   → new strip: 9%–16.8% of 1020 px = 91.8–171.4 px → label 110 px
 *   EXPERIENCE → strip: 16.8%–20.9% of 1020 px = 171.4–213.2 px → label 186 px
 *               (at 992–1199 px the stage is 800 px → strip 134.4–167.2 px → lgTop 150 px)
 *   PRODUCT   → front fully visible from 20.9% → label 244 px
 *
 * Mobile (stage 480 px, ≤767 px — values unchanged; mobileTop uses px):
 *   PROBLEM   → strip 26–63 px → label at 38 px
 *   EXPERIENCE → strip 63–83 px → label at 68 px
 *   PRODUCT   → label at 95 px
 */
const slabs = [
  {
    bg: colors.darkGreen,
    rotation: '10deg',
    finalRotation: 10,
    /* desktop: back card bleeds left into gap (Figma intent) */
    leftPct: '-16%',
    topPct: '9%',
    /*
     * mobile (≤991 px, slab fixed at 263×385 px):
     * 10 px left compensates the 10-deg AABB offset (~31.5 px).
     * viewport_left ≈ padding(24) + 10 - 31.5 = 2.5 px ✓
     */
    mobileLeft: '10px',
    mobileTop: '26px',
    labelText: 'PROBLEM',
    labelColor: colors.cream,
    labelRotation: '10deg',
    labelDesktopLeft: '70px',
    labelDesktopTop: '110px',
    labelLgTop: undefined as string | undefined,
    labelMobileLeft: '26px',
    labelMobileTop: '38px',
  },
  {
    bg: colors.cream,
    rotation: '3deg',
    finalRotation: 3,
    leftPct: '0.7%',
    topPct: '16.8%',
    mobileLeft: '9px',
    mobileTop: '63px',
    labelText: 'EXPERIENCE',
    labelColor: colors.darkGreen,
    labelRotation: '3deg',
    labelDesktopLeft: '81px',
    labelDesktopTop: '186px',
    /* At 992–1199 px the stage is 800 px: middle strip = 134.4–167.2 px */
    labelLgTop: '150px' as string | undefined,
    labelMobileLeft: '28px',
    labelMobileTop: '68px',
  },
  {
    bg: colors.pink,
    rotation: '-4deg',
    finalRotation: -4,
    leftPct: '10%',
    topPct: '20.9%',
    mobileLeft: '22px',
    mobileTop: '83px',
    labelText: 'PRODUCT',
    labelColor: colors.cream,
    labelRotation: '-4deg',
    labelDesktopLeft: '110px',
    labelDesktopTop: '244px',
    labelLgTop: undefined as string | undefined,
    labelMobileLeft: '38px',
    labelMobileTop: '95px',
  },
];

/* GSAP starting offsets — slabs converge from a tighter cluster */
const slabDesktopFrom = [
  { x:  50, y: 40 },
  { x:   0, y: 22 },
  { x: -30, y: 32 },
] as const;

const slabMobileFrom = [
  { x:  20, y: 16 },
  { x:   0, y: 10 },
  { x: -10, y: 14 },
] as const;

export function BuildSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const assemblyRef  = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const section  = sectionRef.current;
    const assembly = assemblyRef.current;
    if (!section || !assembly) return;

    /* matches ContentGrid stacking breakpoint so GSAP uses mobile offsets
       when the stage is full-width (single-column layout) */
    const isMobile = window.matchMedia('(max-width: 991px)').matches;

    const label         = section.querySelector('[data-b-label]');
    const headlineEl    = section.querySelector('[data-b-headline]');
    const headlineLines = headlineEl ? headlineEl.querySelectorAll('span') : [];
    const pinkEl        = section.querySelector('[data-b-headline-pink]');
    const pinkLines     = pinkEl ? pinkEl.querySelectorAll('span') : [];
    const body          = section.querySelector('[data-b-body]');
    const slabEls       = Array.from(section.querySelectorAll('[data-b-slab]'))  as HTMLElement[];
    const labelEls      = Array.from(section.querySelectorAll('[data-b-slab-label]')) as HTMLElement[];

    /* headline + copy entrance */
    gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%' },
      defaults: { ease: 'power2.out' },
    })
      .from(label,         { opacity: 0, y: -10, duration: 0.45 })
      .from(headlineLines, { opacity: 0, y: isMobile ? 20 : 34, duration: isMobile ? 0.5 : 0.65, stagger: 0.1 }, '-=0.25')
      .from(pinkLines,     { opacity: 0, y: isMobile ? 20 : 34, duration: isMobile ? 0.5 : 0.65, stagger: 0.1 }, '-=0.2')
      .from(body,          { opacity: 0, y: isMobile ? 14 : 20, duration: 0.5 }, '-=0.2');

    /* slab spread: flat cluster → corrected responsive positions */
    const fromValues = isMobile ? slabMobileFrom : slabDesktopFrom;

    const slabTl = gsap.timeline({
      scrollTrigger: {
        trigger: assembly,
        start: 'top 72%',
        end: isMobile ? '+=240' : '+=480',
        scrub: 1.2,
      },
    });

    slabEls.forEach((el, i) => {
      const from = fromValues[i] ?? { x: 0, y: 20 };
      slabTl.fromTo(
        el,
        { x: from.x, y: from.y, rotation: 0, transformOrigin: 'center center' },
        { x: 0, y: 0, rotation: slabs[i]?.finalRotation ?? 0, ease: 'power2.inOut', duration: 1 },
        i * 0.1,
      );
    });

    /* labels fade in with their slabs */
    gsap.from(labelEls, {
      opacity: 0,
      duration: 0.4,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: assembly,
        start: 'top 65%',
      },
    });
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    <Section ref={sectionRef}>
      <SiteContainer>
        <div data-b-label="">
          <SectionLabel>{`05  /  BUILD`}</SectionLabel>
        </div>

        <ContentGrid>
          <TextColumn>
            <Headline data-b-headline="">
              <HeadlineLine>DESIGNED</HeadlineLine>
              <HeadlineLine>TO BE USED.</HeadlineLine>
            </Headline>
            <HeadlinePink data-b-headline-pink="">
              <HeadlineLinePink>BUILT</HeadlineLinePink>
              <HeadlineLinePink>TO BE REAL.</HeadlineLinePink>
            </HeadlinePink>
            <BodyText data-b-body="">
              The idea becomes an experience people can understand, use and test.
            </BodyText>
          </TextColumn>

          <AssemblyStage ref={assemblyRef} aria-hidden="true">
            {/* Slabs rendered first (lower paint order) */}
            {slabs.map((slab, i) => (
              <Slab
                key={i}
                data-b-slab=""
                $bg={slab.bg}
                $rotation={slab.rotation}
                $leftPct={slab.leftPct}
                $topPct={slab.topPct}
                $mobileLeft={slab.mobileLeft}
                $mobileTop={slab.mobileTop}
              />
            ))}
            {/*
              Labels rendered after all slabs — higher paint order ensures
              labels are always visible above slabs regardless of stacking
              context created by slab transforms.
              Each label is positioned in the VISIBLE EXPOSED STRIP of its card.
            */}
            {slabs.map((slab, i) => (
              <SlabLabel
                key={`label-${i}`}
                data-b-slab-label=""
                $rotation={slab.labelRotation}
                $desktopLeft={slab.labelDesktopLeft}
                $desktopTop={slab.labelDesktopTop}
                $lgTop={slab.labelLgTop}
                $mobileLeft={slab.labelMobileLeft}
                $mobileTop={slab.labelMobileTop}
                $color={slab.labelColor}
              >
                {slab.labelText}
              </SlabLabel>
            ))}
          </AssemblyStage>
        </ContentGrid>
      </SiteContainer>
    </Section>
  );
}
