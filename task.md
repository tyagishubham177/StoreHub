# StoreHub Human Partner Task Guide

This document outlines the supporting tasks for the human collaborator during each engineering phase described in `Plan.md`. Each section lists the concrete actions that should be completed in parallel with development to keep the project unblocked and fully validated.

## Phase 1 – Foundation
- **Account provisioning**
  - Create Vercel and Supabase projects named `storehub` (or confirm existing ones).
  - Ensure the Supabase project is in the same region as the intended user base to minimize latency.
- **Environment variable collection**
  - In Supabase, generate service role and anon keys, the project URL, and store them securely.
  - In Vercel, create a preview environment and add placeholders for required variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
  - Share the variables securely with the engineering team (1Password vault or encrypted channel).
- **Access management**
  - Invite the engineering account to both Vercel and Supabase projects with maintainer permissions.
- **Verification**
  - Confirm GitHub repository integrations for automated deploy previews in Vercel.
  - Double-check that Supabase Row Level Security is disabled until policies are added in later phases.

## Phase 2 – Admin CRUD
- **Content preparation**
  - Gather a catalog of at least 10 sample shoe products with metadata (brand, colors, sizes, base prices) to seed the database.
  - Collect 2–3 optimized images per sample product (JPEG/WEBP, ≤5 MB each) and store them in an accessible folder structure.
- **Database validation**
  - Using the Supabase SQL editor, create the core tables per the data model or verify they exist once migrations run.
  - Review the column types and constraints for accuracy (UUID usage, foreign keys, soft-delete fields).
- **Asset management**
  - Pre-configure a Supabase storage bucket `product-images` with the recommended public access policy for signed URLs.
- **Verification**
  - After migrations are applied, run sample CRUD operations through the Supabase dashboard to ensure data integrity and referential constraints behave as expected.

## Phase 3 – Search, Filter, and SEO
- **Search tuning**
  - Evaluate Supabase full-text search configurations and note any dictionary customizations for footwear terminology.
  - Prepare a list of canonical tags/filters (e.g., `running`, `leather`, `wide-fit`) for QA testing.
- **SEO readiness**
  - Draft metadata templates (title, description, OpenGraph tags) for the homepage and product detail pages.
  - Identify the target keywords and confirm they are reflected in the copy prepared for the UI.
- **Verification**
  - Once features are implemented, perform manual search/filter testing on staging data and document edge cases or performance issues.

## Phase 4 – Security and QA
- **Policy review**
  - Author RLS policies in Supabase that enforce read-only access for unauthenticated users and admin write access.
  - Coordinate with engineering to confirm policy deployment after code changes land.
- **Testing support**
  - Set up Supabase test environment credentials (separate project or schema) for integration tests.
  - Execute manual penetration checks: attempt unauthorized writes, confirm they are blocked, and record findings.
- **Verification**
  - Review automated test reports (CI) after each merge and flag flaky tests or failures.

## Phase 5 – Deployment and Observability
- **CI/CD oversight**
  - Monitor GitHub Actions runs for lint/test passes and resolve any blocked workflows.
  - Configure Vercel production deployment protection (required approval before production deploys).
- **Environment completeness**
  - Add production secrets to Vercel from secure storage, ensuring parity with preview variables.
  - Set up Supabase webhooks or logging destinations for error and performance monitoring.
- **Observability setup**
  - Integrate error tracking (e.g., Sentry) and provide the DSN to engineering for instrumentation.
  - Configure uptime monitoring (e.g., Better Stack) pointing to the production URL.
- **Verification**
  - After production deploy, perform smoke tests (home page load, product view, admin login) and record results in the project tracker.

## Phase 6 – Transition to View-Only Mode
- **Configuration management**
  - Maintain documentation for the `app_config.writes_enabled` feature flag, including where it is stored and who can toggle it.
  - Prepare a rollout checklist for switching to view-only mode (announce window, pause write operations, verify backups).
- **Data integrity checks**
  - Before toggling the flag, export the latest product and variant data for archival.
  - Confirm that RLS policies align with view-only expectations (no write paths for public users).
- **Verification**
  - After enabling view-only mode, perform regression testing to ensure admin-only endpoints still function for maintenance tasks and that public users cannot access write capabilities.

## Ongoing Collaboration Tasks
- Maintain a shared checklist in the project management tool that links each engineering ticket to its corresponding human tasks.
- Provide timely feedback on UX copy, accessibility concerns, and stakeholder approvals so that engineering can incorporate changes without churn.
- Keep an updated log of credentials, feature flag states, and deployment approvals in the team knowledge base.

