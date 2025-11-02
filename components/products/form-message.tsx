'use client';

import type { ActionState } from '@/app/products/action-state';

interface FormMessageProps {
  state: ActionState;
}

export default function FormMessage({ state }: FormMessageProps) {
  if (state.status === 'idle' || !state.message) {
    return null;
  }

  const color = state.status === 'error' ? '#dc2626' : '#047857';

  return (
    <p
      role={state.status === 'error' ? 'alert' : undefined}
      style={{
        margin: 0,
        color,
        fontWeight: 600,
      }}
    >
      {state.message}
    </p>
  );
}
