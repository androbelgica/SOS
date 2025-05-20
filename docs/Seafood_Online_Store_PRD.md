
# 📄 Project Document Requirement: Seafood Online Store Web App

## 1. Project Overview
A mobile-friendly web application built with **Laravel 12** and **React Kit** (integrated via Inertia.js) using **SQLite** as the database. The platform is designed to manage seafood product listings, handle inventory, process orders, and include a unique section where the admin/owner can post seafood recipes tied to specific products.

## 2. Project Objectives
- Provide an intuitive platform for customers to browse and purchase seafood products.
- Allow the admin to manage product inventory efficiently.
- Integrate a unique recipe feature to enhance product value and customer engagement.
- Ensure the application is responsive and mobile-friendly for optimal usability.

## 3. Technology Stack
| Component         | Technology               |
|------------------|--------------------------|
| Backend          | Laravel 12               |
| Frontend         | React Kit (Inertia.js)   |
| Database         | SQLite                   |
| UI Framework     | Tailwind CSS (default with React Kit) |
| Hosting/Server   | Optional: Shared Hosting / Localhost |
| Deployment Tools | Laravel Sail / Vite / Git |

## 4. User Roles

### 1. Admin/Owner
- Login/logout
- Manage seafood products (CRUD)
- Manage inventory (stock levels)
- View and manage customer orders
- Add/edit/delete recipes per product
- View recipe usage reports (optional future feature)

### 2. Customer
- View seafood product listings
- Search/filter products
- View seafood recipes (public access)
- Add items to cart and place orders
- View order history and status

## 5. Core Features

### 📦 Product & Inventory Management
- Product name, description, price, image, stock quantity
- Product availability toggle
- Inventory alerts (optional)

### 🧾 Orders Module
- Shopping cart system
- Order placement
- Order status (Pending, Processing, Delivered, Canceled)

### 🍽️ Recipes Module (Unique Feature)
- Admin can assign recipes to one or more seafood products
- Recipe includes: title, image, ingredients list, preparation steps, and optional video link
- Public-facing recipe listing with filters by seafood type

### 🔍 Search & Filter
- Search by name, type (e.g., shrimp, crab)
- Filter by availability, price range

### 📱 Mobile-Friendly UI
- Responsive layout using Tailwind CSS
- Touch-friendly interface for mobile users

## 6. Database Tables (Schema Outline)
- **users**: id, name, email, password, role (admin/customer)
- **products**: id, name, description, price, stock, image, available (bool)
- **orders**: id, user_id, status, total_price, created_at
- **order_items**: id, order_id, product_id, quantity, price
- **recipes**: id, title, description, image, video_url, created_by
- **recipe_product**: id, recipe_id, product_id (pivot table for many-to-many)

## 7. Wireframe Suggestions
You can sketch or prototype the following views:
- Home page (product listings)
- Product details
- Cart and checkout
- Admin dashboard
- Recipe creation and listing page
- Recipe details view

## 8. Non-Functional Requirements
- **Performance**: Optimized for fast loading on mobile
- **Security**: Basic auth (Laravel Breeze or Jetstream), input validation
- **Scalability**: Code modularity and clean architecture
- **Accessibility**: Color contrast and text size for mobile users
