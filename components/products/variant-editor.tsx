'use client';

import { useFormState } from 'react-dom';
import { deleteVariant, updateVariant } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ColorSummary, SizeSummary, ProductVariantWithRelations } from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
interface VariantEditorProps {
  variant: ProductVariantWithRelations;
  colors: ColorSummary[];
  sizes: SizeSummary[];
  writesEnabled: boolean;
  onClose: () => void;
}

export default function VariantEditor({ variant, colors, sizes, writesEnabled, onClose }: VariantEditorProps) {
  const [updateState, updateAction] = useFormState(updateVariant, initialActionState);
  const [deleteState, deleteAction] = useFormState(deleteVariant, initialActionState);
  const disabled = !writesEnabled;

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-lg font-semibold">
          Edit variant
        </h4>
        <form action={deleteAction}>
          <input type="hidden" name="variant_id" value={variant.id} />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={disabled}
            aria-label="Delete variant"
          >
            <Trash2 size={16} />
          </Button>
          <FormMessage state={deleteState} />
        </form>
      </div>
      <form action={updateAction} className="grid gap-4">
        <input type="hidden" name="variant_id" value={variant.id} />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <label className="grid gap-1.5">
            <span>Color</span>
            <select
              name="color_id"
              defaultValue={variant.color_id ?? ''}
              disabled={disabled}
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: '0.65rem',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: disabled ? '#9ca3af' : undefined,
              }}
            >
              <option value="">None</option>
              {colors.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span>Size</span>
            <select name="size_id" defaultValue={variant.size_id ?? ''} disabled={disabled}>
              <option value="">None</option>
              {sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span>Price</span>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              defaultValue={variant.price}
              required
              disabled={disabled}
            />
          </label>

          <label className="grid gap-1.5">
            <span>Stock</span>
            <input
              type="number"
              name="stock_qty"
              min="0"
              step="1"
              defaultValue={variant.stock_qty}
              required
              disabled={disabled}
            />
          </label>

          <label className="grid gap-1.5">
            <span>SKU</span>
            <input type="text" name="sku" defaultValue={variant.sku} required disabled={disabled} />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span>Status</span>
          <select name="is_active" defaultValue={variant.is_active ? 'true' : 'false'} disabled={disabled}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
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
              Save variant
            </SubmitButton>
          </div>
        </div>
      </form>
    </div>
  );
}
