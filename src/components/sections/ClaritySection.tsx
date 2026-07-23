'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';

const Section = styled.section`
  background-color: ${colors.darkGreen};
  position: relative;
  overflow: hidden;
  min-height: 1183px;
  padding-top: 68px;
  padding-left: 64px;
  padding-right: 64px;
  padding-bottom: 68px;

  ${media.mobile} {
    min-height: 1250px;
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

const LabelWrap = styled.div`
  margin-bottom: 0;
`;

/* Two-column grid — Figma: 560 px text left, 1fr blob right. */
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

const TextColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const Headline = styled.h2`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
  /* 104 px margin matches the Figma gap from label bottom (86 px from section top) to
     headline top (190 px from section top): 190 – 86 = 104 px. */
  margin-top: 104px;

  ${media.mobile} {
    margin-top: 64px;
  }

  ${media.tablet} {
    margin-top: 80px;
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
    font-size: clamp(70px, 8vw, 100px);
    line-height: 1.05;
  }
`;

const BodyText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 21px;
  line-height: 33px;
  color: ${colors.creamBody};
  /* Figma gap from headline bottom (562) to body top (650): 88 px. */
  margin-top: 88px;
  max-width: 520px;

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

/* Statement headline lives in the BLOB (right) column per Figma desktop frame.
   On mobile it flows naturally after the blob since BlobColumn comes after TextColumn. */
const StatementHeadline = styled.h3`
  font-family: ${fonts.display};
  font-weight: 400;
  font-style: normal;
  color: ${colors.cream};
  font-size: 54px;
  line-height: 60px;
  /* Figma: blob bottom ≈ section-y 806, statement at 980 → gap 174 px. */
  margin-top: 174px;
  max-width: 600px;

  ${media.mobile} {
    font-size: 34px;
    line-height: 40px;
    margin-top: 60px;
    max-width: 100%;
  }

  ${media.tablet} {
    font-size: 40px;
    line-height: 46px;
    margin-top: 100px;
  }
`;

const StatementLine = styled.span`
  display: block;
`;

/* InteractionNote is a direct child of Section (not ContentGrid) so it appears after
   BlobColumn on mobile flex-column — matching Figma mobile order.
   On desktop it is absolutely positioned to land at section-y 968 in the left column. */
const InteractionNote = styled.div`
  position: absolute;
  left: 70px;
  top: 968px;
  width: 420px;
  height: 147px;

  .note-content {
    position: relative;
    z-index: 1;
    padding: 42px 40px;
  }

  ${media.mobile} {
    position: static;
    width: 100%;
    height: 162px;
    margin-top: 47px;
  }

  ${media.tablet} {
    left: 40px;
    width: 380px;
  }
`;

/* Desktop: "INTERACTION" / cursor message. Mobile: "MOBILE INTERACTION" / scroll message. */
const InteractionLabel = styled.p`
  font-family: ${fonts.body};
  font-weight: 700;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 0.5px;
  color: #33d966;
  text-transform: uppercase;
  margin-bottom: 8px;

  ${media.mobile} {
    color: ${colors.lime};
    font-size: 10px;
  }
`;

const InteractionText = styled.p`
  font-family: ${fonts.body};
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #bfd1c7;

  ${media.mobile} {
    color: ${colors.creamBody};
  }
`;

/* Text variants visible only on their respective breakpoints */
const DesktopOnly = styled.span`
  ${media.mobile} { display: none; }
`;

const MobileOnly = styled.span`
  display: none;
  ${media.mobile} { display: inline; }
`;

/* Blob S column — BlobSImg at 44 px from column left to match Figma frame position. */
const BlobColumn = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 60px;
  padding-left: 44px;

  ${media.mobile} {
    padding-top: 32px;
    padding-left: 0;
    align-items: center;
  }

  ${media.tablet} {
    padding-top: 40px;
    padding-left: 0;
    align-items: center;
  }
`;

/* Figma 19:3: Blob S clarity at 500×660 px. Tablet: 380×502 px (same ratio). */
const BlobSImgWrap = styled.div`
  position: relative;
  width: 500px;
  height: 660px;
  flex-shrink: 0;
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));

  ${media.mobile} {
    width: 240px;
    height: 317px;
  }

  ${media.tablet} {
    width: 380px;
    height: 502px;
  }
`;

/* Discipline labels — absolutely positioned relative to the Section so coordinates
   match the Figma frame exactly at 1440 px (desktop) and 390 px (mobile).
   Tablet uses desktop values (some may clip at narrower widths — acceptable per spec). */
interface DisciplineLabelProps {
  $desktopLeft: string;
  $desktopTop: string;
  $mobileLeft: string;
  $mobileTop: string;
  $color?: string;
}

