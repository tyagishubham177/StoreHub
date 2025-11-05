import type { Database } from './database';

export type ProductStatus = Database['public']['Enums']['product_status'];

type BrandRow = Database['public']['Tables']['brands']['Row'];
type ColorRow = Database['public']['Tables']['colors']['Row'];
type SizeRow = Database['public']['Tables']['sizes']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type ImageRow = Database['public']['Tables']['product_images']['Row'];
type TagRow = Database['public']['Tables']['tags']['Row'];

export interface ProductVariantWithRelations extends VariantRow {
  color: Pick<ColorRow, 'id' | 'name'> | null;
  size: Pick<SizeRow, 'id' | 'label'> | null;
}

export interface ProductWithRelations extends ProductRow {
  brand: Pick<BrandRow, 'id' | 'name'> | null;
  variants: ProductVariantWithRelations[];
  images: ImageRow[];
  product_type: { id: number; name: string } | null;
}

export type BrandSummary = Pick<BrandRow, 'id' | 'name' | 'created_by'>;
export type ColorSummary = Pick<ColorRow, 'id' | 'name' | 'hex' | 'created_by'>;
export type SizeSummary = Pick<SizeRow, 'id' | 'label' | 'created_by'>;
export type TagSummary = Pick<TagRow, 'id' | 'name' | 'slug'>;
export type ProductTypeSummary = Pick<Database['public']['Tables']['product_types']['Row'], 'id' | 'name' | 'created_by'>;

export interface CatalogVariant extends VariantRow {
  color: (Pick<ColorRow, 'id' | 'name'> & { hex: string | null }) | null;
  size: Pick<SizeRow, 'id' | 'label'> | null;
}

export interface CatalogProduct extends ProductRow {
  brand: Pick<BrandRow, 'id' | 'name'> | null;
  variants: CatalogVariant[];
  images: ImageRow[];
  tags: TagSummary[];
  lowestPrice: number;
  highestPrice: number;
  availableStock: number;
  product_type: { id: number; name: string } | null;
}
