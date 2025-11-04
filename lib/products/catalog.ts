import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { reportError } from '@/lib/observability/report-error';
import type { Database } from '@/types/database';
import type {
  BrandSummary,
  CatalogProduct,
  CatalogVariant,
  ColorSummary,
  SizeSummary,
  TagSummary,
} from '@/types/products';

type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type ImageRow = Database['public']['Tables']['product_images']['Row'];
type ColorRow = Database['public']['Tables']['colors']['Row'];
type SizeRow = Database['public']['Tables']['sizes']['Row'];

type RawCatalogVariant = VariantRow & {
  color: Pick<ColorRow, 'id' | 'name' | 'hex'> | null;
  size: Pick<SizeRow, 'id' | 'label'> | null;
};

type RawCatalogProduct = ProductRow & {
  brand: BrandSummary | null;
  variants: RawCatalogVariant[] | null;
  images: ImageRow[] | null;
  tags: ({ tag: TagSummary | null } | null)[] | null;
  product_type: { id: number; name: string } | null;
};

export const CATALOG_PAGE_SIZE = 12;

export type CatalogSort = 'newest' | 'price-asc' | 'price-desc';

export interface CatalogFilters {
  search?: string;
  brandIds: number[];
  colorIds: number[];
  sizeIds: number[];
  tagIds: number[];
  productTypeIds: number[];
  minPrice?: number;
  maxPrice?: number;
  sort: CatalogSort;
  page: number;
}

