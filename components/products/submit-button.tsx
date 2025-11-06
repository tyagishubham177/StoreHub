'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>['variant'];
}

export default function SubmitButton({
  children,
  pendingLabel,
  disabled = false,
  variant = 'default',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <Button type="submit" disabled={isDisabled} aria-disabled={isDisabled} variant={variant}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingLabel ?? 'Saving…'}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
