'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobButton } from '@/components/ui/BlobButton';
import { SecondaryExploreCta } from '@/components/ui/SecondaryExploreCta';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

const DesktopBr = styled.br`
  ${media.mobile} {
    display: none;
  }
`;

/* ─── Section shell — full-width background, vertical spacing only ──────── */
const Section = styled.section`
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  scroll-margin-top: 100px;
  min-height: 951px;
  padding-top: 60px;
  padding-bottom: 0;

  ${media.mobile} {
    min-height: auto;
    padding-top: 48px;
  }

  ${media.tablet} {
    min-height: 820px;
  }
`;

/* SiteContainer that also acts as the containing block for the absolute Blob S.
   The blob is positioned relative to this max-1440px centred container, so it
   stays correctly aligned with the text column at any viewport width. */
const InnerContainer = styled(SiteContainer)`
  position: relative;
  min-height: inherit;
`;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
  margin-top: 120px;
  max-width: 900px;

  ${media.mobile} {
    margin-top: 62px;
    max-width: 100%;
  }

  ${media.tablet} {
    margin-top: 80px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-size: 128px;
  line-height: 134px;

  ${media.mobile} {
    font-size: 58px;
    line-height: 62px;
  }

  ${media.tablet} {
    font-size: clamp(72px, 8vw, 110px);
    line-height: 1.05;
  }
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 22px;
  line-height: 34px;
  color: ${colors.creamBody};
  margin-top: 120px;
  max-width: 600px;

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

/* ─── Blob S — absolute, positioned relative to InnerContainer ──────────── */
/* Figma 19:3: right edge at 1440–961 = 479 px from left, width 461 px → right ≈ 19 px */
const BlobSFinalWrap = styled.div`
  position: absolute;
  right: 19px;
  top: 194px;
  width: 461px;
  height: 503px;
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));
  pointer-events: none;

  ${media.mobile} {
    position: static;
    width: 166px;
    height: 181px;
    margin-left: auto;
    margin-top: 40px;
    filter: drop-shadow(0px 10px 8px rgba(8, 46, 38, 0.42));
  }

  ${media.tablet} {
    width: 300px;
    height: 330px;
    right: 19px;
    top: 140px;
  }
`;

/* ─── CTA block ─────────────────────────────────────────────────────────── */
const CtaBlock = styled.div`
  margin-top: 135px;
  display: flex;
  align-items: center;
  gap: 0;
  padding-bottom: 100px;

  ${media.mobile} {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    margin-top: 48px;
    padding-bottom: 60px;
  }

  ${media.tablet} {
    margin-top: 60px;
    flex-wrap: wrap;
    gap: 20px;
    padding-bottom: 80px;
  }
`;

/* Desktop group — primary blob + overlapping secondary blob (same pattern as Hero) */
const DesktopCtaGroup = styled.div`
  display: flex;
  align-items: center;

  ${media.mobile} {
    display: none;
  }

  ${media.tablet} {
    display: none;
  }
`;

/* Mobile/narrow full-width CTA wrappers */
const NarrowBlobWrap = styled.div`
  display: none;
  position: relative;
  width: 100%;
  height: 56px;
  align-items: center;
  justify-content: center;

  a {
    position: relative;
    z-index: 1;
    font-family: ${fonts.body};
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
    color: ${colors.darkGreen};
    text-align: center;
    text-decoration: none;
  }

  ${media.mobile} {
    display: flex;
  }
`;

const NarrowSecondaryWrap = styled(NarrowBlobWrap)`
  a {
    color: ${colors.cream};
    white-space: pre-wrap;
  }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */

export function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const label    = section.querySelector('[data-f-label]');
    const headline = section.querySelector('[data-f-headline]');
    const lines    = headline ? headline.querySelectorAll('span') : [];
    const body     = section.querySelector('[data-f-body]');
    const blob     = section.querySelector('[data-f-blob]');
    const cta      = section.querySelector('[data-f-cta]');

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

    if (blob) {
      gsap.from(blob, {
        opacity: 0,
        scale: 0.94,
        rotation: isMobile ? 1.5 : 2.5,
        transformOrigin: 'center center',
        duration: 1.1,
        ease: 'power2.out',
        delay: 0.15,
        scrollTrigger: { trigger: section, start: 'top 78%' },
      });
    }
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    <Section id="contact" ref={sectionRef}>
      <InnerContainer>
        <div data-f-label="">
          <SectionLabel>{`07  /  THE NEXT IDEA`}</SectionLabel>
        </div>

        <Headline data-f-headline="">
          <HeadlineLine>HAVE AN IDEA</HeadlineLine>
          <HeadlineLine>WORTH BUILDING?</HeadlineLine>
        </Headline>

        <BodyText data-f-body="">
          Bring the idea, problem or opportunity.{' '}
          <DesktopBr />
          Let&apos;s find out what product should exist.
        </BodyText>

        {/* Blob S — desktop: absolute within InnerContainer; mobile: inline flow */}
        <BlobSFinalWrap data-f-blob="" aria-hidden="true">
          <Image
            src="/assets/blob-s-final.svg"
            alt=""
            fill
            unoptimized
            style={{ objectFit: 'contain' }}
          />
        </BlobSFinalWrap>

        <CtaBlock data-f-cta="">
          {/* Desktop (≥1101 px): primary blob + overlapping secondary organic border */}
          <DesktopCtaGroup>
            <BlobButton
              href="mailto:jan@stefanko.tech"
              blobSrc="/assets/cta-start-conversation.svg"
              textColor={colors.white}
              width={230}
              height={70}
              fontSize={16}
            >
              Start a conversation
            </BlobButton>

            {/* Organic border — same component and geometry as Hero secondary CTA */}
            <SecondaryExploreCta href="#proof" />
          </DesktopCtaGroup>

          {/* Mobile: full-width stacked blobs */}
          <NarrowBlobWrap>
            <Image
              src="/assets/cta-primary-mobile.svg"
              alt=""
              aria-hidden={true}
              fill
              unoptimized
              style={{ objectFit: 'fill', pointerEvents: 'none' }}
            />
            <a href="mailto:jan@stefanko.tech">Start a conversation</a>
          </NarrowBlobWrap>

          <NarrowSecondaryWrap>
            <Image
              src="/assets/cta-secondary-mobile.svg"
              alt=""
              aria-hidden={true}
              fill
              unoptimized
              style={{ objectFit: 'fill', pointerEvents: 'none' }}
            />
            <a href="#proof">{`Explore selected work  ↗`}</a>
          </NarrowSecondaryWrap>
        </CtaBlock>
      </InnerContainer>
    </Section>
  );
}
