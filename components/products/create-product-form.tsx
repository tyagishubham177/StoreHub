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
  productTypes: { id: number; name: string }[];
  colors: { id: number; name: string }[];
  sizes: { id: number; label: string }[];
  writesEnabled: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
};

export default function CreateProductForm({ brands, productTypes, colors, sizes, writesEnabled }: CreateProductFormProps) {
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" type="text" name="name" required placeholder="Air Zoom Pegasus" disabled={disabled} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="brand_id">Brand</Label>
          <Select name="brand_id" defaultValue="null" disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">No brand</SelectItem>
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
          <Label htmlFor="product_type_id">Product Type</Label>
          <Select name="product_type_id" defaultValue="null" disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">No product type</SelectItem>
              {productTypes.map((productType) => (
                <SelectItem key={productType.id} value={String(productType.id)}>
                  {productType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={1}
            placeholder="Responsive neutral running shoe with Flywire support."
            disabled={disabled}
          />
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
        <div className="mb-4">
          <h4 className="text-base font-semibold">Initial variant</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Every product requires at least one variant. Use these details to create the first SKU alongside the product
            record.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="variant-color">Color (optional)</Label>
            <Select name="variant_color_id" defaultValue="null" disabled={disabled}>
              <SelectTrigger id="variant-color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">No color</SelectItem>
                {colors.map((color) => (
                  <SelectItem key={color.id} value={String(color.id)}>
                    {color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="variant-size">Size (optional)</Label>
            <Select name="variant_size_id" defaultValue="null" disabled={disabled}>
              <SelectTrigger id="variant-size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">No size</SelectItem>
                {sizes.map((size) => (
                  <SelectItem key={size.id} value={String(size.id)}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="variant-stock">Stock on hand</Label>
            <Input
              id="variant-stock"
              type="number"
              name="variant_stock_qty"
              min="0"
              step="1"
              required
              placeholder="20"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="variant-price">Variant price</Label>
            <Input
              id="variant-price"
              type="number"
              name="variant_price"
              min="0"
              step="0.01"
              placeholder="120"
              disabled={disabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="variant-sku">SKU</Label>
            <Input
              id="variant-sku"
              type="text"
              name="variant_sku"
              placeholder="PEG-CLAY-10"
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-generate a code from the brand, product name, size, and color.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="variant-status">Variant status</Label>
            <Select name="variant_is_active" defaultValue="true" disabled={disabled}>
              <SelectTrigger id="variant-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
