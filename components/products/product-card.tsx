'use client';

import Image from 'next/image';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useFormState } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import {
  restoreProduct,
  softDeleteProduct,
  updateProduct,
  deleteVariant as deleteVariantAction,
  deleteProductImage as deleteProductImageAction,
  setDefaultProductImage,
} from '@/app/products/actions';
import { initialActionState } from '@/app/products/action-state';
import type {
  BrandSummary,
  ColorSummary,
  ProductWithRelations,
  SizeSummary,
  ProductTypeSummary,
} from '@/types/products';
import FormMessage from './form-message';
import SubmitButton from './submit-button';
import FormPendingOverlay from './form-pending-overlay';
import CreateVariantForm from './create-variant-form';
import VariantEditor from './variant-editor';
import CreateImageForm from './create-image-form';
import ImageEditor from './image-editor';
import { VIEW_ONLY_MESSAGE } from './view-only-copy';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

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

export default function ProductCard({ product, brands, colors, sizes, productTypes, writesEnabled }: ProductCardProps) {
  const [updateState, updateAction] = useFormState(updateProduct, initialActionState);
  const [archiveState, archiveAction] = useFormState(softDeleteProduct, initialActionState);
  const [restoreState, restoreAction] = useFormState(restoreProduct, initialActionState);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const statusDetails = STATUS_LABELS[product.status] ?? STATUS_LABELS.draft;
  const isArchived = Boolean(product.deleted_at) || product.status === 'archived';
  const disabled = !writesEnabled;
  const archivePendingLabel = isArchived ? 'Restoring…' : 'Archiving…';
  const archiveOverlayLabel = isArchived ? 'Restoring product…' : 'Archiving product…';

  const variants = useMemo(
    () => [...product.variants].sort((a, b) => a.sku.localeCompare(b.sku)),
    [product.variants]
  );
  const images = useMemo(() => [...product.images], [product.images]);

  const [deleteVariantState, deleteVariantFormAction] = useFormState(
    deleteVariantAction,
    initialActionState
  );
  const [deleteImageState, deleteImageFormAction] = useFormState(
    deleteProductImageAction,
    initialActionState
  );

  const { toast } = useToast();
  const [setDefaultImageState, setDefaultImageFormAction] = useFormState(
    setDefaultProductImage,
    initialActionState
  );

  useEffect(() => {
    if (setDefaultImageState.status === 'success') {
      toast({
        title: 'Success',
        description: setDefaultImageState.message,
      });
    } else if (setDefaultImageState.status === 'error') {
      toast({
        title: 'Error',
        description: setDefaultImageState.message,
        variant: 'destructive',
      });
    }
  }, [setDefaultImageState, toast]);

  useEffect(() => {
    if (openSection !== 'variants') {
      setEditingVariantId(null);
    }
  }, [openSection]);

  useEffect(() => {
    if (openSection !== 'images') {
      setEditingImageId(null);
    }
  }, [openSection]);

  const handleAccordionChange = useCallback((value: string) => {
    setOpenSection((prev) => (prev === value ? null : value));
  }, []);

  const beginVariantCreate = useCallback(() => {
    setOpenSection('variants');
    setEditingVariantId('new');
  }, []);

  const beginVariantEdit = useCallback((id: string) => {
    setOpenSection('variants');
    setEditingVariantId(id);
  }, []);

  const beginImageCreate = useCallback(() => {
    setOpenSection('images');
    setEditingImageId('new');
  }, []);

  const beginImageEdit = useCallback((id: string) => {
    setOpenSection('images');
    setEditingImageId(id);
  }, []);

  const handleVariantFormClose = useCallback(() => {
    setEditingVariantId(null);
  }, []);

  const handleImageFormClose = useCallback(() => {
    setEditingImageId(null);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{product.slug}</p>
          </div>
          <Badge
            variant={statusDetails.variant}
            className={cn(
              product.status === 'active' && 'border-green-600 bg-green-100 text-green-700',
              product.status === 'archived' && 'border-red-600 bg-red-100 text-red-700',
              product.status === 'draft' && 'border-gray-600 bg-gray-100 text-gray-700'
            )}
          >
            {statusDetails.label}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold">{formatCurrency(product.base_price)}</p>
          <p>{product.brand ? `Brand: ${product.brand.name}` : 'No brand assigned'}</p>
          {isArchived ? (
            <p className="font-semibold text-destructive">
              Archived {product.deleted_at ? new Date(product.deleted_at).toLocaleDateString() : ''}
            </p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={openSection ?? undefined}
          onValueChange={handleAccordionChange}
        >
          <AccordionItem value="details">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <form action={updateAction} className="relative space-y-4">
                <FormPendingOverlay label="Saving product details…" />
                <input type="hidden" name="product_id" value={String(product.id)} />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  <div className="flex items-center gap-4">
                    <form action={isArchived ? restoreAction : archiveAction} className="relative">
                      <FormPendingOverlay label={archiveOverlayLabel} />
                      <input type="hidden" name="product_id" value={String(product.id)} />
                      <FormMessage state={isArchived ? restoreState : archiveState} />
                      <SubmitButton
                        variant="link"
                        className={isArchived ? 'text-green-600' : 'text-red-600'}
                        disabled={disabled}
                        pendingLabel={archivePendingLabel}
                      >
                        {isArchived ? 'Restore product' : 'Archive product'}
                      </SubmitButton>
                    </form>
                    <SubmitButton disabled={disabled} pendingLabel="Saving…">
                      Save details
                    </SubmitButton>
                  </div>
                </div>
                </form>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="variants">
            <AccordionTrigger>Variants</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Track size, color, inventory, and pricing per SKU.
                  </p>
                  <Button type="button" onClick={beginVariantCreate} disabled={disabled}>
                    Add New Variant
                  </Button>
                </div>
                {editingVariantId === 'new' && (
                  <CreateVariantForm
                    productId={String(product.id)}
                    colors={colors}
                    sizes={sizes}
                    writesEnabled={writesEnabled}
                    onClose={handleVariantFormClose}
                  />
                )}
                {editingVariantId !== null && editingVariantId !== 'new' ? (
                  <VariantEditor
                    variant={variants.find((v) => String(v.id) === editingVariantId)!}
                    colors={colors}
                    sizes={sizes}
                    writesEnabled={writesEnabled}
                    onClose={handleVariantFormClose}
                  />
                ) : null}
                {variants.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {variants.map((variant) => (
                      <Card key={variant.id} className="flex h-full flex-col">
                        <CardHeader className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{variant.sku}</CardTitle>
                            <Badge variant={variant.is_active ? 'default' : 'secondary'}>
                              {variant.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            {(variant.color?.name ?? 'No color')} / {(variant.size?.label ?? 'No size')}
                          </p>
                          <p>{formatCurrency(variant.price)}</p>
                          <p>{variant.stock_qty} in stock</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => beginVariantEdit(String(variant.id))}
                            disabled={disabled}
                          >
                            Edit
                          </Button>
                          <form
                            action={deleteVariantFormAction}
                            className="relative"
                            onSubmit={(event) => {
                              if (disabled || !window.confirm(`Delete variant ${variant.sku}? This cannot be undone.`)) {
                                event.preventDefault();
                              }
                            }}
                          >
                            <FormPendingOverlay label="Deleting variant…" className="rounded-md" />
                            <input type="hidden" name="variant_id" value={String(variant.id)} />
                            <SubmitButton
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              disabled={disabled}
                              pendingLabel="Deleting…"
                            >
                              Delete
                            </SubmitButton>
                          </form>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No variants yet.</p>
                )}
                <FormMessage state={deleteVariantState} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="images">
            <AccordionTrigger>Images</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Attach hosted URLs or Supabase storage references.
                  </p>
                  <Button type="button" onClick={beginImageCreate} disabled={disabled}>
                    Add New Image
                  </Button>
                </div>
                {editingImageId === 'new' && (
                  <CreateImageForm
                    productId={String(product.id)}
                    variants={variants}
                    writesEnabled={writesEnabled}
                    onClose={handleImageFormClose}
                  />
                )}
                {editingImageId !== null && editingImageId !== 'new' ? (
                  <ImageEditor
                    image={images.find((i) => String(i.id) === editingImageId)!}
                    variants={variants}
                    writesEnabled={writesEnabled}
                    onClose={handleImageFormClose}
                  />
                ) : null}
                {images.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {images.map((image) => (
                      <Card
                        key={image.id}
                        className={cn(
                          'flex h-full flex-col',
                          image.is_default && 'border-2 border-primary'
                        )}
                      >
                        <CardHeader className="space-y-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{image.alt_text ?? 'Image'}</CardTitle>
                            {image.is_default ? (
                              <Badge>Default</Badge>
                            ) : null}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <p className="truncate">{image.url}</p>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 ml-2" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{image.url}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 pt-0">
                          <Image
                            src={image.url}
                            alt={image.alt_text ?? ''}
                            width={96}
                            height={96}
                            className="h-24 w-24 rounded-md object-cover"
                          />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <form action={setDefaultImageFormAction} className="relative">
                            <input type="hidden" name="image_id" value={String(image.id)} />
                            <input type="hidden" name="product_id" value={String(product.id)} />
                            <SubmitButton
                              size="sm"
                              variant="outline"
                              disabled={disabled || image.is_default}
                              pendingLabel="Setting..."
                            >
                              Set as default
                            </SubmitButton>
                          </form>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => beginImageEdit(String(image.id))}
                              disabled={disabled}
                            >
                              Edit
                          </Button>
                          <form
                            action={deleteImageFormAction}
                            className="relative"
                            onSubmit={(event) => {
                              if (disabled || !window.confirm('Delete this image? This cannot be undone.')) {
                                event.preventDefault();
                              }
                            }}
                          >
                            <FormPendingOverlay label="Deleting image…" className="rounded-md" />
                            <input type="hidden" name="image_id" value={String(image.id)} />
                            <SubmitButton
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              disabled={disabled}
                              pendingLabel="Deleting…"
                            >
                              Delete
                            </SubmitButton>
                          </form>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No images linked yet.</p>
                )}
                <FormMessage state={deleteImageState} />
                <FormMessage state={setDefaultImageState} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
