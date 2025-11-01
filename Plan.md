
---

# **Product Requirements Document (PRD)**

## StoreHUB

### **Project Overview**

The goal of this project is to develop an easy-to-use web and mobile-friendly application to manage shoe inventory for a shoe store. The app will allow the store owner to log inventory items, each with associated details like color, shoe size, brand, images, and price. Users can easily search and filter inventory based on these attributes. Eventually, the "add" feature will be disabled, and the app will serve as a viewing platform for users to browse the inventory.

---

### **Objectives**

1. **Manage Inventory**:

   * The app should allow the store owner to log new inventory items, including:

     * Shoe name, brand, color, size, price.
     * Upload 2–3 images per item.
     * Add tags such as color, shoe size, and brand for easy searchability.

2. **Search & Filter**:

   * Enable easy searching and filtering of the inventory by attributes like size, color, brand, etc.
   * Integrate a fast, flexible search that supports keyword matching and filter combinations.

3. **Scalability**:

   * The app should be scalable to support adding more shoes over time. Later, the "add" functionality will be removed, and it will be made publicly available for users to view inventory only.

4. **Cross-Platform Accessibility**:

   * The app must be responsive and work seamlessly on both web and mobile platforms.

5. **Deployment**:

   * The application should be deployed on a free-tier platform for easy access and testing (e.g., Vercel for frontend, Supabase for database).

---

### **Clarified Scope and Domain Decisions (Pre-Development Checklist)**

1. **Stock per size**:

   * Do you need a stock quantity per size? Yes. For shoes, variants by size/color are typical. Hence, stock per size will be tracked via product variants.

2. **Shoe Size Systems**:

   * Will sizes be US-only, or multi-system (US/EU/UK)? **Multi-system** (define a canonical size, e.g., US, and map others).

3. **Price Variations per Variant**:

   * Will price vary per variant (e.g., larger sizes priced differently)? **Yes**, allow price customization per variant.

4. **Delete Method**:

   * Soft delete (recommended): Use `deleted_at` to mark products as deleted rather than removing them from the database entirely.

5. **SEO-friendly Pages**:

   * Will you need SEO-friendly product pages (for public browsing)? **Yes**, consider canonical slugs and meta tags for each product.

6. **Image Constraints**:

   * Define limits: Max 3 images per product, 5 MB each, JPEG/WEBP only, with automatic resizing and compression.

7. **Transition to "View-Only" Mode**:

   * Transition will be handled by a **feature flag** in `app_config.writes_enabled` and enforced via Row-Level Security (RLS).

---

### **Data Model: Use Product + Variant Structure**

Shoes naturally vary by size and sometimes color. The structure described here will ensure fast and clean searching and filtering.

#### Core Tables (Supabase Postgres):

1. **brands**:

   * `id`, `name`, `slug`

2. **colors**:

   * `id`, `name`, `hex` (Hex code validation)

3. **sizes**:

   * `id`, `label` (e.g., “US 10”), `sort_order`

