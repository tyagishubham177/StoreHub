import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import SignOutButton from '@/components/auth/sign-out-button';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      <header>
        <h1>StoreHub Admin Foundation</h1>
        <p>
          This starter lays the groundwork for the StoreHub inventory manager. Authentication is powered by Supabase and the app
          router is configured for future admin tooling.
        </p>
      </header>

      {user ? (
        <section>
          <h2>Signed in</h2>
          <p>Welcome back, {user.email ?? 'team member'}.</p>
          <SignOutButton />
        </section>
      ) : (
        <section>
          <h2>Get started</h2>
          <p>Create an account in Supabase Auth or sign in to access admin features.</p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#111827',
              color: '#ffffff',
              borderRadius: '0.75rem',
              fontWeight: 600,
            }}
          >
            Sign in to StoreHub
          </Link>
        </section>
      )}

      <section>
        <h2>Environment checklist</h2>
        <ul>
          <li>Populate <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env</code>.</li>
          <li>Provide <code>SUPABASE_SERVICE_ROLE_KEY</code> for server-side administration tasks.</li>
          <li>Configure redirect URLs in Supabase Auth to include <code>http://localhost:3000/auth/callback</code>.</li>
        </ul>
      </section>
    </main>
  );
}
