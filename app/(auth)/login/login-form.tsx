'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export default function LoginForm() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setStatus('idle');
      return;
    }

    setStatus('success');
    router.replace('/products');
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gap: '1rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 20px 45px -20px rgba(15, 23, 42, 0.25)',
      }}
    >
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@storehub.com"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          placeholder="••••••••"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          padding: '0.75rem 1.25rem',
          borderRadius: '0.75rem',
          fontWeight: 600,
          border: 'none',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {status === 'loading' ? 'Signing in…' : status === 'success' ? 'Signed in! Redirecting…' : 'Sign in'}
      </button>

      {error ? (
        <p role="alert" style={{ color: '#dc2626', fontWeight: 500 }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
