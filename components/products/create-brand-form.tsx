'use client';

import { useFormState } from 'react-dom';
import { createBrand, initialActionState } from '@/app/products/actions';
import FormMessage from './form-message';
import SubmitButton from './submit-button';

export default function CreateBrandForm() {
  const [state, formAction] = useFormState(createBrand, initialActionState);

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gap: '0.75rem',
      }}
    >
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Brand name</span>
        <input
          type="text"
          name="name"
          required
          placeholder="Nike"
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormMessage state={state} />
        <SubmitButton>Add brand</SubmitButton>
      </div>
    </form>
  );
}
