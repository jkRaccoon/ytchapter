import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Analytics from '../components/Analytics';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { detectLangFromPath, withLangPrefix } from '../i18n';

export default function RootLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = detectLangFromPath(location.pathname);
  const p = (path: string) => withLangPrefix(path, lang);

  return (
    <div className="min-h-screen bg-slate-50">
      <Analytics />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <Link to={p('/')} className="flex items-center gap-2">
            <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white">
              ▶
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">{t('site.brandPrefix')} {t('site.brandSuffix')}</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {[
              { to: p('/'), label: t('nav.home') },
              { to: p('/guide'), label: t('nav.guide') },
              { to: p('/faq'), label: t('nav.faq') },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === p('/')}
                className={({ isActive }) =>
                  `font-medium transition ${
                    isActive ? 'text-red-700' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-slate-500">
          <p>{t('site.footerCopyright')}</p>
          <nav className="mt-2 flex flex-wrap gap-3">
            <a className="underline hover:text-slate-700" href="https://bal.pe.kr">bal.pe.kr</a>
            <a className="underline hover:text-slate-700" href="https://bal.pe.kr/privacy.html">{t('footer.privacy')}</a>
            <a className="underline hover:text-slate-700" href="https://bal.pe.kr/terms.html">{t('footer.terms')}</a>
            <a className="underline hover:text-slate-700" href="mailto:comsamo84@gmail.com">{t('footer.contact')}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
