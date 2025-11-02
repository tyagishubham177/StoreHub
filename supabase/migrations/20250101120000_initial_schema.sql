-- Enable required extensions
create extension if not exists "pgcrypto";

-- Product status enum
create type public.product_status as enum ('draft', 'active', 'archived');

-- Tables
create table public.admin_users (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create table public.app_config (
  id bigserial primary key,
  writes_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.brands (
  id bigserial primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.colors (
  id bigserial primary key,
  name text not null,
  hex text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  constraint colors_hex_check check (hex ~* '^#?[0-9A-F]{6}$')
);

create unique index colors_name_key on public.colors (lower(name));
create unique index colors_hex_key on public.colors (lower(hex));

create table public.sizes (
  id bigserial primary key,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create unique index sizes_label_key on public.sizes (lower(label));

create table public.tags (
  id bigserial primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  base_price numeric(12, 2) not null,
  brand_id bigint references public.brands(id),
  status public.product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null,
  price numeric(12, 2) not null,
  stock_qty integer not null default 0,
  is_active boolean not null default true,
  color_id bigint references public.colors(id),
  size_id bigint references public.sizes(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create unique index product_variants_sku_key on public.product_variants (lower(sku));
create index product_variants_product_idx on public.product_variants (product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  url text not null,
  storage_path text,
  alt_text text,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id);
create index product_images_variant_idx on public.product_images (variant_id);

create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
as $$
declare
  result boolean := false;
begin
  if to_regclass('public.admin_users') is null then
    return false;
  end if;

  execute $query$
    select exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  $query$
    into result;

  return result;
end;
$$;

create or replace function public.writes_enabled()
returns boolean
language plpgsql
stable
as $$
declare
  result boolean := true;
begin
  if to_regclass('public.app_config') is null then
    return true;
  end if;

  execute $query$
    select coalesce(
      (
        select ac.writes_enabled
        from public.app_config ac
        order by ac.id desc
        limit 1
      ),
      true
    )
  $query$
    into result;

  return coalesce(result, true);
end;
$$;

-- Seed default app config row
insert into public.app_config (id, writes_enabled)
values (1, true)
on conflict (id) do nothing;

-- Enable RLS
alter table public.admin_users enable row level security;
alter table public.app_config enable row level security;
alter table public.brands enable row level security;
alter table public.colors enable row level security;
alter table public.sizes enable row level security;
alter table public.tags enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_tags enable row level security;

-- Policies
create policy "Allow read access" on public.admin_users for select using (true);
create policy "Allow read access" on public.app_config for select using (true);
create policy "Allow read access" on public.brands for select using (true);
create policy "Allow read access" on public.colors for select using (true);
create policy "Allow read access" on public.sizes for select using (true);
create policy "Allow read access" on public.tags for select using (true);
create policy "Allow read access" on public.products for select using (true);
create policy "Allow read access" on public.product_variants for select using (true);
create policy "Allow read access" on public.product_images for select using (true);
create policy "Allow read access" on public.product_tags for select using (true);

-- Admin gated writes with writes_enabled check (excluding app_config)
create policy "Admin writes when enabled" on public.brands
  for all
  using (public.is_admin() and public.writes_enabled())
  with check (public.is_admin() and public.writes_enabled());

create policy "Admin writes when enabled" on public.colors
  for all
  using (public.is_admin() and public.writes_enabled())
  with check (public.is_admin() and public.writes_enabled());

create policy "Admin writes when enabled" on public.sizes
  for all
  using (public.is_admin() and public.writes_enabled())
  with check (public.is_admin() and public.writes_enabled());

create policy "Admin writes when enabled" on public.tags
  for all
  using (public.is_admin() and public.writes_enabled())
  with check (public.is_admin() and public.writes_enabled());

create policy "Admin writes when enabled" on public.products
  for all
  using (public.is_admin() and public.writes_enabled())
  with check (public.is_admin() and public.writes_enabled());

create policy "Admin writes when enabled" on public.product_variants
  for all
  using (public.is_admin() and public.writes_enabled())
  with check (public.is_admin() and public.writes_enabled());

create policy "Admin writes when enabled" on public.product_images
  for all
  using (public.is_admin() and public.writes_enabled())
  with check (public.is_admin() and public.writes_enabled());

create policy "Admin writes when enabled" on public.product_tags
  for all
  using (public.is_admin() and public.writes_enabled())
  with check (public.is_admin() and public.writes_enabled());

create policy "Admin writes when enabled" on public.admin_users
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin writes" on public.app_config
  for all
  using (public.is_admin())
  with check (public.is_admin());

