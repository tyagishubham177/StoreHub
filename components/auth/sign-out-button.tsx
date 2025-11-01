'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export default function SignOutButton() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
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
