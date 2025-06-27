# 📦 Featured Product Module Documentation

## Overview

The Featured Product Module allows administrators to highlight specific products on the customer dashboard. This module provides tools for managing featured products and a React component for showcasing them to users.

## 1. Admin Features

- **Add Featured Product:** Admin can select products to mark as "featured" from the product management interface.
- **Update Featured Product:** Admin can change which products are featured at any time.
- **Remove Featured Product:** Admin can unmark products as featured.
- **Featured Product Limit:** (Optional) Limit the number of featured products displayed (e.g., 3-5).
- **Featured Flag:** Each product has a `featured` boolean attribute in the database.

## 2. Customer Dashboard (Frontend)

- **Featured Product Showcase:**
    - A dedicated React component displays featured products prominently on the customer dashboard/homepage.
    - Products are fetched via API (filtered by `featured = true`).
    - Responsive carousel or grid layout (suggested: Tailwind CSS + React Slick or Swiper).
    - Each featured product displays image, name, price, and quick link to details.

## 3. Database Changes

- Add a `featured` boolean column to the `products` table (default: false).

```sql
ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT 0;
```

## 4. API Endpoints

- **GET /api/featured-products**: Returns a list of featured products for the dashboard.
- **POST /api/products/{id}/feature**: Mark a product as featured (admin only).
- **DELETE /api/products/{id}/feature**: Remove featured status (admin only).

## 5. UI/UX Suggestions

- Admin: Add a toggle or button in the product management table/form for "Mark as Featured".
- Customer: Place the featured product showcase at the top of the dashboard for maximum visibility.

## 6. Security & Permissions

- Only admin users can manage featured products.
- All users can view featured products on the dashboard.

## 7. Future Enhancements

- Schedule featured products (start/end date).
- Analytics for featured product engagement.
- Highlight featured products in search results.

---

**See also:** Main PRD for integration points and user flows.
