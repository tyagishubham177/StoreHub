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

  return (
    <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <ProductSelector products={products} onSelectProduct={setSelectedProduct} />
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
