'use client';

import { useMemo } from 'react';
import { useFormState } from 'react-dom';
import { restoreProduct, softDeleteProduct, updateProduct } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type {
  BrandSummary,
  ColorSummary,
  ProductWithRelations,
  SizeSummary,
} from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import CreateVariantForm from './create-variant-form';
import VariantEditor from './variant-editor';
import CreateImageForm from './create-image-form';
import ImageEditor from './image-editor';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';

const STATUS_LABELS: Record<string, { label: string; color: string; background: string }> = {
  draft: { label: 'Draft', color: '#1d4ed8', background: '#dbeafe' },
  active: { label: 'Active', color: '#047857', background: '#d1fae5' },
  archived: { label: 'Archived', color: '#92400e', background: '#fef3c7' },
};

interface ProductCardProps {
  product: ProductWithRelations;
  brands: BrandSummary[];
  colors: ColorSummary[];
  sizes: SizeSummary[];
  writesEnabled: boolean;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function ProductCard({ product, brands, colors, sizes, writesEnabled }: ProductCardProps) {
  const [updateState, updateAction] = useFormState(updateProduct, initialActionState);
  const [archiveState, archiveAction] = useFormState(softDeleteProduct, initialActionState);
  const [restoreState, restoreAction] = useFormState(restoreProduct, initialActionState);

  const statusDetails = STATUS_LABELS[product.status] ?? STATUS_LABELS.draft;
  const isArchived = Boolean(product.deleted_at) || product.status === 'archived';
  const disabled = !writesEnabled;

  const variants = useMemo(
    () => [...product.variants].sort((a, b) => a.sku.localeCompare(b.sku)),
    [product.variants]
  );
  const images = useMemo(() => [...product.images], [product.images]);

  return (
    <article
      style={{
        display: 'grid',
        gap: '1.5rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '1.1rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 20px 45px -25px rgba(15, 23, 42, 0.35)',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{product.name}</h2>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>{product.slug}</p>
          </div>
          <span
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              backgroundColor: statusDetails.background,
              color: statusDetails.color,
              fontWeight: 600,
            }}
          >
            {statusDetails.label}
          </span>
        </div>

        <div style={{ color: '#374151' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{currency.format(product.base_price)}</p>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
            {product.brand ? `Brand: ${product.brand.name}` : 'No brand assigned'}
          </p>
          {isArchived ? (
            <p style={{ margin: '0.25rem 0 0', color: '#b91c1c', fontWeight: 600 }}>
              Archived {product.deleted_at ? new Date(product.deleted_at).toLocaleDateString() : ''}
            </p>
          ) : null}
        </div>
      </header>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <form action={updateAction} style={{ display: 'grid', gap: '0.75rem' }}>
          <input type="hidden" name="product_id" value={product.id} />

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>Name</span>
            <input
              type="text"
              name="name"
              defaultValue={product.name}
              required
              disabled={disabled}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: '0.75rem',
                border: '1px solid #d1d5db',
                backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>Slug</span>
            <input
              type="text"
              name="slug"
              defaultValue={product.slug}
              required
              disabled={disabled}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: '0.75rem',
                border: '1px solid #d1d5db',
                backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>Brand</span>
            <select
              name="brand_id"
              defaultValue={product.brand_id ?? ''}
              disabled={disabled}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: '0.75rem',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: disabled ? '#9ca3af' : undefined,
              }}
            >
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '0.35rem', maxWidth: '200px' }}>
            <span style={{ fontWeight: 600 }}>Base price</span>
            <input
              type="number"
              name="base_price"
              min="0"
              step="0.01"
              defaultValue={product.base_price}
              required
              disabled={disabled}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: '0.75rem',
                border: '1px solid #d1d5db',
                backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem', maxWidth: '200px' }}>
            <span style={{ fontWeight: 600 }}>Status</span>
            <select
              name="status"
              defaultValue={product.status}
              disabled={disabled}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: '0.75rem',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: disabled ? '#9ca3af' : undefined,
              }}
            >
              {Object.entries(STATUS_LABELS).map(([value, details]) => (
                <option key={value} value={value}>
                  {details.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>Description</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={product.description ?? ''}
              disabled={disabled}
              style={{
                padding: '0.7rem 0.9rem',
                borderRadius: '0.75rem',
                border: '1px solid #d1d5db',
                resize: 'vertical',
                backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
              }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <FormMessage state={updateState} />
              {disabled ? (
                <p style={{ margin: 0, color: '#b45309', fontWeight: 600 }}>{VIEW_ONLY_MESSAGE}</p>
              ) : null}
            </div>
            <SubmitButton disabled={disabled} pendingLabel="Saving…">
              Save details
            </SubmitButton>
          </div>
        </form>

        <form action={isArchived ? restoreAction : archiveAction}>
          <input type="hidden" name="product_id" value={product.id} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormMessage state={isArchived ? restoreState : archiveState} />
            <button
              type="submit"
              disabled={disabled}
              style={{
                border: 'none',
                background: 'transparent',
                color: isArchived ? '#047857' : '#dc2626',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              {isArchived ? 'Restore product' : 'Archive product'}
            </button>
          </div>
        </form>
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0 }}>Variants</h3>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
            Track size, color, inventory, and pricing per SKU.
          </p>
        </div>

        {variants.length ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {variants.map((variant) => (
              <VariantEditor
                key={variant.id}
                variant={variant}
                colors={colors}
                sizes={sizes}
                writesEnabled={writesEnabled}
              />
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#6b7280' }}>No variants yet.</p>
        )}

        <CreateVariantForm
          productId={product.id}
          colors={colors}
          sizes={sizes}
          writesEnabled={writesEnabled}
        />
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0 }}>Images</h3>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
            Attach hosted URLs or Supabase storage references. Limit to three featured images per product.
          </p>
        </div>

        {images.length ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {images.map((image) => (
              <ImageEditor
                key={image.id}
                image={image}
                variants={variants}
                writesEnabled={writesEnabled}
              />
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: '#6b7280' }}>No images linked yet.</p>
        )}

        <CreateImageForm
          productId={product.id}
          variants={variants}
          writesEnabled={writesEnabled}
        />
      </section>
    </article>
  );
}
