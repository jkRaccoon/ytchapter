import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import i18n, { detectLangFromPath, type Lang } from './index';

interface Props {
  /** Force language regardless of URL detection (used by /en route subtree) */
  forceLang?: Lang;
}

export default function LanguageProvider({ forceLang }: Props) {
  const location = useLocation();
  const lang = forceLang ?? detectLangFromPath(location.pathname);

  useEffect(() => {
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  // Ensure first render also matches (before effect runs) so hydration matches prerendered HTML
  if (i18n.language !== lang) {
    void i18n.changeLanguage(lang);
  }

  return <Outlet />;
}
