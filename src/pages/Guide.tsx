import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { detectLangFromPath, withLangPrefix } from '../i18n';

export default function Guide() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = detectLangFromPath(location.pathname);
  const p = (path: string) => withLangPrefix(path, lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t('guide.h1'),
    inLanguage: lang === 'ko' ? 'ko-KR' : 'en-US',
    author: { '@type': 'Organization', name: 'ytchapter.bal.pe.kr' },
    publisher: { '@type': 'Organization', name: 'ytchapter.bal.pe.kr' },
    mainEntityOfPage: `https://ytchapter.bal.pe.kr${lang === 'ko' ? '/guide' : '/en/guide'}`,
  };

  return (
    <>
      <SEO
        titleKey="guide.title"
        descriptionKey="guide.description"
        path="/guide"
        jsonLd={jsonLd}
      />

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{t('guide.h1')}</h1>
      <p className="mt-2 text-sm text-slate-600">{t('guide.lead')}</p>

      {lang === 'ko' ? (
        <article className="prose prose-slate mt-8 max-w-none text-[15px]">
          <h2>1. 필수 규칙 5가지</h2>
          <ol>
            <li><strong>첫 챕터는 0:00 으로 시작</strong> — 필수.</li>
            <li><strong>최소 3개 이상</strong> 의 챕터.</li>
            <li><strong>각 챕터 10초 이상</strong> 길이 (10초 미만 간격은 인식 안됨).</li>
            <li><strong>오름차순</strong> 으로 나열 (뒤 챕터가 앞보다 시간이 빠르면 비활성).</li>
            <li><strong>콜론 형식</strong> 권장: <code>0:00</code>, <code>1:30</code>, <code>1:02:45</code>. 점·세미콜론은 인식 실패.</li>
          </ol>
          <p>5가지 중 하나만 어겨도 유튜브는 전체 챕터 목록을 무시합니다.</p>

          <h2>2. 권장 표기</h2>
          <pre>{`0:00 인트로
1:30 본론 시작
3:45 중반부 정리
5:10 핵심 포인트
9:00 마무리 및 Q&A`}</pre>

          <h2>3. 흔한 실수</h2>
          <ul>
            <li>첫 챕터를 <code>00:00</code> 또는 <code>00:00:00</code> 으로 시작하는 것: 인식은 되지만 <code>0:00</code> 권장.</li>
            <li>부제를 긴 한 줄로 몰아 쓰기: 줄바꿈 필요.</li>
            <li><code>1:00 ~ 2:00 인트로</code> 처럼 범위 표기: 시작 시간만 써야 함.</li>
            <li><code>• 1:30</code> 처럼 불릿 기호 앞에 붙이기: 콜론 앞에는 다른 문자가 오면 안됨.</li>
          </ul>

          <h2>4. 플랫폼 차이</h2>
          <ul>
            <li>유튜브 쇼츠는 챕터를 지원하지 않습니다.</li>
            <li>유튜브 키즈에서는 일부만 표시.</li>
            <li>네이버TV·카카오TV 는 챕터 기능 미지원 (댓글 고정으로 대체).</li>
          </ul>

          <h2>5. SEO 이점</h2>
          <ul>
            <li>챕터는 검색 결과 페이지에서 "키모먼트(Key Moments)" 형태로 노출되어 클릭률 상승.</li>
            <li>각 챕터 제목은 개별 검색 쿼리와 매칭 가능.</li>
            <li>시청자 이탈 지점 분석에도 유용.</li>
          </ul>

          <h2>6. 참고 자료</h2>
          <ul>
            <li><a href="https://support.google.com/youtube/answer/9884579" target="_blank" rel="noreferrer">YouTube Help — 챕터 만들기</a></li>
          </ul>
        </article>
      ) : (
        <article className="prose prose-slate mt-8 max-w-none text-[15px]">
          <h2>1. Five Required Rules</h2>
          <ol>
            <li><strong>First chapter must start at 0:00</strong> — mandatory.</li>
            <li><strong>At least 3 chapters</strong>.</li>
            <li><strong>Each chapter must be at least 10 seconds long</strong> (gaps under 10s are not recognized).</li>
            <li><strong>Ascending order</strong> (if a later chapter has an earlier timestamp, chapters are deactivated).</li>
            <li><strong>Colon format recommended</strong>: <code>0:00</code>, <code>1:30</code>, <code>1:02:45</code>. Dots and semicolons fail.</li>
          </ol>
          <p>If any one of the five rules is violated, YouTube ignores the entire chapter list.</p>

          <h2>2. Recommended Format</h2>
          <pre>{`0:00 Intro
1:30 Main Content Begins
3:45 Mid-section Summary
5:10 Key Point
9:00 Wrap-up & Q&A`}</pre>

          <h2>3. Common Mistakes</h2>
          <ul>
            <li>Starting the first chapter with <code>00:00</code> or <code>00:00:00</code>: recognized but <code>0:00</code> is recommended.</li>
            <li>Writing long subtitles on a single line: line breaks are needed.</li>
            <li>Using range notation like <code>1:00 ~ 2:00 Intro</code>: only start time should be used.</li>
            <li>Prepending bullet symbols like <code>• 1:30</code>: no other characters should come before the colon.</li>
          </ul>

          <h2>4. Platform Differences</h2>
          <ul>
            <li>YouTube Shorts does not support chapters.</li>
            <li>YouTube Kids shows chapters partially.</li>
            <li>Naver TV and Kakao TV do not support chapters (use pinned comments instead).</li>
          </ul>

          <h2>5. SEO Benefits</h2>
          <ul>
            <li>Chapters appear as "Key Moments" in search results, improving click-through rates.</li>
            <li>Each chapter title can match individual search queries.</li>
            <li>Useful for analyzing viewer drop-off points.</li>
          </ul>

          <h2>6. References</h2>
          <ul>
            <li><a href="https://support.google.com/youtube/answer/9884579" target="_blank" rel="noreferrer">YouTube Help — Add chapters to videos</a></li>
          </ul>
        </article>
      )}

      <p className="mt-8 text-sm text-slate-500">
        <Link to={p('/')} className="underline">{t('guide.backToHome')}</Link>
      </p>
    </>
  );
}
