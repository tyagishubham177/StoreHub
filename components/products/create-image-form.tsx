'use client';

import { useRef, useEffect } from 'react';
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

interface CreateImageFormProps {
  productId: string;
  variants: ProductVariantWithRelations[];
  writesEnabled: boolean;
}

export default function CreateImageForm({ productId, variants, writesEnabled }: CreateImageFormProps) {
  const [state, formAction] = useFormState(createProductImage, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"
    >
      <input type="hidden" name="product_id" value={productId} />

      <div className="grid gap-2">
        <Label htmlFor="image-upload">Upload Image</Label>
        <Input
          id="image-upload"
          type="file"
          name="image"
          accept="image/*"
          required
          disabled={!writesEnabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="variant_id">Variant (optional)</Label>
          <Select name="variant_id" defaultValue="null" disabled={!writesEnabled}>
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">Unassigned</SelectItem>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.sku}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="width">Width (px)</Label>
          <Input
            id="width"
            type="number"
            name="width"
            min="0"
            step="1"
            placeholder="1200"
            disabled={!writesEnabled}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            name="height"
            min="0"
            step="1"
            placeholder="900"
            disabled={!writesEnabled}
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
        <SubmitButton disabled={!writesEnabled} pendingLabel="Saving…">
          Add image
        </SubmitButton>
      </div>
    </form>
  );
}
