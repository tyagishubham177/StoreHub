-- Add product_type column to products table
alter table public.products
add column product_type text;

-- Seed initial product types for existing products
with numbered_products as (
    select id, row_number() over (order by created_at) as rn
    from public.products
)
update public.products
set product_type = case
    when np.rn % 3 = 1 then 'Shoes'
    when np.rn % 3 = 2 then 'Shirts'
    else 'Jeans'
end
from numbered_products np
where public.products.id = np.id;
