'use client';

import { useFormState } from 'react-dom';
import { deleteProductImage, updateProductImage } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ProductVariantWithRelations } from '@/types/products';
import type { Database } from '@/types/database';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import FormPendingOverlay from './form-pending-overlay';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ImageRow = Database['public']['Tables']['product_images']['Row'];

interface ImageEditorProps {
  image: ImageRow;
  variants: ProductVariantWithRelations[];
  writesEnabled: boolean;
  onClose: () => void;
}

const selectClasses =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function ImageEditor({ image, variants, writesEnabled, onClose }: ImageEditorProps) {
  const [updateState, updateAction] = useFormState(updateProductImage, initialActionState);
  const [deleteState, deleteAction] = useFormState(deleteProductImage, initialActionState);
  const disabled = !writesEnabled;

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <form action={updateAction} className="relative grid gap-4">
        <FormPendingOverlay label="Saving image…" className="rounded-lg" />
        <input type="hidden" name="image_id" value={image.id} />

        <div className="grid gap-2">
          <Label htmlFor={`image-url-${image.id}`}>Image URL</Label>
          <Input
            id={`image-url-${image.id}`}
            type="url"
            name="url"
            defaultValue={image.url}
            required
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor={`image-variant-${image.id}`}>Variant</Label>
            <Select name="variant_id" defaultValue={image.variant_id ?? 'null'} disabled={disabled}>
              <SelectTrigger id={`image-variant-${image.id}`} className={selectClasses}>
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
            <Label htmlFor={`image-width-${image.id}`}>Width (px)</Label>
            <Input
              id={`image-width-${image.id}`}
              type="number"
              name="width"
              min="0"
              step="1"
              defaultValue={image.width ?? ''}
              disabled={disabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`image-height-${image.id}`}>Height (px)</Label>
            <Input
              id={`image-height-${image.id}`}
              type="number"
              name="height"
              min="0"
              step="1"
              defaultValue={image.height ?? ''}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={`image-storage-${image.id}`}>Storage path</Label>
            <Input
              id={`image-storage-${image.id}`}
              type="text"
              name="storage_path"
              defaultValue={image.storage_path ?? ''}
              disabled={disabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`image-alt-${image.id}`}>Alt text</Label>
            <Input
              id={`image-alt-${image.id}`}
              type="text"
              name="alt_text"
              defaultValue={image.alt_text ?? ''}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="grid gap-1 text-sm">
            <FormMessage state={updateState} />
            {disabled ? <p className="m-0 font-semibold text-yellow-600">{VIEW_ONLY_MESSAGE}</p> : null}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <SubmitButton disabled={disabled} pendingLabel="Saving…">
              Save image
            </SubmitButton>
          </div>
        </div>
      </form>

      <form
        action={deleteAction}
        className="relative flex items-center justify-between gap-3 border-t pt-4"
        onSubmit={(event) => {
          if (disabled || !window.confirm('Delete this image? This cannot be undone.')) {
            event.preventDefault();
          }
        }}
      >
        <FormPendingOverlay label="Deleting image…" className="rounded-b-lg" />
        <input type="hidden" name="image_id" value={image.id} />
        <FormMessage state={deleteState} />
        <SubmitButton disabled={disabled} pendingLabel="Deleting…" variant="destructive">
          Delete image
        </SubmitButton>
      </form>
    </div>
  );
}
