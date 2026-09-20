/**
 * Exact signed-distance texture of the Blob S for the Open Graph export.
 *
 * The live hero samples public/assets/logo-distance.png (768×768): the brand outline
 * (public/assets/blob-s-footer-logo.svg, viewBox 17.7709×23.8251) scaled to two thirds of the
 * texture height, centred, with the signed Euclidean distance in texels encoded as
 * D = 0.5 + dist / 204.8 in a 16-bit RG pair. That file was rasterised from a bitmap, so its
 * gradient wobbles by ~±15 % along the contour — the source of the faint radial streaks on the
 * hero and of the facets a magnified still shows.
 *
 * This module rebuilds the same field analytically from the SVG path at any resolution:
 * distance to the flattened outline (exact within a hair of the edge, Euclidean transform
 * elsewhere), sign by scan-line parity, identical mapping and encoding. `verifyAgainstLive`
 * proves the shape is the one on the site by comparing the analytic field with the live texture.
 */
import { readFileSync } from 'node:fs';
import { deflateSync, inflateSync } from 'node:zlib';

export const LIVE_SIZE = 768;
const ENCODE_TEXELS = 204.8;          // D = 0.5 + dist(768-texels) / 204.8, saturating at ±102.4 texels
const VIEWBOX = [17.7709, 23.8251];
const HEIGHT_FRACTION = 2 / 3;         // the outline's height relative to the texture

export function outlineFromSvg(svgSource) {
  const d = svgSource.match(/ d="([^"]+)"/)[1];
  const tokens = d.match(/[MCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  let i = 0, cur = [0, 0], start = [0, 0]; const curves = [];
  while (i < tokens.length) {
    const t = tokens[i++];
    if (t === 'M') { cur = [+tokens[i++], +tokens[i++]]; start = cur; }
    else if (t === 'C') { const p1 = [+tokens[i++], +tokens[i++]], p2 = [+tokens[i++], +tokens[i++]], p3 = [+tokens[i++], +tokens[i++]]; curves.push([cur, p1, p2, p3]); cur = p3; }
    else if (t === 'Z') { if (cur[0] !== start[0] || cur[1] !== start[1]) curves.push([cur, cur, start, start]); cur = start; }
    else throw new Error(`distance-texture: unsupported path command ${t}`);
  }
  return curves;
}

/* Flatten the closed outline into texel-space points, at most `spacing` texels apart. */
function flatten(curves, size, spacing = 0.5) {
  const scale = size * HEIGHT_FRACTION / VIEWBOX[1];
  const tx = (size - VIEWBOX[0] * scale) / 2, ty = (size - VIEWBOX[1] * scale) / 2;
  const pts = [];
  for (const [p0, p1, p2, p3] of curves) {
    const approx = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
    const steps = Math.max(8, Math.ceil(approx * scale / spacing));
    for (let k = 0; k < steps; k++) {
      const t = k / steps, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
      pts.push([(a * p0[0] + b * p1[0] + c * p2[0] + e * p3[0]) * scale + tx, (a * p0[1] + b * p1[1] + c * p2[1] + e * p3[1]) * scale + ty]);
    }
  }
  return pts;
}

/* 1-D squared Euclidean distance transform (Felzenszwalb & Huttenlocher) that also returns the arg-min. */
function edt1d(f, n, out, src) {
  const v = new Int32Array(n), z = new Float64Array(n + 1); let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s;
    for (;;) { const p = v[k]; s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p); if (s <= z[k] && k > 0) k--; else break; }
    if (s <= z[k] && k === 0) { v[0] = q; z[0] = -Infinity; z[1] = Infinity; continue; }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; out[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; src[q] = v[k]; }
}

