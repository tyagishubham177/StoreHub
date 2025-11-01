import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import SupabaseProvider from '@/components/supabase/supabase-provider';
import SupabaseListener from '@/components/supabase/supabase-listener';
import type { Database } from '@/types/database';

export const metadata: Metadata = {
  title: 'StoreHub Admin',
  description: 'Inventory management foundation for StoreHub.',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body>
        <SupabaseProvider session={session}>
          <SupabaseListener accessToken={session?.access_token} />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
