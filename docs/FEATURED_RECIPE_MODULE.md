# 🍽️ Featured Recipe Module Documentation

## Overview

The Featured Recipe Module allows administrators to highlight specific recipes on the customer dashboard. This module provides tools for managing featured recipes and a React component for showcasing them to users.

## 1. Admin Features

- **Add Featured Recipe:** Admin can select recipes to mark as "featured" from the recipe management interface.
- **Update Featured Recipe:** Admin can change which recipes are featured at any time.
- **Remove Featured Recipe:** Admin can unmark recipes as featured.
- **Featured Recipe Limit:** (Optional) Limit the number of featured recipes displayed (e.g., 3-5).
- **Featured Flag:** Each recipe has a `featured` boolean attribute in the database.

## 2. Customer Dashboard (Frontend)

- **Featured Recipe Showcase:**
    - A dedicated React component displays featured recipes prominently on the customer dashboard/homepage.
    - Recipes are fetched via API (filtered by `featured = true`).
    - Responsive carousel or grid layout (suggested: Tailwind CSS + React Slick or Swiper).
    - Each featured recipe displays image, title, and quick link to details.

## 3. Database Changes

- Add a `featured` boolean column to the `recipes` table (default: false).

```sql
ALTER TABLE recipes ADD COLUMN featured BOOLEAN DEFAULT 0;
```

## 4. API Endpoints

- **GET /api/featured-recipes**: Returns a list of featured recipes for the dashboard.
- **POST /api/recipes/{id}/feature**: Mark a recipe as featured (admin only).
- **DELETE /api/recipes/{id}/feature**: Remove featured status (admin only).

## 5. UI/UX Suggestions

- Admin: Add a toggle or button in the recipe management table/form for "Mark as Featured".
- Customer: Place the featured recipe showcase at the top of the dashboard for maximum visibility.

## 6. Security & Permissions

- Only admin users can manage featured recipes.
- All users can view featured recipes on the dashboard.

## 7. Future Enhancements

- Schedule featured recipes (start/end date).
- Analytics for featured recipe engagement.
- Highlight featured recipes in search results.

---

**See also:** Main PRD for integration points and user flows.
