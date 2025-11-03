declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_ENV?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;
    SENTRY_DSN?: string;
  }
}
