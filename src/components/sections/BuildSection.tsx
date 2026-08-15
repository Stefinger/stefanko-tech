'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import styled from 'styled-components';
import { colors, fonts, motion } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobSlot } from '@/components/blob/BlobSlot';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useMessages } from '@/lib/i18n/LocaleProvider';

/* ─── Section shell ────────────────────────────────────────────────────────── */
/*
 * Background is the primary brand dark green (#082E26). The lifted
 * darkGreenAlt tone read as an off-brand tint next to the Hero and Final CTA;
 * separation between the sections comes from the layered cards, not from
 * shifting the green.
 */
const Section = styled.section`
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  padding-top: 96px;
  padding-bottom: 120px;

  @media (max-width: 991px) {
    padding-top: 72px;
  }

  @media (max-width: 767px) {
    padding-top: 48px;
    padding-bottom: 88px;
  }
`;

/* Everything readable sits above the fixed Blob S canvas (z-index: 20) */
const Content = styled.div`
  position: relative;
  z-index: 30;
`;

/* ─── Blob S ────────────────────────────────────────────────────────────────
 *
 * Desktop: far right, deliberately bleeding past the content container so it
 * reads as a spatial object sitting beyond the layout rather than an element
 * inside it. Its left edge is placed clear of the card deck's right edge, so it
 * never crowds the stack, and it is nowhere near the headline column.
 *
 * With the deck reduced there is real room beside it, so the blob is pulled
 * back toward the container and enlarged: it now reads as the second element in
 * a two-part composition rather than a sliver entering frame.
 *
 * IMPORTANT: the slot must stay fully inside the section VERTICALLY. The blob
 * is drawn by the fixed WebGL canvas, which is not clipped by the section's
 * overflow, so a negative top/bottom offset does not crop it — it hangs the
 * blob over the neighbouring section. Horizontal bleed is fine.
 */
