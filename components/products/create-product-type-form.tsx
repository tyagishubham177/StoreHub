'use client';

import { useFormState } from 'react-dom';
import { createProductType } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';

interface CreateProductTypeFormProps {
  disabled?: boolean;
}

export default function CreateProductTypeForm({ disabled }: CreateProductTypeFormProps) {
  const [state, formAction] = useFormState(createProductType, initialActionState);

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="product-type-name">Product type</Label>
        <Input
          id="product-type-name"
          type="text"
          name="name"
          placeholder="e.g. Footwear, Apparel"
          required
          disabled={disabled}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <FormMessage state={state} />
          {disabled ? <p className="m-0 font-semibold text-yellow-600">{VIEW_ONLY_MESSAGE}</p> : null}
        </div>
        <SubmitButton disabled={disabled} pendingLabel="Adding…">
          Add type
        </SubmitButton>
      </div>
    </form>
  );
}
