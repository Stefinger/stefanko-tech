'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { BlobButton } from '@/components/ui/BlobButton';

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
   right = 1440 - 960 - 461 = 19 px from section right edge.
   Mobile 113:3: left:205, top:385, width:166, height:181 (appears after body text in flow) */
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
  return (
    <Section id="contact">
      <SectionLabel>{`07  /  THE NEXT IDEA`}</SectionLabel>

      <Headline>
        <HeadlineLine>HAVE AN IDEA</HeadlineLine>
        <HeadlineLine>WORTH BUILDING?</HeadlineLine>
      </Headline>

      <BodyText>
        Bring the idea, problem or opportunity.
        <DesktopBr />
        Let&apos;s find out what product should exist.
      </BodyText>

      {/* Blob S — desktop: absolute (position ignores DOM order), mobile: inline after body text */}
      <BlobSFinalWrap aria-hidden="true">
        <Image
          src="/assets/blob-s-final.svg"
          alt=""
          fill
          unoptimized
          style={{ objectFit: 'contain' }}
        />
      </BlobSFinalWrap>

      <CtaBlock>
        {/* Desktop CTAs */}
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
          <a href="mailto:jan@stefanko.tech">Start a conversation</a>
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
      </CtaBlock>
    </Section>
  );
}
