import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { track } from '../lib/track';
import { formatText } from '../lib/chapter';
import { detectLangFromPath, withLangPrefix } from '../i18n';

const STORAGE = 'ytchapter-input';
const EXAMPLE = `0:00 인트로
1:30 본론 시작
3:45 중반부 정리
5분 10초 핵심 포인트
9:00 마무리 및 Q&A`;

export default function Home() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = detectLangFromPath(location.pathname);
  const p = (path: string) => withLangPrefix(path, lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('home.h1'),
    url: 'https://ytchapter.bal.pe.kr/',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    inLanguage: lang === 'ko' ? 'ko-KR' : 'en-US',
    description: t('home.description'),
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  };

  const [text, setText] = useState<string>(() => {
    if (typeof window === 'undefined') return EXAMPLE;
    return localStorage.getItem(STORAGE) ?? EXAMPLE;
  });

  const result = useMemo(() => formatText(text), [text]);

  const persist = useCallback((v: string) => {
    setText(v);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE, v);
  }, []);

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    track('chapter_copy');
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt(t('home.copyBtn'), result.output);
    }
  };

  return (
    <>
      <SEO
        titleKey="home.title"
        descriptionKey="home.description"
        path="/"
        jsonLd={jsonLd}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{t('home.h1')}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {t('home.lead')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{t('home.inputLabel')}</h2>
          <textarea
            rows={14}
            value={text}
            onChange={(e) => persist(e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-sm focus:border-red-500 focus:outline-none"
            placeholder={EXAMPLE}
          />
          <p className="mt-2 text-xs text-slate-500">
            {t('home.supportedFormats')}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">{t('home.outputLabel')}</h2>
            <button
              onClick={copy}
              disabled={!result.output}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
            >
              {copied ? t('home.copiedBtn') : t('home.copyBtn')}
            </button>
          </div>
          <pre className="mt-2 min-h-[320px] whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900">
{result.output || t('home.noValidChapters')}
          </pre>

          <div className={`mt-3 rounded-md p-3 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
            {result.ok ? (
              <p>{t('home.passAll')}</p>
            ) : (
              <>
                <p className="font-semibold">{t('home.violationTitle')}</p>
                <ul className="mt-1 list-disc pl-5">
                  {result.rulesViolated.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">{t('home.parseResultLabel')}</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="pb-2">{t('home.colNum')}</th>
              <th className="pb-2">{t('home.colRaw')}</th>
              <th className="pb-2">{t('home.colTime')}</th>
              <th className="pb-2">{t('home.colTitle')}</th>
              <th className="pb-2">{t('home.colError')}</th>
            </tr>
          </thead>
          <tbody>
            {result.chapters.map((c) => (
              <tr key={c.index} className="border-t border-slate-100">
                <td className="py-2 text-slate-500">{c.index + 1}</td>
                <td className="py-2 text-slate-700">{c.raw || <em className="text-slate-400">{t('home.emptyLine')}</em>}</td>
                <td className="py-2 font-mono text-slate-900">{c.seconds === null ? '-' : c.seconds + 's'}</td>
                <td className="py-2 text-slate-800">{c.title || '-'}</td>
                <td className="py-2 text-xs">{c.errors.length > 0 ? <span className="text-rose-700">{c.errors.join(', ')}</span> : <span className="text-emerald-700">OK</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
        <p>
          {lang === 'ko' ? (
            <>
              유튜브 챕터 규칙은{' '}
              <Link to={p('/guide')} className="underline">
                {t('home.guideLink')}
              </Link>
              , 자주 묻는 질문은{' '}
              <Link to={p('/faq')} className="underline">
                {t('home.faqLink')}
              </Link>
              .
            </>
          ) : (
            <>
              {t('home.guideAndFaq').split('Guide')[0]}
              <Link to={p('/guide')} className="underline">{t('home.guideLink')}</Link>
              {t('home.guideAndFaq').split('Guide')[1]?.split('FAQ')[0]}
              <Link to={p('/faq')} className="underline">{t('home.faqLink')}</Link>
              .
            </>
          )}
        </p>
      </section>
    </>
  );
}
