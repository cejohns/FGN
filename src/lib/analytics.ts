/**
 * Analytics utility with built-in debugging
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const analytics = {
  /**
   * Track a page view
   */
  pageView(pagePath: string, pageTitle?: string) {
    if (typeof window.gtag === 'function') {
      console.log('%c[Analytics]', 'color: #34a853; font-weight: bold;',
        'Page view:', pagePath, pageTitle || '');

      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle || document.title
      });
    } else {
      console.warn('[Analytics] gtag not loaded yet');
    }
  },

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, eventParams?: Record<string, any>) {
    if (typeof window.gtag === 'function') {
      console.log('%c[Analytics]', 'color: #34a853; font-weight: bold;',
        'Event:', eventName, eventParams || '');

      window.gtag('event', eventName, eventParams);
    } else {
      console.warn('[Analytics] gtag not loaded yet');
    }
  },

  /**
   * Check if Analytics is properly loaded
   */
  isLoaded(): boolean {
    const loaded = typeof window.gtag === 'function' &&
                   Array.isArray(window.dataLayer) &&
                   window.dataLayer.length > 0;

    console.log('%c[Analytics]', 'color: #34a853; font-weight: bold;',
      'Status:', loaded ? '✓ Loaded' : '✗ Not loaded');

    if (loaded) {
      console.log('%c[Analytics]', 'color: #34a853; font-weight: bold;',
        'DataLayer entries:', window.dataLayer.length);
    }

    return loaded;
  },

  /**
   * Debug: Show all dataLayer entries
   */
  debugDataLayer() {
    if (Array.isArray(window.dataLayer)) {
      console.group('%c[Analytics Debug]', 'color: #fbbc04; font-weight: bold;',
        'DataLayer Contents');
      console.table(window.dataLayer);
      console.groupEnd();
    } else {
      console.warn('[Analytics] DataLayer not available');
    }
  }
};

// Auto-check on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      analytics.isLoaded();
      console.log('%c[Analytics]', 'color: #34a853; font-weight: bold;',
        'To debug, run: analytics.debugDataLayer()');

      // Debug environment configuration
      console.group('%c[Config Debug]', 'color: #ea4335; font-weight: bold;');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Build time:', new Date().toISOString());
      console.log('Environment:', import.meta.env.MODE);
      console.groupEnd();
    }, 1000);
  });
}

// Make analytics available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).analytics = analytics;
}
