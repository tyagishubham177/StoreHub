'use server';

import { revalidatePath } from 'next/cache';
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from '@/lib/supabase/server';
import { ensureUniqueSlug, slugify } from '@/lib/utils/slugify';
import { reportError } from '@/lib/observability/report-error';
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

  const normalized = trimmed.toLowerCase();
  if (normalized === 'null' || normalized === 'undefined' || normalized === 'none' || normalized === 'unassigned') {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new ActionError('Number field is invalid.');
  }

  return parsed;
}

function requireBoolean(value: FormDataEntryValue | null, field: string) {
  const input = requireString(value, field).toLowerCase();

  if (input === 'true') {
    return true;
  }
  if (input === 'false') {
    return false;
  }

  throw new ActionError(`${field} must be true or false.`);
}

function normalizeForSku(value: string) {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createSkuSegment(source: string, { maxLength }: { maxLength: number }) {
  const normalized = normalizeForSku(source);
  if (!normalized) {
    return '';
  }

  const compact = normalized
    .split(' ')
    .map((word) => {
      if (!word.length) {
        return '';
      }
      const [head, ...rest] = word;
      const tail = rest.join('').replace(/[AEIOU]/g, '');
      return `${head}${tail}`;
    })
    .join('');

  return (compact || normalized.replace(/\s+/g, '')).slice(0, Math.max(1, maxLength));
}

async function ensureUniqueSku(
  supabase: SupabaseClient<Database>,
  base: string,
  { maxLength = 80 }: { maxLength?: number } = {}
) {
  const sanitizedBase = base.replace(/[^A-Z0-9-]/g, '').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
  if (!sanitizedBase) {
    throw new ActionError('Unable to generate a SKU from the provided details. Please supply one manually.');
  }

  let attempt = 0;
  let candidate = sanitizedBase.slice(0, maxLength);

  while (attempt < 50) {
    const { data, error } = await supabase
      .from('product_variants')
      .select('id')
      .eq('sku', candidate)
      .limit(1);

    if (error) {
      throw new ActionError(error.message);
    }

    if (!data?.length) {
      return candidate;
    }

    attempt += 1;
    const suffix = `-${String(attempt).padStart(2, '0')}`;
    const trimmedBase = sanitizedBase.slice(0, Math.max(1, maxLength - suffix.length));
    candidate = `${trimmedBase}${suffix}`;
  }

  throw new ActionError('Unable to generate a unique SKU. Please supply one manually.');
}

async function lookupBrandName(supabase: SupabaseClient<Database>, brandId: number | null) {
  if (typeof brandId !== 'number') {
    return null;
  }

  const { data, error } = await supabase
    .from('brands')
    .select('name')
    .eq('id', brandId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ActionError(error.message);
  }

  return data?.name ?? null;
}

async function lookupColorName(supabase: SupabaseClient<Database>, colorId: number | null) {
  if (typeof colorId !== 'number') {
    return null;
  }

  const { data, error } = await supabase
    .from('colors')
    .select('name')
    .eq('id', colorId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ActionError(error.message);
  }

  return data?.name ?? null;
}

async function lookupSizeLabel(supabase: SupabaseClient<Database>, sizeId: number | null) {
  if (typeof sizeId !== 'number') {
    return null;
  }

  const { data, error } = await supabase
    .from('sizes')
    .select('label')
    .eq('id', sizeId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ActionError(error.message);
  }

  return data?.label ?? null;
}

async function generateVariantSku(
  supabase: SupabaseClient<Database>,
  {
    productName,
    brandId,
    colorId,
    sizeId,
  }: {
    productName: string;
    brandId: number | null;
    colorId: number | null;
    sizeId: number | null;
  }
) {
  const [brandName, colorName, sizeLabel] = await Promise.all([
    lookupBrandName(supabase, brandId),
    lookupColorName(supabase, colorId),
    lookupSizeLabel(supabase, sizeId),
  ]);

  const segments: string[] = [];
  if (brandName) {
    const brandSegment = createSkuSegment(brandName, { maxLength: 4 });
    if (brandSegment) {
      segments.push(brandSegment);
    }
  }

  const productSegment = createSkuSegment(productName, { maxLength: 6 });
  if (productSegment) {
    segments.push(productSegment);
  }

  if (sizeLabel) {
    const sizeSegment = createSkuSegment(sizeLabel, { maxLength: 3 });
    if (sizeSegment) {
      segments.push(`SZ${sizeSegment}`);
    }
  }

  if (colorName) {
    const colorSegment = createSkuSegment(colorName, { maxLength: 3 });
    if (colorSegment) {
      segments.push(colorSegment);
    }
  }

  const base = segments.length ? segments.join('-') : createSkuSegment(productName, { maxLength: 10 }) || 'SKU';
  return ensureUniqueSku(supabase, base, { maxLength: 80 });
}

function optionalFile(
  value: FormDataEntryValue | null,
  field: string,
  {
    maxSize = 5 * 1024 * 1024,
    types = ['image/jpeg', 'image/png', 'image/webp'],
  }: { maxSize?: number; types?: string[] } = {}
) {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (value.size > maxSize) {
    throw new ActionError(`${field} must be less than ${maxSize / 1024 / 1024}MB.`);
  }

  if (!types.includes(value.type)) {
    throw new ActionError(`${field} must be one of the following types: ${types.join(', ')}.`);
  }

  return value;
}

function handleActionError(context: string, error: unknown, fallback: string): ActionState {
  if (error instanceof ActionError) {
    return { status: 'error', message: error.message };
  }

  reportError(context, error);
  return { status: 'error', message: fallback };
}

async function requireAuthenticatedUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    reportError('serverActions.requireAuthenticatedUser', error);
    throw new ActionError(error.message);
  }
  if (!user) {
    throw new ActionError('You must be signed in to perform this action.');
  }

  return { supabase, user };
}

