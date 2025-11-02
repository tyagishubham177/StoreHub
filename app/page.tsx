import type { Metadata } from 'next';
import Link from 'next/link';
import StorefrontProductCard from '@/components/storefront/product-card';
import { fetchCatalogProducts, fetchCatalogTaxonomy, parseCatalogSearchParams } from '@/lib/products/catalog';

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
  const [{ brands, colors, sizes, tags }, catalog] = await Promise.all([
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
    Number(typeof filters.minPrice === 'number') +
    Number(typeof filters.maxPrice === 'number');

  const paginationSearchParams = toURLSearchParams(searchParams, []);

  return (
    <main className="storefront">
      <header className="storefront__hero">
        <div>
          <p className="storefront__eyebrow">StoreHub Footwear</p>
          <h1>Inventory browser with instant insights</h1>
          <p>
            Explore sizes, colors, and curated tags without logging in. Every result surfaces live variant availability so
            your merchandising team can plan the next drop.
          </p>
        </div>

        <Link className="storefront__admin-link" href="/login">
          Admin sign in
        </Link>
      </header>

      <form className="storefront__layout" method="get">
        <aside className="storefront__filters">
          <div className="storefront__filters-header">
            <h2>Refine results</h2>
            {appliedFilterCount ? <span>{appliedFilterCount} active</span> : null}
          </div>

          <label className="storefront__field">
            <span>Search</span>
            <input type="search" name="q" placeholder="Search by name or description" defaultValue={filters.search ?? ''} />
          </label>

          <fieldset className="storefront__fieldset">
            <legend>Brands</legend>
            <div className="storefront__checkboxes">
              {brands.length ? (
                brands.map((brand) => (
                  <label key={brand.id}>
                    <input type="checkbox" name="brand" value={brand.id} defaultChecked={filters.brandIds.includes(brand.id)} />
                    {brand.name}
                  </label>
                ))
              ) : (
                <p className="storefront__empty">No brands yet</p>
              )}
            </div>
          </fieldset>

          <fieldset className="storefront__fieldset">
            <legend>Colors</legend>
            <div className="storefront__checkboxes">
              {colors.length ? (
                colors.map((color) => (
                  <label key={color.id}>
                    <input
                      type="checkbox"
                      name="color"
                      value={color.id}
                      defaultChecked={filters.colorIds.includes(color.id)}
                    />
                    <span className="storefront__color-chip" style={{ backgroundColor: color.hex ?? '#e5e7eb' }} />
                    {color.name}
                  </label>
                ))
              ) : (
                <p className="storefront__empty">No colors yet</p>
              )}
            </div>
          </fieldset>

          <fieldset className="storefront__fieldset">
            <legend>Sizes</legend>
            <div className="storefront__checkboxes">
              {sizes.length ? (
                sizes.map((size) => (
                  <label key={size.id}>
                    <input type="checkbox" name="size" value={size.id} defaultChecked={filters.sizeIds.includes(size.id)} />
                    {size.label}
                  </label>
                ))
              ) : (
                <p className="storefront__empty">No sizes yet</p>
              )}
            </div>
          </fieldset>

          <fieldset className="storefront__fieldset">
            <legend>Tags</legend>
            <div className="storefront__checkboxes">
              {tags.length ? (
                tags.map((tag) => (
                  <label key={tag.id}>
                    <input type="checkbox" name="tag" value={tag.id} defaultChecked={filters.tagIds.includes(tag.id)} />
                    #{tag.slug ?? tag.name}
                  </label>
                ))
              ) : (
                <p className="storefront__empty">No tags yet</p>
              )}
            </div>
          </fieldset>

          <fieldset className="storefront__fieldset storefront__fieldset--range">
            <legend>Price range</legend>
            <div className="storefront__range-inputs">
              <label>
                <span>Min</span>
                <input type="number" name="min_price" min="0" step="0.01" defaultValue={filters.minPrice ?? ''} />
              </label>
              <label>
                <span>Max</span>
                <input type="number" name="max_price" min="0" step="0.01" defaultValue={filters.maxPrice ?? ''} />
              </label>
            </div>
          </fieldset>

          <div className="storefront__actions">
            <button type="submit">Apply filters</button>
            <a href="/">Clear all</a>
          </div>
        </aside>

        <section className="storefront__results">
          <input type="hidden" name="page" value="1" />

          <div className="storefront__results-header">
            <div>
              <p className="storefront__count">{formatRange(start, end, catalog.total)}</p>
              {filters.search ? <p className="storefront__search-term">Search: “{filters.search}”</p> : null}
            </div>

            <label className="storefront__sort">
              <span>Sort by</span>
              <select name="sort" defaultValue={filters.sort}>
                <option value="newest">Newest arrivals</option>
                <option value="price-asc">Price: Low to high</option>
                <option value="price-desc">Price: High to low</option>
              </select>
            </label>
          </div>

          {catalog.products.length ? (
            <div className="storefront__grid">
              {catalog.products.map((product) => (
                <StorefrontProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="storefront__empty-state">
              <h3>No products match these filters</h3>
              <p>Try adjusting the filters or clear them to see the full catalog.</p>
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="storefront__pagination" aria-label="Pagination">
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
            </nav>
          ) : null}
        </section>
      </form>
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

  return disabled ? (
    <span aria-disabled="true" className="storefront__page-link storefront__page-link--disabled">
      {label}
    </span>
  ) : (
    <Link href={href} className="storefront__page-link">
      {label}
    </Link>
  );
}
