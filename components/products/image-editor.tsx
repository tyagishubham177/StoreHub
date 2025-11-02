'use client';

import { useFormState } from 'react-dom';
import { deleteProductImage, updateProductImage } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type { ProductVariantWithRelations } from '@/types/products';
import type { Database } from '@/types/database';
import FormMessage from './form-message';
import SubmitButton from './submit-button';

type ImageRow = Database['public']['Tables']['product_images']['Row'];

interface ImageEditorProps {
  image: ImageRow;
  variants: ProductVariantWithRelations[];
}

export default function ImageEditor({ image, variants }: ImageEditorProps) {
  const [updateState, updateAction] = useFormState(updateProductImage, initialActionState);
  const [deleteState, deleteAction] = useFormState(deleteProductImage, initialActionState);

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
        <input type="hidden" name="image_id" value={image.id} />

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600 }}>Image URL</span>
          <input
            type="url"
            name="url"
            defaultValue={image.url}
            required
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
            }}
          />
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem', flex: '1 1 160px', minWidth: '160px' }}>
            <span style={{ fontWeight: 600 }}>Variant</span>
            <select
              name="variant_id"
              defaultValue={image.variant_id ?? ''}
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
              defaultValue={image.width ?? ''}
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
              defaultValue={image.height ?? ''}
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: '0.65rem',
                border: '1px solid #d1d5db',
              }}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600 }}>Storage path</span>
          <input
            type="text"
            name="storage_path"
            defaultValue={image.storage_path ?? ''}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontWeight: 600 }}>Alt text</span>
          <input
            type="text"
            name="alt_text"
            defaultValue={image.alt_text ?? ''}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid #d1d5db',
            }}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <FormMessage state={updateState} />
          <SubmitButton pendingLabel="Saving…">Save image</SubmitButton>
        </div>
      </form>

      <form action={deleteAction}>
        <input type="hidden" name="image_id" value={image.id} />
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
            Delete image
          </button>
        </div>
      </form>
    </div>
  );
}