async function requireAdminUser({ checkWritesEnabled = true }: { checkWritesEnabled?: boolean } = {}) {
  const { supabase, user } = await requireAuthenticatedUser();
  const adminSupabase = createSupabaseServiceRoleClient();

  const { data: adminRows, error: adminError } = await adminSupabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .limit(1);

  if (adminError) {
    reportError('serverActions.requireAdminUser.lookup', adminError, { userId: user.id });
    throw new ActionError('Unable to verify admin access. Please try again.');
  }

  if (!adminRows?.length) {
    throw new ActionError('You do not have permission to manage inventory.');
  }

  if (checkWritesEnabled) {
    const { data: configRows, error: configError } = await adminSupabase
      .from('app_config')
      .select('writes_enabled')
      .order('id', { ascending: false })
      .limit(1);

    if (configError) {
      reportError('serverActions.requireAdminUser.config', configError);
      throw new ActionError('Unable to verify write access. Please try again later.');
    }

    const writesEnabled = configRows?.[0]?.writes_enabled ?? true;

    if (!writesEnabled) {
      throw new ActionError('Inventory writes are currently disabled for maintenance.');
    }
  }

  return { supabase, adminSupabase, user };
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
    const { supabase } = await requireAdminUser();
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
    return handleActionError('serverActions.createBrand', error, 'Unable to create brand.');
  }
}

export async function deleteBrand(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const brandId = requireNumber(formData.get('brand_id'), 'Brand');

    const { error } = await supabase.from('brands').delete().eq('id', brandId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Brand deleted.' };
  } catch (error) {
    return handleActionError('serverActions.deleteBrand', error, 'Unable to delete brand.');
  }
}

export async function createProductType(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const name = requireString(formData.get('name'), 'Product type name', { min: 2, max: 120 });
    const baseSlug = slugify(name);

    const { data, error } = await supabase
      .from('product_types')
      .select('slug')
      .ilike('slug', `${baseSlug}%`);

    if (error) {
      throw new ActionError(error.message);
    }

    type ProductTypeSlugRow = Pick<Database['public']['Tables']['product_types']['Row'], 'slug'>;
    const rows = (data ?? []) as ProductTypeSlugRow[];
    const slug = ensureUniqueSlug(baseSlug, new Set(rows.map((item) => item.slug)));

    const { error: insertError } = await supabase.from('product_types').insert({ name, slug });

    if (insertError) {
      throw new ActionError(insertError.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: `Product type "${name}" added.` };
  } catch (error) {
    return handleActionError('serverActions.createProductType', error, 'Unable to create product type.');
  }
}

export async function deleteProductType(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const productTypeId = requireNumber(formData.get('product_type_id'), 'Product type');

    const { error } = await supabase.from('product_types').delete().eq('id', productTypeId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Product type deleted.' };
  } catch (error) {
    return handleActionError('serverActions.deleteProductType', error, 'Unable to delete product type.');
  }
}

export async function createColor(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const name = requireString(formData.get('name'), 'Color name', { min: 2, max: 80 });

    const { error } = await supabase.from('colors').insert({ name });
    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: `Color "${name}" added.` };
  } catch (error) {
    return handleActionError('serverActions.createColor', error, 'Unable to create color.');
  }
}