const BlobOverlay = styled(SiteContainer)`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const BlobOverlayInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const BlobSlotWrap = styled.div`
  position: absolute;
  left: auto;
  right: -6%;
  top: 11%;
  width: 23%;
  max-width: 310px;
  aspect-ratio: 590 / 780;

  /* Mobile: top-right, in the space beside the section label and clear of the
     headline, which never reaches that far across. */
  @media (max-width: 991px) {
    right: -7%;
    top: 0;
    width: 34%;
    max-width: 190px;
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

  /* 992–1399 px: an even split gives the display headline enough measure to
     stay on two lines per block at the sizes it reaches in this range. */
  @media (min-width: 992px) and (max-width: 1399px) {
    grid-template-columns: 1fr 1fr;
    column-gap: 24px;
  }

  @media (max-width: 991px) {
    display: flex;
    flex-direction: column;
  }
`;

/* z-index keeps the headline above the layered cards — the back slab
   deliberately bleeds left into the grid gap and would otherwise paint over
   the last word of "TO BE REAL." at wide widths. */
const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  min-width: 0;
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

/* Capped at 110 px: the longest line ("TO BE REAL.") measures ~4.94 em in
   Anton, which is exactly what the 560 px text column holds at xxl. */
const HeadlineLine = styled.span`
  display: block;
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: clamp(64px, 8.2vw, 110px);
  line-height: 1.03;
  color: ${colors.cream};

  @media (max-width: 767px) {
    font-size: clamp(46px, 14.8vw, 58px);
    line-height: 1.07;
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

/* ─── Assembly stage ───────────────────────────────────────────────────────── */
/*
 * Stage height is derived from its own width via aspect-ratio rather than a
 * per-breakpoint pixel value, so the deck keeps identical spacing at every
 * desktop width.
 *
 * A slab is 44 % of the stage width — down from 62 %, a real reduction in the
 * composition rather than a repositioning of the same stack. Its 560:820 ratio
 * makes it 0.644 × the stage width tall; with the front slab starting at 22 %
 * the stage needs to be 0.83 × its width to contain the deck exactly.
 *
 * The smaller deck is what buys the section its breathing room: the stage is
 * now shorter than the headline column beside it, which opens real space on the
 * right for the Blob S to sit as an equal part of the composition.
 */
const AssemblyStage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 0.83;
  margin-top: 0;
  /* overflow visible so rotated cards don't self-clip */
  overflow: visible;

  @media (max-width: 991px) {
    aspect-ratio: auto;
    height: 470px;
    margin-top: 56px;
  }
`;

interface SlabProps {
  $bg: string;
  $rotation: string;
  $leftPct: string;
  $topPct: string;
  $mobileOffset: string;
  $mobileTop: string;
}

/*
 * The outer Slab owns POSITION and the GSAP-driven transform (assembly scrub).
 * Its child SlabSurface owns the visual card and the hover transform, so CSS
 * hover and GSAP never write to the same `transform` property and fight.
 */
const Slab = styled.div<SlabProps>`
  position: absolute;
  transform: rotate(${({ $rotation }) => $rotation});
  /* 44% of stage width, aspect 560:820 */
  width: 44%;
  aspect-ratio: 560 / 820;
  left: ${({ $leftPct }) => $leftPct};
  top: ${({ $topPct }) => $topPct};

  /*
   * At ≤991 px the ContentGrid stacks to a single column, so the stage is
   * full-container width. The deck is CENTRED on the stage — previously it was
   * pinned to the left gutter, which left the whole section visually
   * lopsided on phones and tablets.
   *
   * Fixed 240 × 351 px bounds the rotation AABB (297 px at 10°) so a rotated
   * card always clears the SiteContainer gutter on a 390 px viewport.
   */
  @media (max-width: 991px) {
    width: 240px;
    aspect-ratio: 240 / 351;
    left: calc(50% - 120px + ${({ $mobileOffset }) => $mobileOffset});
    top: ${({ $mobileTop }) => $mobileTop};
  }
`;

/*
 * The card surface, and the hover response.
 *
 * Hovering an exposed strip lifts that card out of the deck and deepens its
 * shadow — a depth response rather than a highlight. Because only the exposed
 * strip of a back card is hittable, the interaction naturally reads as
 * "peeling" whichever layer you reach for.
 */
const SlabSurface = styled.div<{ $bg: string }>`
  position: absolute;
  inset: 0;
  background-color: ${({ $bg }) => $bg};
  border-radius: 28px;
  box-shadow: 0px 16px 26px 0px rgba(8, 46, 38, 0.32);
  transform-origin: 50% 50%;
  transition:
    transform 420ms ${motion.hoverEase},
    box-shadow 420ms ${motion.hoverEase};
  will-change: transform;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-11px) scale(1.015);
      box-shadow: 0px 28px 42px 0px rgba(8, 46, 38, 0.4);
    }
  }

  @media (max-width: 991px) {
    border-radius: 19px;
    box-shadow: 0px 11px 18px 0px rgba(8, 46, 38, 0.3);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`;

/*
 * Labels are now CHILDREN of their own slab rather than stage-positioned
 * siblings with hand-tuned pixel offsets per breakpoint.
 *
 * That means each label inherits its card's rotation and position for free, and
 * sits at a fixed proportional inset inside its card, so it stays inside that
 * card's exposed strip at every width without a single magic number. The next
 * slab still paints over the covered part of the card below, which is exactly
 * the intended layering.
 */
const SlabLabel = styled.p<{ $color: string }>`
  position: absolute;
  left: 11%;
  top: 3.2%;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: clamp(9px, 0.72vw, 11px);
  line-height: 1.4;
  letter-spacing: 0.14em;
  color: ${({ $color }) => $color};
  pointer-events: none;
  white-space: nowrap;

  @media (max-width: 991px) {
    left: 11%;
    top: 4%;
    font-size: 8px;
    letter-spacing: 0.15em;
    line-height: 12px;
  }
`;

/* ─── Slab config ───────────────────────────────────────────────────────────── */
/*
 * leftPct / topPct: % of AssemblyStage.
 *
 * The three tops are evenly spaced 8.5 % apart, so each card exposes an equal
 * strip of the one behind it — the deck reads as one deliberate progression
 * (PROBLEM → EXPERIENCE → PRODUCT) instead of two tight steps and one loose one.
 *
 * The lefts step 16 % each and start at 2 %. With the narrower cards this keeps
 * the same staircase read while spreading the deck across its column instead of
 * bunching it. The back card does not bleed toward the headline.
 *
 * mobileOffset: px offset from the centred position (see Slab, ≤991 px).
 */
const slabs = [
  {
    /*
     * The back card must differ from the section behind it. The section is now
     * the primary dark green, so the card takes the lifted darkGreenAlt tone —
     * the same two-green relationship as before, with the roles swapped so the
     * SECTION carries the brand green and the card carries the variant.
     */
    bg: colors.darkGreenAlt,
    rotation: '10deg',
    finalRotation: 10,
    leftPct: '2%',
    topPct: '5%',
    mobileOffset: '-16px',
    mobileTop: '18px',
    labelColor: colors.cream,
  },
  {
    bg: colors.cream,
    rotation: '3deg',
    finalRotation: 3,
    leftPct: '18%',
    topPct: '13.5%',
    mobileOffset: '0px',
    mobileTop: '58px',
    labelColor: colors.darkGreen,
  },
  {
    bg: colors.pink,
    rotation: '-4deg',
    finalRotation: -4,
    leftPct: '34%',
    topPct: '22%',
    mobileOffset: '14px',
    mobileTop: '98px',
    labelColor: colors.cream,
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
  const t = useMessages();
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
    /* data-scene-section is read by BlobJourneyController to resolve the scene */
    <Section ref={sectionRef} data-scene-section="build">
      {/* Blob S — behind the cards, below the canvas layer */}
      <BlobOverlay aria-hidden="true">
        <BlobOverlayInner>
          <BlobSlotWrap>
            <BlobSlot slotKey="build" mobile="none" />
          </BlobSlotWrap>
        </BlobOverlayInner>
      </BlobOverlay>

      <Content>
        <SiteContainer>
          <div data-b-label="">
            <SectionLabel>{t.build.label}</SectionLabel>
          </div>

          <ContentGrid>
            <TextColumn>
              <Headline data-b-headline="">
                {t.build.headline.map(line => (
                  <HeadlineLine key={line}>{line}</HeadlineLine>
                ))}
              </Headline>
              <HeadlinePink data-b-headline-pink="">
                {t.build.headlineAccent.map(line => (
                  <HeadlineLinePink key={line}>{line}</HeadlineLinePink>
                ))}
              </HeadlinePink>
              <BodyText data-b-body="">{t.build.body}</BodyText>
            </TextColumn>

            <AssemblyStage ref={assemblyRef} aria-hidden="true">
              {slabs.map((slab, i) => (
                <Slab
                  key={i}
                  data-b-slab=""
                  $bg={slab.bg}
                  $rotation={slab.rotation}
                  $leftPct={slab.leftPct}
                  $topPct={slab.topPct}
                  $mobileOffset={slab.mobileOffset}
                  $mobileTop={slab.mobileTop}
                >
                  <SlabSurface $bg={slab.bg}>
                    {/* Label rides its own card — rotation and position for free */}
                    <SlabLabel data-b-slab-label="" $color={slab.labelColor}>
                      {t.build.slabs[i]}
                    </SlabLabel>
                  </SlabSurface>
                </Slab>
              ))}
            </AssemblyStage>
          </ContentGrid>
        </SiteContainer>
      </Content>
    </Section>
  );
}
