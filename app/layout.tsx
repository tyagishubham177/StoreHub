import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import SupabaseProvider from '@/components/supabase/supabase-provider';
import SupabaseListener from '@/components/supabase/supabase-listener';
import BrowserErrorListener from '@/components/observability/browser-error-listener';
import type { Database } from '@/types/database';
import Header from '@/components/layout/header';

export const metadata: Metadata = {
  title: {
    default: 'StoreHub Footwear',
    template: '%s • StoreHub Footwear',
  },
  description: 'Browse the StoreHub footwear catalog with live inventory filters.',
  keywords: ['storehub', 'footwear', 'inventory', 'sneakers', 'shoe catalog', 'supabase'],
  openGraph: {
    title: 'StoreHub Footwear',
    description: 'Curated footwear inventory with search, filters, and real-time availability.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StoreHub Footwear',
    description: 'Curated footwear inventory with search, filters, and real-time availability.',
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body>
        <SupabaseProvider session={session}>
          <SupabaseListener accessToken={session?.access_token} />
          <BrowserErrorListener />
          <div className="flex flex-col min-h-screen">
            <Header />
            {children}
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
