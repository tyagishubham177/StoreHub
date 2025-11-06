'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormPendingOverlayProps {
  label?: string;
  className?: string;
}

export default function FormPendingOverlay({ label = 'Processing…', className }: FormPendingOverlayProps) {
  const { pending } = useFormStatus();

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 opacity-0 backdrop-blur-sm transition-opacity duration-200',
        pending && 'opacity-100',
        className
      )}
      aria-hidden={!pending}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{label}</span>
      </div>
    </div>
  );
}
