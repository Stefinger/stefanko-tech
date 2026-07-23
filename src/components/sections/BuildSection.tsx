'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

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

/* Figma: pink headline group (BUILT/TO BE REAL) — 53 px gap desktop, 26 px mobile */
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
    finalRotation: 10,
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
    finalRotation: 3,
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
    finalRotation: -4,
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

// Per-slab starting offsets for the flat→spread animation.
// Slabs converge from a tighter cluster toward their Phase 2 spread positions.
const slabDesktopFrom = [
  { x:  50, y: 40 },
  { x:   0, y: 22 },
  { x: -30, y: 32 },
] as const;
const slabMobileFrom = [
  { x:  24, y: 20 },
  { x:   0, y: 12 },
  { x: -14, y: 16 },
] as const;

export function BuildSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const assemblyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    const assembly = assemblyRef.current;
    if (!section || !assembly) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const label       = section.querySelector('[data-b-label]');
    const headlineEl  = section.querySelector('[data-b-headline]');
    const headlineLines = headlineEl ? headlineEl.querySelectorAll('span') : [];
    const pinkEl      = section.querySelector('[data-b-headline-pink]');
    const pinkLines   = pinkEl ? pinkEl.querySelectorAll('span') : [];
    const body        = section.querySelector('[data-b-body]');
    const slabEls     = Array.from(section.querySelectorAll('[data-b-slab]')) as HTMLElement[];
    const labelEls    = Array.from(section.querySelectorAll('[data-b-slab-label]')) as HTMLElement[];

    // ── Headline and copy entrance ────────────────────────────────────────────
    gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%' },
      defaults: { ease: 'power2.out' },
    })
      .from(label,         { opacity: 0, y: -10,                  duration: 0.45 })
      .from(headlineLines, { opacity: 0, y: isMobile ? 20 : 34,  duration: isMobile ? 0.5 : 0.65, stagger: 0.1  }, '-=0.25')
      .from(pinkLines,     { opacity: 0, y: isMobile ? 20 : 34,  duration: isMobile ? 0.5 : 0.65, stagger: 0.1  }, '-=0.2')
      .from(body,          { opacity: 0, y: isMobile ? 14 : 20,  duration: 0.5 }, '-=0.2');

    // ── Slab spread: flat stack → Phase 2 rotations + positions (scrub) ───────
    // Uses fromTo with explicit final rotation values so GSAP does not rely on
    // reading the CSS transform (avoids potential styled-components specificity issues).
    const fromValues = isMobile ? slabMobileFrom : slabDesktopFrom;

    const slabTl = gsap.timeline({
      scrollTrigger: {
        trigger: assembly,
        start: 'top 72%',
        end: isMobile ? '+=280' : '+=480',
        scrub: 1.2,
      },
    });

    slabEls.forEach((el, i) => {
      const from = fromValues[i] ?? { x: 0, y: 20 };
      slabTl.fromTo(
        el,
        { x: from.x, y: from.y, rotation: 0, transformOrigin: 'center center' },
        { x: 0,       y: 0,     rotation: slabs[i]?.finalRotation ?? 0, ease: 'power2.inOut', duration: 1 },
        i * 0.1,
      );
    });

    // ── Slab labels fade in with their slab ───────────────────────────────────
    gsap.from(labelEls, {
      opacity: 0,
      duration: 0.4,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: assembly,
        start: 'top 65%',
      },
    });
  }, { scope: sectionRef, dependencies: [reducedMotion] });

  return (
    <Section ref={sectionRef}>
      <div data-b-label="">
        <SectionLabel>{`05  /  BUILD`}</SectionLabel>
      </div>

      <ContentGrid>
        <TextColumn>
          <Headline data-b-headline="">
            <HeadlineLine>DESIGNED</HeadlineLine>
            <HeadlineLine>TO BE USED.</HeadlineLine>
          </Headline>
          <HeadlinePink data-b-headline-pink="">
            <HeadlineLinePink>BUILT</HeadlineLinePink>
            <HeadlineLinePink>TO BE REAL.</HeadlineLinePink>
          </HeadlinePink>

          <BodyText data-b-body="">
            The idea becomes an experience people can understand, use and test.
          </BodyText>
        </TextColumn>

        <AssemblyWrap ref={assemblyRef} aria-hidden="true">
          {slabs.map((slab, i) => (
            <Slab
              key={i}
              data-b-slab=""
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
              data-b-slab-label=""
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
