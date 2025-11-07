'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type SVGProps,
} from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid, Rows3, Rows4, ArrowDownWideNarrow, ArrowUpWideNarrow, SlidersHorizontal } from 'lucide-react';
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
  const selectedColors = useMemo(() => {
    return new Set(
      searchParams
        .getAll('color')
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isInteger(value))
    );
  }, [searchParams]);
  const selectedSizes = useMemo(() => {
    return new Set(
      searchParams
        .getAll('size')
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isInteger(value))
    );
  }, [searchParams]);

  useEffect(() => {
    const computeRowHeight = () => {
      if (!containerRef.current) {
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const available = Math.max(0, viewportHeight - rect.top - 40);
      const gap = 24; // gap-6
      const minimum = layout === '3x5' ? 220 : layout === '3x4' ? 240 : 260;
      const computed = Math.max(minimum, Math.floor((available - gap) / 2));
      setRowHeight(Number.isFinite(computed) ? computed : minimum);
    };

    computeRowHeight();
    window.addEventListener('resize', computeRowHeight);
    return () => window.removeEventListener('resize', computeRowHeight);
  }, [layout, products.length]);

  const resolveComparableVariants = useCallback(
    (product: CatalogProduct) => {
      const activeVariants = product.variants.filter((variant) => variant.is_active && variant.stock_qty > 0);
      const fallbackVariants = activeVariants.length ? activeVariants : product.variants;
      if (!selectedColors.size && !selectedSizes.size) {
        return fallbackVariants;
      }
      const matching = fallbackVariants.filter((variant) => {
        const matchesColor = !selectedColors.size || (variant.color && selectedColors.has(variant.color.id));
        const matchesSize = !selectedSizes.size || (variant.size && selectedSizes.has(variant.size.id));
        return matchesColor && matchesSize;
      });
      return matching.length ? matching : fallbackVariants;
    },
    [selectedColors, selectedSizes]
  );

  const getSortKey = useCallback(
    (product: CatalogProduct, direction: 'asc' | 'desc') => {
      // Determine the price of the variant that the card would elevate to the top given the active filters.
      const candidates = resolveComparableVariants(product);
      if (!candidates.length) {
        return product.base_price ?? 0;
      }
      const prices = candidates.map((variant) => variant.price);
      return direction === 'asc' ? Math.min(...prices) : Math.max(...prices);
    },
    [resolveComparableVariants]
  );

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (currentSort) {
      case 'price-asc':
        return list.sort((a, b) => {
          const aPrice = getSortKey(a, 'asc');
          const bPrice = getSortKey(b, 'asc');
          if (aPrice === bPrice) {
            return a.name.localeCompare(b.name);
          }
          return aPrice - bPrice;
        });
      case 'price-desc':
        return list.sort((a, b) => {
          const aPrice = getSortKey(a, 'desc');
          const bPrice = getSortKey(b, 'desc');
          if (aPrice === bPrice) {
            return a.name.localeCompare(b.name);
          }
          return bPrice - aPrice;
        });
      default:
        return list.sort(
          (a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime()
        );
    }
    // Sorting considers the variant that would be surfaced first in the card given active filters.
  }, [currentSort, getSortKey, products]);

  const minHeight = rowHeight ? rowHeight * 2 + 24 : undefined;
  const gridStyle: CSSProperties | undefined = rowHeight
    ? { gridAutoRows: `minmax(${rowHeight}px, auto)` }
    : undefined;
  const imageHeight = rowHeight ? Math.max(180, Math.min(rowHeight - 88, 320)) : undefined;

  const createSortLink = (sort: CatalogSort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    return `?${params.toString()}`;
  };

  const sortButtons: {
    value: CatalogSort;
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
  }[] = [
    { value: 'price-asc', label: 'Low to High', icon: ArrowDownWideNarrow },
    { value: 'price-desc', label: 'High to Low', icon: ArrowUpWideNarrow },
  ];

  return (
    <div
      ref={containerRef}
      className="flex flex-col"
      style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Sort by price</span>
          <div className="flex items-center gap-1 rounded-full border bg-background p-1 shadow-sm">
            {sortButtons.map((option) => {
              const Icon = option.icon;
              const active = currentSort === option.value;
              return (
                <Button
                  key={option.value}
                  asChild
                  variant={active ? 'default' : 'ghost'}
                  size="sm"
                  className={cn('gap-2 rounded-full px-3 py-1 text-xs font-semibold', active ? 'shadow-sm' : '')}
                  aria-pressed={active}
                >
                  <Link href={createSortLink(option.value)}>
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
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
