'use client';

import { useFormState } from 'react-dom';
import { createProductType } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { Input } from '@/components/ui/input';

interface CreateProductTypeFormProps {
  disabled?: boolean;
}

export default function CreateProductTypeForm({ disabled }: CreateProductTypeFormProps) {
  const [state, formAction] = useFormState(createProductType, initialActionState);

  return (
    <form action={formAction} className="mt-4 flex items-start gap-3">
      <div className="grid flex-grow gap-1">
        <Input
          type="text"
          name="name"
          placeholder="e.g. Footwear, Apparel"
          required
          disabled={disabled}
        />
        <FormMessage state={state} />
      </div>
      <SubmitButton disabled={disabled} pendingLabel="Adding…">
        Add type
      </SubmitButton>
    </form>
  );
}
