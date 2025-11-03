'use client';

import { useFormState } from 'react-dom';
import { createSize } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';

interface CreateSizeFormProps {
  disabled: boolean;
}

export default function CreateSizeForm({ disabled }: CreateSizeFormProps) {
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
          disabled={disabled}
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
            backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Sort order (optional)</span>
        <input
          type="number"
          name="sort_order"
          min="0"
          step="1"
          disabled={disabled}
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
            backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
          }}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <FormMessage state={state} />
          {disabled ? (
            <p style={{ margin: 0, color: '#b45309', fontWeight: 600 }}>{VIEW_ONLY_MESSAGE}</p>
          ) : null}
        </div>
        <SubmitButton disabled={disabled}>Add size</SubmitButton>
      </div>
    </form>
  );
}
