'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonProps = React.ComponentProps<typeof Button>;

interface SubmitButtonProps extends Omit<ButtonProps, 'type'> {
  children: React.ReactNode;
  pendingLabel?: string;
}

export default function SubmitButton({
  children,
  pendingLabel = 'Saving…',
  disabled = false,
  className,
  variant = 'default',
  size,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      variant={variant}
      size={size}
      className={cn('relative overflow-hidden transition-all duration-200', className)}
      {...props}
    >
      <span
        className={cn(
          'flex items-center justify-center gap-2 transition-opacity duration-150',
          pending ? 'opacity-0' : 'opacity-100'
        )}
      >
        {children}
      </span>
      <span
        aria-hidden={!pending}
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium transition-opacity duration-150',
          pending ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{pendingLabel}</span>
      </span>
    </Button>
  );
}
