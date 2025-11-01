'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
}

export default function SubmitButton({ children, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        padding: '0.65rem 1.2rem',
        borderRadius: '0.75rem',
        border: 'none',
        fontWeight: 600,
        color: '#ffffff',
        backgroundColor: pending ? '#1f2937' : '#2563eb',
        transition: 'background-color 120ms ease-out',
      }}
    >
      {pending ? pendingLabel ?? 'Saving…' : children}
    </button>
  );
}
