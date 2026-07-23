'use client';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';

const Section = styled.section`
  background-color: ${colors.darkGreenAlt};
  position: relative;
  overflow: hidden;
  min-height: 1333px;
  padding-top: 72px;
  padding-left: 64px;
  padding-right: 64px;
  padding-bottom: 80px;

  ${media.mobile} {
    min-height: 1120px;
    padding-top: 48px;
    padding-left: 24px;
    padding-right: 24px;
    padding-bottom: 60px;
  }

  ${media.tablet} {
    padding-left: 40px;
    padding-right: 40px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 560px 1fr;
  column-gap: 32px;
  align-items: start;

  ${media.mobile} {
    display: flex;
    flex-direction: column;
  }

  ${media.tablet} {
    grid-template-columns: 1fr 1fr;
  }
`;

/* position: relative + z-index: 1 ensures the text column paints above the rotated
   slabs in the right column, which have negative left offsets that overlap this column. */
const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

/* Figma: white headline group (DESIGNED/TO BE USED) at section-y 180 */
const Headline = styled.h2`
  margin-top: 108px;

  ${media.mobile} {
    margin-top: 62px;
  }

  ${media.tablet} {
    margin-top: 60px;
  }
`;

/* Figma: pink headline group (BUILT/TO BE REAL) starts 53 px below white group bottom
   Desktop: white ends at 180+2×128=436, pink starts at 489 → gap 53 px
   Mobile:  white ends at 110+2×62=234,  pink starts at 260 → gap 26 px */
const HeadlinePink = styled.h2`
  margin-top: 53px;

  ${media.mobile} {
    margin-top: 26px;
  }

  ${media.tablet} {
    margin-top: 36px;
  }
`;

const HeadlineLine = styled.span`
  display: block;
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  font-size: 124px;
  line-height: 128px;
  color: ${colors.cream};

  ${media.mobile} {
    font-size: 58px;
    line-height: 62px;
  }

  ${media.tablet} {
    font-size: clamp(64px, 8vw, 104px);
    line-height: 1.04;
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

  ${media.mobile} {
    font-size: 17px;
    line-height: 27px;
    margin-top: 32px;
    max-width: 100%;
  }
`;

/* Assembly slabs — three overlapping rotated panels */
const AssemblyWrap = styled.div`
  position: relative;
  height: 1020px;
  margin-top: 0;

  ${media.mobile} {
    height: 480px;
    margin-top: 48px;
  }

  ${media.tablet} {
    height: 700px;
  }
`;

interface SlabProps {
  $bg: string;
  $rotation: string;
  $desktopLeft: string;
  $desktopTop: string;
  $mobileLeft: string;
  $mobileTop: string;
}

const Slab = styled.div<SlabProps>`
  position: absolute;
  background-color: ${({ $bg }) => $bg};
  border-radius: 40px;
  box-shadow: 0px 24px 38px 0px rgba(8, 46, 38, 0.3);
  transform: rotate(${({ $rotation }) => $rotation});
  width: 560px;
  height: 820px;
  left: ${({ $desktopLeft }) => $desktopLeft};
  top: ${({ $desktopTop }) => $desktopTop};

  ${media.mobile} {
    border-radius: 19px;
    width: 263px;
    height: 385px;
    left: ${({ $mobileLeft }) => $mobileLeft};
    top: ${({ $mobileTop }) => $mobileTop};
    box-shadow: 0px 11px 18px 0px rgba(8, 46, 38, 0.3);
  }

  ${media.tablet} {
    width: 380px;
    height: 560px;
  }
`;

interface SlabLabelProps {
  $rotation: string;
  $desktopLeft: string;
  $desktopTop: string;
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
  transform: rotate(${({ $rotation }) => $rotation});
  left: ${({ $desktopLeft }) => $desktopLeft};
  top: ${({ $desktopTop }) => $desktopTop};
  pointer-events: none;

  ${media.mobile} {
    left: ${({ $mobileLeft }) => $mobileLeft};
    top: ${({ $mobileTop }) => $mobileTop};
    font-size: 8px;
    letter-spacing: 1.2px;
  }
`;

const slabs = [
  {
    bg: colors.darkGreen,
    rotation: '10deg',
    desktopLeft: '-122px',
    desktopTop: '55px',
    mobileLeft: '-58px',
    mobileTop: '26px',
    labelText: 'PROBLEM',
    labelColor: colors.cream,
    labelRotation: '10deg',
    labelDesktopLeft: '52px',
    labelDesktopTop: '89px',
    labelMobileLeft: '25px',
    labelMobileTop: '42px',
  },
  {
    bg: colors.cream,
    rotation: '3deg',
    desktopLeft: '5px',
    desktopTop: '135px',
    mobileLeft: '2px',
    mobileTop: '63px',
    labelText: 'EXPERIENCE',
    labelColor: colors.darkGreen,
    labelRotation: '3deg',
    labelDesktopLeft: '81px',
    labelDesktopTop: '169px',
    labelMobileLeft: '38px',
    labelMobileTop: '79px',
  },
  {
    bg: colors.pink,
    rotation: '-4deg',
    desktopLeft: '76px',
    desktopTop: '176px',
    mobileLeft: '36px',
    mobileTop: '83px',
    labelText: 'PRODUCT',
    labelColor: colors.cream,
    labelRotation: '-4deg',
    labelDesktopLeft: '110px',
    labelDesktopTop: '215px',
    labelMobileLeft: '52px',
    labelMobileTop: '101px',
  },
];

export function BuildSection() {
  return (
    <Section>
      <SectionLabel>{`05  /  BUILD`}</SectionLabel>

      <ContentGrid>
        <TextColumn>
          <Headline>
            <HeadlineLine>DESIGNED</HeadlineLine>
            <HeadlineLine>TO BE USED.</HeadlineLine>
          </Headline>
          <HeadlinePink>
            <HeadlineLinePink>BUILT</HeadlineLinePink>
            <HeadlineLinePink>TO BE REAL.</HeadlineLinePink>
          </HeadlinePink>

          <BodyText>
            The idea becomes an experience people can understand, use and test.
          </BodyText>
        </TextColumn>

        <AssemblyWrap aria-hidden="true">
          {slabs.map((slab, i) => (
            <Slab
              key={i}
              $bg={slab.bg}
              $rotation={slab.rotation}
              $desktopLeft={slab.desktopLeft}
              $desktopTop={slab.desktopTop}
              $mobileLeft={slab.mobileLeft}
              $mobileTop={slab.mobileTop}
            />
          ))}
          {slabs.map((slab, i) => (
            <SlabLabel
              key={`label-${i}`}
              $rotation={slab.labelRotation}
              $desktopLeft={slab.labelDesktopLeft}
              $desktopTop={slab.labelDesktopTop}
              $mobileLeft={slab.labelMobileLeft}
              $mobileTop={slab.labelMobileTop}
              $color={slab.labelColor}
            >
              {slab.labelText}
            </SlabLabel>
          ))}
        </AssemblyWrap>
      </ContentGrid>
    </Section>
  );
}
