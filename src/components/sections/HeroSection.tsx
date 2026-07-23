'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobButton } from '@/components/ui/BlobButton';

const Section = styled.section`
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  min-height: 1072px;
  padding-top: 154px;
  padding-bottom: 80px;
  padding-left: 64px;
  padding-right: 64px;

  ${media.mobile} {
    min-height: 932px;
    padding-top: 106px;
    padding-bottom: 60px;
    padding-left: 24px;
    padding-right: 24px;
  }

  ${media.tablet} {
    padding-left: 40px;
    padding-right: 40px;
  }
`;

const HeroGrid = styled.div`
  display: grid;
  /* Blob column shrinks below 590px at viewports under ~1440px to preserve text column width */
  grid-template-columns: 1fr minmax(0, min(590px, 45%));
  column-gap: 32px;
  align-items: start;

  ${media.mobile} {
    display: flex;
    flex-direction: column;
  }

  ${media.tablet} {
    grid-template-columns: 1fr minmax(0, 440px);
  }
`;

const TextColumn = styled.div`
  display: flex;
  flex-direction: column;

  ${media.mobile} {
    order: 1;
    width: 100%;
  }
`;

const LabelWrap = styled.div`
  margin-bottom: 36px;

  ${media.mobile} {
    margin-bottom: 0;
  }
`;

const Headline = styled.h1`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  margin-top: 150px;

  ${media.mobile} {
    /* Figma mobile: headline at 148; label bottom ≈ 122 → gap 26 px. */
    margin-top: 26px;
  }

  ${media.tablet} {
    margin-top: 80px;
  }
`;

const HeadlineLineWhite = styled.span`
  display: block;
  /* Fluid: 138px at 1440px, scaling down to fit text column at intermediate widths */
  font-size: clamp(114px, 9.58vw, 138px);
  line-height: 1.044;
  color: ${colors.cream};

  ${media.mobile} {
    font-size: 66px;
    line-height: 70px;
  }

  ${media.tablet} {
    font-size: clamp(80px, 9vw, 120px);
    line-height: 1.04;
  }
`;

const HeadlineLinePink = styled(HeadlineLineWhite)`
  color: ${colors.pink};
`;

const BlobMobileWrap = styled.div`
  display: none;
  justify-content: center;
  /* Figma mobile: blob at 305; headline bottom 288 → gap 17 px. */
  margin-top: 17px;
  filter: drop-shadow(0px 10px 8px rgba(8, 46, 38, 0.42));

  ${media.mobile} {
    display: flex;
  }
`;

/* Figma mobile 113:3: Hero Blob S at 218×289 px centered */

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 22px;
  line-height: 34px;
  color: ${colors.creamBody};
  margin-top: 59px;
  max-width: 520px;

  ${media.mobile} {
    font-size: 18px;
    line-height: 28px;
    margin-top: 32px;
    max-width: 100%;
  }

  ${media.tablet} {
    font-size: 18px;
    line-height: 28px;
    margin-top: 48px;
    max-width: 480px;
  }
`;

const CtaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 76px;
  position: relative;

  ${media.mobile} {
    flex-direction: column;
    gap: 16px;
    margin-top: 40px;
    align-items: stretch;
  }

  ${media.tablet} {
    margin-top: 48px;
    flex-wrap: wrap;
    gap: 16px;
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

const SecondaryCtaWrap = styled.div`
  position: relative;
  width: 291px;
  height: 77px;
  margin-left: -40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  a {
    position: relative;
    z-index: 1;
    font-family: ${fonts.body};
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    color: ${colors.cream};
    white-space: nowrap;
  }

  ${media.mobile} {
    display: none;
  }

  ${media.tablet} {
    display: none;
  }
`;


const MobilePrimaryBlobWrap = styled.div`
  display: none;
  position: relative;
  width: 342px;
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
    width: 100%;
  }
`;

const MobileSecondaryBlobWrap = styled(MobilePrimaryBlobWrap)`
  a {
    color: ${colors.cream};
    white-space: pre-wrap;
  }
`;

/* Figma mobile shows body text as one flowing paragraph; the line break is desktop-only */
const DesktopBr = styled.br`
  ${media.mobile} {
    display: none;
  }
`;

const ScrollHint = styled.p`
  font-family: ${fonts.body};
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 1.8px;
  color: ${colors.muted};
  text-align: right;
  position: absolute;
  right: 64px;
  bottom: 58px;

  ${media.mobile} {
    font-size: 10px;
    line-height: 14px;
    letter-spacing: 1.4px;
    right: 24px;
    bottom: 53px;
  }
`;

const BlobDesktopWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 66px;
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));

  ${media.mobile} {
    display: none;
  }

  ${media.tablet} {
    padding-top: 40px;
  }
`;

/* Responsive wrapper for next/image fill on the desktop Blob S */
const BlobDesktopImgWrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 590px;
  aspect-ratio: 590 / 780;
`;

export function HeroSection() {
  return (
    <Section>
      <HeroGrid>
        <TextColumn>
          <LabelWrap>
            <SectionLabel>{`01  /  RAW IDEA`}</SectionLabel>
          </LabelWrap>

          <Headline>
            <HeadlineLineWhite>FROM IDEA</HeadlineLineWhite>
            <HeadlineLinePink>TO PRODUCT.</HeadlineLinePink>
          </Headline>

          {/* Blob S — mobile position (between headline and body) */}
          <BlobMobileWrap>
            <Image
              src="/assets/blob-s-hero-mobile.svg"
              alt="Stefanko.tech signature S"
              width={218}
              height={289}
              unoptimized
              style={{ objectFit: 'contain' }}
            />
          </BlobMobileWrap>

          <BodyText>
            I connect product thinking, AI, design and technology
            <DesktopBr />
            to turn raw ideas into real products.
          </BodyText>

          <CtaRow>
            {/* Desktop CTAs */}
            <DesktopCtaGroup>
              <BlobButton
                href="#contact"
                blobSrc="/assets/cta-start-conversation.svg"
                textColor={colors.white}
                width={230}
                height={70}
                fontSize={16}
              >
                Start a conversation
              </BlobButton>

              <SecondaryCtaWrap>
                <Image
                  src="/assets/cta-explore-work-light.svg"
                  alt=""
                  aria-hidden={true}
                  fill
                  unoptimized
                  style={{ objectFit: 'fill', pointerEvents: 'none' }}
                />
                <a href="#proof">Explore selected work &nbsp;↗</a>
              </SecondaryCtaWrap>
            </DesktopCtaGroup>

            {/* Mobile primary CTA */}
            <MobilePrimaryBlobWrap>
              <Image
                src="/assets/cta-primary-mobile.svg"
                alt=""
                aria-hidden={true}
                fill
                unoptimized
                style={{ objectFit: 'fill', pointerEvents: 'none' }}
              />
              <a href="#contact">Start a conversation</a>
            </MobilePrimaryBlobWrap>

            {/* Mobile secondary CTA */}
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
          </CtaRow>
        </TextColumn>

        {/* Blob S — desktop right column */}
        <BlobDesktopWrap>
          <BlobDesktopImgWrap>
            <Image
              src="/assets/blob-s-hero.svg"
              alt="Stefanko.tech signature S"
              fill
              unoptimized
              style={{ objectFit: 'contain' }}
            />
          </BlobDesktopImgWrap>
        </BlobDesktopWrap>
      </HeroGrid>

      <ScrollHint>SCROLL TO SHAPE THE IDEA</ScrollHint>
    </Section>
  );
}
