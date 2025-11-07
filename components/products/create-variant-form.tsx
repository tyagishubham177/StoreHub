'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { createVariant } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ColorSummary, SizeSummary } from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateVariantFormProps {
  productId: string;
  colors: ColorSummary[];
  sizes: SizeSummary[];
  writesEnabled: boolean;
  onClose: () => void;
}

const selectClasses =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function CreateVariantForm({
  productId,
  colors,
  sizes,
  writesEnabled,
  onClose,
}: CreateVariantFormProps) {
  const [state, formAction] = useFormState(createVariant, initialActionState);
  const disabled = !writesEnabled;

  useEffect(() => {
    if (state.status === 'success') {
      onClose();
    }
  }, [state.status, onClose]);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4"
    >
      <input type="hidden" name="product_id" value={productId} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="variant-color-create">Color (optional)</Label>
          <select
            id="variant-color-create"
            name="color_id"
            defaultValue="null"
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
          <Label htmlFor="variant-size-create">Size (optional)</Label>
          <select
            id="variant-size-create"
            name="size_id"
            defaultValue="null"
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
          <Label htmlFor="variant-price-create">Variant price</Label>
          <Input
            id="variant-price-create"
            type="number"
            name="price"
            min="0"
            step="0.01"
            required
            placeholder="130"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="variant-stock-create">Stock</Label>
          <Input
            id="variant-stock-create"
            type="number"
            name="stock_qty"
            min="0"
            step="1"
            required
            placeholder="10"
            disabled={disabled}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="variant-sku-create">SKU</Label>
          <Input
            id="variant-sku-create"
            type="text"
            name="sku"
            required
            placeholder="PEG-CLAY-10"
            disabled={disabled}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="variant-status-create">Status</Label>
          <select
            id="variant-status-create"
            name="is_active"
            defaultValue="true"
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
          <FormMessage state={state} />
          {disabled ? <p className="m-0 font-semibold text-yellow-600">{VIEW_ONLY_MESSAGE}</p> : null}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton disabled={disabled} pendingLabel="Adding…">
            Add variant
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
