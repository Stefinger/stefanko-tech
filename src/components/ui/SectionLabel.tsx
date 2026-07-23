'use client';
import styled from 'styled-components';
import { colors, fonts, media } from '@/styles/tokens';

const Label = styled.p`
  font-family: ${fonts.body};
  font-weight: 500;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 1.82px;
  color: ${colors.muted};
  white-space: pre-wrap;

  ${media.mobile} {
    font-size: 11px;
    line-height: 16px;
    letter-spacing: 1.54px;
  }
`;

interface SectionLabelProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function SectionLabel({ children, color, className }: SectionLabelProps) {
  return (
    <Label className={className} style={color ? { color } : undefined}>
      {children}
    </Label>
  );
}
