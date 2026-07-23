'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { fonts } from '@/styles/tokens';

interface BlobButtonProps {
  children: React.ReactNode;
  href?: string;
  blobSrc: string;
  textColor?: string;
  width: number;
  height: number;
  fontSize?: number;
  className?: string;
}

const BlobAnchor = styled.a<{ $width: number; $height: number }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  cursor: pointer;
  text-decoration: none;
  flex-shrink: 0;

  span {
    position: relative;
    z-index: 1;
    font-family: ${fonts.body};
    font-weight: 600;
    text-align: center;
  }
`;

export function BlobButton({
  children,
  href,
  blobSrc,
  textColor = '#ffffff',
  width,
  height,
  fontSize = 15,
  className,
}: BlobButtonProps) {
  return (
    <BlobAnchor
      href={href ?? '#'}
      $width={width}
      $height={height}
      className={className}
    >
      <Image
        src={blobSrc}
        alt=""
        aria-hidden={true}
        fill
        unoptimized
        style={{ objectFit: 'fill', pointerEvents: 'none', userSelect: 'none' }}
      />
      <span style={{ color: textColor, fontSize }}>{children}</span>
    </BlobAnchor>
  );
}
