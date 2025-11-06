'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CatalogTaxonomy, CatalogFilters } from '@/lib/products/catalog';
import { Filter } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'storefront-last-filter';

type ProductFiltersProps = {
  taxonomy: CatalogTaxonomy;
  initialFilters: CatalogFilters;
};

export default function ProductFilters({ taxonomy, initialFilters }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState(initialFilters);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.search) {
      params.set('q', filters.search);
    }
    filters.brandIds.forEach((id) => params.append('brand', String(id)));
    filters.colorIds.forEach((id) => params.append('color', String(id)));
    filters.sizeIds.forEach((id) => params.append('size', String(id)));
    filters.tagIds.forEach((id) => params.append('tag', String(id)));
    filters.productTypeIds.forEach((id) => params.append('product_type_id', String(id)));
    if (filters.minPrice) {
      params.set('min_price', String(filters.minPrice));
    }
    if (filters.maxPrice) {
      params.set('max_price', String(filters.maxPrice));
    }
    if (filters.sort) {
      params.set('sort', filters.sort);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filters));
    setIsSheetOpen(false);
  }, [filters, pathname, router, startTransition]);

  // Auto-apply filters with a debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
        applyFilters();
      }
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [filters, initialFilters, applyFilters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      brandIds: [],
      colorIds: [],
      sizeIds: [],
      tagIds: [],
      productTypeIds: [],
      minPrice: undefined,
      maxPrice: undefined,
      sort: 'newest',
      page: 1,
    });
    startTransition(() => {
      router.replace(pathname);
    });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const applyLastFilter = () => {
    const savedFilters = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  };

  const handleInputChange = (name: keyof CatalogFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof CatalogFilters, checked: boolean | 'indeterminate', value: number) => {
    setFilters((prev: any) => {
      const existing = prev[name] || [];
      if (checked) {
        return { ...prev, [name]: [...existing, value] };
      } else {
        return { ...prev, [name]: existing.filter((item: any) => item !== value) };
      }
    });
  };

  const FilterForm = (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters();
      }}
    >
      <div className="flex justify-between items-center">
        <Button onClick={applyLastFilter} variant="outline" type="button">
          Apply Last Filter
        </Button>
        <Button onClick={clearFilters} variant="ghost" type="button">
          Clear All
        </Button>
      </div>

      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          type="search"
          id="search"
          placeholder="Search..."
          value={filters.search ?? ''}
          onChange={(e) => handleInputChange('search', e.target.value)}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900">Brands</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {taxonomy.brands.map((brand) => (
            <div key={brand.id} className="flex items-center">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={filters.brandIds.includes(brand.id)}
                onCheckedChange={(checked) => handleCheckboxChange('brandIds', checked, brand.id)}
              />
              <Label htmlFor={`brand-${brand.id}`} className="ml-2">
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900">Product Type</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {taxonomy.productTypes.map((productType) => (
            <div key={productType.id} className="flex items-center">
              <Checkbox
                id={`product-type-${productType.id}`}
                checked={filters.productTypeIds.includes(productType.id)}
                onCheckedChange={(checked) => handleCheckboxChange('productTypeIds', checked, productType.id)}
              />
              <Label htmlFor={`product-type-${productType.id}`} className="ml-2">
                {productType.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900">Colors</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {taxonomy.colors.map((color) => (
            <div key={color.id} className="flex items-center">
              <Checkbox
                id={`color-${color.id}`}
                checked={filters.colorIds.includes(color.id)}
                onCheckedChange={(checked) => handleCheckboxChange('colorIds', checked, color.id)}
              />
              <span
                className="ml-2 h-4 w-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex ?? '#e5e7eb' }}
              />
              <Label htmlFor={`color-${color.id}`} className="ml-2">
                {color.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900">Sizes</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {taxonomy.sizes.map((size) => (
            <div key={size.id} className="flex items-center">
              <Checkbox
                id={`size-${size.id}`}
                checked={filters.sizeIds.includes(size.id)}
                onCheckedChange={(checked) => handleCheckboxChange('sizeIds', checked, size.id)}
              />
              <Label htmlFor={`size-${size.id}`} className="ml-2">
                {size.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900">Tags</h3>
        <div className="mt-2 space-y-2">
          {taxonomy.tags.map((tag) => (
            <div key={tag.id} className="flex items-center">
              <Checkbox
                id={`tag-${tag.id}`}
                checked={filters.tagIds.includes(tag.id)}
                onCheckedChange={(checked) => handleCheckboxChange('tagIds', checked, tag.id)}
              />
              <Label htmlFor={`tag-${tag.id}`} className="ml-2">
                #{tag.slug ?? tag.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900">Price range</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_price">Min</Label>
            <Input
              type="number"
              id="min_price"
              min="0"
              step="0.01"
              value={filters.minPrice ?? ''}
              onChange={(e) => handleInputChange('minPrice', e.target.valueAsNumber)}
            />
          </div>
          <div>
            <Label htmlFor="max_price">Max</Label>
            <Input
              type="number"
              id="max_price"
              min="0"
              step="0.01"
              value={filters.maxPrice ?? ''}
              onChange={(e) => handleInputChange('maxPrice', e.target.valueAsNumber)}
            />
          </div>
        </div>
      </div>
        <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
            Sort by
            </label>
            <Select name="sort" defaultValue={filters.sort} onValueChange={(value) => handleInputChange('sort', value)}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Newest arrivals</SelectItem>
                <SelectItem value="price-asc">Price: Low to high</SelectItem>
                <SelectItem value="price-desc">Price: High to low</SelectItem>
            </SelectContent>
            </Select>
        </div>
    </form>
  );

  return (
    <>
      <div className="hidden md:block">{FilterForm}</div>
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full shadow-lg h-16 w-16 text-primary-foreground"
              aria-label="Refine Results"
            >
              <Filter className="h-8 w-8" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Refine Results</SheetTitle>
            </SheetHeader>
            <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">{FilterForm}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
