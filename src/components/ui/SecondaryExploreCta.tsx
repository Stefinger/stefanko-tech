'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts } from '@/styles/tokens';

/**
 * Shared organic-border secondary CTA used in Hero and Final CTA sections.
 * Uses the light variant of the explore-work blob (for dark green backgrounds).
 *
 * Includes the -40 px left overlap via margin-left so the blob visually
 * nests against the primary button. Apply margin-left: 0 when used standalone.
 */

const Wrap = styled.div`
  position: relative;
  width: 291px;
  height: 77px;
  margin-left: -40px;
  display: inline-flex;
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
    text-decoration: none;
  }
`;

interface SecondaryExploreCta {
  href: string;
  onClick?: () => void;
  className?: string;
}

export function SecondaryExploreCta({ href, onClick, className }: SecondaryExploreCta) {
  return (
    <Wrap className={className}>
      <Image
        src="/assets/cta-explore-work-light.svg"
        alt=""
        aria-hidden={true}
        fill
        unoptimized
        style={{ objectFit: 'fill', pointerEvents: 'none' }}
      />
      <a href={href} onClick={onClick}>
        Explore selected work&nbsp;↗
      </a>
    </Wrap>
  );
}
