'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  disabled?: boolean;
}

export default function SubmitButton({ children, pendingLabel, disabled = false }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
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
        backgroundColor: isDisabled ? '#9ca3af' : '#2563eb',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 120ms ease-out',
      }}
    >
      {pending ? pendingLabel ?? 'Saving…' : children}
    </button>
  );
}
