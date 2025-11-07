-- Ensure catalog search and filtering remain performant.
-- Run `supabase db push` (or the equivalent deployment workflow) after pulling this change so the indexes are applied.

create extension if not exists pg_trgm;

create index if not exists idx_products_status on public.products using btree (status);
create index if not exists idx_products_deleted_at on public.products using btree (deleted_at);
create index if not exists idx_products_brand_id on public.products using btree (brand_id);
create index if not exists idx_products_product_type_id on public.products using btree (product_type_id);
create index if not exists idx_products_created_at on public.products using btree (created_at);

create index if not exists idx_product_variants_product_id on public.product_variants using btree (product_id);
create index if not exists idx_product_variants_is_active on public.product_variants using btree (is_active);
create index if not exists idx_product_variants_stock_qty on public.product_variants using btree (stock_qty);
create index if not exists idx_product_variants_color_id on public.product_variants using btree (color_id);
create index if not exists idx_product_variants_size_id on public.product_variants using btree (size_id);
create index if not exists idx_product_variants_price on public.product_variants using btree (price);
create index if not exists idx_product_variants_active_instock on public.product_variants using btree (product_id) where is_active = true and stock_qty > 0;

create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_description_trgm on public.products using gin (description gin_trgm_ops);
create index if not exists idx_products_slug_trgm on public.products using gin (slug gin_trgm_ops);