4. **products**:

   * `id` (UUID), `name`, `brand_id`, `description`, `base_price`, `status` (draft/active/archived), `slug`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`

5. **product_variants**:

   * `id` (UUID), `product_id`, `color_id`, `size_id`, `price`, `sku`, `is_active`, `stock_qty`, `created_at`, `updated_at`

6. **product_images**:

   * `id` (UUID), `product_id`, `variant_id` (nullable), `storage_path`, `url`, `alt_text`, `width`, `height`, `created_at`

7. **tags**:

   * `id`, `name`, `slug`

8. **product_tags**:

   * `product_id`, `tag_id`

9. **admin_users**:

   * `user_id` (linked to `auth.users.id`)

10. **app_config**:

    * `id`, `writes_enabled` (boolean for transitioning to view-only mode)

#### Key Constraints:

* Unique slugs for products and tags.
* Enforce 1–3 images per product via validation.
* Check for non-negative prices and stock quantities.

---

### **Security and Row-Level Security (RLS)**

1. **RLS Policies**:

   * Public read access for active products only.
   * Admin write permissions enforced by role-based access control via Supabase authentication.

2. **RLS Policy Example for Products**:

   ```sql
   alter table products enable row level security;

   -- Public read of active products
   create policy "public_read_products"
   on products for select
   using (status = 'active' and deleted_at is null);

   -- Admin write access
   create policy "admin_write_products"
   on products for all
   using (
     auth.role() = 'authenticated'
     and exists (select 1 from admin_users a where a.user_id = auth.uid())
     and (select writes_enabled from app_config where id = 1)
   )
   with check (
     exists (select 1 from admin_users a where a.user_id = auth.uid())
     and (select writes_enabled from app_config where id = 1)
   );
   ```

3. **Storage Bucket Policies**:

   * **Public-read** for images (read access allowed to all), but only admins can insert/update/delete images.

---

### **Image Pipeline and Performance Optimization**

1. **Client-side Image Constraints**:

   * Accept only JPEG/WEBP formats.
   * Max 5 MB and max 4000px per image.
   * Use client-side compression (e.g., `Squoosh`, `browser-image-compression`).

2. **Resizing**:

   * Create multiple image variants:

     * Thumbnail (300px wide)
     * Medium (800px wide)
     * Original (max 1600px)
   * Enforce 2–3 images per product with form validation.

3. **Image Upload**:

   * Use Supabase Storage with a path convention `products/{product_id}/{image_id}.jpg`.
   * Enable image CDN delivery via Supabase or Next.js Image Component for optimization.

---

### **Search and Filter Implementation**

1. **Supported Filters**:

   * Brand, size, color, price range, and keyword.

2. **Sorting**:

   * By price (ascending/descending), newest first.

3. **Pagination**:

   * Limit results to 24 per page, using offset for now.

4. **Example Query** (SQL):

   ```sql
   select p.*
   from products p
   where p.status = 'active'
     and p.deleted_at is null
     and (
       :q is null
       or p.search @@ plainto_tsquery('simple', unaccent(:q))
     )
     and (:brand_id is null or p.brand_id = :brand_id)
     and exists (
       select 1 from product_variants v
       where v.product_id = p.id
         and v.is_active = true
         and (:size_id is null or v.size_id = :size_id)
         and (:color_id is null or v.color_id = :color_id)
     )
   order by
     case when :sort = 'price-asc' then p.base_price end asc nulls last,
     case when :sort = 'price-desc' then p.base_price end desc nulls last,
     p.created_at desc
   limit :limit offset :offset;
   ```

---

### **API and Frontend Architecture (Next.js + Supabase)**

1. **Next.js App Router**:

   * Use Server Components for SEO-friendly public pages.
   * Route structure:

     * `/` (home page with grid and filters)
     * `/products/[slug]` (product detail page)
     * `/admin` (admin dashboard)

2. **Data Fetching**:

   * Public pages query Supabase directly with RLS policies applied.
   * Admin actions (CRUD) are handled via Next.js server actions.

3. **Caching**:

   * Cache public pages (revalidate every 60–300 seconds).
   * Use edge caching on Vercel for GET requests.

---

### **Admin UX and Workflow**

1. **Product Management**:

   * Admin can create/edit products, variants, and images.
   * Variant creation helper: Add sizes in bulk for a color (or vice versa).
   * Prevent duplicate variants and ensure consistent images.

2. **Draft and Publish**:

   * Products default to `draft` status, and publish sets the status to `active`.

3. **Soft Delete**:

   * Use `deleted_at` instead of hard deletion for product variants.

---

### **Performance and Cost Optimization**

1. **Indexing**:

   * Add appropriate indexes on frequently queried fields.
2. **Pagination and Grid Views**:

   * Only select the necessary columns for grid views (ID, name, price, thumbnail).
3. **Lazy Loading**:

   * Use lazy loading for images and infinite scroll or "Load more" for pagination.

---

### **SEO and Accessibility**

1. **SEO**:

   * Canonical slugs for products and optimized metadata.
2. **Accessibility**:

   * Keyboard navigation, screen reader support, and high contrast mode.
   * Enforce alt text for images.

---

### **Testing Strategy**

1. **Unit Testing**:

   * Test schema validation (Zod), utility functions.

2. **Integration Testing**:

   * Test Supabase queries with a test database.

3. **E2E Testing**:

   * Use Cypress or Playwright for critical user flows (e.g., browsing, filtering, admin login, CRUD operations).

4. **Security Tests**:

   * Ensure non-admin users cannot write to the database.

---

### **Deployment and Environments**

1. **CI/CD**:

   * GitHub Actions for type checking, linting, and testing.
2. **Environment Variables**:

   * Use Vercel and Supabase environment variables to configure API keys and other secrets.

---

### **Transition to View-Only Mode**

1. **Feature Flag**:

   * Use the `writes_enabled` flag in `app_config` to control whether the app is in "write" or "view-only" mode.

---

### **Milestones and Acceptance Criteria**

1. **Phase 1: Foundation**: Set up Next.js app, Supabase, and authentication.
2. **Phase 2: Admin CRUD**: Implement product/variant/image CRUD, draft-publish, and soft delete.
3. **Phase 3: Search/Filter/SEO**: Implement grid with filters, search, and pagination.
4. **Phase 4: Security/QA**: Complete RLS, security tests, and integrate analytics.
5. **Phase 5: Deploy and Observe**: Vercel production deploy, monitoring, and error tracking.
6. **Phase 6: View-Only**: Switch to view-only mode using feature flags.

---
