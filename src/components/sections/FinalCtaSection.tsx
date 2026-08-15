'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import styled from 'styled-components';
import { colors, fonts, media, spacing } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobCta } from '@/components/ui/BlobCta';
import { BlobSlot } from '@/components/blob/BlobSlot';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useMessages } from '@/lib/i18n/LocaleProvider';
import { joinLines } from '@/lib/i18n/lines';

const DesktopBr = styled.br`
  ${media.mobile} {
    display: none;
  }
`;

/* ─── Section shell ──────────────────────────────────────────────────────────
 *
 * The closing scene mirrors the Hero: a single-screen composition on desktop,
 * so the journey ends the way it started. Vertical rhythm is viewport-relative,
 * which is what stops the CTA pair from ever being pushed against the footer.
 */
const Section = styled.section`
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  scroll-margin-top: calc(${spacing.navHeight} + var(--safe-top));
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: clamp(56px, 8vh, 104px);
  padding-bottom: clamp(56px, 8vh, 104px);

  @media (max-width: 991px) {
    min-height: auto;
    justify-content: flex-start;
    padding-top: 56px;
    padding-bottom: 64px;
  }

  ${media.mobile} {
    scroll-margin-top: calc(${spacing.navHeightMobile} + var(--safe-top));
    padding-top: 48px;
  }
`;

/* Section label — above canvas (z-index: 20) */
const LabelWrap = styled.div`
  position: relative;
  z-index: 30;
`;

/*
 * Two-column grid.
 *
 * Previously the headline was a full-width block with the Blob S absolutely
 * positioned on top of it at a fixed 461 px — at every width between 992 and
 * 1400 px the words ran underneath the blob. Giving the blob its own grid
 * column makes the collision structurally impossible instead of tuned away.
 */
const FinalGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 400px);
  column-gap: clamp(24px, 3.4vw, 56px);
  align-items: center;
  margin-top: clamp(32px, 5vh, 72px);

  @media (min-width: 992px) and (max-width: 1199px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 300px);
    column-gap: 24px;
  }

  @media (max-width: 991px) {
    display: flex;
    flex-direction: column;
    margin-top: 28px;
  }
`;

const TextColumn = styled.div`
  position: relative;
  z-index: 30;
  min-width: 0;
`;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
`;

/* Capped by viewport height as well as width so the closing screen holds
   its one-screen composition on short laptop displays. */
const HeadlineLine = styled.span`
  display: block;
  font-size: min(clamp(72px, 8.6vw, 124px), 15vh);
  line-height: 1.05;

  @media (max-width: 991px) {
    font-size: clamp(64px, 9vw, 92px);
  }

  ${media.mobile} {
    font-size: clamp(46px, 14.8vw, 58px);
    line-height: 1.07;
  }
`;

/* Body text — above canvas */
const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: clamp(18px, 1.6vw, 22px);
  line-height: 1.55;
  color: ${colors.creamBody};
  margin-top: clamp(24px, 4vh, 64px);
  max-width: 600px;
  position: relative;
  z-index: 30;

  ${media.mobile} {
    font-size: 17px;
    line-height: 27px;
    margin-top: 28px;
    max-width: 100%;
  }
`;

/* ─── Blob S slot — its own grid column ─────────────────────────────────────── */
/* filter creates a stacking context at z-index: auto — below canvas (z-index: 20).
   The Blob S regains full presence here: this is the end of the journey. */
const BlobColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));
  pointer-events: none;

  @media (max-width: 991px) {
    margin-top: 36px;
    filter: drop-shadow(0px 14px 11px rgba(8, 46, 38, 0.42));
  }
`;

