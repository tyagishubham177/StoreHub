'use server';

import { revalidatePath } from 'next/cache';
import { getServerActionClient } from '@/lib/supabase/server';
import { ensureUniqueSlug, slugify } from '@/lib/utils/slugify';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ActionState } from './action-state';
export type { ActionState } from './action-state';

class ActionError extends Error {}

const PRODUCT_STATUSES: Database['public']['Enums']['product_status'][] = [
  'draft',
  'active',
  'archived',
];

function requireString(
  value: FormDataEntryValue | null,
  field: string,
  { min = 1, max = 255 }: { min?: number; max?: number } = {}
) {
  if (typeof value !== 'string') {
    throw new ActionError(`${field} is required.`);
  }

  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw new ActionError(`${field} must be at least ${min} characters long.`);
  }
  if (trimmed.length > max) {
    throw new ActionError(`${field} must be less than ${max + 1} characters.`);
  }

  return trimmed;
}

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function requireNumber(
  value: FormDataEntryValue | null,
  field: string,
  { min, max }: { min?: number; max?: number } = {}
) {
  const asString = requireString(value, field);
  const parsed = Number(asString);

  if (!Number.isFinite(parsed)) {
    throw new ActionError(`${field} must be a number.`);
  }
  if (typeof min === 'number' && parsed < min) {
    throw new ActionError(`${field} must be at least ${min}.`);
  }
  if (typeof max === 'number' && parsed > max) {
    throw new ActionError(`${field} must be ${max} or less.`);
  }

  return parsed;
}

function optionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new ActionError('Number field is invalid.');
  }

  return parsed;
}

async function requireAuthenticatedUser() {
  const supabase = getServerActionClient() as unknown as SupabaseClient<Database>;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new ActionError(error.message);
  }
  if (!user) {
    throw new ActionError('You must be signed in to perform this action.');
  }

  return { supabase, user };
}

async function generateUniqueProductSlug(
  supabase: SupabaseClient<Database>,
  name: string,
  excludeId?: string
) {
  const baseSlug = slugify(name);
  const { data, error } = await supabase
    .from('products')
    .select('id, slug')
    .ilike('slug', `${baseSlug}%`);

  if (error) {
    throw new ActionError(error.message);
  }

  type ProductSlugRow = Pick<Database['public']['Tables']['products']['Row'], 'id' | 'slug'>;
  const rows = (data ?? []) as ProductSlugRow[];
  const existing = new Set<string>(
    rows.filter((item) => item.id !== excludeId).map((item) => item.slug)
  );

  return ensureUniqueSlug(baseSlug, existing);
}

function requireHex(value: FormDataEntryValue | null, field: string) {
  const hex = requireString(value, field, { min: 4, max: 7 }).toLowerCase();
  if (!/^#?[0-9a-f]{3}([0-9a-f]{3})?$/.test(hex)) {
    throw new ActionError(`${field} must be a valid hex code.`);
  }

  return hex.startsWith('#') ? hex : `#${hex}`;
}

function requireStatus(value: FormDataEntryValue | null) {
  const status = requireString(value, 'Status').toLowerCase();
  if (!PRODUCT_STATUSES.includes(status as typeof PRODUCT_STATUSES[number])) {
    throw new ActionError('Status is invalid.');
  }

  return status as Database['public']['Enums']['product_status'];
}

function requireUuid(value: FormDataEntryValue | null, field: string) {
  const input = requireString(value, field);
  if (!/^[0-9a-f-]{36}$/i.test(input)) {
    throw new ActionError(`${field} is invalid.`);
  }
  return input;
}

function requireSlug(value: FormDataEntryValue | null, field: string) {
  const input = requireString(value, field, { min: 1, max: 120 }).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input)) {
    throw new ActionError(`${field} must only contain letters, numbers, and hyphens.`);
  }
  return input;
}

