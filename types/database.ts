export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      app_config: {
        Row: {
          created_at: string;
          id: number;
          writes_enabled: boolean;
        };
        Insert: {
          created_at?: string;
          id?: number;
          writes_enabled: boolean;
        };
        Update: {
          created_at?: string;
          id?: number;
          writes_enabled?: boolean;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      colors: {
        Row: {
          created_at: string;
          hex: string | null;
          id: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          hex?: string | null;
          id?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          hex?: string | null;
          id?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          height: number | null;
          id: string;
          product_id: string;
          storage_path: string | null;
          url: string;
          variant_id: string | null;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          height?: number | null;
          id?: string;
          product_id: string;
          storage_path?: string | null;
          url: string;
          variant_id?: string | null;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          height?: number | null;
          id?: string;
          product_id?: string;
          storage_path?: string | null;
          url?: string;
          variant_id?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_images_variant_id_fkey';
            columns: ['variant_id'];
            referencedRelation: 'product_variants';
            referencedColumns: ['id'];
          }
        ];
      };
      product_tags: {
        Row: {
          created_at: string;
          product_id: string;
          tag_id: number;
        };
        Insert: {
          created_at?: string;
          product_id: string;
          tag_id: number;
        };
        Update: {
          created_at?: string;
          product_id?: string;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'product_tags_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_tags_tag_id_fkey';
            columns: ['tag_id'];
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          }
        ];
      };
      product_variants: {
        Row: {
          color_id: number | null;
          created_at: string;
          id: string;
          is_active: boolean;
          price: number;
          product_id: string;
          size_id: number | null;
          sku: string;
          stock_qty: number;
          updated_at: string | null;
        };
        Insert: {
          color_id?: number | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          price: number;
          product_id: string;
          size_id?: number | null;
          sku: string;
          stock_qty: number;
          updated_at?: string | null;
        };
        Update: {
          color_id?: number | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          price?: number;
          product_id?: string;
          size_id?: number | null;
          sku?: string;
          stock_qty?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'product_variants_color_id_fkey';
            columns: ['color_id'];
            referencedRelation: 'colors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_variants_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_variants_size_id_fkey';
            columns: ['size_id'];
            referencedRelation: 'sizes';
            referencedColumns: ['id'];
          }
        ];
      };
      products: {
        Row: {
          base_price: number;
          brand_id: number | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          name: string;
          slug: string;
          status: Database['public']['Enums']['product_status'];
          updated_at: string | null;
          updated_by: string | null;
          product_type: string | null;
        };
        Insert: {
          base_price: number;
          brand_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
          status?: Database['public']['Enums']['product_status'];
          updated_at?: string | null;
          updated_by?: string | null;
          product_type?: string | null;
        };
        Update: {
          base_price?: number;
          brand_id?: number | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          status?: Database['public']['Enums']['product_status'];
          updated_at?: string | null;
          updated_by?: string | null;
          product_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'products_brand_id_fkey';
            columns: ['brand_id'];
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          }
        ];
      };
      sizes: {
        Row: {
          created_at: string;
          id: number;
          label: string;
          sort_order: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          label: string;
          sort_order?: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          label?: string;
          sort_order?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      product_status: 'draft' | 'active' | 'archived';
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<TableName extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][TableName]['Row'];

export type TablesInsert<TableName extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][TableName]['Insert'];

export type TablesUpdate<TableName extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][TableName]['Update'];

export type Enums<EnumName extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][EnumName];
