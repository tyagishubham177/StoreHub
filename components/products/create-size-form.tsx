'use client';

import { useFormState } from 'react-dom';
import { createSize, initialActionState } from '@/app/products/actions';
import FormMessage from './form-message';
import SubmitButton from './submit-button';

export default function CreateSizeForm() {
  const [state, formAction] = useFormState(createSize, initialActionState);

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gap: '0.75rem',
      }}
    >
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Size label</span>
        <input
          type="text"
          name="label"
          required
          placeholder="US 10"
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Sort order (optional)</span>
        <input
          type="number"
          name="sort_order"
          placeholder="1"
          min="0"
          step="1"
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormMessage state={state} />
        <SubmitButton>Add size</SubmitButton>
      </div>
    </form>
  );
}
