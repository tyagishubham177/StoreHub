'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid, Rows3, Rows4, ArrowUp, ArrowDown } from 'lucide-react';
import StorefrontProductCard from '@/components/storefront/product-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CatalogProduct } from '@/types/products';
import type { CatalogSort } from '@/lib/products/catalog';

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
  const [rowHeight, setRowHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get('sort') as CatalogSort) ?? 'newest';

  useEffect(() => {
    const computeRowHeight = () => {
      if (!containerRef.current) {
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const available = Math.max(0, viewportHeight - rect.top - 40);
      const gap = 24; // gap-6
      const minimum = layout === '3x5' ? 200 : layout === '3x4' ? 220 : 240;
      const computed = Math.max(minimum, Math.floor((available - gap) / 2));
      setRowHeight(Number.isFinite(computed) ? computed : minimum);
    };

    computeRowHeight();
    window.addEventListener('resize', computeRowHeight);
    return () => window.removeEventListener('resize', computeRowHeight);
  }, [layout, products.length]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (currentSort) {
      case 'price-asc':
        return list.sort((a, b) => a.lowestPrice - b.lowestPrice);
      case 'price-desc':
        return list.sort((a, b) => b.highestPrice - a.highestPrice);
      default:
        return list.sort(
          (a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime()
        );
    }
  }, [currentSort, products]);

  const minHeight = rowHeight ? rowHeight * 2 + 24 : undefined;
  const gridStyle: CSSProperties | undefined = rowHeight ? { gridAutoRows: `${rowHeight}px` } : undefined;
  const imageHeight = rowHeight ? Math.max(160, Math.min(rowHeight - 96, 280)) : undefined;

  const createSortLink = (sort: CatalogSort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    return `?${params.toString()}`;
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col"
      style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
    >
      <div className="flex items-center justify-end gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by Price:</span>
          <Link href={createSortLink('price-asc')}>
            <Button variant="ghost" size="icon" disabled={currentSort === 'price-asc'}>
              <ArrowDown className="h-5 w-5" />
              <span className="sr-only">Sort by price ascending</span>
            </Button>
          </Link>
          <Link href={createSortLink('price-desc')}>
            <Button variant="ghost" size="icon" disabled={currentSort === 'price-desc'}>
              <ArrowUp className="h-5 w-5" />
              <span className="sr-only">Sort by price descending</span>
            </Button>
          </Link>
        </div>
        <div className="flex items-center">
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
      </div>
      {products.length ? (
        <div className={cn('grid gap-6', layoutConfig[layout])} style={gridStyle}>
          {sortedProducts.map((product) => (
            <StorefrontProductCard key={product.id} product={product} imageHeight={imageHeight} />
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