export async function createBrand(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const name = requireString(formData.get('name'), 'Brand name', { min: 2, max: 120 });
    const baseSlug = slugify(name);

    const { data, error } = await supabase
      .from('brands')
      .select('slug')
      .ilike('slug', `${baseSlug}%`);

    if (error) {
      throw new ActionError(error.message);
    }

    type BrandSlugRow = Pick<Database['public']['Tables']['brands']['Row'], 'slug'>;
    const rows = (data ?? []) as BrandSlugRow[];
    const slug = ensureUniqueSlug(baseSlug, new Set(rows.map((item) => item.slug)));

    const { error: insertError } = await supabase.from('brands').insert({ name, slug });

    if (insertError) {
      throw new ActionError(insertError.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: `Brand "${name}" added.` };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to create brand.';
    return { status: 'error', message };
  }
}

export async function createColor(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const name = requireString(formData.get('name'), 'Color name', { min: 2, max: 80 });
    const hex = requireHex(formData.get('hex'), 'Color hex');

    const { error } = await supabase.from('colors').insert({ name, hex });
    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: `Color "${name}" added.` };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to create color.';
    return { status: 'error', message };
  }
}

export async function createSize(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const label = requireString(formData.get('label'), 'Size label', { min: 1, max: 40 });
    const sortOrder = optionalNumber(formData.get('sort_order')) ?? undefined;

    const { error } = await supabase
      .from('sizes')
      .insert({ label, sort_order: typeof sortOrder === 'number' ? sortOrder : undefined });

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: `Size "${label}" added.` };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to create size.';
    return { status: 'error', message };
  }
}

export async function createProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const name = requireString(formData.get('name'), 'Product name', { min: 2, max: 160 });
    const brandId = optionalNumber(formData.get('brand_id'));
    const basePrice = requireNumber(formData.get('base_price'), 'Base price', { min: 0 });
    const description = optionalString(formData.get('description'));
    const status = requireStatus(formData.get('status'));

    const slug = await generateUniqueProductSlug(supabase, name);

    const { error } = await supabase.from('products').insert({
      name,
      slug,
      brand_id: typeof brandId === 'number' ? brandId : null,
      base_price: basePrice,
      description,
      status,
      created_by: user.id,
      updated_by: user.id,
    });

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: `Product "${name}" created.` };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to create product.';
    return { status: 'error', message };
  }
}

export async function updateProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const productId = requireUuid(formData.get('product_id'), 'Product');
    const name = requireString(formData.get('name'), 'Product name', { min: 2, max: 160 });
    const slugInput = requireSlug(formData.get('slug'), 'Slug');
    const brandId = optionalNumber(formData.get('brand_id'));
    const basePrice = requireNumber(formData.get('base_price'), 'Base price', { min: 0 });
    const description = optionalString(formData.get('description'));
    const status = requireStatus(formData.get('status'));

    const slug = await generateUniqueProductSlug(supabase, slugInput, productId);

    const { error } = await supabase
      .from('products')
      .update({
        name,
        slug,
        brand_id: typeof brandId === 'number' ? brandId : null,
        base_price: basePrice,
        description,
        status,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: `Product "${name}" updated.` };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to update product.';
    return { status: 'error', message };
  }
}

export async function softDeleteProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const productId = requireUuid(formData.get('product_id'), 'Product');

    const { error } = await supabase
      .from('products')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'archived',
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Product archived.' };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to archive product.';
    return { status: 'error', message };
  }
}

export async function restoreProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const productId = requireUuid(formData.get('product_id'), 'Product');

    const { error } = await supabase
      .from('products')
      .update({
        deleted_at: null,
        status: 'draft',
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Product restored to draft.' };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to restore product.';
    return { status: 'error', message };
  }
}

