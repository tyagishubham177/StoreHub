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

#### Automating migrations with GitHub Actions

If you prefer to apply migrations from GitHub instead of your local or cloud terminal, trigger the **Supabase DB Push** workflow that lives in `.github/workflows/supabase-db-push.yml`. The workflow installs the Supabase CLI and runs `supabase db push` against your hosted project using repository secrets. Configure the secrets once and everyone on the team can re-run the workflow with a single click.

Add the following repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value to copy from Supabase |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Personal access token created in the Supabase dashboard. |
| `SUPABASE_DB_PASSWORD` | Database password from **Project Settings → Database → Connection string**. |
| `SUPABASE_PROJECT_REF` | Project reference (e.g., `abcd1234`) from the Supabase dashboard URL. |

> The project currently stores these values in Vercel. Duplicate them as GitHub Action secrets so the workflow can authenticate. Vercel can continue using its own copies for runtime environments.

Once the secrets exist, open **Actions → Supabase DB Push → Run workflow**. Optionally provide a different project ref when dispatching (for example, to target staging), otherwise the secret value is used. The workflow checks out the repo, installs the Supabase CLI, and applies every migration in `supabase/migrations/` to the specified project.

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
