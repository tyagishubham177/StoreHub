'use client';

import { useFormState } from 'react-dom';
import { createProduct } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';

interface CreateProductFormProps {
  brands: { id: number; name: string }[];
  writesEnabled: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
};

export default function CreateProductForm({ brands, writesEnabled }: CreateProductFormProps) {
  const [state, formAction] = useFormState(createProduct, initialActionState);
  const disabled = !writesEnabled;

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gap: '0.9rem',
        padding: '1.25rem',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 30px -20px rgba(15, 23, 42, 0.35)',
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Create a product</h3>
        <p style={{ margin: '0.35rem 0 0', color: '#6b7280' }}>
          Define base details. Variants and images can be added after the product is saved.
        </p>
      </div>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Name</span>
        <input
          type="text"
          name="name"
          required
          placeholder="Air Zoom Pegasus"
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
          defaultValue=""
          disabled={disabled}
          style={{
            padding: '0.7rem 0.9rem',
            borderRadius: '0.75rem',
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            color: disabled ? '#9ca3af' : undefined,
          }}
        >
          <option value="">Select brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Base price</span>
        <input
          type="number"
          min="0"
          step="0.01"
          name="base_price"
          required
          placeholder="120"
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
        <span style={{ fontWeight: 600 }}>Status</span>
        <select
          name="status"
          defaultValue="draft"
          disabled={disabled}
          style={{
            padding: '0.7rem 0.9rem',
            borderRadius: '0.75rem',
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            color: disabled ? '#9ca3af' : undefined,
          }}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>Description</span>
        <textarea
          name="description"
          rows={4}
          placeholder="Responsive neutral running shoe with Flywire support."
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
          <FormMessage state={state} />
          {disabled ? (
            <p style={{ margin: 0, color: '#b45309', fontWeight: 600 }}>{VIEW_ONLY_MESSAGE}</p>
          ) : null}
        </div>
        <SubmitButton disabled={disabled} pendingLabel="Creating…">
          Create product
        </SubmitButton>
      </div>
    </form>
  );
}
