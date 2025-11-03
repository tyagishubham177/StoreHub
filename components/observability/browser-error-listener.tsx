'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/observability/report-error';

const hasPublicDsn = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

export default function BrowserErrorListener() {
  useEffect(() => {
    if (!hasPublicDsn) {
      return undefined;
    }

    const handleError = (event: ErrorEvent) => {
      reportError('browser.runtime.error', event.error ?? event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      reportError('browser.unhandledrejection', event.reason ?? 'Unhandled rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
