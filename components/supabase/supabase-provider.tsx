'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

interface SupabaseProviderProps {
  session: Session | null;
  children: React.ReactNode;
}

export default function SupabaseProvider({ session, children }: SupabaseProviderProps) {
  const [supabaseClient] = useState(() => createSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
      {children}
    </SessionContextProvider>
  );
}
