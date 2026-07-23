'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobButton } from '@/components/ui/BlobButton';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* Figma 19:3: two separate <p> elements (explicit break). Figma 113:3: single <p>, natural wrap. */
const DesktopBr = styled.br`
  ${media.mobile} {
    display: none;
  }
`;

const Section = styled.section`
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  min-height: 951px;
  padding-top: 60px;
  padding-left: 64px;
  padding-right: 64px;
  padding-bottom: 0;

  ${media.mobile} {
    min-height: 930px;
    padding-top: 48px;
    padding-left: 24px;
    padding-right: 24px;
  }

  ${media.tablet} {
    padding-left: 40px;
    padding-right: 40px;
  }
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

const CtaBlock = styled.div`
  margin-top: 135px;
  display: flex;
  align-items: center;
  gap: 0;

  ${media.mobile} {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    margin-top: 48px;
  }

  ${media.tablet} {
    margin-top: 60px;
    flex-wrap: wrap;
    gap: 20px;
  }
`;

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

const SecondaryCtaText = styled.a`
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: ${colors.cream};
  margin-left: 56px;
  white-space: nowrap;

  ${media.mobile} {
    display: none;
  }
`;

const MobilePrimaryBlobWrap = styled.div`
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
    color: ${colors.darkGreen};
    text-align: center;
  }

  ${media.mobile} {
    display: flex;
  }
`;

const MobileSecondaryBlobWrap = styled(MobilePrimaryBlobWrap)`
  a {
    color: ${colors.cream};
    white-space: pre-wrap;
  }
`;

/* Figma 19:3: Blob S at left:960, top:194, width:461, height:503
   right = 1440 - 960 - 461 = 19 px from section right edge. */
const BlobSFinalWrap = styled.div`
  position: absolute;
  right: 19px;
  top: 194px;
  width: 461px;
  height: 503px;
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));

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
  }
`;

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

    // ── Entrance timeline ─────────────────────────────────────────────────────
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

    // ── Static Blob S — subtle opacity + scale + small rotation ─────────────
    // No morph, no scroll-reactivity, no cursor behavior — those belong to Phase 5.
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
      <div data-f-label="">
        <SectionLabel>{`07  /  THE NEXT IDEA`}</SectionLabel>
      </div>

      <Headline data-f-headline="">
        <HeadlineLine>HAVE AN IDEA</HeadlineLine>
        <HeadlineLine>WORTH BUILDING?</HeadlineLine>
      </Headline>

      <BodyText data-f-body="">
        Bring the idea, problem or opportunity.
        <DesktopBr />
        Let&apos;s find out what product should exist.
      </BodyText>

      {/* Blob S — desktop: absolute (ignores DOM order), mobile: inline after body text */}
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

          <SecondaryCtaText href="#proof">
            {`Explore selected work  ↗`}
          </SecondaryCtaText>
        </DesktopCtaGroup>

        <MobilePrimaryBlobWrap>
          <Image
            src="/assets/cta-primary-mobile.svg"
            alt=""
            aria-hidden={true}
            fill
            unoptimized
            style={{ objectFit: 'fill', pointerEvents: 'none' }}
          />
          <a href="mailto:jan@stefanko.tech">Start a conversation</a>
        </MobilePrimaryBlobWrap>

        <MobileSecondaryBlobWrap>
          <Image
            src="/assets/cta-secondary-mobile.svg"
            alt=""
            aria-hidden={true}
            fill
            unoptimized
            style={{ objectFit: 'fill', pointerEvents: 'none' }}
          />
          <a href="#proof">{`Explore selected work  ↗`}</a>
        </MobileSecondaryBlobWrap>
      </CtaBlock>
    </Section>
  );
}
