'use client';

import { useFormState } from 'react-dom';
import { createColor } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';
import SubmitButton from './submit-button';

export default function CreateColorForm() {
  const [state, formAction] = useFormState(createColor, initialActionState);

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gap: '0.75rem',
      }}
    >
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Color name</span>
        <input
          type="text"
          name="name"
          required
          placeholder="Desert Clay"
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Hex value</span>
        <input
          type="text"
          name="hex"
          required
          placeholder="#f97316"
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormMessage state={state} />
        <SubmitButton>Add color</SubmitButton>
      </div>
    </form>
  );
}
