interface SEOProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: object;
}

const SITE = 'https://ytchapter.bal.pe.kr';

export default function SEO({ title, description, path, jsonLd }: SEOProps) {
  const url = `${SITE}${path}`;
  const fullTitle = path === '/' ? title : `${title} | 유튜브 챕터 타임스탬프 포매터`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:image" content={`${SITE}/og.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="유튜브 챕터 타임스탬프 포매터" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE}/og.png`} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
