export interface ParsedSentryDsn {
  protocol: string;
  host: string;
  projectId: string;
  publicKey: string;
  path: string;
  storeUrl: string;
}

export function parseSentryDsn(dsn: string | undefined | null): ParsedSentryDsn | null {
  if (!dsn) {
    return null;
  }

  try {
    const url = new URL(dsn);
    const publicKey = url.username;

    if (!publicKey) {
      return null;
    }

    const trimmedPath = url.pathname.replace(/\/$/, '');
    const segments = trimmedPath.split('/').filter(Boolean);

    if (!segments.length) {
      return null;
    }

    const projectId = segments[segments.length - 1];
    const basePath = segments.slice(0, -1).join('/');
    const path = basePath ? `/${basePath}` : '';
    const origin = `${url.protocol}//${url.host}`;
    const storeUrl = `${origin}${path}/api/${projectId}/store/`;

    return {
      protocol: url.protocol,
      host: url.host,
      projectId,
      publicKey,
      path,
      storeUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Unable to parse Sentry DSN:', error);
    }
    return null;
  }
}
