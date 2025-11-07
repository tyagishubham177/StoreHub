'use client';

import { useState } from 'react';
import { LayoutGrid, Rows3, Rows4 } from 'lucide-react';
import StorefrontProductCard from '@/components/storefront/product-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CatalogProduct } from '@/types/products';

interface ProductGridProps {
  products: CatalogProduct[];
}

type Layout = '2x3' | '3x4' | '3x5';

const layoutConfig = {
  '2x3': 'sm:grid-cols-2 lg:grid-cols-3',
  '3x4': 'sm:grid-cols-3 lg:grid-cols-4',
  '3x5': 'sm:grid-cols-3 lg:grid-cols-5',
};

export default function ProductGrid({ products }: ProductGridProps) {
  const [layout, setLayout] = useState<Layout>('2x3');

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <Button variant="ghost" size="icon" onClick={() => setLayout('2x3')} disabled={layout === '2x3'}>
          <LayoutGrid className="h-5 w-5" />
          <span className="sr-only">2x3 Grid</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setLayout('3x4')} disabled={layout === '3x4'}>
          <Rows3 className="h-5 w-5" />
          <span className="sr-only">3x4 Grid</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setLayout('3x5')} disabled={layout === '3x5'}>
          <Rows4 className="h-5 w-5" />
          <span className="sr-only">3x5 Grid</span>
        </Button>
      </div>
      {products.length ? (
        <div className={cn('grid gap-6', layoutConfig[layout])}>
          {products.map((product) => (
            <StorefrontProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900">No products match these filters</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting the filters or clear them to see the full catalog.
          </p>
        </div>
      )}
    </div>
  );
}
