'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

interface SupabaseListenerProps {
  accessToken?: string;
}

export default function SupabaseListener({ accessToken }: SupabaseListenerProps) {
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token !== accessToken) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [accessToken, router, supabase]);

  return null;
}
