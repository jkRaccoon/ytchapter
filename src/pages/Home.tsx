import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { track } from '../lib/track';
import { formatText, chaptersToSrt } from '../lib/chapter';
import { detectLangFromPath, withLangPrefix } from '../i18n';

const STORAGE = 'ytchapter-input';
const HISTORY_STORAGE = 'ytchapter-history';
const MAX_HISTORY = 5;

const EXAMPLE = `0:00 인트로
1:30 본론 시작
3:45 중반부 정리
5분 10초 핵심 포인트
9:00 마무리 및 Q&A`;

interface HistoryEntry {
  text: string;
  savedAt: number;
  chaptersCount: number;
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE) ?? '[]') as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveToHistory(text: string, chaptersCount: number): void {
  if (typeof window === 'undefined') return;
  const existing = loadHistory();
  const trimmed = text.trim();
  if (!trimmed) return;
  const entry: HistoryEntry = { text: trimmed, savedAt: Date.now(), chaptersCount };
  // deduplicate
  const filtered = existing.filter((e) => e.text !== trimmed);
  const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_STORAGE, JSON.stringify(updated));
}

function downloadSrt(content: string, filename = 'chapters.srt'): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = detectLangFromPath(location.pathname);
  const p = (path: string) => withLangPrefix(path, lang);

  const [text, setText] = useState<string>(() => {
    if (typeof window === 'undefined') return EXAMPLE;
    return localStorage.getItem(STORAGE) ?? EXAMPLE;
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => formatText(text), [text]);

  const validCount = result.chapters.filter((c) => c.seconds !== null).length;
  const totalLines = result.chapters.length;

  const persist = useCallback((v: string) => {
    setText(v);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE, v);
  }, []);

  // Auto-save to history when user pauses typing (debounce 1.5s)
  useEffect(() => {
    const id = setTimeout(() => {
      const trimmed = text.trim();
      if (trimmed && trimmed !== EXAMPLE && validCount >= 1) {
        saveToHistory(trimmed, validCount);
        setHistory(loadHistory());
      }
    }, 1500);
    return () => clearTimeout(id);
  }, [text, validCount]);

  const copy = useCallback(async () => {
    track('chapter_copy', { valid_count: validCount });
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt(t('home.copyBtn'), result.output);
    }
  }, [result.output, t, validCount]);

  const handleOutputClick = useCallback(async () => {
    if (!result.output) return;
    await copy();
  }, [copy, result.output]);

  const handleSrtDownload = useCallback(() => {
    track('srt_exported', { valid_count: validCount });
    const srtContent = chaptersToSrt(result.chapters);
    downloadSrt(srtContent);
  }, [result.chapters, validCount]);

  const restoreHistory = useCallback((entry: HistoryEntry) => {
    track('history_restored', { chapters_count: entry.chaptersCount });
    persist(entry.text);
    setShowHistory(false);
  }, [persist]);

  // Track chapters_formatted on output change (debounced)
  useEffect(() => {
    if (validCount < 1) return;
    const id = setTimeout(() => {
      track('chapters_formatted', { valid_count: validCount, ok: result.ok });
    }, 800);
    return () => clearTimeout(id);
  }, [result.output, validCount, result.ok]);

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: lang === 'ko' ? '유튜브 챕터 타임스탬프 만드는 법' : 'How to Create YouTube Chapter Timestamps',
    description: lang === 'ko'
      ? '유튜버가 설명란에 넣을 챕터 타임스탬프를 유튜브 공식 규칙에 맞게 자동 변환·검증하는 방법'
      : 'How to automatically convert and validate chapter timestamps for YouTube descriptions according to official rules',
    step: [
      {
        '@type': 'HowToStep',
        name: lang === 'ko' ? '타임스탬프 입력' : 'Enter timestamps',
        text: lang === 'ko'
          ? '자유 형식(1:30, 1분30초, 1m30s 등)으로 챕터 목록을 붙여넣습니다.'
          : 'Paste your chapter list in any format (1:30, 1m30s, etc.).',
      },
      {
        '@type': 'HowToStep',
        name: lang === 'ko' ? '규칙 확인' : 'Check rules',
        text: lang === 'ko'
          ? '도구가 5가지 유튜브 챕터 규칙(0:00 시작, 10초 간격, 3개 이상, 오름차순, 콜론 형식)을 자동으로 검증합니다.'
          : 'The tool automatically validates 5 YouTube chapter rules (0:00 start, 10s gap, 3+ chapters, ascending, colon format).',
      },
      {
        '@type': 'HowToStep',
        name: lang === 'ko' ? '복사 후 붙여넣기' : 'Copy and paste',
        text: lang === 'ko'
          ? '"복사" 버튼 또는 결과 클릭으로 텍스트를 복사해 유튜브 설명란에 붙여넣습니다.'
          : 'Click "Copy" or click the output to copy, then paste into your YouTube description.',
      },
    ],
  };

  const webAppJsonLd = {
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

  return (
    <>
      <SEO
        titleKey="home.title"
        descriptionKey="home.description"
        path="/"
        jsonLd={webAppJsonLd}
      />
      {/* Additional HowTo JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{t('home.h1')}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {t('home.lead')}
        </p>
      </div>

      {/* Chapter counter + action bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${validCount >= 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {t('home.chapterCounter', { valid: validCount, total: totalLines })}
          </span>
          {validCount > 0 && (
            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${validCount >= 3 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, (validCount / Math.max(totalLines, 1)) * 100)}%` }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* History toggle */}
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {t('home.historyLabel')} ({history.length})
          </button>
          {/* SRT Download */}
          {validCount >= 1 && (
            <button
              onClick={handleSrtDownload}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {t('home.srtBtn')}
            </button>
          )}
        </div>
      </div>

      {/* History dropdown */}
      {showHistory && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold text-slate-700">{t('home.historyLabel')}</p>
          {history.length === 0 ? (
            <p className="text-xs text-slate-400">{t('home.historyEmpty')}</p>
          ) : (
            <ul className="space-y-2">
              {history.map((entry) => (
                <li key={entry.savedAt} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-slate-700">{entry.text.split('\n')[0]}…</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {entry.chaptersCount}{lang === 'ko' ? '개 챕터' : ' chapters'} · {new Date(entry.savedAt).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreHistory(entry)}
                    className="shrink-0 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    {t('home.historyRestore')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{t('home.outputLabel')}</h2>
              <p className="mt-0.5 text-xs text-slate-400">{t('home.outputClickToCopy')}</p>
            </div>
            <button
              onClick={copy}
              disabled={!result.output}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
            >
              {copied ? t('home.copiedBtn') : t('home.copyBtn')}
            </button>
          </div>
          <pre
            onClick={handleOutputClick}
            title={t('home.outputClickToCopy')}
            className={`mt-2 min-h-[320px] cursor-pointer whitespace-pre-wrap rounded-md border p-3 font-mono text-sm text-slate-900 transition-colors ${
              copied
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-slate-200 bg-slate-50 hover:border-red-300 hover:bg-red-50'
            }`}
          >
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
