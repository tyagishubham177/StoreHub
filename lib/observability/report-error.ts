import { parseSentryDsn } from './dsn';

type SerializableError = {
  message: string;
  stack?: string;
  name?: string;
};

const isServer = typeof window === 'undefined';
const rawDsn = isServer
  ? process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || ''
  : process.env.NEXT_PUBLIC_SENTRY_DSN || '';
const parsedDsn = parseSentryDsn(rawDsn);

const clientName = 'storehub-observer/1.0.0';

const toSerializableError = (error: unknown): SerializableError => {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack ?? undefined, name: error.name };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: 'Unknown error' };
  }
};

const sendToSentry = async (
  context: string,
  error: SerializableError,
  extra: Record<string, unknown>
) => {
  if (!parsedDsn) {
    return;
  }

  const timestamp = new Date();
  const eventId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID().replace(/-/g, '')
    : Math.random().toString(16).slice(2, 34).padEnd(32, '0');

  const payload = {
    event_id: eventId,
    level: 'error',
    platform: 'javascript',
    logger: context,
    timestamp: timestamp.toISOString(),
    message: error.message,
    tags: { context },
    extra: {
      ...extra,
      runtime: isServer ? 'server' : 'browser',
      stack: error.stack,
      name: error.name,
    },
  };

  const authHeader = [
    'Sentry sentry_version=7',
    `sentry_client=${clientName}`,
    `sentry_timestamp=${Math.floor(timestamp.getTime() / 1000)}`,
    `sentry_key=${parsedDsn.publicKey}`,
  ].join(', ');

  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sentry-Auth': authHeader,
    },
    body: JSON.stringify(payload),
  };

  if (!isServer) {
    requestInit.keepalive = true;
  }

  await fetch(parsedDsn.storeUrl, requestInit);
};

export function reportError(
  context: string,
  error: unknown,
  extra: Record<string, unknown> = {}
) {
  const serializable = toSerializableError(error);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, error, extra);
  }

  if (!parsedDsn) {
    return;
  }

  sendToSentry(context, serializable, extra).catch((sendError) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(`[${context}] Failed to report error`, sendError);
    }
  });
}