export async function deleteColor(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const colorId = requireNumber(formData.get('color_id'), 'Color');

    const { error } = await supabase.from('colors').delete().eq('id', colorId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Color deleted.' };
  } catch (error) {
    return handleActionError('serverActions.deleteColor', error, 'Unable to delete color.');
  }
}

export async function createSize(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
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
    return handleActionError('serverActions.createSize', error, 'Unable to create size.');
  }
}

export async function deleteSize(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const sizeId = requireNumber(formData.get('size_id'), 'Size');

    const { error } = await supabase.from('sizes').delete().eq('id', sizeId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Size deleted.' };
  } catch (error) {
    return handleActionError('serverActions.deleteSize', error, 'Unable to delete size.');
  }
}

export async function createProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireAdminUser();
    const name = requireString(formData.get('name'), 'Product name', { min: 2, max: 160 });
    const brandId = optionalNumber(formData.get('brand_id'));
    const basePrice = requireNumber(formData.get('base_price'), 'Base price', { min: 0 });
    const description = optionalString(formData.get('description'));
    const status = requireStatus(formData.get('status'));
    const productTypeId = optionalNumber(formData.get('product_type_id'));
    const variantColorId = optionalNumber(formData.get('variant_color_id'));
    const variantSizeId = optionalNumber(formData.get('variant_size_id'));
    const variantPriceInput = optionalNumber(formData.get('variant_price'));
    if (variantPriceInput !== null && variantPriceInput < 0) {
      throw new ActionError('Variant price cannot be negative.');
    }
    const variantPrice = variantPriceInput ?? basePrice;
    const variantStockQty = requireNumber(formData.get('variant_stock_qty'), 'Variant stock', { min: 0 });
    const variantSkuInput = optionalString(formData.get('variant_sku'));
    const normalizedBrandId = typeof brandId === 'number' ? brandId : null;
    const normalizedColorId = typeof variantColorId === 'number' ? variantColorId : null;
    const normalizedSizeId = typeof variantSizeId === 'number' ? variantSizeId : null;
    const variantSku = variantSkuInput
      ? await ensureUniqueSku(supabase, variantSkuInput.toUpperCase(), { maxLength: 80 })
      : await generateVariantSku(supabase, {
          productName: name,
          brandId: normalizedBrandId,
          colorId: normalizedColorId,
          sizeId: normalizedSizeId,
        });
    const variantIsActive = requireString(formData.get('variant_is_active'), 'Variant status').toLowerCase() !== 'false';

    const slug = await generateUniqueProductSlug(supabase, name);

    const { data: insertedRows, error } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        brand_id: normalizedBrandId,
        base_price: basePrice,
        description,
        status,
        product_type_id: typeof productTypeId === 'number' ? productTypeId : null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('id')
      .single();

    if (error) {
      throw new ActionError(error.message);
    }

    const productId = insertedRows?.id;

    if (!productId) {
      throw new ActionError('Unable to determine the created product.');
    }

    const { error: variantError } = await supabase.from('product_variants').insert({
      product_id: productId,
      color_id: normalizedColorId,
      size_id: normalizedSizeId,
      price: variantPrice,
      sku: variantSku,
      stock_qty: variantStockQty,
      is_active: variantIsActive,
    });

    if (variantError) {
      await supabase.from('products').delete().eq('id', productId);
      throw new ActionError(variantError.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: `Product "${name}" created with initial variant.` };
  } catch (error) {
    return handleActionError('serverActions.createProduct', error, 'Unable to create product.');
  }
}

export async function updateProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireAdminUser();
    const productId = requireUuid(formData.get('product_id'), 'Product');
    const name = requireString(formData.get('name'), 'Product name', { min: 2, max: 160 });
    const slugInput = requireSlug(formData.get('slug'), 'Slug');
    const brandValue = formData.get('brand_id');
    const brandId = brandValue === 'null' ? null : optionalNumber(brandValue);
    const basePrice = requireNumber(formData.get('base_price'), 'Base price', { min: 0 });
    const description = optionalString(formData.get('description'));
    const status = requireStatus(formData.get('status'));
    const productTypeId = optionalNumber(formData.get('product_type_id'));

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
        product_type_id: typeof productTypeId === 'number' ? productTypeId : null,
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
    return handleActionError('serverActions.updateProduct', error, 'Unable to update product.');
  }
}

export async function softDeleteProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireAdminUser();
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
    return handleActionError('serverActions.archiveProduct', error, 'Unable to archive product.');
  }
}

export async function restoreProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireAdminUser();
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
    return handleActionError('serverActions.restoreProduct', error, 'Unable to restore product.');
  }
}

export async function createVariant(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
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
    return handleActionError('serverActions.createVariant', error, 'Unable to create variant.');
  }
}

