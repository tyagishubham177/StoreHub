import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  BrandSummary,
  ColorSummary,
  ProductWithRelations,
  SizeSummary,
} from '@/types/products';
import CreateBrandForm from '@/components/products/create-brand-form';
import CreateColorForm from '@/components/products/create-color-form';
import CreateSizeForm from '@/components/products/create-size-form';
import CreateProductForm from '@/components/products/create-product-form';
import ProductCard from '@/components/products/product-card';

export const dynamic = 'force-dynamic';

async function fetchTaxonomy<T>(
  supabase: SupabaseClient<Database>,
  table: keyof Database['public']['Tables'],
  columns: string,
  orderColumn: string
) {
  const query = supabase.from(table).select(columns);
  if (orderColumn) {
    query.order(orderColumn, { ascending: true });
  }
  const { data, error } = await query;
  if (error) {
    console.error(`Failed to fetch ${table}:`, error);
    return [] as unknown as T[];
  }
  return (data as T[]) ?? [];
}

export default async function ProductsPage() {
  const supabase = createServerComponentClient<Database>({ cookies }) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: adminRows, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id);

  const isAdmin = !adminError && (adminRows?.length ?? 0) > 0;

  if (!isAdmin) {
    return (
      <main>
        <header>
          <h1>Inventory access requires admin status</h1>
          <p>Please ask a StoreHub administrator to grant your account access to product management.</p>
        </header>
      </main>
    );
  }

  const brands = await fetchTaxonomy<BrandSummary>(supabase, 'brands', 'id, name', 'name');
  const colors = await fetchTaxonomy<ColorSummary>(supabase, 'colors', 'id, name, hex', 'name');
  const sizes = await fetchTaxonomy<SizeSummary>(supabase, 'sizes', 'id, label', 'sort_order');

  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select(
      `
        id,
        name,
        slug,
        status,
        base_price,
        description,
        brand_id,
        deleted_at,
        created_at,
        updated_at,
        brand:brands ( id, name ),
        variants:product_variants (
          id,
          product_id,
          color_id,
          size_id,
          price,
          sku,
          stock_qty,
          is_active,
          created_at,
          updated_at,
          color:colors ( id, name, hex ),
          size:sizes ( id, label )
        ),
        images:product_images (
          id,
          product_id,
          variant_id,
          url,
          storage_path,
          alt_text,
          width,
          height,
          created_at
        )
      `
    )
    .order('created_at', { ascending: false });

  if (productsError) {
    console.error('Failed to fetch products:', productsError);
  }

  const products = ((productsData as ProductWithRelations[] | null) ?? []).map((product) => ({
    ...product,
    variants: product.variants ?? [],
    images: product.images ?? [],
  }));

  return (
    <main style={{ maxWidth: '1200px' }}>
      <header>
        <h1>StoreHub Inventory</h1>
        <p>
          Create products, manage size and color variants, and attach imagery. All write operations respect the
          Supabase feature flag for transitioning to view-only mode.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gap: '1.25rem',
          padding: '1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 15px 35px -25px rgba(15, 23, 42, 0.35)',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Catalog foundations</h2>
          <p style={{ margin: '0.35rem 0 0', color: '#6b7280' }}>
            Seed your brands, colors, and sizes before adding product variants.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1.25rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Brands</h3>
            <CreateBrandForm />
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#6b7280' }}>
              {brands.length ? brands.map((brand) => <li key={brand.id}>{brand.name}</li>) : <li>No brands yet.</li>}
            </ul>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Colors</h3>
            <CreateColorForm />
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#6b7280' }}>
              {colors.length ? (
                colors.map((color) => (
                  <li key={color.id}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '0.75rem',
                        height: '0.75rem',
                        borderRadius: '999px',
                        backgroundColor: color.hex,
                        marginRight: '0.5rem',
                        border: '1px solid #d1d5db',
                        verticalAlign: 'middle',
                      }}
                    />
                    {color.name}
                  </li>
                ))
              ) : (
                <li>No colors yet.</li>
              )}
            </ul>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Sizes</h3>
            <CreateSizeForm />
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#6b7280' }}>
              {sizes.length ? sizes.map((size) => <li key={size.id}>{size.label}</li>) : <li>No sizes yet.</li>}
            </ul>
          </div>
        </div>
      </section>

      <CreateProductForm brands={brands} />

      <section style={{ display: 'grid', gap: '2rem' }}>
        {products.length ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              brands={brands}
              colors={colors}
              sizes={sizes}
            />
          ))
        ) : (
          <p style={{ color: '#6b7280' }}>Create a product to begin managing variants and imagery.</p>
        )}
      </section>
    </main>
  );
}
