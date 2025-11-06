'use client';

import { useFormState } from 'react-dom';
import { createBrand } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateBrandFormProps {
  disabled: boolean;
}

export default function CreateBrandForm({ disabled }: CreateBrandFormProps) {
  const [state, formAction] = useFormState(createBrand, initialActionState);

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="brand-name">Brand name</Label>
        <Input id="brand-name" type="text" name="name" required placeholder="Nike" disabled={disabled} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <FormMessage state={state} />
          {disabled ? <p className="m-0 font-semibold text-yellow-600">{VIEW_ONLY_MESSAGE}</p> : null}
        </div>
        <SubmitButton disabled={disabled} pendingLabel="Adding…">
          Add brand
        </SubmitButton>
      </div>
    </form>
  );
}
