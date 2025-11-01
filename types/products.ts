import type { Database } from './database';

export type ProductStatus = Database['public']['Enums']['product_status'];

type BrandRow = Database['public']['Tables']['brands']['Row'];
type ColorRow = Database['public']['Tables']['colors']['Row'];
type SizeRow = Database['public']['Tables']['sizes']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type ImageRow = Database['public']['Tables']['product_images']['Row'];

export interface ProductVariantWithRelations extends VariantRow {
  color: Pick<ColorRow, 'id' | 'name' | 'hex'> | null;
  size: Pick<SizeRow, 'id' | 'label'> | null;
}

export interface ProductWithRelations extends ProductRow {
  brand: Pick<BrandRow, 'id' | 'name'> | null;
  variants: ProductVariantWithRelations[];
  images: ImageRow[];
}

export type BrandSummary = Pick<BrandRow, 'id' | 'name'>;
export type ColorSummary = Pick<ColorRow, 'id' | 'name' | 'hex'>;
export type SizeSummary = Pick<SizeRow, 'id' | 'label'>;
