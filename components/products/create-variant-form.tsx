'use client';

import { useFormState } from 'react-dom';
import { createVariant } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ColorSummary, SizeSummary } from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';

interface CreateVariantFormProps {
  productId: string;
  colors: ColorSummary[];
  sizes: SizeSummary[];
  writesEnabled: boolean;
}

export default function CreateVariantForm({
  productId,
  colors,
  sizes,
  writesEnabled,
}: CreateVariantFormProps) {
  const [state, formAction] = useFormState(createVariant, initialActionState);
  const disabled = !writesEnabled;

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gap: '0.75rem',
        padding: '1rem',
        border: '1px dashed #d1d5db',
        borderRadius: '0.85rem',
        backgroundColor: '#f9fafb',
      }}
    >
      <input type="hidden" name="product_id" value={productId} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 160px', minWidth: '140px' }}>
          <span style={{ fontWeight: 600 }}>Color</span>
          <select
            name="color_id"
            defaultValue=""
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

        <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 160px', minWidth: '140px' }}>
          <span style={{ fontWeight: 600 }}>Size</span>
          <select
            name="size_id"
            defaultValue=""
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
            {sizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 160px', minWidth: '120px' }}>
          <span style={{ fontWeight: 600 }}>Price</span>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            required
            placeholder="130"
            disabled={disabled}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
              backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 160px', minWidth: '120px' }}>
          <span style={{ fontWeight: 600 }}>Stock</span>
          <input
            type="number"
            name="stock_qty"
            min="0"
            step="1"
            required
            placeholder="10"
            disabled={disabled}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
              backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 180px', minWidth: '160px' }}>
          <span style={{ fontWeight: 600 }}>SKU</span>
          <input
            type="text"
            name="sku"
            required
            placeholder="PEG-CLAY-10"
            disabled={disabled}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
              backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
            }}
          />
        </label>
      </div>

      <label style={{ display: 'grid', gap: '0.35rem', maxWidth: '200px' }}>
        <span style={{ fontWeight: 600 }}>Status</span>
        <select
          name="is_active"
          defaultValue="true"
          disabled={disabled}
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            color: disabled ? '#9ca3af' : undefined,
          }}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <FormMessage state={state} />
          {disabled ? (
            <p style={{ margin: 0, color: '#b45309', fontWeight: 600 }}>{VIEW_ONLY_MESSAGE}</p>
          ) : null}
        </div>
        <SubmitButton disabled={disabled} pendingLabel="Adding…">
          Add variant
        </SubmitButton>
      </div>
    </form>
  );
}
