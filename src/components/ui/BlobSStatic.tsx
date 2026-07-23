'use client';
import styled from 'styled-components';

interface BlobSStaticProps {
  src: string;
  width: number;
  height: number;
  className?: string;
  alt?: string;
}

const BlobImage = styled.img<{ $width: number; $height: number }>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
  filter: drop-shadow(0px 28px 21px rgba(8, 46, 38, 0.42));
`;

export function BlobSStatic({ src, width, height, className, alt = '' }: BlobSStaticProps) {
  return (
    <BlobImage
      src={src}
      alt={alt}
      $width={width}
      $height={height}
      className={className}
    />
  );
}
