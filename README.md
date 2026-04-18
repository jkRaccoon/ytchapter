# YouTube Chapter Timestamp Formatter

Live: https://ytchapter.bal.pe.kr

Converts free-form timestamps (`1분30초`, `01:30`, `1:02:45`, `1m30s`, `90s`) to YouTube chapter format and validates the 5 official rules: starts at 0:00, minimum 10s gaps, at least 3 chapters, ascending order, colon-separated times.

## Development
```bash
npm install
npm run dev
```

## Deploy
Pushing to `main` triggers the shared OIDC GitHub Actions workflow which deploys via CDK.

## Stack
- Vite + React 19 + TypeScript + Tailwind
- Regex-based parser, no external API
- React Router 3 pages + puppeteer prerender
- AWS S3 + CloudFront + ACM + Route53 (`microsaas-infra` CDK Construct)
