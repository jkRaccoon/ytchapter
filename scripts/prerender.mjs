#!/usr/bin/env node
import { createServer } from 'http';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import handler from 'serve-handler';
import puppeteer from 'puppeteer';

const DIST = 'dist';
const PORT = 4173;
const ROUTES = ['/', '/guide', '/faq'];

function startServer() {
  const server = createServer((req, res) => {
    handler(req, res, { public: DIST, rewrites: [{ source: '**', destination: '/index.html' }] });
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0' });
  try { await page.waitForSelector('h1', { timeout: 5000 }); } catch { console.warn(`! ${route}: h1 not found`); }
  const html = await page.content();
  await page.close();
  return html;
}

async function main() {
  const server = await startServer();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    for (const route of ROUTES) {
      process.stdout.write(`  prerendering ${route} ... `);
      const html = await prerenderRoute(browser, route);
      const outPath = route === '/' ? join(DIST, 'index.html') : join(DIST, route.slice(1), 'index.html');
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

main().catch((e) => { console.error(e); process.exit(1); });
