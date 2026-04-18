interface TrackParams { [k: string]: unknown }

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: TrackParams = {}): void {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', event, params);
    window.dataLayer?.push({ event, ...params });
  } catch {
    /* noop */
  }
}