export interface CatalogQueryResult {
  products: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: CatalogFilters = {
  brandIds: [],
  colorIds: [],
  sizeIds: [],
  tagIds: [],
  productTypeIds: [],
  sort: 'newest',
  page: 1,
};

const sanitizeNumber = (value: string | null | undefined) => {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const sanitizeInteger = (value: string | null | undefined) => {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : undefined;
};

const valueArray = (input: string | string[] | undefined): string[] => {
  if (!input) {
    return [];
  }
  return Array.isArray(input) ? input : [input];
};

const toNumberArray = (input: string | string[] | undefined): number[] =>
  valueArray(input)
    .map((value) => sanitizeInteger(value))
    .filter((value): value is number => typeof value === 'number');

const escapeIlikePattern = (term: string) => term.replace(/[\\%_]/g, (match) => `\\${match}`);

const transformProduct = (product: RawCatalogProduct): CatalogProduct => {
  const variants = (product.variants ?? []) as RawCatalogVariant[];
  const activeVariants = variants.filter((variant) => variant.is_active && variant.stock_qty > 0);
  const fallbackVariants = activeVariants.length ? activeVariants : variants.filter((variant) => variant.is_active);
  const referenceVariants = fallbackVariants.length ? fallbackVariants : variants;
  const priceSamples = referenceVariants.length ? referenceVariants.map((variant) => variant.price) : [product.base_price];
  const lowestPrice = priceSamples.length ? Math.min(...priceSamples) : product.base_price;
  const highestPrice = priceSamples.length ? Math.max(...priceSamples) : product.base_price;
  const availableStock = referenceVariants.reduce((total, variant) => total + Math.max(variant.stock_qty, 0), 0);

  return {
    ...product,
    brand: product.brand,
    variants: variants.map((variant) => ({
      ...variant,
      color: variant.color ? { ...variant.color, hex: variant.color.hex ?? null } : null,
      size: variant.size,
    })) as CatalogVariant[],
    images: product.images ?? [],
    tags: (product.tags ?? [])
      .map((entry) => entry?.tag)
      .filter((tag): tag is TagSummary => Boolean(tag)),
    lowestPrice,
    highestPrice,
    availableStock,
    product_type: product.product_type,
  };
};

export const parseCatalogSearchParams = (
  searchParams: Record<string, string | string[] | undefined>
): CatalogFilters => {
  const search = typeof searchParams.q === 'string' ? searchParams.q.trim() : Array.isArray(searchParams.q) ? searchParams.q[0]?.trim() : undefined;
  const sortParam = typeof searchParams.sort === 'string' ? searchParams.sort : Array.isArray(searchParams.sort) ? searchParams.sort[0] : undefined;
  const sort: CatalogSort = sortParam === 'price-asc' || sortParam === 'price-desc' ? sortParam : 'newest';
  const pageParam = typeof searchParams.page === 'string' ? searchParams.page : Array.isArray(searchParams.page) ? searchParams.page[0] : undefined;
  const page = Math.max(1, sanitizeInteger(pageParam) ?? 1);
  const minPrice = sanitizeNumber(typeof searchParams.min_price === 'string' ? searchParams.min_price : Array.isArray(searchParams.min_price) ? searchParams.min_price[0] : undefined);
  const maxPrice = sanitizeNumber(typeof searchParams.max_price === 'string' ? searchParams.max_price : Array.isArray(searchParams.max_price) ? searchParams.max_price[0] : undefined);

  return {
    ...DEFAULT_FILTERS,
    search: search && search.length ? search : undefined,
    sort,
    page,
    minPrice,
    maxPrice,
    brandIds: toNumberArray(searchParams.brand),
    colorIds: toNumberArray(searchParams.color),
    sizeIds: toNumberArray(searchParams.size),
    tagIds: toNumberArray(searchParams.tag),
    productTypeIds: toNumberArray(searchParams.product_type_id),
  };
};

import { ProductTypeSummary } from '@/types/products';

export const fetchCatalogTaxonomy = async (): Promise<{
  brands: BrandSummary[];
  colors: ColorSummary[];
  sizes: SizeSummary[];
  tags: TagSummary[];
  productTypes: ProductTypeSummary[];
}> => {
  const supabase = createSupabaseServerClient();

  const [brandsResponse, colorsResponse, sizesResponse, tagsResponse, productTypesResponse] = await Promise.all([
    supabase.from('brands').select('id, name').order('name', { ascending: true }),
    supabase.from('colors').select('id, name, hex').order('name', { ascending: true }),
    supabase.from('sizes').select('id, label').order('sort_order', { ascending: true }),
    supabase.from('tags').select('id, name, slug').order('name', { ascending: true }),
    supabase.from('product_types').select('id, name').order('name', { ascending: true }),
  ]);

  if (brandsResponse.error) {
    reportError('catalog.fetchBrands', brandsResponse.error);
  }
  if (colorsResponse.error) {
    reportError('catalog.fetchColors', colorsResponse.error);
  }
  if (sizesResponse.error) {
    reportError('catalog.fetchSizes', sizesResponse.error);
  }
  if (tagsResponse.error) {
    reportError('catalog.fetchTags', tagsResponse.error);
  }
  if (productTypesResponse.error) {
    reportError('catalog.fetchProductTypes', productTypesResponse.error);
  }

  return {
    brands: (brandsResponse.data as BrandSummary[] | null) ?? [],
    colors: (colorsResponse.data as ColorSummary[] | null) ?? [],
    sizes: (sizesResponse.data as SizeSummary[] | null) ?? [],
    tags: (tagsResponse.data as TagSummary[] | null) ?? [],
    productTypes: (productTypesResponse.data as ProductTypeSummary[] | null) ?? [],
  };
};

export const fetchCatalogProducts = async (filters: CatalogFilters): Promise<CatalogQueryResult> => {
  const supabase = createSupabaseServerClient();
  const rangeStart = (filters.page - 1) * CATALOG_PAGE_SIZE;
  const rangeEnd = rangeStart + CATALOG_PAGE_SIZE - 1;

  const tagJoin = filters.tagIds.length ? '!inner' : '';

  let query = supabase
    .from('products')
    .select(
      `
        id,
        name,
        slug,
        description,
        base_price,
        created_at,
        brand_id,
        product_type:product_types ( id, name ),
        brand:brands ( id, name ),
        variants:product_variants!inner (
          id,
          price,
          stock_qty,
          is_active,
          sku,
          color_id,
          size_id,
          color:colors ( id, name, hex ),
          size:sizes ( id, label )
        ),
        images:product_images (
          id,
          url,
          alt_text,
          width,
          height
        ),
        tags:product_tags${tagJoin} (
          tag:tags ( id, name, slug )
        )
      `,
      { count: 'exact' }
    )
    .eq('status', 'active')
    .is('deleted_at', null)
    .eq('product_variants.is_active', true)
    .gt('product_variants.stock_qty', 0);

  if (filters.brandIds.length) {
    query = query.in('brand_id', filters.brandIds);
  }
  if (filters.colorIds.length) {
    query = query.in('product_variants.color_id', filters.colorIds);
  }
  if (filters.sizeIds.length) {
    query = query.in('product_variants.size_id', filters.sizeIds);
  }
  if (filters.tagIds.length) {
    query = query.in('product_tags.tag_id', filters.tagIds);
  }
  if (filters.productTypeIds.length) {
    query = query.in('product_type_id', filters.productTypeIds);
  }
  if (typeof filters.minPrice === 'number') {
    query = query.gte('product_variants.price', filters.minPrice);
  }
  if (typeof filters.maxPrice === 'number') {
    query = query.lte('product_variants.price', filters.maxPrice);
  }

  if (filters.search) {
    const escaped = escapeIlikePattern(filters.search);
    query = query.or(
      `name.ilike.%${escaped}%,description.ilike.%${escaped}%,slug.ilike.%${escaped}%`
    );
  }

  switch (filters.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true, foreignTable: 'product_variants', nullsFirst: false });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false, foreignTable: 'product_variants' });
      break;
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  if (filters.sort !== 'newest') {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(rangeStart, rangeEnd);

  if (error) {
    reportError('catalog.fetchProducts', error, { filters });
    return {
      products: [],
      total: 0,
      page: filters.page,
      pageSize: CATALOG_PAGE_SIZE,
    };
  }

  const records = (data as RawCatalogProduct[] | null) ?? [];

  return {
    products: records.map(transformProduct),
    total: count ?? records.length,
    page: filters.page,
    pageSize: CATALOG_PAGE_SIZE,
  };
};

export const getProductBySlug = cache(async (slug: string): Promise<CatalogProduct | null> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
        id,
        name,
        slug,
        description,
        base_price,
        created_at,
        brand_id,
        product_type:product_types ( id, name ),
        brand:brands ( id, name ),
        variants:product_variants!inner (
          id,
          price,
          stock_qty,
          is_active,
          sku,
          color_id,
          size_id,
          color:colors ( id, name, hex ),
          size:sizes ( id, label )
        ),
        images:product_images (
          id,
          url,
          alt_text,
          width,
          height
        ),
        tags:product_tags (
          tag:tags ( id, name, slug )
        )
      `
    )
    .eq('status', 'active')
    .is('deleted_at', null)
    .eq('slug', slug)
    .eq('product_variants.is_active', true)
    .gt('product_variants.stock_qty', 0)
    .limit(1)
    .maybeSingle();

  if (error) {
    reportError('catalog.getProductBySlug', error, { slug });
    return null;
  }

  if (!data) {
    return null;
  }

  return transformProduct(data as RawCatalogProduct);
});
