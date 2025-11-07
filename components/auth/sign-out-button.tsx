'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

export default function SignOutButton() {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.replace('/');
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1.1rem',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '0.75rem',
        color: '#111827',
        fontWeight: 600,
      }}
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
