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

| Secret | Where to find it | Example format |
| --- | --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Supabase dashboard → click your avatar → **Access Tokens** → **New token**. Copy the generated token once. | `sbp_xxxxxxxx...` |
| `SUPABASE_DB_PASSWORD` | Project → **Settings → Database → Connection string**. The password appears in the URI snippet (after `:` and before `@`). | `your-strong-db-password` |
| `SUPABASE_PROJECT_REF` | Project URL in the Supabase dashboard or the `supabase/config.toml` `project_ref` value. | `abcd1234` |

> BitDummy (placeholder) values for local testing could look like:
>
> ```env
> SUPABASE_ACCESS_TOKEN=sbp_exampledevtoken1234567890
> SUPABASE_DB_PASSWORD=example-dev-password
> SUPABASE_PROJECT_REF=devproj1234
> ```
>
> Replace these with the real credentials from your Supabase project before running the workflow.

**Retrieving the secrets step-by-step**

1. Sign in to [Supabase](https://supabase.com/), open the relevant project, and create a personal access token if you do not already have one. The token is shown only once—copy it immediately and store it in a password manager.
2. While viewing the same project, open **Settings → Database**, scroll to the **Connection string** section, and click the URI reveal toggle. Copy the password portion (between the first `:` and the `@`).
3. Inspect the project URL (e.g., `https://supabase.com/dashboard/project/abcd1234`). The trailing segment is the project reference. You can also find the same reference inside `supabase/config.toml` after running `supabase init` locally.
4. In GitHub, navigate to **Settings → Secrets and variables → Actions → New repository secret** and create secrets for each value (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`). Paste the copied credentials into the matching fields.

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