export async function updateVariant(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
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
    return handleActionError('serverActions.updateVariant', error, 'Unable to update variant.');
  }
}

export async function deleteVariant(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const variantId = requireUuid(formData.get('variant_id'), 'Variant');

    const { error } = await supabase.from('product_variants').delete().eq('id', variantId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Variant removed.' };
  } catch (error) {
    return handleActionError('serverActions.deleteVariant', error, 'Unable to delete variant.');
  }
}

export async function createProductImage(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, adminSupabase } = await requireAdminUser();
    const productId = requireUuid(formData.get('product_id'), 'Product');
    const imageFile = optionalFile(formData.get('image'), 'Image');
    const imageUrl = optionalString(formData.get('url'));

    if (imageFile && imageUrl) {
      throw new ActionError('Please provide either an image file or a URL, not both.');
    }
    if (!imageFile && !imageUrl) {
      throw new ActionError('Please provide either an image file or a URL.');
    }

    const altText = optionalString(formData.get('alt_text'));

    let url = imageUrl;
    let storagePath: string | null = null;

    const storageClient = adminSupabase ?? supabase;

    if (imageFile) {
      storagePath = `${productId}/${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await storageClient.storage
        .from('product-images')
        .upload(storagePath, imageFile);

      if (uploadError) {
        throw new ActionError(uploadError.message);
      }

      url = storageClient.storage.from('product-images').getPublicUrl(storagePath).data.publicUrl;
    }

    if (!url) {
      throw new ActionError('Unable to determine image URL.');
    }

    const targetClient = adminSupabase ?? supabase;

    const { error: insertError } = await targetClient.from('product_images').insert({
      product_id: productId,
      url,
      storage_path: storagePath,
      alt_text: altText,
    });

    if (insertError) {
      throw new ActionError(insertError.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Image added.' };
  } catch (error) {
    return handleActionError('serverActions.createImage', error, 'Unable to add image.');
  }
}

export async function updateProductImage(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, adminSupabase } = await requireAdminUser();
    const imageId = requireUuid(formData.get('image_id'), 'Image');
    const url = requireString(formData.get('url'), 'Image URL', { min: 5, max: 500 });
    const storagePath = optionalString(formData.get('storage_path'));
    const altText = optionalString(formData.get('alt_text'));

    const targetClient = adminSupabase ?? supabase;

    const { error } = await targetClient
      .from('product_images')
      .update({
        url,
        storage_path: storagePath,
        alt_text: altText,
      })
      .eq('id', imageId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Image updated.' };
  } catch (error) {
    return handleActionError('serverActions.updateImage', error, 'Unable to update image.');
  }
}

export async function deleteProductImage(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, adminSupabase } = await requireAdminUser();
    const imageId = requireUuid(formData.get('image_id'), 'Image');

    const targetClient = adminSupabase ?? supabase;

    const { error } = await targetClient.from('product_images').delete().eq('id', imageId);

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    return { status: 'success', message: 'Image removed.' };
  } catch (error) {
    return handleActionError('serverActions.deleteImage', error, 'Unable to delete image.');
  }
}

export async function updateWritesEnabled(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const writesEnabled = requireBoolean(formData.get('writes_enabled'), 'Writes enabled');
    const { supabase, user } = await requireAdminUser({ checkWritesEnabled: false });

    const { error } = await supabase
      .from('app_config')
      .upsert({ id: 1, writes_enabled: writesEnabled });

    if (error) {
      reportError('serverActions.updateWritesEnabled.write', error, {
        writesEnabled,
        userId: user.id,
      });
      throw new ActionError('Unable to update inventory mode.');
    }

    revalidatePath('/');
    revalidatePath('/products');

    const message = writesEnabled
      ? 'Inventory write operations re-enabled.'
      : 'View-only mode activated. Writes are now disabled.';

    return { status: 'success', message };
  } catch (error) {
    return handleActionError(
      'serverActions.updateWritesEnabled',
      error,
      'Unable to update inventory write mode.'
    );
  }
}

export async function setDefaultProductImage(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const imageId = requireUuid(formData.get('image_id'), 'Image');
    const productId = requireUuid(formData.get('product_id'), 'Product');

    const { error } = await supabase.rpc('set_default_product_image', {
      p_product_id: productId,
      p_image_id: imageId,
    });

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath('/products');
    revalidatePath('/');
    return { status: 'success', message: 'Default image has been set.' };
  } catch (error) {
    return handleActionError(
      'serverActions.setDefaultProductImage',
      error,
      'An unexpected error occurred. Please try again.'
    );
  }
}
