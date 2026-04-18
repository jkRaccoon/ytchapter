import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const NAVER_WA = import.meta.env.VITE_NAVER_ANALYTICS_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    wcs_add?: Record<string, string>;
    wcs_do?: (wa?: unknown) => void;
    wcs?: unknown;
  }
}

export default function Analytics() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (GA_ID) {
      if (!window.dataLayer) {
        window.dataLayer = [];
        window.gtag = function gtag(...args: unknown[]) {
          window.dataLayer!.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', GA_ID, { send_page_view: false });
        const s = document.createElement('script');
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(s);
      }
      window.gtag?.('event', 'page_view', {
        page_path: pathname + search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
    if (NAVER_WA) {
      if (!window.wcs_add) window.wcs_add = {};
      window.wcs_add['wa'] = NAVER_WA;
      if (!document.querySelector('script[data-naver-wcs]')) {
        const s = document.createElement('script');
        s.src = '//wcs.pstatic.net/wcslog.js';
        s.async = true;
        s.setAttribute('data-naver-wcs', '1');
        s.onload = () => {
          if (window.wcs) window.wcs_do?.();
        };
        document.head.appendChild(s);
      } else if (window.wcs) {
        window.wcs_do?.();
      }
    }
  }, [pathname, search]);
  return null;
}
