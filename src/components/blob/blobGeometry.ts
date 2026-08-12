import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { BLOB_S_D } from '@/components/canvas/BlobSMesh';

const BLOB_SVG = `<svg viewBox="0 0 590 780" xmlns="http://www.w3.org/2000/svg"><path d="${BLOB_S_D}"/></svg>`;

export interface BlobGeometryOptions {
  bevelSegments?: number;
  curveSegments?: number;
}

/**
 * Builds the approved Blob S solid from the shared SVG path.
 *
 * Extracted so the desktop journey mesh and the mobile section-local meshes
 * are guaranteed to be the same object rather than two drifting copies. Only
 * the tessellation is tunable — depth, bevel thickness and bevel size are
 * fixed, because bevelSize is the one value that widens the XY face and would
 * pull the silhouette away from the approved outline.
 */
export function buildBlobGeometry(opts: BlobGeometryOptions = {}): THREE.BufferGeometry {
  const { bevelSegments = 7, curveSegments = 26 } = opts;
  try {
    const parsed = new SVGLoader().parse(BLOB_SVG);
    const shapes = parsed.paths.flatMap(p => p.toShapes());
    if (shapes.length === 0) return new THREE.BufferGeometry();

    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 80,
      bevelEnabled: true,
      bevelThickness: 42,
      bevelSize: 20,
      bevelSegments,
      curveSegments,
    });

    geo.scale(1, -1, 1);
    geo.computeBoundingBox();
    if (geo.boundingBox) {
      const c = new THREE.Vector3();
      geo.boundingBox.getCenter(c);
      geo.translate(-c.x, -c.y, -c.z);
    }
    geo.scale(0.01, 0.01, 0.01);
    return geo;
  } catch {
    return new THREE.BufferGeometry();
  }
}
