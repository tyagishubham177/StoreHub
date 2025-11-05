'use client';

import { useState } from 'react';
import type {
  BrandSummary,
  ColorSummary,
  ProductWithRelations,
  SizeSummary,
  ProductTypeSummary,
} from '@/types/products';
import ProductSelector from './product-selector';
import ProductEditor from './product-editor';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface ProductViewProps {
  products: ProductWithRelations[];
  brands: BrandSummary[];
  colors: ColorSummary[];
  sizes: SizeSummary[];
  productTypes: ProductTypeSummary[];
  writesEnabled: boolean;
}

export default function ProductView({
  products,
  brands,
  colors,
  sizes,
  productTypes,
  writesEnabled,
}: ProductViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isDesktop) {
    return (
      <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProductSelector
            products={products}
            onSelectProduct={setSelectedProduct}
            selectedProduct={selectedProduct}
          />
        </div>
        <div className="lg:col-span-2">
          <ProductEditor
            product={selectedProduct}
            brands={brands}
            colors={colors}
            sizes={sizes}
            productTypes={productTypes}
            writesEnabled={writesEnabled}
          />
        </div>
      </section>
    );
  }

  return (
    <>
      <ProductSelector
        products={products}
        onSelectProduct={setSelectedProduct}
        selectedProduct={selectedProduct}
      />
      <Sheet open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedProduct?.name ?? 'Edit Product'}</SheetTitle>
          </SheetHeader>
          <ProductEditor
            product={selectedProduct}
            brands={brands}
            colors={colors}
            sizes={sizes}
            productTypes={productTypes}
            writesEnabled={writesEnabled}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
