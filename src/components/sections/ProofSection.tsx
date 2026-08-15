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

/* Section 06 — Proof Lives in Reality
 *
 * The three cards name the three kinds of evidence the section exists to show:
 * a product UI, a tangible prototype, and the process behind them.
 *
 * They currently carry no imagery, because no real product asset exists in this
 * repository yet. That is deliberate: the section states what it will prove and
 * shows nothing it cannot back up, rather than displaying a stand-in that the
 * brand's own rules forbid ("no fake screenshots, no invented proof"). Each card
 * already has the frame, ratio and stacking behaviour a real asset needs — see
 * the notes on FeaturedCard / HardwareCard / BuildPublicCard for what each one
 * is sized to receive. */

/*
 * Proof card interaction.
 *
 * One object, one movement. The card lifts and its accent ring fades in —
 * nothing else. The earlier version also deepened a drop shadow and drifted the
 * card's own contents apart, which made a single tile read as a stack of
 * separating layers rather than as one physical thing being picked up.
 *
 * `--card-ring` is set per card; this block stays colour-agnostic.
 */
const cardHover = `
  position: relative;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0);
  transition:
    transform 620ms cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 620ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-8px);
      box-shadow: inset 0 0 0 1px var(--card-ring);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`;

/* ─── Section shell — full-width background, vertical spacing only ──────── */
const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  overflow: hidden;
  scroll-margin-top: calc(${spacing.navHeight} + var(--safe-top));
  padding-top: 66px;
  padding-bottom: 78px;

  ${media.mobile} {
    scroll-margin-top: calc(${spacing.navHeightMobile} + var(--safe-top));
    padding-top: 48px;
    padding-bottom: 56px;
  }

  ${media.tablet} {
    padding-bottom: 68px;
  }
`;

/* Everything readable sits above the fixed Blob S canvas (z-index: 20) */
const Content = styled.div`
  position: relative;
  z-index: 30;
