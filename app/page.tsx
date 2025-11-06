import type { Metadata } from 'next';
import Link from 'next/link';
import StorefrontProductCard from '@/components/storefront/product-card';
import { fetchCatalogProducts, fetchCatalogTaxonomy, parseCatalogSearchParams } from '@/lib/products/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductFilters from '@/components/storefront/product-filters';

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
        <aside className="md:col-span-1 sticky top-8 h-[calc(100vh-4rem)] overflow-y-auto">
          <ProductFilters taxonomy={{ brands, colors, sizes, tags, productTypes }} initialFilters={filters} />
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
