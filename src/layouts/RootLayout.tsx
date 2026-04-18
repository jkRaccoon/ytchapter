import { Link, NavLink, Outlet } from 'react-router-dom';
import Analytics from '../components/Analytics';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Analytics />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white">
              ▶
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">유튜브 챕터 포매터</span>
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm">
            {[
              { to: '/', label: '챕터 포매팅' },
              { to: '/guide', label: '가이드' },
              { to: '/faq', label: 'FAQ' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `font-medium transition ${
                    isActive ? 'text-red-700' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-slate-500">
          <p>© 2026 ytchapter.bal.pe.kr · 유튜브 공식 챕터 규칙을 참고한 보조 도구입니다.</p>
          <nav className="mt-2 flex flex-wrap gap-3">
            <a className="underline hover:text-slate-700" href="https://bal.pe.kr">bal.pe.kr</a>
            <a className="underline hover:text-slate-700" href="https://bal.pe.kr/privacy.html">개인정보처리방침</a>
            <a className="underline hover:text-slate-700" href="https://bal.pe.kr/terms.html">이용약관</a>
            <a className="underline hover:text-slate-700" href="mailto:comsamo84@gmail.com">문의</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