`;

/* ─── Blob S — small marginal presence beside the headline ─────────────────── */
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
  right: 0;
  top: 6%;
  width: 17%;
  max-width: 210px;
  aspect-ratio: 590 / 780;

  ${media.mobile} {
    right: -8%;
    top: 2%;
    width: 40%;
    max-width: none;
  }
`;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.darkGreen};
  margin-top: 76px;

  ${media.mobile} {
    margin-top: 44px;
  }

  ${media.tablet} {
    margin-top: 60px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-size: clamp(88px, 8.2vw, 118px);
  line-height: 1.05;

  ${media.mobile} {
    font-size: clamp(46px, 14.8vw, 58px);
    line-height: 1.07;
  }

  ${media.tablet} {
    font-size: clamp(64px, 8vw, 100px);
    line-height: 1.05;
  }
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 20px;
  line-height: 30px;
  color: ${colors.darkGreen};
  margin-top: 32px;

  ${media.mobile} {
    font-size: 18px;
    line-height: 28px;
    margin-top: 18px;
  }
`;

/* Cards grid — fixed 790 px left column within the 1312 px content area at xxl */
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 790px) 1fr;
  grid-template-rows: 200px 200px;
  column-gap: 30px;
  row-gap: 30px;
  margin-top: clamp(56px, 6.2vw, 90px);

  ${media.mobile} {
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-top: 60px;
  }

  ${media.tablet} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    margin-top: 60px;
  }
`;

const FeaturedCard = styled.div`
  ${cardHover}
  --card-ring: rgba(136, 255, 92, 0.45);
  background-color: ${colors.darkGreen};
  border-radius: 34px;
  overflow: hidden;
  grid-row: 1 / 3;
  padding: 28px 30px;
  min-height: 430px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${media.mobile} {
    min-height: 300px;
    border-radius: 30px;
    padding: 24px;
  }

  ${media.tablet} {
    grid-row: 1 / 3;
    min-height: 380px;
  }
`;

const CardWorkLabel = styled.p`
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 0.5px;
  color: ${colors.muted};
  white-space: pre-wrap;

  ${media.mobile} {
    font-size: 10px;
    line-height: 14px;
  }
`;

const CardHeadline = styled.h3`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
  font-size: 58px;
  line-height: 64px;
  margin-top: auto;
  margin-bottom: 12px;

  ${media.mobile} {
    font-size: 44px;
    line-height: 50px;
  }
`;

const HardwareCard = styled.div`
  ${cardHover}
  --card-ring: rgba(8, 46, 38, 0.4);
  background-color: ${colors.pink};
  border-radius: 34px;
  overflow: hidden;
  padding: 34px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;

  ${media.mobile} {
    min-height: 150px;
    border-radius: 30px;
    padding: 24px;
  }
`;

const HardwareHeadline = styled.h3`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.darkGreen};
  font-size: 42px;
  line-height: 48px;

  ${media.mobile} {
    font-size: 34px;
    line-height: 40px;
  }
`;

const BuildPublicCard = styled.div`
  ${cardHover}
  --card-ring: rgba(136, 255, 92, 0.45);
  background-color: ${colors.darkGreenAlt};
  border-radius: 34px;
  overflow: hidden;
  scroll-margin-top: calc(${spacing.navHeight} + var(--safe-top));
  padding: 34px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;

  ${media.mobile} {
    min-height: 150px;
    border-radius: 30px;
    padding: 24px;
  }
`;

const BuildPublicHeadline = styled.h3`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
  font-size: 42px;
  line-height: 48px;

  ${media.mobile} {
    font-size: 34px;
    line-height: 40px;
  }
`;

/*
 * One CTA for every breakpoint.
 *
 * The gap below the card grid is generous on purpose: the featured Selected
 * Work card is tall and visually heavy, and a tight button underneath read as
 * attached to it rather than as a separate action.
 */
const CtaWrap = styled.div`
  margin-top: 64px;

  ${media.tablet} {
    margin-top: 56px;
  }

  ${media.mobile} {
    margin-top: 52px;
  }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */

export function ProofSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const t = useMessages();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const label    = section.querySelector('[data-p-label]');
    const headline = section.querySelector('[data-p-headline]');
    const lines    = headline ? headline.querySelectorAll('span') : [];
    const body     = section.querySelector('[data-p-body]');
    const cards    = Array.from(section.querySelectorAll('[data-p-card]')) as HTMLElement[];
    const cta      = section.querySelector('[data-p-cta]');

    gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%' },
      defaults: { ease: 'power2.out' },
    })
      .from(label, { opacity: 0, y: -10, duration: 0.45 })
      .from(lines, { opacity: 0, y: isMobile ? 22 : 36, duration: isMobile ? 0.5 : 0.65, stagger: 0.1 }, '-=0.25')
      .from(body,  { opacity: 0, y: isMobile ? 14 : 20, duration: 0.5 }, '-=0.2');

    if (cards.length > 0) {
      gsap.from(cards, {
        opacity: 0,
        y: isMobile ? 22 : 32,
        duration: isMobile ? 0.5 : 0.6,
        stagger: 0.14,
        ease: 'power2.out',
        /*
         * The entrance leaves an inline `transform` on each card, and an inline
         * style always beats a stylesheet rule — which silently killed the CSS
         * hover lift. Clearing the property once the entrance finishes hands
         * `transform` back to CSS so the hover can own it.
         */
        clearProps: 'transform',
        scrollTrigger: {
          trigger: cards[0],
          start: 'top 80%',
        },
      });
    }

    if (cta) {
      gsap.from(cta, {
        opacity: 0,
        y: isMobile ? 14 : 18,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cta,
          start: 'top 88%',
        },
      });
    }
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    /* data-scene-section is read by BlobJourneyController to resolve the scene */
    <Section id="proof" ref={sectionRef} data-scene-section="proof">
      {/* Blob S — small marginal presence, below the canvas layer */}
      <BlobOverlay aria-hidden="true">
        <BlobOverlayInner>
          <BlobSlotWrap>
            <BlobSlot slotKey="proof" mobile="none" />
          </BlobSlotWrap>
        </BlobOverlayInner>
      </BlobOverlay>

      <Content>
        <SiteContainer>
          <div data-p-label="">
            <SectionLabel color={colors.darkGreen}>{t.proof.label}</SectionLabel>
          </div>

          <Headline data-p-headline="">
            {t.proof.headline.map(line => (
              <HeadlineLine key={line}>{line}</HeadlineLine>
            ))}
          </Headline>

          <BodyText data-p-body="">{t.proof.body}</BodyText>

          <CardsGrid>
            {/* Awaits a real product UI screenshot — the tall card is the one
                sized to carry it, at roughly 790 x 430 on desktop. */}
            <FeaturedCard data-p-card="">
              <CardWorkLabel>{t.proof.featured.workLabel}</CardWorkLabel>
              {/* Line count is a locale decision: Czech needs three lines to
                  keep the display size inside the card on a 390 px screen. */}
              <CardHeadline>{joinLines(t.proof.featured.headline, 'br')}</CardHeadline>
            </FeaturedCard>

            {/* Awaits a real prototype / device photograph. */}
            <HardwareCard data-p-card="">
              <HardwareHeadline>{joinLines(t.proof.hardware.headline, 'br')}</HardwareHeadline>
            </HardwareCard>

            {/* Awaits a real process image (Figma, sketch, iteration, testing). */}
            <BuildPublicCard id="build-in-public" data-p-card="">
              <BuildPublicHeadline>{joinLines(t.proof.buildPublic.headline, 'br')}</BuildPublicHeadline>
            </BuildPublicCard>
          </CardsGrid>

          <CtaWrap data-p-cta="">
            <BlobCta href="#proof" variant="outlineDark" size="md">
              {t.proof.cta}
            </BlobCta>
          </CtaWrap>
        </SiteContainer>
      </Content>
    </Section>
  );
}
