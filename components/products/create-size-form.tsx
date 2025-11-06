'use client';

import { useFormState } from 'react-dom';
import { createSize } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateSizeFormProps {
  disabled: boolean;
}

export default function CreateSizeForm({ disabled }: CreateSizeFormProps) {
  const [state, formAction] = useFormState(createSize, initialActionState);

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="size-label">Size label</Label>
        <Input id="size-label" type="text" name="label" required placeholder="US 10" disabled={disabled} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="size-sort">Sort order (optional)</Label>
        <Input id="size-sort" type="number" name="sort_order" min="0" step="1" disabled={disabled} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <FormMessage state={state} />
          {disabled ? <p className="m-0 font-semibold text-yellow-600">{VIEW_ONLY_MESSAGE}</p> : null}
        </div>
        <SubmitButton disabled={disabled} pendingLabel="Adding…">
          Add size
        </SubmitButton>
      </div>
    </form>
  );
}
