'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobButton } from '@/components/ui/BlobButton';

/* Section 06 — Proof Lives in Reality
   PLACEHOLDER: All proof cards contain placeholder content only.
   Phase 6 will replace them with real product screenshots and assets. */

const Section = styled.section`
  background-color: ${colors.cream};
  position: relative;
  min-height: 1132px;
  padding-top: 66px;
  padding-left: 64px;
  padding-right: 64px;
  /* Figma: CTA ends at 1066, section is 1132 → 66 px below. */
  padding-bottom: 66px;

  ${media.mobile} {
    min-height: 1130px;
    padding-top: 48px;
    padding-left: 24px;
    padding-right: 24px;
    /* Figma mobile: CTA ends at 1086, section is 1130 → 44 px below. */
    padding-bottom: 44px;
  }

  ${media.tablet} {
    padding-left: 40px;
    padding-right: 40px;
    padding-bottom: 60px;
  }
`;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.darkGreen};
  /* Figma: headline at 160; label bottom ≈ 84 → gap 76 px. */
  margin-top: 76px;

  ${media.mobile} {
    /* Figma mobile: headline at 110; label bottom ≈ 66 → gap 44 px. */
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
  /* Figma: body at 440; headline bottom 408 → gap 32 px. */
  margin-top: 32px;

  ${media.mobile} {
    font-size: 18px;
    line-height: 28px;
    /* Figma mobile: body at 252; headline bottom 234 → gap 18 px. */
    margin-top: 18px;
  }
`;

/* Desktop proof card grid */
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 790px 1fr;
  grid-template-rows: 200px 200px;
  column-gap: 30px;
  row-gap: 30px;
  /* Figma: cards at 560; body bottom 470 → gap 90 px. */
  margin-top: 90px;

  ${media.mobile} {
    display: flex;
    flex-direction: column;
    gap: 30px;
    /* Figma mobile: cards at 340; body bottom 280 → gap 60 px. */
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
  /* Figma: CTA at 1010; cards bottom 990 → gap 20 px. */
  margin-top: 20px;

  ${media.mobile} {
    display: none;
  }
`;

const MobileCtaWrap = styled.div`
  display: none;
  /* Figma mobile: CTA at 1030; cards bottom 1000 → gap 30 px. */
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
  }

  ${media.mobile} {
    display: flex;
  }
`;

export function ProofSection() {
  return (
    <Section id="proof">
      <SectionLabel color={colors.darkGreen}>{`06  /  REAL PROOF`}</SectionLabel>

      <Headline>
        <HeadlineLine>PROOF LIVES</HeadlineLine>
        <HeadlineLine>IN REALITY.</HeadlineLine>
      </Headline>

      <BodyText>Real products. Real progress. Real lessons.</BodyText>

      <CardsGrid>
        {/* PLACEHOLDER — replace with real product screenshot before launch */}
        <FeaturedCard>
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
        <HardwareCard>
          <HardwareHeadline>
            HARDWARE
            <br />
            + SOFTWARE
          </HardwareHeadline>
          <HardwareSubLabel>REAL PROTOTYPE</HardwareSubLabel>
        </HardwareCard>

        {/* PLACEHOLDER — replace with real build-in-public process image */}
        <BuildPublicCard>
          <BuildPublicHeadline>
            BUILD IN
            <br />
            PUBLIC
          </BuildPublicHeadline>
          <BuildPublicSubLabel>REAL PROCESS IMAGE</BuildPublicSubLabel>
        </BuildPublicCard>
      </CardsGrid>

      <DesktopCtaWrap>
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

      <MobileCtaWrap>
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
    </Section>
  );
}
