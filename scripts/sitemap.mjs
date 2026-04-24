#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { join } from 'path';

const HOST = process.env.SITE_HOST || 'https://ytchapter.bal.pe.kr';
const DIST = 'dist';

const BASE_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/guide', priority: '0.9', changefreq: 'monthly' },
  { path: '/faq', priority: '0.8', changefreq: 'monthly' },
];

const today = new Date().toISOString().slice(0, 10);

function enPath(path) {
  return path === '/' ? '/en' : `/en${path}`;
}

function urlBlock({ path, priority, changefreq }) {
  const koLoc = `${HOST}${path}`;
  const enLoc = `${HOST}${enPath(path)}`;
  return [
    [
      '  <url>',
      `    <loc>${koLoc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      `    <xhtml:link rel="alternate" hreflang="ko" href="${koLoc}" />`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${koLoc}" />`,
      '  </url>',
    ].join('\n'),
    [
      '  <url>',
      `    <loc>${enLoc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      `    <xhtml:link rel="alternate" hreflang="ko" href="${koLoc}" />`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${koLoc}" />`,
      '  </url>',
    ].join('\n'),
  ].join('\n');
}

const body = BASE_ROUTES.map(urlBlock).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;

writeFileSync(join(DIST, 'sitemap.xml'), xml);
console.log(`✓ sitemap.xml written (${BASE_ROUTES.length * 2} urls)`);