export async function createVariant(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const productId = requireUuid(formData.get('product_id'), 'Product');
    const colorId = optionalNumber(formData.get('color_id'));
    const sizeId = optionalNumber(formData.get('size_id'));
    const price = requireNumber(formData.get('price'), 'Variant price', { min: 0 });
    const sku = requireString(formData.get('sku'), 'SKU', { min: 1, max: 80 });
    const stockQty = requireNumber(formData.get('stock_qty'), 'Stock quantity', { min: 0 });
    const isActive = formData.get('is_active') === 'true';

    const { error } = await supabase.from('product_variants').insert({
      product_id: productId,
      color_id: typeof colorId === 'number' ? colorId : null,
      size_id: typeof sizeId === 'number' ? sizeId : null,
      price,
      sku,
      stock_qty: stockQty,
      is_active: isActive,
    });

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Variant created.' };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to create variant.';
    return { status: 'error', message };
  }
}

export async function updateVariant(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const variantId = requireUuid(formData.get('variant_id'), 'Variant');
    const colorId = optionalNumber(formData.get('color_id'));
    const sizeId = optionalNumber(formData.get('size_id'));
    const price = requireNumber(formData.get('price'), 'Variant price', { min: 0 });
    const sku = requireString(formData.get('sku'), 'SKU', { min: 1, max: 80 });
    const stockQty = requireNumber(formData.get('stock_qty'), 'Stock quantity', { min: 0 });
    const isActive = formData.get('is_active') === 'true';

    const { error } = await supabase
      .from('product_variants')
      .update({
        color_id: typeof colorId === 'number' ? colorId : null,
        size_id: typeof sizeId === 'number' ? sizeId : null,
        price,
        sku,
        stock_qty: stockQty,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', variantId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Variant updated.' };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to update variant.';
    return { status: 'error', message };
  }
}

export async function deleteVariant(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const variantId = requireUuid(formData.get('variant_id'), 'Variant');

    const { error } = await supabase.from('product_variants').delete().eq('id', variantId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Variant removed.' };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to delete variant.';
    return { status: 'error', message };
  }
}

export async function createProductImage(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const productId = requireUuid(formData.get('product_id'), 'Product');
    const variantId = optionalString(formData.get('variant_id'));
    const url = requireString(formData.get('url'), 'Image URL', { min: 5, max: 500 });
    const storagePath = optionalString(formData.get('storage_path'));
    const altText = optionalString(formData.get('alt_text'));
    const width = optionalNumber(formData.get('width'));
    const height = optionalNumber(formData.get('height'));

    const { error } = await supabase.from('product_images').insert({
      product_id: productId,
      variant_id: variantId ? requireUuid(variantId, 'Variant') : null,
      url,
      storage_path: storagePath,
      alt_text: altText,
      width: typeof width === 'number' ? width : null,
      height: typeof height === 'number' ? height : null,
    });

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Image added.' };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to add image.';
    return { status: 'error', message };
  }
}

export async function updateProductImage(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const imageId = requireUuid(formData.get('image_id'), 'Image');
    const variantId = optionalString(formData.get('variant_id'));
    const url = requireString(formData.get('url'), 'Image URL', { min: 5, max: 500 });
    const storagePath = optionalString(formData.get('storage_path'));
    const altText = optionalString(formData.get('alt_text'));
    const width = optionalNumber(formData.get('width'));
    const height = optionalNumber(formData.get('height'));

    const { error } = await supabase
      .from('product_images')
      .update({
        variant_id: variantId ? requireUuid(variantId, 'Variant') : null,
        url,
        storage_path: storagePath,
        alt_text: altText,
        width: typeof width === 'number' ? width : null,
        height: typeof height === 'number' ? height : null,
      })
      .eq('id', imageId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Image updated.' };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to update image.';
    return { status: 'error', message };
  }
}

export async function deleteProductImage(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAuthenticatedUser();
    const imageId = requireUuid(formData.get('image_id'), 'Image');

    const { error } = await supabase.from('product_images').delete().eq('id', imageId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Image removed.' };
  } catch (error) {
    const message = error instanceof ActionError ? error.message : 'Unable to delete image.';
    return { status: 'error', message };
  }
}
