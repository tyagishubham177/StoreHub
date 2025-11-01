# StoreHub

StoreHub is an inventory management platform tailored for shoe retailers. This repository contains the Next.js foundation for the admin interface with Supabase authentication pre-wired.

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase project with email/password auth enabled

### Installation

```bash
npm install
```

If you are working in a restricted environment, make sure that scoped packages from `@supabase/*` are allowed in your npm confi
guration.

### Environment variables

Duplicate `.env.example` and provide the credentials from your Supabase project:

```bash
cp .env.example .env.local
```

### Supabase database setup

Initialize the local Supabase metadata and apply the project's schema before working in the `/products` workspace:

```bash
supabase init
supabase db push
```

The generated `supabase/config.toml` keeps the CLI configuration in sync across contributors, and `supabase db push` applies the
SQL migrations in `supabase/migrations/` to your linked project so the product management tables, relationships, and policies are
ready to use.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key used by the browser client. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for privileged server operations. |

### Development

```bash
npm run dev
```

The application is available at [http://localhost:3000](http://localhost:3000).

### Authentication callbacks

Add `http://localhost:3000/auth/callback` to the list of redirect URLs in your Supabase project so OAuth and magic link flows ca
n establish sessions.

## Project structure

- `app/` – Next.js App Router routes for public and auth pages.
- `components/` – Shared UI and Supabase helpers.
- `lib/supabase/` – Server helpers for creating Supabase clients in various contexts.
- `types/` – Shared TypeScript definitions for the Supabase schema.

## Next steps

Phase 1 establishes the baseline. Upcoming phases will introduce product management, filtering, and hardened security according 
to the [Product Requirements Document](./Plan.md).