/*
 * Both axes are stated explicitly.
 *
 * This box used to give only a height and let `aspect-ratio` derive the width,
 * as a centred flex item. Chrome resolves that fine, which is why it measured
 * correctly in every headless check, but it is the most fragile of the three
 * mobile blob slots — Hero pins a max-width and Clarity states a width outright,
 * so Final was the only one whose width existed purely as a derivation from a
 * viewport-unit height. It is also the only one that failed on real iOS Safari,
 * where that derivation collapses and leaves a zero-width canvas with nothing
 * to draw into.
 *
 * Stating the width in the same clamp removes the derivation. The computed size
 * is identical in every engine that already got it right.
 */
const BlobSlotInner = styled.div`
  position: relative;
  --slot-h: clamp(280px, 46svh, 540px);
  height: var(--slot-h);
  width: calc(var(--slot-h) * 590 / 780);
  max-width: 100%;
  flex-shrink: 0;

  @media (min-width: 992px) and (max-width: 1199px) {
    --slot-h: clamp(260px, 38svh, 400px);
  }

  @media (max-width: 991px) {
    --slot-h: clamp(200px, 30svh, 280px);
  }
`;

/* ─── CTA block — above canvas ───────────────────────────────────────────── */
/*
 * Identical construction to the Hero CTA row: two content-width buttons with a
 * real gap, wrapping to a left-aligned column on narrow screens. Nothing here
 * stretches to the container width any more.
 */
const CtaBlock = styled.div`
  margin-top: clamp(36px, 6vh, 88px);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  position: relative;
  z-index: 30;

  /* Below 992 px the pair is treated as one centred stack. */
  @media (max-width: 991px) {
    flex-direction: column;
    align-items: center;
    gap: 14px;
    margin-top: 40px;
  }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */

export function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const t = useMessages();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.matchMedia('(max-width: 991px)').matches;

    const label    = section.querySelector('[data-f-label]');
    const headline = section.querySelector('[data-f-headline]');
    const lines    = headline ? headline.querySelectorAll('span') : [];
    const body     = section.querySelector('[data-f-body]');
    const cta      = section.querySelector('[data-f-cta]');
    // data-f-blob (the Blob S) is handled by the persistent canvas; no GSAP animation here.

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%' },
      defaults: { ease: 'power2.out' },
    });

    tl.from(label, { opacity: 0, y: -10, duration: 0.45 })
      .from(lines, {
        opacity: 0,
        y: isMobile ? 22 : 36,
        duration: isMobile ? 0.55 : 0.7,
        stagger: 0.13,
      }, '-=0.25')
      .from(body, { opacity: 0, y: isMobile ? 14 : 22, duration: 0.55 }, '-=0.2')
      .from(cta,  { opacity: 0, y: isMobile ? 12 : 18, duration: 0.5  }, '-=0.25');
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    /* data-scene-section used by BlobJourneyController */
    <Section id="contact" ref={sectionRef} data-scene-section="final">
      <SiteContainer>
        <LabelWrap data-f-label="">
          <SectionLabel>{t.finalCta.label}</SectionLabel>
        </LabelWrap>

        <FinalGrid>
          <TextColumn>
            <Headline data-f-headline="">
              {t.finalCta.headline.map(line => (
                <HeadlineLine key={line}>{line}</HeadlineLine>
              ))}
            </Headline>

            <BodyText data-f-body="">{joinLines(t.finalCta.body, DesktopBr)}</BodyText>
          </TextColumn>

          {/* Blob S slot — canvas renders above via z-index: 20 > filter: auto */}
          <BlobColumn data-f-blob="" aria-hidden="true">
            <BlobSlotInner>
              <BlobSlot slotKey="final" mobile="local" />
            </BlobSlotInner>
          </BlobColumn>
        </FinalGrid>

        <CtaBlock data-f-cta="">
          <BlobCta href="mailto:jan@stefanko.tech" variant="primary" size="lg">
            {t.finalCta.ctaPrimary}
          </BlobCta>

          <BlobCta href="#proof" variant="outlineLight" size="lg">
            {t.finalCta.ctaSecondary}
          </BlobCta>
        </CtaBlock>
      </SiteContainer>
    </Section>
  );
}
