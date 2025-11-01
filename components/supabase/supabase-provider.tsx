'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

interface SupabaseProviderProps {
  session: Session | null;
  children: React.ReactNode;
}

export default function SupabaseProvider({ session, children }: SupabaseProviderProps) {
  const [supabaseClient] = useState(() => createClientComponentClient<Database>());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
      {children}
    </SessionContextProvider>
  );
}
