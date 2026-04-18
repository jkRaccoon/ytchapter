#!/usr/bin/env node
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

const ensureDir = (p) => mkdirSync(dirname(p), { recursive: true });

const OG_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7f1d1d"/>
      <stop offset="1" stop-color="#991b1b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fecaca"/>
      <stop offset="1" stop-color="#fef08a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(80, 90)">
    <rect x="0" y="0" width="90" height="90" rx="18" fill="url(#accent)"/>
    <path d="M32 25 L68 45 L32 65 Z" fill="#7f1d1d"/>
  </g>
  <text x="80" y="270" font-family="Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" font-size="68" font-weight="900" fill="#ffffff" letter-spacing="-2">유튜브 챕터 포매터</text>
  <text x="80" y="350" font-family="Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" font-size="60" font-weight="900" fill="url(#accent)" letter-spacing="-2">0:00 규칙 자동 검증</text>
  <text x="80" y="430" font-family="Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" font-size="26" font-weight="500" fill="#fecaca">자유 형식 → 유튜브 공식 챕터 규격 · 복붙 가능</text>
  <text x="80" y="475" font-family="Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" font-size="22" font-weight="500" fill="#fee2e2">0:00 시작 · 10초 간격 · 오름차순 · 3개 이상 · 콜론 형식</text>
  <text x="1120" y="580" text-anchor="end" font-family="Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" font-size="22" font-weight="500" fill="#fecaca">ytchapter.bal.pe.kr</text>
</svg>`;

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ef4444"/>
      <stop offset="1" stop-color="#b91c1c"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <path d="M22 18 L48 32 L22 46 Z" fill="white"/>
</svg>`;

ensureDir('public/og.png');
writeFileSync('public/favicon.svg', FAVICON_SVG);
console.log('✓ public/favicon.svg');
await sharp(Buffer.from(OG_SVG)).png().toFile('public/og.png');
console.log('✓ public/og.png');
await sharp(Buffer.from(FAVICON_SVG)).resize(512, 512).png().toFile('public/favicon.png');
console.log('✓ public/favicon.png');
