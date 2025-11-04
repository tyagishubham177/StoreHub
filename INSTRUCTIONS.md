# Supabase Configuration Instructions

To enable image uploads to your Supabase storage bucket, you need to configure the following environment variables in your Vercel and GitHub Actions environments:

- `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key for your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`: The service role key for your Supabase project.

## Finding Your Supabase Keys

1.  Go to your Supabase project dashboard.
2.  Navigate to **Project Settings** > **API**.
3.  You will find your **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`) and **Project API keys** (`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`) here.

## Vercel Configuration

1.  Go to your Vercel project dashboard.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add the three environment variables listed above with their corresponding values from your Supabase project.

## GitHub Actions Configuration

1.  Go to your GitHub repository.
2.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
3.  Add the three environment variables listed above as new repository secrets.

**Note:** The `NEXT_PUBLIC_` prefix is important for the client-side code to be able to access the Supabase URL and anonymous key.
