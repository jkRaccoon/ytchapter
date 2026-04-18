import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { track } from '../lib/track';
import { formatText } from '../lib/chapter';

const STORAGE = 'ytchapter-input';
const EXAMPLE = `0:00 인트로
1:30 본론 시작
3:45 중반부 정리
5분 10초 핵심 포인트
9:00 마무리 및 Q&A`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '유튜브 챕터 타임스탬프 포매터',
  url: 'https://ytchapter.bal.pe.kr/',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'All',
  inLanguage: 'ko-KR',
  description:
    '자유 형식 타임스탬프 텍스트(1분30초, 01:30, 1m30s 등)를 유튜브 공식 챕터 규격으로 자동 변환하고, 0:00 시작·10초 간격·3개 이상·오름차순 규칙을 실시간 검증.',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
};

export default function Home() {
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
      window.prompt('아래 결과를 복사하세요', result.output);
    }
  };

  return (
    <>
      <SEO
        title="유튜브 챕터 타임스탬프 포매터 — 0:00 규칙 자동 검증"
        description="자유 형식 타임스탬프(1분30초, 1:30, 1m30s 등)를 유튜브 챕터 표준으로 자동 변환하고 0:00 시작·10초 간격·3개 이상·오름차순 규칙을 실시간 검증합니다."
        path="/"
        jsonLd={jsonLd}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">유튜브 챕터 타임스탬프 포매터</h1>
        <p className="mt-2 text-sm text-slate-600">
          자유 형식 타임스탬프를 넣으면 <span className="font-medium text-red-700">유튜브 챕터 규격</span>으로 자동 변환 + 규칙 위반 실시간 검증.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">입력 (자유 형식)</h2>
          <textarea
            rows={14}
            value={text}
            onChange={(e) => persist(e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-sm focus:border-red-500 focus:outline-none"
            placeholder={EXAMPLE}
          />
          <p className="mt-2 text-xs text-slate-500">
            지원 형식: <code>0:00</code>, <code>01:30</code>, <code>1:02:45</code>, <code>1분 30초</code>, <code>1m30s</code>, <code>90s</code>, <code>1.30</code> 등.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">결과 (유튜브 챕터 규격)</h2>
            <button
              onClick={copy}
              disabled={!result.output}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
            >
              {copied ? '✓ 복사됨' : '복사'}
            </button>
          </div>
          <pre className="mt-2 min-h-[320px] whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900">
{result.output || '(유효한 챕터가 없습니다)'}
          </pre>

          <div className={`mt-3 rounded-md p-3 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
            {result.ok ? (
              <p>✅ 유튜브 챕터 규칙 모두 통과. 설명란에 그대로 붙여넣으세요.</p>
            ) : (
              <>
                <p className="font-semibold">❗ 규칙 위반</p>
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
        <h2 className="text-sm font-semibold text-slate-900">줄별 파싱 결과</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="pb-2">#</th>
              <th className="pb-2">원본</th>
              <th className="pb-2">시간</th>
              <th className="pb-2">제목</th>
              <th className="pb-2">오류</th>
            </tr>
          </thead>
          <tbody>
            {result.chapters.map((c) => (
              <tr key={c.index} className="border-t border-slate-100">
                <td className="py-2 text-slate-500">{c.index + 1}</td>
                <td className="py-2 text-slate-700">{c.raw || <em className="text-slate-400">(빈 줄)</em>}</td>
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
          유튜브 챕터 규칙은{' '}
          <Link to="/guide" className="underline">
            가이드
          </Link>
          , 자주 묻는 질문은{' '}
          <Link to="/faq" className="underline">
            FAQ
          </Link>
          .
        </p>
      </section>
    </>
  );
}
