'use client';

import { useFormState } from 'react-dom';
import { deleteProductImage, updateProductImage } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ProductVariantWithRelations } from '@/types/products';
import type { Database } from '@/types/database';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ImageRow = Database['public']['Tables']['product_images']['Row'];

interface ImageEditorProps {
  image: ImageRow;
  variants: ProductVariantWithRelations[];
  writesEnabled: boolean;
  onClose: () => void;
}

export default function ImageEditor({ image, variants, writesEnabled, onClose }: ImageEditorProps) {
  const [updateState, updateAction] = useFormState(updateProductImage, initialActionState);
  const [deleteState, deleteAction] = useFormState(deleteProductImage, initialActionState);
  const disabled = !writesEnabled;

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-lg font-semibold">
          Edit image
        </h4>
        <form action={deleteAction}>
          <input type="hidden" name="image_id" value={image.id} />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={disabled}
            aria-label="Delete image"
          >
            <Trash2 size={16} />
          </Button>
          <FormMessage state={deleteState} />
        </form>
      </div>

      <form action={updateAction} className="grid gap-4">
        <input type="hidden" name="image_id" value={image.id} />

        <label className="grid gap-1.5">
          <span>Image URL</span>
          <input type="url" name="url" defaultValue={image.url} required disabled={disabled} />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="grid gap-1.5">
            <span>Variant</span>
            <Select
              name="variant_id"
              defaultValue={image.variant_id ?? 'null'}
              disabled={disabled}
            >
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
          </label>

          <label className="grid gap-1.5">
            <span>Width (px)</span>
            <input
              type="number"
              name="width"
              min="0"
              step="1"
              defaultValue={image.width ?? ''}
              disabled={disabled}
            />
          </label>

          <label className="grid gap-1.5">
            <span>Height (px)</span>
            <input
              type="number"
              name="height"
              min="0"
              step="1"
              defaultValue={image.height ?? ''}
              disabled={disabled}
            />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span>Storage path</span>
          <input
            type="text"
            name="storage_path"
            defaultValue={image.storage_path ?? ''}
            disabled={disabled}
          />
        </label>

        <label className="grid gap-1.5">
          <span>Alt text</span>
          <input
            type="text"
            name="alt_text"
            defaultValue={image.alt_text ?? ''}
            disabled={disabled}
          />
        </label>

        <div className="flex items-center justify-between">
          <div>
            <FormMessage state={updateState} />
            {disabled && <p className="font-semibold text-amber-700">{VIEW_ONLY_MESSAGE}</p>}
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <SubmitButton disabled={disabled} pendingLabel="Saving…">
              Save image
            </SubmitButton>
          </div>
        </div>
      </form>
    </Card>
  );
}