export function signedDistanceField(curves, size) {
  const pts = flatten(curves, size);
  const n = pts.length;
  // Boundary texels and the segments that pass through them.
  const segsAt = new Map();
  const mark = (x, y, k) => { const key = (y | 0) * size + (x | 0); let list = segsAt.get(key); if (!list) segsAt.set(key, list = []); if (list[list.length - 1] !== k) list.push(k); };
  for (let k = 0; k < n; k++) {
    const a = pts[k], b = pts[(k + 1) % n]; const len = Math.hypot(b[0] - a[0], b[1] - a[1]); const steps = Math.max(1, Math.ceil(len / 0.25));
    for (let s = 0; s <= steps; s++) { const t = s / steps; const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; if (x >= 0 && y >= 0 && x < size && y < size) mark(x, y, k); }
  }
  // Euclidean distance transform to the nearest boundary texel, remembering which one.
  const INF = 1e12, g = new Float64Array(size * size), srcY = new Int32Array(size * size);
  const f = new Float64Array(size), o = new Float64Array(size), s1 = new Int32Array(size);
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) f[y] = segsAt.has(y * size + x) ? 0 : INF;
    edt1d(f, size, o, s1);
    for (let y = 0; y < size; y++) { g[y * size + x] = o[y]; srcY[y * size + x] = s1[y]; }
  }
  const dist = new Float32Array(size * size);
  const segDist = (px, py, k) => { const a = pts[k], b = pts[(k + 1) % n]; const vx = b[0] - a[0], vy = b[1] - a[1], wx = px - a[0], wy = py - a[1]; const t = Math.max(0, Math.min(1, (vx * wx + vy * wy) / (vx * vx + vy * vy || 1))); return Math.hypot(a[0] + vx * t - px, a[1] + vy * t - py); };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) f[x] = g[y * size + x];
    edt1d(f, size, o, s1);
    for (let x = 0; x < size; x++) {
      const bx = s1[x], by = srcY[y * size + bx];            // nearest boundary texel
      const px = x + .5, py = y + .5; let best = Infinity;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {   // exact distance to the segments around it
        const list = segsAt.get((by + dy) * size + bx + dx); if (!list) continue;
        for (const k of list) { const dd = segDist(px, py, k); if (dd < best) best = dd; }
      }
      dist[y * size + x] = best;
    }
  }
  // Sign: scan-line parity of the closed outline at texel centres.
  for (let y = 0; y < size; y++) {
    const yc = y + .5, xs = [];
    for (let k = 0; k < n; k++) { const a = pts[k], b = pts[(k + 1) % n]; if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
    xs.sort((p, q) => p - q);
    for (let j = 0; j + 1 < xs.length; j += 2) for (let x = Math.max(0, Math.ceil(xs[j] - .5)); x + .5 < xs[j + 1] && x < size; x++) dist[y * size + x] = -dist[y * size + x];
  }
  return dist;
}

/* Encode the field the way the live texture is encoded: 16-bit D in the R (high) and G (low) bytes. */
export function encodeDistancePng(dist, size) {
  const px = Buffer.alloc(size * size * 4);
  const texelScale = LIVE_SIZE / size;                    // distances are encoded in 768-texel units
  for (let i = 0; i < size * size; i++) {
    const D = Math.min(1, Math.max(0, .5 + dist[i] * texelScale / ENCODE_TEXELS));
    const v = Math.round(D * 65535);
    px[i * 4] = v >> 8; px[i * 4 + 1] = v & 255; px[i * 4 + 2] = 0; px[i * 4 + 3] = 255;
  }
  return encodePng(px, size, size, 4);
}

export function decodeDistancePng(buf) {
  const { width, data } = decodePng(buf);
  const D = new Float32Array(width * width);
  for (let i = 0; i < width * width; i++) D[i] = (data[i * 4] * 256 + data[i * 4 + 1]) / 65535;
  return { size: width, D };
}

/* Compare the analytic field (rendered at the live size) with the live texture near the contour. */
export function verifyAgainstLive(curves, livePngBuffer) {
  const { size, D } = decodeDistancePng(livePngBuffer);
  const dist = signedDistanceField(curves, size);
  let sum = 0, worst = 0, count = 0;
  for (let i = 0; i < size * size; i++) {
    if (Math.abs(D[i] - .5) > .1) continue;                 // within ±20 texels of the edge
    const diff = (D[i] - .5) * ENCODE_TEXELS - dist[i];     // texels
    sum += diff * diff; count++; if (Math.abs(diff) > worst) worst = Math.abs(diff);
  }
  return { size, samples: count, rmsTexels: Math.sqrt(sum / count), worstTexels: worst };
}

/* ---- minimal PNG codec: 8-bit RGB/RGBA, non-interlaced ---- */
export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8, width = 0, height = 0, channels = 0; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[12] !== 0 || ![2, 6].includes(data[9])) throw new Error('unsupported PNG layout');
      channels = data[9] === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), stride = width * channels, out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[dst + x - channels] : 0, b = y > 0 ? out[dst - stride + x] : 0, c = x >= channels && y > 0 ? out[dst - stride + x - channels] : 0;
      let pred = 0;
      if (filter === 1) pred = a; else if (filter === 2) pred = b; else if (filter === 3) pred = (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[dst + x] = (raw[src + x] + pred) & 255;
    }
  }
  return { width, height, channels, data: out };
}

export function encodePng(data, width, height, channels) {
  const crcTable = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = b => { let c = -1; for (const byte of b) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (type, body) => { const t = Buffer.from(type, 'ascii'), len = Buffer.alloc(4), sum = Buffer.alloc(4); len.writeUInt32BE(body.length); sum.writeUInt32BE(crc(Buffer.concat([t, body]))); return Buffer.concat([len, t, body, sum]); };
  const stride = width * channels, raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride); // filter 0 on every row
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = channels === 4 ? 6 : 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
