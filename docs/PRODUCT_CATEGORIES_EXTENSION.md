# 🛒 Product Categories Extension Guide

## Overview
This guide details how to extend your existing Seafood Online Store web app to support additional product categories: **Meat, Vegetables, and Fruits**. The goal is to transform the platform into a flexible online grocery store supporting multiple product types, each with their own inventory, listings, and recipe associations.

---

## 1. Database Changes

### a. Products Table
- **Add a `category` column** to the `products` table (if not already present).
  - Type: `string` or `enum` (recommended values: 'seafood', 'meat', 'vegetable', 'fruit')
- **Migration Example:**

```php
// database/migrations/xxxx_xx_xx_xxxxxx_add_category_to_products_table.php
Schema::table('products', function (Blueprint $table) {
    $table->string('category')->default('seafood');
});
```

- **Update seeders/factories** to include the new categories.

### b. Recipes Table & Pivot
- No change needed if recipes are already linked to products via a pivot table (`recipe_product`).
- Ensure recipes can be associated with products from any category.

---

## 2. Backend (Laravel) Changes

### a. Models
- **Product Model:**
  - Add `category` to `$fillable`.
  - Add scopes for filtering by category (e.g., `scopeSeafood`, `scopeMeat`, etc.).
- **Recipe Model:**
  - Update relationships to allow linking to products of any category.

### b. Controllers
- Update product CRUD logic to handle the `category` field.
- Update recipe creation/editing to allow selecting products from all categories.
- Update API endpoints to support category filtering.

### c. Policies
- Ensure admin/customer permissions apply across all categories.

---

## 3. Frontend (React/Inertia.js) Changes

### a. Product Listings
- Add category filters (tabs, dropdowns, or sidebar) for Seafood, Meat, Vegetables, Fruits.
- Update product creation/edit forms to include a category selector.

### b. Recipe Module
- Allow users to tag recipes with one or more product categories.
- Update recipe listing and detail pages to show category and allow filtering.

### c. Cart & Orders
- No major changes unless you want category-specific promotions or rules.

---

## 4. Admin Workflow
- Admin can create, edit, and manage products in all categories.
- Admin can view and moderate recipes for all product types.
- Inventory management and alerts should be category-aware.

---

## 5. Customer Workflow
- Customers can browse and search products by category.
- Customers can submit recipes for any product type.
- Comments, reactions, and recipe engagement work across all categories.

---

## 6. UI/UX Recommendations
- Use color-coding or icons to visually distinguish categories.
- Provide clear navigation for switching between product types.
- Ensure mobile responsiveness for new filters and forms.

---

## 7. Example Category Enum (Optional)
If you want to use an enum for categories in Laravel 9+:

```php
// app/Enums/ProductCategory.php
namespace App\Enums;

enum ProductCategory: string {
    case Seafood = 'seafood';
    case Meat = 'meat';
    case Vegetable = 'vegetable';
    case Fruit = 'fruit';
}
```

---

## 8. Testing
- Add/extend tests to cover new categories in product CRUD, recipe creation, and filtering.

---

## 9. Migration Plan
1. Add the `category` column to the `products` table.
2. Update models, controllers, and forms to support the new field.
3. Update frontend to allow category selection and filtering.
4. Test all workflows for each product type.
5. Update documentation and train admin users if needed.

---

## 10. Future Extensions
- Add more categories (e.g., Dairy, Bakery) as needed.
- Category-specific promotions, analytics, or recommendations.

---

**With these changes, your platform will support a full range of grocery products, not just seafood!** 