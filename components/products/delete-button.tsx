
'use client';

import { useFormState } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';

interface DeleteButtonProps {
  action: (state: any, formData: FormData) => Promise<any>;
  itemId: number | string;
  itemName: string;
  itemType: string;
}

export default function DeleteButton({ action, itemId, itemName, itemType }: DeleteButtonProps) {
  const [state, formAction] = useFormState(action, initialActionState);

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name={`${itemType}_id`} value={itemId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        aria-label={`Delete ${itemName}`}
      >
        <Trash2 size={16} />
      </Button>
      <FormMessage state={state} />
    </form>
  );
}
