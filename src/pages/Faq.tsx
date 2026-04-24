import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { detectLangFromPath } from '../i18n';

const QAS_KO = [
  { q: '챕터가 설명란에 있는데도 활성화되지 않아요.', a: '5가지 규칙 중 하나라도 위반하면 전체가 무시됩니다. 본 도구의 "규칙 위반" 섹션에서 원인을 확인하세요. 가장 흔한 원인은 (1) 첫 줄이 0:00 이 아님, (2) 10초 미만 간격, (3) 불릿 기호 사용입니다.' },
  { q: '1시간이 넘는 영상은 어떻게 표기하나요?', a: '<code>1:02:45</code> 형식의 H:MM:SS 를 사용합니다. 본 도구는 시:분:초 형식을 자동 인식합니다.' },
  { q: '쇼츠(Shorts)에도 챕터가 되나요?', a: '아니요. 60초 이하의 유튜브 쇼츠는 챕터를 지원하지 않습니다. 일반 영상(60초 초과)에서만 적용됩니다.' },
  { q: '챕터 제목에 이모지를 써도 되나요?', a: '가능합니다. 하지만 제목 맨 앞에 숫자와 콜론 형식이 반드시 먼저 와야 합니다 (예: "0:00 🎬 인트로" OK, "🎬 0:00 인트로" X).' },
  { q: '챕터를 15개까지 만들어도 되나요?', a: '유튜브는 챕터 수 상한은 없다고 공식 답변했지만, 너무 많으면 플레이어 UI 가 잘립니다. 20개 이내 권장.' },
  { q: '챕터 기능을 쓰면 광고 수익이 줄어드나요?', a: '아닙니다. 챕터는 중간광고 삽입 위치에 영향을 주지 않으며, 오히려 시청 시간이 늘어 수익에 긍정적입니다.' },
  { q: '이미 업로드된 영상에 챕터를 추가할 수 있나요?', a: '가능합니다. YouTube Studio 에서 해당 영상 > 상세 > 설명에 챕터 목록을 추가하고 저장하면 즉시 반영됩니다.' },
  { q: '카카오TV·네이버TV 에도 쓸 수 있나요?', a: '두 플랫폼은 챕터 기능을 공식 지원하지 않습니다. 고정 댓글로 타임스탬프 목록을 대신 올리세요. 본 도구의 출력을 그대로 복사해 붙이면 됩니다.' },
  { q: '영상 URL 을 붙여넣으면 자동으로 챕터를 제안해주나요?', a: 'MVP 에서는 지원하지 않습니다. CORS 제약으로 서버리스 함수가 필요하며 향후 추가 예정입니다.' },
  { q: '타임스탬프를 한 번에 많이 붙여넣으면 느려져요.', a: '본 도구는 클라이언트 측 정규식 기반이라 수백 줄까지도 즉시 처리됩니다. 느리면 브라우저 확장 프로그램이 간섭할 가능성.' },
];

const QAS_EN = [
  { q: 'Chapters are in the description but not activating.', a: 'If any one of the 5 rules is violated, the entire list is ignored. Check the "Rule violations" section in this tool. The most common causes are: (1) first line is not 0:00, (2) gaps under 10 seconds, (3) bullet symbols used.' },
  { q: 'How do I format timestamps for videos over 1 hour?', a: 'Use the H:MM:SS format like <code>1:02:45</code>. This tool automatically recognizes hour:minute:second format.' },
  { q: 'Do Shorts support chapters?', a: 'No. YouTube Shorts (60 seconds or less) do not support chapters. They only apply to regular videos (over 60 seconds).' },
  { q: 'Can I use emojis in chapter titles?', a: 'Yes, but the number and colon format must come first (e.g., "0:00 🎬 Intro" OK, "🎬 0:00 Intro" X).' },
  { q: 'Can I create up to 15 chapters?', a: 'YouTube officially stated there is no upper limit, but too many chapters may clip the player UI. We recommend keeping it under 20.' },
  { q: 'Will using chapters reduce ad revenue?', a: 'No. Chapters do not affect mid-roll ad placement and can actually increase watch time, which is positive for revenue.' },
  { q: 'Can I add chapters to an already uploaded video?', a: 'Yes. In YouTube Studio, go to the video details > Description, add the chapter list and save — changes are reflected immediately.' },
  { q: 'Can I use this for Kakao TV or Naver TV?', a: 'Those platforms do not officially support chapters. Use pinned comments with timestamps instead. You can copy the output from this tool directly.' },
  { q: 'Can I paste a video URL to automatically get chapter suggestions?', a: 'Not supported in the MVP. A serverless function is needed due to CORS restrictions and will be added in a future update.' },
  { q: 'The tool slows down when I paste many timestamps at once.', a: 'This tool uses client-side regex and can handle hundreds of lines instantly. If it\'s slow, a browser extension may be interfering.' },
];

export default function Faq() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = detectLangFromPath(location.pathname);

  const QAS = lang === 'ko' ? QAS_KO : QAS_EN;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: QAS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') },
    })),
  };

  return (
    <>
      <SEO
        titleKey="faq.title"
        descriptionKey="faq.description"
        path="/faq"
        jsonLd={jsonLd}
      />

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{t('faq.h1')}</h1>
      <p className="mt-2 text-sm text-slate-600">{t('faq.lead')}</p>

      <dl className="mt-8 space-y-6">
        {QAS.map(({ q, a }, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <dt className="text-sm font-semibold text-slate-900">Q{i + 1}. {q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-700" dangerouslySetInnerHTML={{ __html: a }} />
          </div>
        ))}
      </dl>
    </>
  );
}
