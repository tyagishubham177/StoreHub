'use client';

import { useFormState } from 'react-dom';
import { deleteVariant, updateVariant } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ColorSummary, SizeSummary, ProductVariantWithRelations } from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';

interface VariantEditorProps {
  variant: ProductVariantWithRelations;
  colors: ColorSummary[];
  sizes: SizeSummary[];
}

export default function VariantEditor({ variant, colors, sizes }: VariantEditorProps) {
  const [updateState, updateAction] = useFormState(updateVariant, initialActionState);
  const [deleteState, deleteAction] = useFormState(deleteVariant, initialActionState);

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.85rem',
        padding: '1rem',
        display: 'grid',
        gap: '0.75rem',
        backgroundColor: '#ffffff',
      }}
    >
      <form action={updateAction} style={{ display: 'grid', gap: '0.75rem' }}>
        <input type="hidden" name="variant_id" value={variant.id} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 140px', minWidth: '140px' }}>
            <span style={{ fontWeight: 600 }}>Color</span>
            <select
              name="color_id"
              defaultValue={variant.color_id ?? ''}
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: '0.65rem',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
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

          <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 140px', minWidth: '140px' }}>
            <span style={{ fontWeight: 600 }}>Size</span>
            <select
              name="size_id"
              defaultValue={variant.size_id ?? ''}
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: '0.65rem',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">None</option>
              {sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 120px', minWidth: '120px' }}>
            <span style={{ fontWeight: 600 }}>Price</span>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              defaultValue={variant.price}
              required
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: '0.65rem',
                border: '1px solid #d1d5db',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 120px', minWidth: '120px' }}>
            <span style={{ fontWeight: 600 }}>Stock</span>
            <input
              type="number"
              name="stock_qty"
              min="0"
              step="1"
              defaultValue={variant.stock_qty}
              required
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: '0.65rem',
                border: '1px solid #d1d5db',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 160px', minWidth: '160px' }}>
            <span style={{ fontWeight: 600 }}>SKU</span>
            <input
              type="text"
              name="sku"
              defaultValue={variant.sku}
              required
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: '0.65rem',
                border: '1px solid #d1d5db',
              }}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: '0.35rem', maxWidth: '200px' }}>
          <span style={{ fontWeight: 600 }}>Status</span>
          <select
            name="is_active"
            defaultValue={variant.is_active ? 'true' : 'false'}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <FormMessage state={updateState} />
          <SubmitButton pendingLabel="Saving…">Save variant</SubmitButton>
        </div>
      </form>

      <form action={deleteAction}>
        <input type="hidden" name="variant_id" value={variant.id} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormMessage state={deleteState} />
          <button
            type="submit"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#dc2626',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Delete variant
          </button>
        </div>
      </form>
    </div>
  );
}
