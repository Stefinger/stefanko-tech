'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SiteContainer } from '@/components/layout/SiteContainer';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobButton } from '@/components/ui/BlobButton';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

/* Section 06 — Proof Lives in Reality
   PLACEHOLDER: All proof cards contain placeholder content only.
   Phase 6 will replace them with real product screenshots and assets. */

/* ─── Section shell — full-width background, vertical spacing only ──────── */
const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  scroll-margin-top: 100px;
  padding-top: 66px;
  padding-bottom: 66px;

  ${media.mobile} {
    padding-top: 48px;
    padding-bottom: 44px;
  }

  ${media.tablet} {
    padding-bottom: 60px;
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
  font-size: 118px;
  line-height: 124px;

  ${media.mobile} {
    font-size: 58px;
    line-height: 62px;
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
  margin-top: 90px;

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

const CardPlaceholderLabel = styled.p`
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  color: ${colors.lime};

  ${media.mobile} {
    font-size: 10px;
    line-height: 14px;
  }
`;

const HardwareCard = styled.div`
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

const HardwareSubLabel = styled.p`
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  color: ${colors.darkGreen};

  ${media.mobile} {
    font-size: 10px;
    line-height: 14px;
  }
`;

const BuildPublicCard = styled.div`
  background-color: ${colors.darkGreenAlt};
  border-radius: 34px;
  overflow: hidden;
  scroll-margin-top: 100px;
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

const BuildPublicSubLabel = styled.p`
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  color: ${colors.lime};

  ${media.mobile} {
    font-size: 10px;
    line-height: 14px;
  }
`;

const DesktopCtaWrap = styled.div`
  margin-top: 20px;

  ${media.mobile} {
    display: none;
  }
`;

const MobileCtaWrap = styled.div`
  display: none;
  margin-top: 30px;

  ${media.mobile} {
    display: block;
  }
`;

const MobileCtaBlobWrap = styled.div`
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

/* ─── Component ─────────────────────────────────────────────────────────── */

export function ProofSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

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
    <Section id="proof" ref={sectionRef}>
      <SiteContainer>
        <div data-p-label="">
          <SectionLabel color={colors.darkGreen}>{`06  /  REAL PROOF`}</SectionLabel>
        </div>

        <Headline data-p-headline="">
          <HeadlineLine>PROOF LIVES</HeadlineLine>
          <HeadlineLine>IN REALITY.</HeadlineLine>
        </Headline>

        <BodyText data-p-body="">Real products. Real progress. Real lessons.</BodyText>

        <CardsGrid>
          {/* PLACEHOLDER — replace with real product screenshot before launch */}
          <FeaturedCard data-p-card="">
            <CardWorkLabel>{`SELECTED WORK  /  01`}</CardWorkLabel>
            <div>
              <CardHeadline>
                A REAL
                <br />
                DIGITAL PRODUCT
              </CardHeadline>
              {/* PLACEHOLDER: replace with real screenshot */}
              <CardPlaceholderLabel>REPLACE WITH A REAL SCREENSHOT</CardPlaceholderLabel>
            </div>
          </FeaturedCard>

          {/* PLACEHOLDER — replace with real hardware+software prototype asset */}
          <HardwareCard data-p-card="">
            <HardwareHeadline>
              HARDWARE
              <br />
              + SOFTWARE
            </HardwareHeadline>
            <HardwareSubLabel>REAL PROTOTYPE</HardwareSubLabel>
          </HardwareCard>

          {/* PLACEHOLDER — replace with real build-in-public process image */}
          <BuildPublicCard id="build-in-public" data-p-card="">
            <BuildPublicHeadline>
              BUILD IN
              <br />
              PUBLIC
            </BuildPublicHeadline>
            <BuildPublicSubLabel>REAL PROCESS IMAGE</BuildPublicSubLabel>
          </BuildPublicCard>
        </CardsGrid>

        <DesktopCtaWrap data-p-cta="">
          <BlobButton
            href="#proof"
            blobSrc="/assets/cta-explore-work-dark.svg"
            textColor={colors.darkGreen}
            width={236}
            height={56}
            fontSize={14}
          >
            Explore selected work
          </BlobButton>
        </DesktopCtaWrap>

        <MobileCtaWrap data-p-cta="">
          <MobileCtaBlobWrap>
            <Image
              src="/assets/cta-explore-work-dark-mobile.svg"
              alt=""
              aria-hidden={true}
              fill
              unoptimized
              style={{ objectFit: 'fill', pointerEvents: 'none' }}
            />
            <a href="#proof">Explore selected work</a>
          </MobileCtaBlobWrap>
        </MobileCtaWrap>
      </SiteContainer>
    </Section>
  );
}
