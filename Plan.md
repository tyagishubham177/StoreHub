
---

# **Product Requirements Document (PRD)**

## StoreHUB

### **Project Overview**

The goal of this project is to develop an easy-to-use web and mobile-friendly application to manage shoe inventory for a shoe store. The app will allow the store owner to log inventory items, each with associated details like color, shoe size, brand, images, and price. Users can easily search and filter inventory based on these attributes. Eventually, the "add" feature will be disabled, and the app will serve as a viewing platform for users to browse the inventory.

---

### **Objectives**

1. **Manage Inventory**: The app should allow the store owner to log new inventory items, including:

   * Shoe name, brand, color, size, and price.
   * Upload 2-3 images per item.
   * Add tags such as color, shoe size, and brand for easy searchability.

2. **Search & Filter**: Enable easy searching and filtering of the inventory by attributes like size, color, brand, etc.

3. **Scalability**: The app should be scalable to support adding more shoes over time. Later, the "add" functionality will be removed, and it will be made publicly available for users to view inventory only.

4. **Cross-Platform Accessibility**: The app must be responsive and work seamlessly on both web and mobile platforms.

5. **Deployment**: The application should be deployed on a free-tier platform for easy access and testing (e.g., Vercel for frontend, Supabase for database).

---

### **User Stories**

1. **Store Owner**:

   * **As a store owner**, I should be able to add shoes to the inventory with their attributes (name, size, color, brand, price, images).
   * **As a store owner**, I should be able to search for shoes based on attributes (size, color, brand).
   * **As a store owner**, I should be able to update or delete inventory items if needed.

2. **User (viewing inventory)**:

   * **As a user**, I should be able to filter shoes by size, color, brand, and price.
   * **As a user**, I should be able to view the images and basic details of the shoes.

---

### **Functional Requirements**

1. **Inventory Management**:

   * A user interface to add, update, or remove inventory items (for admin users).
   * Inventory items will include:

     * Shoe Name (Text)
     * Shoe Size (Dropdown/Number input)
     * Shoe Color (Dropdown/Color input)
     * Brand (Text)
     * Price (Decimal input)
     * Images (Image upload: 2-3 images per item)

2. **Search & Filter**:

   * Filter shoes by size, color, brand.
   * Implement a search bar where users can type to filter items dynamically based on attributes.
   * Option to sort the inventory by price (ascending/descending).

3. **Image Upload**:

   * Support for uploading 2-3 images per item.
   * Display images in the item details and in the search results.

4. **User Authentication** (Admin users for adding inventory):

   * Use Supabase authentication to allow only authorized users to add or edit inventory.
   * For non-admin users, only view access will be allowed.

5. **Cross-Platform Compatibility**:

   * Mobile-responsive UI for ease of use on mobile browsers.
   * The app will also work on desktop browsers seamlessly.

6. **Data Storage**:

   * Use **Supabase** for storing inventory data and images. This includes:

     * A PostgreSQL database for inventory details.
     * Supabase storage for images.

7. **Deployment**:

   * Frontend to be deployed on **Vercel** using React (or Next.js) for dynamic rendering.
   * The backend will be managed using **Supabase** to handle database operations and file storage.
   * **Vercel** for hosting the frontend, connected to the Supabase backend via API calls.

8. **User Roles**:

   * **Admin Role**: Can add, edit, or delete inventory.
   * **User Role**: Can only view inventory with search and filter options.

---

### **Non-Functional Requirements**

1. **Security**:

   * Use HTTPS for all data transfer between client and server.
   * User passwords must be securely stored (hashed) in Supabase.

2. **Performance**:

   * The app should be optimized to load quickly, especially image-heavy pages.
   * Efficient database queries to ensure fast search and filtering.

3. **Scalability**:

   * The system should handle large inventories without performance degradation.
   * The system should easily scale to support more users and inventory items.

4. **Responsiveness**:

   * The UI must be responsive to various screen sizes, particularly for mobile devices.
   * Use flexible grid layouts and CSS media queries to achieve this.

5. **Backup & Recovery**:

   * Supabase’s automatic backups will be leveraged for data recovery.

---

### **Tech Stack**

* **Frontend**:

  * React (for web UI)
  * Optional: React Native if you want a mobile app later (can reuse the same components).

* **Backend**:

  * Supabase (for database and file storage)

* **Deployment**:

  * Vercel (for frontend hosting)
  * Supabase (for backend and database management)

* **Authentication**:

  * Supabase Authentication (for user management)

* **Database**:

  * Supabase PostgreSQL (for inventory data)

---

### **User Interface Design**

1. **Admin Panel**:

   * A simple form to enter shoe details: Name, Size, Color, Brand, Price.
   * A file uploader to attach 2-3 images per item.
   * A button to submit the form and add the shoe to the inventory.

2. **View Inventory (User)**:

   * A grid/list view of shoes, displaying images, name, price, and a short description.
   * Filters on top (Size, Color, Brand).
   * A search bar for quick look-up of shoes by any keyword.

3. **Responsive Layout**:

   * The layout should adjust smoothly for both mobile and desktop views.
   * On mobile, items will be displayed in a single column, with large images and details.
   * On desktop, multiple columns can be used to display more items per screen.

---

### **API Requirements**

1. **GET /inventory**: Fetches all inventory items (with filtering by size, color, brand).
2. **POST /inventory**: Adds a new inventory item (Admin only).
3. **PUT /inventory/:id**: Updates an existing inventory item (Admin only).
4. **DELETE /inventory/:id**: Deletes an inventory item (Admin only).

---

### **Deployment Steps**

1. **Frontend Deployment**:

   * Set up a GitHub repository for the frontend code.
   * Connect the GitHub repository to **Vercel** for automatic deployment.
   * Set environment variables in Vercel for connecting to **Supabase**.
2. **Backend Deployment**:

   * Create a **Supabase** account and set up the database.
   * Set up tables for inventory and images.
   * Configure **Supabase Storage** for handling shoe images.
   * Integrate Supabase with the frontend for CRUD operations.

---

### **Future Enhancements**

1. **Remove Add Feature**: Transition the app from an inventory logging system to a public "view-only" system. Remove the add/edit features and allow users to view and filter inventory only.
2. **User Reviews**: Allow users to leave reviews for each product.
3. **Ratings System**: Add a rating system for shoes.
4. **Advanced Search**: Add more granular search options (e.g., price range, specific attributes).
5. **Payment Integration**: Eventually add an e-commerce feature to enable purchases directly through the app.

---

### **Timeline & Milestones**

| **Phase**   | **Task**                                 |
| ----------- | ---------------------------------------- | 
| **Phase 1** | Set up React frontend + Supabase         | 
| **Phase 2** | Develop CRUD functionality for inventory | 
| **Phase 3** | Implement search and filter feature      | 
| **Phase 4** | Implement user roles and authentication  | 
| **Phase 5** | Deploy and test                          | 

---