const DisciplineLabel = styled.p<DisciplineLabelProps>`
  position: absolute;
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 1.82px;
  color: ${({ $color }) => $color ?? colors.cream};
  white-space: nowrap;
  pointer-events: none;

  left: ${({ $desktopLeft }) => $desktopLeft};
  top: ${({ $desktopTop }) => $desktopTop};

  ${media.mobile} {
    font-size: 10px;
    line-height: 14px;
    letter-spacing: 1.2px;
    left: ${({ $mobileLeft }) => $mobileLeft};
    top: ${({ $mobileTop }) => $mobileTop};
  }
`;

const DisciplineLabelsArea = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

/* Exact Figma coordinates — desktop from frame 19:3, mobile from frame 113:3 (via 135:4). */
const disciplineLabels = [
  {
    text: 'PRODUCT THINKING',
    color: colors.cream,
    desktopLeft: '675px',
    desktopTop: '180px',
    mobileLeft: '24px',
    mobileTop: '455px',
  },
  {
    text: 'RESEARCH',
    color: colors.muted,
    desktopLeft: '1120px',
    desktopTop: '290px',
    mobileLeft: '258px',
    mobileTop: '500px',
  },
  {
    text: 'AI',
    color: colors.pink,
    desktopLeft: '1195px',
    desktopTop: '525px',
    mobileLeft: '300px',
    mobileTop: '610px',
  },
  {
    text: 'UX',
    color: colors.cream,
    desktopLeft: '1030px',
    desktopTop: '760px',
    mobileLeft: '274px',
    mobileTop: '780px',
  },
  {
    text: 'DESIGN',
    color: colors.muted,
    desktopLeft: '650px',
    desktopTop: '850px',
    mobileLeft: '24px',
    mobileTop: '805px',
  },
  {
    text: 'TECHNOLOGY',
    color: colors.cream,
    desktopLeft: '470px',
    desktopTop: '680px',
    mobileLeft: '24px',
    mobileTop: '670px',
  },
  {
    text: 'BUSINESS',
    color: colors.lime,
    desktopLeft: '470px',
    desktopTop: '400px',
    mobileLeft: '24px',
    mobileTop: '555px',
  },
];

export function ClaritySection() {
  return (
    <Section>
      <LabelWrap>
        <SectionLabel>{`03  /  CLARITY BEFORE COMPLEXITY`}</SectionLabel>
      </LabelWrap>

      <ContentGrid>
        {/* Left column — headline and body only. InteractionNote is Section-level below. */}
        <TextColumn>
          <Headline>
            <HeadlineLine>CLARITY</HeadlineLine>
            <HeadlineLine>BEFORE</HeadlineLine>
            <HeadlineLine>COMPLEXITY.</HeadlineLine>
          </Headline>

          <BodyText>
            Find the real problem. Remove what does not matter.
            <br />
            Then connect every discipline around one clear direction.
          </BodyText>
        </TextColumn>

        {/* Right column — Blob S + statement headline (matches Figma right-column placement). */}
        <BlobColumn>
          <BlobSImgWrap>
            <Image
              src="/assets/blob-s-clarity.svg"
              alt="Stefanko.tech S — clarity"
              fill
              unoptimized
              style={{ objectFit: 'contain' }}
            />
          </BlobSImgWrap>

          <StatementHeadline>
            <StatementLine>I DON&apos;T JUST WRITE CODE.</StatementLine>
            <StatementLine>I CONNECT THE PIECES.</StatementLine>
          </StatementHeadline>
        </BlobColumn>
      </ContentGrid>

      {/* InteractionNote — absolute on desktop (left-column area at Figma y=968),
          static on mobile after BlobColumn in the flex-column flow. */}
      <InteractionNote>
        <Image
          src="/assets/interaction-note-border.svg"
          alt=""
          aria-hidden={true}
          fill
          unoptimized
          style={{ objectFit: 'fill', pointerEvents: 'none' }}
        />
        <div className="note-content">
          <InteractionLabel>
            <DesktopOnly>INTERACTION</DesktopOnly>
            <MobileOnly>MOBILE INTERACTION</MobileOnly>
          </InteractionLabel>
          <InteractionText>
            <DesktopOnly>3D Blob S tilts and reacts toward the cursor.</DesktopOnly>
            <MobileOnly>Blob S reacts to scroll progress. No hover or device orientation dependency.</MobileOnly>
          </InteractionText>
        </div>
      </InteractionNote>

      {/* Discipline labels — exact Figma positions relative to section */}
      <DisciplineLabelsArea aria-hidden="true">
        {disciplineLabels.map((label) => (
          <DisciplineLabel
            key={label.text}
            $desktopLeft={label.desktopLeft}
            $desktopTop={label.desktopTop}
            $mobileLeft={label.mobileLeft}
            $mobileTop={label.mobileTop}
            $color={label.color}
          >
            {label.text}
          </DisciplineLabel>
        ))}
      </DisciplineLabelsArea>
    </Section>
  );
}
