'use client';

import { FormEvent, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LoginStatus = 'idle' | 'loading' | 'success';

interface LoginFormProps {
  onSuccess?: () => void | Promise<void>;
  onStatusChange?: (status: LoginStatus) => void;
  variant?: 'card' | 'plain';
  redirectTo?: string;
  className?: string;
}

export default function LoginForm({
  onSuccess,
  onStatusChange,
  variant = 'card',
  redirectTo = '/products',
  className,
}: LoginFormProps) {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LoginStatus>('idle');

  const updateStatus = useCallback(
    (nextStatus: LoginStatus) => {
      setStatus(nextStatus);
      onStatusChange?.(nextStatus);
    },
    [onStatusChange]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateStatus('loading');
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      updateStatus('idle');
      return;
    }

    updateStatus('success');

    if (onSuccess) {
      await onSuccess();
    } else {
      router.replace(redirectTo);
      router.refresh();
    }
  };

  const isSubmitting = status === 'loading' || status === 'success';

  const buttonLabel = useMemo(() => {
    if (status === 'loading') {
      return 'Signing in…';
    }
    if (status === 'success') {
      return 'Signed in! Redirecting…';
    }
    return 'Sign in';
  }, [status]);

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@storehub.com"
          className="mt-1 block w-full"
          disabled={isSubmitting}
          autoComplete="username"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          placeholder="••••••••"
          className="mt-1 block w-full"
          disabled={isSubmitting}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {buttonLabel}
      </Button>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );

  if (variant === 'plain') {
    return <div className={cn('w-full max-w-sm space-y-4', className)}>{form}</div>;
  }

  return (
    <Card className={cn('w-full max-w-sm', className)}>
      <CardHeader>
        <CardTitle className="text-2xl">Sign in to StoreHub</CardTitle>
        <p className="text-sm text-muted-foreground">
          Use your Supabase credentials to access the admin workspace.
        </p>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
}
