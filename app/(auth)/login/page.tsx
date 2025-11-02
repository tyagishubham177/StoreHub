import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import LoginForm from './login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/products');
  }

  return (
    <main>
      <header>
        <h1>Sign in to StoreHub</h1>
        <p>Use your Supabase credentials to access the admin workspace.</p>
      </header>
      <LoginForm />
    </main>
  );
}
