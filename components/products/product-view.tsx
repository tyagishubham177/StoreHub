'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id ?? null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const activeProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  useEffect(() => {
    if (!products.length) {
      setSelectedProductId(null);
      return;
    }

    if (selectedProductId && !products.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  if (isDesktop) {
    return (
      <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProductSelector
            products={products}
            selectedProductId={selectedProductId}
            writesEnabled={writesEnabled}
            onSelectProduct={(product) => setSelectedProductId(product.id)}
          />
        </div>
        <div className="lg:col-span-2 sticky top-8 h-[calc(100vh-4rem)] overflow-y-auto">
          <ProductEditor
            product={activeProduct}
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
        selectedProductId={selectedProductId}
        writesEnabled={writesEnabled}
        onSelectProduct={(product) => setSelectedProductId(product.id)}
      />
      <Sheet open={Boolean(activeProduct)} onOpenChange={(open) => !open && setSelectedProductId(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{activeProduct?.name ?? 'Edit Product'}</SheetTitle>
          </SheetHeader>
          <ProductEditor
            product={activeProduct}
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
