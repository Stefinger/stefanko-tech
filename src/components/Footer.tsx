'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

const FooterEl = styled.footer`
  background-color: ${colors.darkGreen};
  padding: 0 64px 48px;

  ${media.mobile} {
    padding: 0 24px 48px;
  }

  ${media.tablet} {
    padding: 0 40px 48px;
  }
`;

const FooterRule = styled.div`
  width: 100%;
  height: 1px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const FooterBlobSWrap = styled.div`
  position: relative;
  width: 26px;
  height: 26px;
  flex-shrink: 0;

  ${media.mobile} {
    width: 20px;
    height: 20px;
  }
`;

const FooterWordmark = styled.span`
  font-family: ${fonts.body};
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: ${colors.cream};

  ${media.mobile} {
    font-size: 14px;
    line-height: 20px;
  }
`;

const FooterTagline = styled.p`
  font-family: ${fonts.body};
  font-weight: 500;
  font-size: 13px;
  line-height: 18px;
  color: ${colors.muted};
  text-align: right;
  white-space: pre-wrap;

  ${media.mobile} {
    font-size: 10px;
    line-height: 14px;
    white-space: normal;
    text-align: right;
    max-width: 180px;
  }
`;

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    if (reducedMotion) return;

    const footer = footerRef.current;
    if (!footer) return;

    const rule     = footer.querySelector('[data-ft-rule]');
    const left     = footer.querySelector('[data-ft-left]');
    const tagline  = footer.querySelector('[data-ft-tagline]');

    // Footer elements fade in together as the footer enters the viewport.
    gsap.timeline({
      scrollTrigger: { trigger: footer, start: 'top 92%' },
      defaults: { ease: 'power2.out' },
    })
      .from(rule,    { opacity: 0, scaleX: 0, transformOrigin: 'left center', duration: 0.6 })
      .from(left,    { opacity: 0, y: 10, duration: 0.45 }, '-=0.2')
      .from(tagline, { opacity: 0, y: 10, duration: 0.45 }, '<0.1');
  }, { scope: footerRef, dependencies: [reducedMotion] });

  return (
    <FooterEl ref={footerRef}>
      <FooterRule data-ft-rule="">
        <Image
          src="/assets/footer-rule.svg"
          alt=""
          aria-hidden={true}
          width={1312}
          height={1}
          unoptimized
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </FooterRule>
      <FooterRow>
        <FooterLeft data-ft-left="">
          <FooterBlobSWrap>
            <Image
              src="/assets/blob-s-footer-logo.svg"
              alt="Stefanko.tech"
              fill
              unoptimized
              style={{ objectFit: 'contain' }}
            />
          </FooterBlobSWrap>
          <FooterWordmark>stefanko.tech</FooterWordmark>
        </FooterLeft>
        <FooterTagline data-ft-tagline="">{`FROM IDEA TO PRODUCT.  /  BUILD IN PUBLIC.`}</FooterTagline>
      </FooterRow>
    </FooterEl>
  );
}
