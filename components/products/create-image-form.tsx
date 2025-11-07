'use client';

import { useRef, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { createProductImage } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ProductVariantWithRelations } from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
interface CreateImageFormProps {
  productId: string;
  variants: ProductVariantWithRelations[];
  writesEnabled: boolean;
  onClose: () => void;
}

export default function CreateImageForm({ productId, variants, writesEnabled, onClose }: CreateImageFormProps) {
  const [state, formAction] = useFormState(createProductImage, initialActionState);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setUrl('');
      setFile(null);
      onClose();
    }
  }, [state.status, onClose]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"
    >
      <input type="hidden" name="product_id" value={productId} />

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="grid gap-2">
          <Label htmlFor="image-upload">Upload Image</Label>
          <Input
            id="image-upload"
            type="file"
            name="image"
            accept="image/*"
            disabled={!writesEnabled || Boolean(url)}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="relative text-xs uppercase self-end pb-3">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="url">Image URL</Label>
          <Input
            id="url"
            type="url"
            name="url"
            placeholder="https://..."
            disabled={!writesEnabled || Boolean(file)}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="alt_text">Alt text (optional)</Label>
        <Input
          id="alt_text"
          type="text"
          name="alt_text"
          placeholder="Side profile of the Pegasus"
          disabled={!writesEnabled}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <FormMessage state={state} />
          {!writesEnabled && <p className="m-0 font-semibold text-yellow-600">{VIEW_ONLY_MESSAGE}</p>}
        </div>
        <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        <SubmitButton disabled={!writesEnabled} pendingLabel="Saving…">
          Add image
        </SubmitButton>
        </div>
      </div>
    </form>
  );
}
