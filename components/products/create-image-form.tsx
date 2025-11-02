'use client';

import { useFormState } from 'react-dom';
import { createProductImage } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ProductVariantWithRelations } from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';

interface CreateImageFormProps {
  productId: string;
  variants: ProductVariantWithRelations[];
}

export default function CreateImageForm({ productId, variants }: CreateImageFormProps) {
  const [state, formAction] = useFormState(createProductImage, initialActionState);

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

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Image URL</span>
        <input
          type="url"
          name="url"
          required
          placeholder="https://..."
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 180px', minWidth: '160px' }}>
          <span style={{ fontWeight: 600 }}>Variant (optional)</span>
          <select
            name="variant_id"
            defaultValue=""
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="">Unassigned</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.sku}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 120px', minWidth: '120px' }}>
          <span style={{ fontWeight: 600 }}>Width (px)</span>
          <input
            type="number"
            name="width"
            min="0"
            step="1"
            placeholder="1200"
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 120px', minWidth: '120px' }}>
          <span style={{ fontWeight: 600 }}>Height (px)</span>
          <input
            type="number"
            name="height"
            min="0"
            step="1"
            placeholder="900"
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
            }}
          />
        </label>
      </div>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Storage path (optional)</span>
        <input
          type="text"
          name="storage_path"
          placeholder="product-images/pegasus-1.jpg"
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Alt text (optional)</span>
        <input
          type="text"
          name="alt_text"
          placeholder="Side profile of the Pegasus"
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '0.65rem',
            border: '1px solid #d1d5db',
          }}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormMessage state={state} />
        <SubmitButton pendingLabel="Saving…">Add image</SubmitButton>
      </div>
    </form>
  );
}
