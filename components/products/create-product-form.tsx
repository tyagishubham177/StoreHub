'use client';

import { useFormState } from 'react-dom';
import { createProduct } from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
      className="grid gap-4 rounded-lg border bg-white p-5 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]"
    >
      <div>
        <h3 className="m-0 text-lg">Create a product</h3>
        <p className="mb-0 mt-1 text-gray-500">
          Define base details. Variants and images can be added after the product is saved.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          name="name"
          required
          placeholder="Air Zoom Pegasus"
          disabled={disabled}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="brand_id">Brand</Label>
        <Select name="brand_id" defaultValue="" disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select brand</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={String(brand.id)}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="base_price">Base price</Label>
        <Input
          id="base_price"
          type="number"
          min="0"
          step="0.01"
          name="base_price"
          required
          placeholder="120"
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue="draft" disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="product_type">Product Type</Label>
          <Input
            id="product_type"
            type="text"
            name="product_type"
            placeholder="e.g. Shoes, Shirts"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Responsive neutral running shoe with Flywire support."
          disabled={disabled}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <FormMessage state={state} />
          {disabled ? <p className="m-0 font-semibold text-yellow-600">{VIEW_ONLY_MESSAGE}</p> : null}
        </div>
        <SubmitButton disabled={disabled} pendingLabel="Creating…">
          Create product
        </SubmitButton>
      </div>
    </form>
  );
}
