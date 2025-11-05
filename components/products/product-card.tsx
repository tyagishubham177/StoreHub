'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  archived: { label: 'Archived', variant: 'destructive' },
};

interface ProductCardProps {
  product: ProductWithRelations;
  brands: BrandSummary[];
  colors: ColorSummary[];
  sizes: SizeSummary[];
  productTypes: { id: number; name: string }[];
  writesEnabled: boolean;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function ProductCard({ product, brands, colors, sizes, productTypes, writesEnabled }: ProductCardProps) {
  const [updateState, updateAction] = useFormState(updateProduct, initialActionState);
  const [archiveState, archiveAction] = useFormState(softDeleteProduct, initialActionState);
  const [restoreState, restoreAction] = useFormState(restoreProduct, initialActionState);
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);

  const statusDetails = STATUS_LABELS[product.status] ?? STATUS_LABELS.draft;
  const isArchived = Boolean(product.deleted_at) || product.status === 'archived';
  const disabled = !writesEnabled;

  const variants = useMemo(
    () => [...product.variants].sort((a, b) => a.sku.localeCompare(b.sku)),
    [product.variants]
  );
  const images = useMemo(() => [...product.images], [product.images]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{product.slug}</p>
          </div>
          <Badge variant={statusDetails.variant}>{statusDetails.label}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold">{currency.format(product.base_price)}</p>
          <p>{product.brand ? `Brand: ${product.brand.name}` : 'No brand assigned'}</p>
          {isArchived ? (
            <p className="font-semibold text-destructive">
              Archived {product.deleted_at ? new Date(product.deleted_at).toLocaleDateString() : ''}
            </p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <form action={updateAction} className="space-y-4">
                <input type="hidden" name="product_id" value={String(product.id)} />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      defaultValue={product.name}
                      required
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="text-sm font-medium">Slug</label>
                    <Input
                      id="slug"
                      type="text"
                      name="slug"
                      defaultValue={product.slug}
                      required
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <label htmlFor="product_type_id" className="text-sm font-medium">Product Type</label>
                    <Select
                      name="product_type_id"
                      defaultValue={String(product.product_type_id ?? 'null')}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product type" />
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
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="brand_id" className="text-sm font-medium">Brand</label>
                    <Select
                      name="brand_id"
                      defaultValue={String(product.brand_id ?? 'null')}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a brand" />
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

                  <div>
                    <label htmlFor="base_price" className="text-sm font-medium">Base price</label>
                    <Input
                      id="base_price"
                      type="number"
                      name="base_price"
                      min="0"
                      step="0.01"
                      defaultValue={product.base_price}
                      required
                      disabled={disabled}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <Select name="status" defaultValue={product.status} disabled={disabled}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, details]) => (
                          <SelectItem key={value} value={value}>
                            {details.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>

                <div>
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={product.description ?? ''}
                    disabled={disabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <FormMessage state={updateState} />
                    {disabled && <p className="text-sm font-semibold text-yellow-600">{VIEW_ONLY_MESSAGE}</p>}
                  </div>
                  <SubmitButton disabled={disabled} pendingLabel="Saving…">
                    Save details
                  </SubmitButton>
                </div>
                </form>
                <form action={isArchived ? restoreAction : archiveAction}>
                  <input type="hidden" name="product_id" value={String(product.id)} />
                  <div className="mt-4 flex items-center justify-between">
                    <FormMessage state={isArchived ? restoreState : archiveState} />
                    <Button
                      type="submit"
                      variant="link"
                      className={isArchived ? 'text-green-600' : 'text-red-600'}
                      disabled={disabled}
                    >
                      {isArchived ? 'Restore product' : 'Archive product'}
                    </Button>
                  </div>
                </form>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="variants">
            <AccordionTrigger>Variants</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Track size, color, inventory, and pricing per SKU.
                </p>
                {variants.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {variants.map((variant) => (
                      <Card
                        key={variant.id}
                        onClick={() => setEditingVariantId(Number(variant.id))}
                        className="cursor-pointer hover:bg-muted"
                      >
                        <CardHeader>
                          <CardTitle>{variant.sku}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>
                            {variant.color?.name} / {variant.size?.label}
                          </p>
                          <p>{currency.format(variant.price)}</p>
                          <p>{variant.stock_qty} in stock</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No variants yet.</p>
                )}
                {editingVariantId ? (
                  <VariantEditor
                    variant={variants.find((v) => Number(v.id) === editingVariantId)!}
                    colors={colors}
                    sizes={sizes}
                    writesEnabled={writesEnabled}
                    onClose={() => setEditingVariantId(null)}
                  />
                ) : (
                  <Button onClick={() => setEditingVariantId(0)}>Add New Variant</Button>
                )}
                {editingVariantId === 0 && (
                  <CreateVariantForm
                    productId={String(product.id)}
                    colors={colors}
                    sizes={sizes}
                    writesEnabled={writesEnabled}
                    onClose={() => setEditingVariantId(null)}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="images">
            <AccordionTrigger>Images</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Attach hosted URLs or Supabase storage references. Limit to three featured images per product.
                </p>
                {images.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {images.map((image) => (
                      <Card
                        key={image.id}
                        onClick={() => setEditingImageId(Number(image.id))}
                        className="cursor-pointer hover:bg-muted"
                      >
                        <CardHeader>
                          <CardTitle>{image.alt_text ?? 'Image'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Image
                            src={image.url}
                            alt={image.alt_text ?? ''}
                            width={96}
                            height={96}
                            className="h-24 w-24 object-cover"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No images linked yet.</p>
                )}
                {editingImageId ? (
                  <ImageEditor
                    image={images.find((i) => Number(i.id) === editingImageId)!}
                    variants={variants}
                    writesEnabled={writesEnabled}
                    onClose={() => setEditingImageId(null)}
                  />
                ) : (
                  <Button onClick={() => setEditingImageId(0)}>Add New Image</Button>
                )}
                {editingImageId === 0 && (
                  <CreateImageForm
                    productId={String(product.id)}
                    variants={variants}
                    writesEnabled={writesEnabled}
                    onClose={() => setEditingImageId(null)}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
