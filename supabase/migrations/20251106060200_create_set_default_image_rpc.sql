
create or replace function set_default_product_image(
  p_product_id uuid,
  p_image_id uuid
)
returns void as $$
begin
  -- First, set is_default to false for all images of the given product
  update public.product_images
  set is_default = false
  where product_id = p_product_id;

  -- Then, set is_default to true for the specified image
  update public.product_images
  set is_default = true
  where id = p_image_id;
end;
$$ language plpgsql;
