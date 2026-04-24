#!/usr/bin/env node
import { createServer } from 'http';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import handler from 'serve-handler';
import puppeteer from 'puppeteer';

const DIST = 'dist';
const PORT = Number(process.env.PRERENDER_PORT) || 4173;

const BASE_ROUTES = [
  '/',
  '/guide',
  '/faq',
];

const LANGS = ['ko', 'en'];

const ROUTES = LANGS.flatMap((lang) =>
  BASE_ROUTES.map((r) =>
    lang === 'ko' ? r : r === '/' ? '/en' : `/en${r}`,
  ),
);

function startServer() {
  const server = createServer((req, res) => {
    handler(req, res, {
      public: DIST,
      rewrites: [{ source: '**', destination: '/index.html' }],
    });
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0' });

  try {
    await page.waitForSelector('h1', { timeout: 5000 });
  } catch {
    console.warn(`! ${route}: h1 not found within 5s (continuing)`);
  }

  await page.evaluate(() => {
    const keepLast = (sel) => {
      const n = document.querySelectorAll(sel);
      for (let i = 0; i < n.length - 1; i++) n[i].remove();
    };
    keepLast('title');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
    keepLast('meta[name="description"]');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
    keepLast('link[rel="canonical"]');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
    keepLast('meta[property="og:url"]');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
    keepLast('meta[property="og:title"]');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
    keepLast('meta[property="og:description"]');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
    keepLast('meta[property="og:image"]');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
    keepLast('meta[name="twitter:title"]');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
    keepLast('meta[name="twitter:description"]');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
    keepLast('meta[name="twitter:image"]');
  keepLast('meta[name="robots"]');
  keepLast('meta[property="og:image:alt"]');
  keepLast('meta[name="twitter:image:alt"]');
  });
  const html = await page.content();
  await page.close();
  return html;
}

function outPathFor(route) {
  if (route === '/') return join(DIST, 'index.html');
  if (route === '/en') return join(DIST, 'en', 'index.html');
  return join(DIST, route.slice(1), 'index.html');
}

async function main() {
  console.log('→ start static server');
  const server = await startServer();

  console.log('→ launch puppeteer');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of ROUTES) {
      process.stdout.write(`  prerendering ${route} ... `);
      const html = await prerenderRoute(browser, route);
      const outPath = outPathFor(route);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html);
      console.log('✓');
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log('✓ prerender done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
