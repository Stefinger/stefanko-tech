'use client';
import styled from 'styled-components';
import { BLOB_S_D } from '@/components/canvas/BlobSMesh';

/** Flat approved Blob S silhouette — used wherever WebGL is not running. */
const Svg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

export function BlobStaticSvg() {
  return (
    <Svg viewBox="0 0 590 780" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path d={BLOB_S_D} fill="#FF6FAE" />
    </Svg>
  );
}
