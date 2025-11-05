'use client';

import type {
  BrandSummary,
  ColorSummary,
  ProductWithRelations,
  SizeSummary,
  ProductTypeSummary,
} from '@/types/products';
import ProductCard from './product-card';

interface ProductEditorProps {
  product: ProductWithRelations | null;
  brands: BrandSummary[];
  colors: ColorSummary[];
  sizes: SizeSummary[];
  productTypes: ProductTypeSummary[];
  writesEnabled: boolean;
}

export default function ProductEditor({
  product,
  brands,
  colors,
  sizes,
  productTypes,
  writesEnabled,
}: ProductEditorProps) {
  if (!product) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h2 className="text-lg font-medium text-muted-foreground">Select a product</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a product from the list to view and edit its details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProductCard
      product={product}
      brands={brands}
      colors={colors}
      sizes={sizes}
      productTypes={productTypes}
      writesEnabled={writesEnabled}
    />
  );
}
