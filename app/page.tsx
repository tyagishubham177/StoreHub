import type { Metadata } from 'next';
import Link from 'next/link';
import StorefrontProductCard from '@/components/storefront/product-card';
import { fetchCatalogProducts, fetchCatalogTaxonomy, parseCatalogSearchParams } from '@/lib/products/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Curated footwear catalog',
  description:
    'Discover StoreHub footwear inventory with real-time filters for brand, color, size, and tags.',
};

type PageSearchParams = Record<string, string | string[] | undefined>;

type HomePageProps = {
  searchParams?: PageSearchParams;
};

const toURLSearchParams = (params: PageSearchParams, exclude: string[] = []) => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (exclude.includes(key) || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined) {
          searchParams.append(key, item);
        }
      });
    } else {
      searchParams.set(key, value);
    }
  }
  return searchParams;
};

const formatRange = (start: number, end: number, total: number) => {
  if (!total) {
    return '0 results';
  }
  if (start === end) {
    return `Showing ${start} of ${total}`;
  }
  return `Showing ${start}–${end} of ${total}`;
};

export default async function HomePage({ searchParams = {} }: HomePageProps) {
  const filters = parseCatalogSearchParams(searchParams);
  const [{ brands, colors, sizes, tags, productTypes }, catalog] = await Promise.all([
    fetchCatalogTaxonomy(),
    fetchCatalogProducts(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(catalog.total / catalog.pageSize));
  const start = catalog.total ? (catalog.page - 1) * catalog.pageSize + 1 : 0;
  const end = catalog.total ? Math.min(catalog.page * catalog.pageSize, catalog.total) : 0;
  const appliedFilterCount =
    Number(Boolean(filters.search)) +
    filters.brandIds.length +
    filters.colorIds.length +
    filters.sizeIds.length +
    filters.tagIds.length +
    filters.productTypeIds.length +
    Number(typeof filters.minPrice === 'number') +
    Number(typeof filters.maxPrice === 'number');

  const paginationSearchParams = toURLSearchParams(searchParams, []);

  return (
    <main className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Refine results</CardTitle>
            </CardHeader>
            <CardContent>
              <form method="get" className="space-y-6">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                    Search
                  </label>
                  <Input
                    type="search"
                    id="search"
                    name="q"
                    placeholder="Search by name or description"
                    defaultValue={filters.search ?? ''}
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Brands</h3>
                  <div className="mt-2 space-y-2">
                    {brands.length ? (
                      brands.map((brand) => (
                        <div key={brand.id} className="flex items-center">
                          <Checkbox
                            id={`brand-${brand.id}`}
                            name="brand"
                            value={brand.id}
                            defaultChecked={filters.brandIds.includes(brand.id)}
                          />
                          <label htmlFor={`brand-${brand.id}`} className="ml-2 text-sm text-gray-600">
                            {brand.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No brands yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Product Type</h3>
                  <div className="mt-2 space-y-2">
                    {productTypes.length ? (
                      productTypes.map((productType) => (
                        <div key={productType.id} className="flex items-center">
                          <Checkbox
                            id={`product-type-${productType.id}`}
                            name="product_type_id"
                            value={productType.id}
                            defaultChecked={filters.productTypeIds.includes(productType.id)}
                          />
                          <label htmlFor={`product-type-${productType.id}`} className="ml-2 text-sm text-gray-600">
                            {productType.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No product types yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Colors</h3>
                  <div className="mt-2 space-y-2">
                    {colors.length ? (
                      colors.map((color) => (
                        <div key={color.id} className="flex items-center">
                          <Checkbox
                            id={`color-${color.id}`}
                            name="color"
                            value={color.id}
                            defaultChecked={filters.colorIds.includes(color.id)}
                          />
                          <span
                            className="ml-2 h-4 w-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.hex ?? '#e5e7eb' }}
                          />
                          <label htmlFor={`color-${color.id}`} className="ml-2 text-sm text-gray-600">
                            {color.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No colors yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sizes</h3>
                  <div className="mt-2 space-y-2">
                    {sizes.length ? (
                      sizes.map((size) => (
                        <div key={size.id} className="flex items-center">
                          <Checkbox
                            id={`size-${size.id}`}
                            name="size"
                            value={size.id}
                            defaultChecked={filters.sizeIds.includes(size.id)}
                          />
                          <label htmlFor={`size-${size.id}`} className="ml-2 text-sm text-gray-600">
                            {size.label}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No sizes yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Tags</h3>
                  <div className="mt-2 space-y-2">
                    {tags.length ? (
                      tags.map((tag) => (
                        <div key={tag.id} className="flex items-center">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            name="tag"
                            value={tag.id}
                            defaultChecked={filters.tagIds.includes(tag.id)}
                          />
                          <label htmlFor={`tag-${tag.id}`} className="ml-2 text-sm text-gray-600">
                            #{tag.slug ?? tag.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No tags yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Price range</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="min_price" className="block text-sm font-medium text-gray-700">
                        Min
                      </label>
                      <Input
                        type="number"
                        id="min_price"
                        name="min_price"
                        min="0"
                        step="0.01"
                        defaultValue={filters.minPrice ?? ''}
                        className="mt-1 block w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="max_price" className="block text-sm font-medium text-gray-700">
                        Max
                      </label>
                      <Input
                        type="number"
                        id="max_price"
                        name="max_price"
                        min="0"
                        step="0.01"
                        defaultValue={filters.maxPrice ?? ''}
                        className="mt-1 block w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="submit">Apply filters</Button>
                  <Button variant="ghost" asChild>
                    <a href="/">Clear all</a>
                  </Button>
                </div>
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                    Sort by
                  </label>
                  <Select name="sort" defaultValue={filters.sort}>
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
            </CardContent>
          </Card>
        </aside>

        <section className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">{formatRange(start, end, catalog.total)}</p>
              {filters.search ? <p className="text-sm text-gray-500">Search: “{filters.search}”</p> : null}
            </div>
          </div>

          {catalog.products.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.products.map((product) => (
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

          {totalPages > 1 ? (
            <nav className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <PaginationLink
                  label="Previous"
                  page={Math.max(1, catalog.page - 1)}
                  disabled={catalog.page === 1}
                  searchParams={paginationSearchParams}
                />
                <span>
                  Page {catalog.page} of {totalPages}
                </span>
                <PaginationLink
                  label="Next"
                  page={Math.min(totalPages, catalog.page + 1)}
                  disabled={catalog.page === totalPages}
                  searchParams={paginationSearchParams}
                />
              </div>
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}

type PaginationLinkProps = {
  label: string;
  page: number;
  disabled: boolean;
  searchParams: URLSearchParams;
};

function PaginationLink({ label, page, disabled, searchParams }: PaginationLinkProps) {
  const params = new URLSearchParams(searchParams);
  params.set('page', String(page));
  const href = `/?${params.toString()}`;

  return (
    <Button asChild variant={disabled ? 'outline' : 'default'} disabled={disabled}>
      <Link href={href}>{label}</Link>
    </Button>
  );
}
