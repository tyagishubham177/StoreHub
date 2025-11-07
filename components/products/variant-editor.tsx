'use client';

import { useFormState } from 'react-dom';
import { deleteVariant, updateVariant } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ColorSummary, SizeSummary, ProductVariantWithRelations } from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import FormPendingOverlay from './form-pending-overlay';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VariantEditorProps {
  variant: ProductVariantWithRelations;
  colors: ColorSummary[];
  sizes: SizeSummary[];
  writesEnabled: boolean;
  onClose: () => void;
}

const selectClasses =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function VariantEditor({ variant, colors, sizes, writesEnabled, onClose }: VariantEditorProps) {
  const [updateState, updateAction] = useFormState(updateVariant, initialActionState);
  const [deleteState, deleteAction] = useFormState(deleteVariant, initialActionState);
  const disabled = !writesEnabled;

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <form action={updateAction} className="relative grid gap-4">
        <FormPendingOverlay label="Saving variant…" className="rounded-lg" />
        <input type="hidden" name="variant_id" value={variant.id} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor={`variant-color-${variant.id}`}>Color (optional)</Label>
            <select
              id={`variant-color-${variant.id}`}
              name="color_id"
              defaultValue={typeof variant.color_id === 'number' ? String(variant.color_id) : 'null'}
              disabled={disabled}
              className={selectClasses}
            >
              <option value="null">None</option>
              {colors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`variant-size-${variant.id}`}>Size (optional)</Label>
            <select
              id={`variant-size-${variant.id}`}
              name="size_id"
              defaultValue={typeof variant.size_id === 'number' ? String(variant.size_id) : 'null'}
              disabled={disabled}
              className={selectClasses}
            >
              <option value="null">None</option>
              {sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`variant-price-${variant.id}`}>Variant price</Label>
            <Input
              id={`variant-price-${variant.id}`}
              type="number"
              name="price"
              min="0"
              step="0.01"
              defaultValue={variant.price}
              required
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor={`variant-stock-${variant.id}`}>Stock</Label>
            <Input
              id={`variant-stock-${variant.id}`}
              type="number"
              name="stock_qty"
              min="0"
              step="1"
              defaultValue={variant.stock_qty}
              required
              disabled={disabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`variant-sku-${variant.id}`}>SKU</Label>
            <Input
              id={`variant-sku-${variant.id}`}
              type="text"
              name="sku"
              defaultValue={variant.sku}
              required
              disabled={disabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`variant-status-${variant.id}`}>Status</Label>
            <select
              id={`variant-status-${variant.id}`}
              name="is_active"
              defaultValue={variant.is_active ? 'true' : 'false'}
              disabled={disabled}
              className={selectClasses}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
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
              Save variant
            </SubmitButton>
          </div>
        </div>
      </form>

      <form
        action={deleteAction}
        className="relative flex items-center justify-between gap-3 border-t pt-4"
        onSubmit={(event) => {
          if (disabled || !window.confirm(`Delete variant ${variant.sku}? This cannot be undone.`)) {
            event.preventDefault();
          }
        }}
      >
        <FormPendingOverlay label="Deleting variant…" className="rounded-b-lg" />
        <input type="hidden" name="variant_id" value={variant.id} />
        <FormMessage state={deleteState} />
        <SubmitButton disabled={disabled} pendingLabel="Deleting…" variant="destructive">
          Delete variant
        </SubmitButton>
      </form>
    </div>
  );
}
