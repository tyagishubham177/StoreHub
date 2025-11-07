import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  BrandSummary,
  ColorSummary,
  ProductWithRelations,
  SizeSummary,
  ProductTypeSummary,
} from '@/types/products';
import SignOutButton from '@/components/auth/sign-out-button';
import CreateBrandForm from '@/components/products/create-brand-form';
import CreateColorForm from '@/components/products/create-color-form';
import CreateSizeForm from '@/components/products/create-size-form';
import CreateProductTypeForm from '@/components/products/create-product-type-form';
import CreateProductForm from '@/components/products/create-product-form';
import WriteModeCard from '@/components/products/write-mode-card';
import ProductView from '@/components/products/product-view';
import CatalogList from '@/components/products/catalog-list';
import { reportError } from '@/lib/observability/report-error';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'StoreHub Inventory Mgmt',
};

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
    reportError('productsPage.fetchTaxonomy', error, { table });
    return [] as unknown as T[];
  }
  return (data as T[]) ?? [];
}

export default async function ProductsPage() {
  const supabase = createSupabaseServerClient();
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

  if (adminError) {
    reportError('productsPage.loadAdmin', adminError, { userId: user.id });
  }

  const isAdmin = !adminError && (adminRows?.length ?? 0) > 0;

  if (!isAdmin) {
    return (
      <main className="container mx-auto py-8">
        <header>
          <h1 className="text-2xl font-bold">Inventory access requires admin status</h1>
          <p className="mt-2 text-muted-foreground">
            Please ask a StoreHub administrator to grant your account access to product management.
          </p>
        </header>
      </main>
    );
  }

  const brands = await fetchTaxonomy<BrandSummary>(supabase, 'brands', 'id, name', 'name');
  const colors = await fetchTaxonomy<ColorSummary>(supabase, 'colors', 'id, name, hex', 'name');
  const sizes = await fetchTaxonomy<SizeSummary>(supabase, 'sizes', 'id, label, sort_order', 'sort_order');
  const productTypes = await fetchTaxonomy<ProductTypeSummary>(supabase, 'product_types', 'id, name', 'name');

  const { data: configRows, error: configError } = await supabase
    .from('app_config')
    .select('writes_enabled')
    .order('id', { ascending: false })
    .limit(1);

  if (configError) {
    reportError('productsPage.loadConfig', configError);
  }

  const writesEnabled = configRows?.[0]?.writes_enabled ?? true;

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
          color:colors ( id, name ),
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
          created_at,
          is_default
        )
      `
    )
    .order('created_at', { ascending: false })
    .order('is_default', { ascending: false, foreignTable: 'product_images' })
    .order('created_at', { ascending: false, foreignTable: 'product_images' });

  if (productsError) {
    reportError('productsPage.loadProducts', productsError);
  }

  const products = ((productsData as ProductWithRelations[] | null) ?? []).map((product) => ({
    ...product,
    variants: product.variants ?? [],
    images: (product.images ?? []).slice().sort((a, b) => {
      if (a.is_default === b.is_default) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.is_default ? -1 : 1;
    }),
  }));

  return (
    <main className="container mx-auto py-8">
      <header className="mb-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">StoreHub Inventory</h1>
            <p className="mt-2 text-muted-foreground">
              Create products, manage size and color variants, and attach imagery. All write operations respect the Supabase
              feature flag for transitioning to view-only mode.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <span>{user.email ?? 'StoreHub admin'}</span>
            <SignOutButton />
          </div>
        </div>

        {!writesEnabled ? (
          <div role="alert" className="rounded-lg border border-yellow-500 bg-yellow-100 p-4 font-semibold text-yellow-800">
            Inventory writes are temporarily disabled for maintenance. Existing data remains available in read-only mode.
          </div>
        ) : null}
      </header>

      <WriteModeCard writesEnabled={writesEnabled} />

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Catalog foundations</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Catalog foundations</CardTitle>
                <p className="text-muted-foreground">
                  Seed your brands, colors, and sizes before adding product variants.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h3 className="text-lg font-medium">Brands</h3>
                    <CreateBrandForm disabled={!writesEnabled} />
                    <CatalogList
                      items={brands.map((brand) => ({ id: brand.id, name: brand.name }))}
                      kind="brand"
                      disabled={!writesEnabled}
                      emptyMessage="No brands yet."
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Colors</h3>
                    <CreateColorForm disabled={!writesEnabled} />
                    <CatalogList
                      items={colors.map((color) => ({
                        id: color.id,
                        name: color.name,
                        description: color.hex ? color.hex.toUpperCase() : undefined,
                      }))}
                      kind="color"
                      disabled={!writesEnabled}
                      emptyMessage="No colors yet."
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Sizes</h3>
                    <CreateSizeForm disabled={!writesEnabled} />
                    <CatalogList
                      items={sizes.map((size) => ({
                        id: size.id,
                        name: size.label,
                        description: typeof size.sort_order === 'number' ? `Sort order ${size.sort_order}` : undefined,
                      }))}
                      kind="size"
                      disabled={!writesEnabled}
                      emptyMessage="No sizes yet."
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Product Types</h3>
                    <CreateProductTypeForm disabled={!writesEnabled} />
                    <CatalogList
                      items={productTypes.map((productType) => ({ id: productType.id, name: productType.name }))}
                      kind="productType"
                      disabled={!writesEnabled}
                      emptyMessage="No product types yet."
                    />
                  </div>
                </div>
              </CardContent>

            </Card>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Create Product</AccordionTrigger>
          <AccordionContent>
            <CreateProductForm
              brands={brands}
              productTypes={productTypes}
              colors={colors}
              sizes={sizes}
              writesEnabled={writesEnabled}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ProductView
        products={products}
        brands={brands}
        colors={colors}
        sizes={sizes}
        productTypes={productTypes}
        writesEnabled={writesEnabled}
      />
    </main>
  );
}
