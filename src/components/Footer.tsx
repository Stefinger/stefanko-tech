'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';

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
  return (
    <FooterEl>
      <FooterRule>
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
        <FooterLeft>
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
        <FooterTagline>{`FROM IDEA TO PRODUCT.  /  BUILD IN PUBLIC.`}</FooterTagline>
      </FooterRow>
    </FooterEl>
  );
}
