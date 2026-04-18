export interface ParsedChapter {
  raw: string;
  seconds: number | null;
  title: string;
  errors: string[];
  index: number;
}

export interface FormatResult {
  chapters: ParsedChapter[];
  output: string;
  ok: boolean;
  rulesViolated: string[];
}

export function parseLine(raw: string, index: number): ParsedChapter {
  const errors: string[] = [];
  const trimmed = raw.trim();
  if (!trimmed) {
    return { raw, seconds: null, title: '', errors: ['빈 줄'], index };
  }

  const patterns: { re: RegExp; build: (m: RegExpMatchArray) => number | null }[] = [
    {
      re: /^(\d+):(\d{1,2}):(\d{1,2})(?:\s+|$)/,
      build: (m) => parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]),
    },
    {
      re: /^(\d+):(\d{1,2})(?:\s+|$)/,
      build: (m) => parseInt(m[1]) * 60 + parseInt(m[2]),
    },
    {
      re: /^(\d+)\s*분\s*(\d+)\s*초(?:\s+|$)/,
      build: (m) => parseInt(m[1]) * 60 + parseInt(m[2]),
    },
    {
      re: /^(\d+)\s*시간\s*(\d+)\s*분\s*(?:(\d+)\s*초)?(?:\s+|$)/,
      build: (m) => parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + (m[3] ? parseInt(m[3]) : 0),
    },
    {
      re: /^(\d+)\s*분(?:\s+|$)/,
      build: (m) => parseInt(m[1]) * 60,
    },
    {
      re: /^(\d+)\s*m\s*(\d+)\s*s(?:\s+|$)/i,
      build: (m) => parseInt(m[1]) * 60 + parseInt(m[2]),
    },
    {
      re: /^(\d+)\s*[.,]\s*(\d{1,2})(?:\s+|$)/,
      build: (m) => parseInt(m[1]) * 60 + parseInt(m[2]),
    },
    {
      re: /^(\d+)\s*s(?:\s+|$)/i,
      build: (m) => parseInt(m[1]),
    },
    {
      re: /^(\d+)\s*초(?:\s+|$)/,
      build: (m) => parseInt(m[1]),
    },
  ];

  for (const { re, build } of patterns) {
    const m = trimmed.match(re);
    if (m) {
      const sec = build(m);
      const rest = trimmed.slice(m[0].length).replace(/^[-–—·•\s]+/, '').trim();
      return { raw, seconds: sec, title: rest || '(제목 없음)', errors: rest ? [] : ['제목 없음'], index };
    }
  }

  errors.push('시간 형식 인식 실패');
  return { raw, seconds: null, title: trimmed, errors, index };
}

export function formatSeconds(s: number): string {
  if (s < 3600) {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${String(ss).padStart(2, '0')}`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function formatText(input: string): FormatResult {
  const lines = input.split('\n').map((l, i) => parseLine(l, i)).filter((c) => c.seconds !== null || c.raw.trim());
  const rulesViolated: string[] = [];

  if (lines.length < 3) rulesViolated.push('챕터는 최소 3개 필요합니다.');

  const valid = lines.filter((l) => l.seconds !== null);
  if (valid.length > 0 && valid[0].seconds !== 0) {
    rulesViolated.push('첫 챕터는 0:00 부터 시작해야 합니다.');
  }

  for (let i = 1; i < valid.length; i++) {
    const prev = valid[i - 1].seconds ?? 0;
    const cur = valid[i].seconds ?? 0;
    if (cur <= prev) {
      valid[i].errors.push('이전 챕터보다 시간이 빠릅니다 (오름차순 위반).');
      rulesViolated.push(`${i + 1}번째 챕터가 오름차순이 아닙니다.`);
    }
    if (cur - prev < 10) {
      valid[i].errors.push('이전 챕터와 10초 미만 간격입니다.');
      rulesViolated.push(`${i + 1}번째 챕터가 이전과 10초 이내로 가깝습니다.`);
    }
  }

  const output = valid
    .map((c) => `${formatSeconds(c.seconds ?? 0)} ${c.title}`)
    .join('\n');

  return {
    chapters: lines,
    output,
    ok: rulesViolated.length === 0 && valid.every((v) => v.errors.length === 0),
    rulesViolated,
  };
}
