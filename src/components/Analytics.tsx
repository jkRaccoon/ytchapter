import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const NAVER_WA = import.meta.env.VITE_NAVER_ANALYTICS_ID as string | undefined;
const SITE_ID = import.meta.env.VITE_SITE_ID as string | undefined;
const SITE_CATEGORY = import.meta.env.VITE_SITE_CATEGORY as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    wcs_add?: Record<string, string>;
    wcs_do?: (wa?: unknown) => void;
    wcs?: unknown;
  }
}

function ensureGa(id: string) {
  if (window.dataLayer) return;
  window.dataLayer = [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, {
    send_page_view: false,
    site_id: SITE_ID,
    site_category: SITE_CATEGORY,
  });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
}

function ensureNaver(wa: string) {
  if (!window.wcs_add) window.wcs_add = {};
  window.wcs_add['wa'] = wa;
  if (document.querySelector('script[data-naver-wcs]')) return;
  const s = document.createElement('script');
  s.src = '//wcs.pstatic.net/wcslog.js';
  s.async = true;
  s.setAttribute('data-naver-wcs', '1');
  s.onload = () => {
    if (window.wcs) window.wcs_do?.();
  };
  document.head.appendChild(s);
}

export default function Analytics() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (GA_ID) {
      ensureGa(GA_ID);
      window.gtag?.('event', 'page_view', {
        page_path: pathname + search,
        page_location: window.location.href,
        page_title: document.title,
        site_id: SITE_ID,
        site_category: SITE_CATEGORY,
      });
    }

    if (NAVER_WA) {
      ensureNaver(NAVER_WA);
      if (window.wcs) window.wcs_do?.();
    }
  }, [pathname, search]);

  return null;
}
