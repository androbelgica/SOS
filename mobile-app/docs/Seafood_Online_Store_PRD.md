
# 📄 Project Document Requirement: Seafood Online Store Web App

## 1. Project Overview
A mobile-friendly web application built with **Laravel 12** and **React Kit** (integrated via Inertia.js) using **SQLite** as the database. The platform is designed to manage seafood product listings, handle inventory, process orders, and include a unique section where the admin/owner can post seafood recipes tied to specific products.

## 2. Project Objectives
- Provide an intuitive platform for customers to browse and purchase seafood products.
- Allow the admin to manage product inventory efficiently.
- Integrate a unique recipe feature to enhance product value and customer engagement.
- Ensure the application is responsive and mobile-friendly for optimal usability.
- Implement a robust order management system with product verification via QR codes.

## 3. Technology Stack
| Component         | Technology               |
|------------------|--------------------------|
| Backend          | Laravel 12               |
| Frontend         | React Kit (Inertia.js)   |
| Database         | SQLite                   |
| UI Framework     | Tailwind CSS (default with React Kit) |
| Hosting/Server   | Optional: Shared Hosting / Localhost |
| Deployment Tools | Laravel Sail / Vite / Git |
| QR Code Generation | BaconQrCode library |
| PDF Generation   | Barryvdh/DomPDF |

## 4. User Roles

### 1. Admin/Owner
- Login/logout with secure authentication
- Manage seafood products (CRUD operations)
- Manage inventory (stock levels, unit types)
- View and manage customer orders
- Generate and print product labels with QR codes
- Add/edit/delete recipes per product
- View recipe usage and ratings analytics
- Access admin dashboard with key metrics

### 2. Customer
- Register/login with email or social authentication
- Manage profile information (name, address, contact details)
- View seafood product listings with detailed information
- Search/filter products by category, price, and availability
- View seafood recipes and leave reviews/ratings
- Add items to cart and place orders
- View order history and status
- Verify product authenticity via QR code scanning

## 5. Core Features

### 📦 Product & Inventory Management
- Product name, description, price, image, stock quantity
- Product categorization (fish, shellfish, etc.)
- Unit type management (kg, piece)
- Product availability toggle
- Inventory alerts for low stock items

### 🧾 Orders Module
- Shopping cart system with persistent storage
- Secure checkout process
- Unique 8-digit order number generation (format: SOS-YYYYMMDD-XXXX)
- Multiple order statuses (Pending, Processing, Delivered, Canceled)
- Payment status tracking (Pending, Paid, Failed)
- QR code generation for product verification
- Product labels (2x4 inches) with:
  - QR codes for verification
  - Product details and pricing (with Philippine peso symbol)
  - Order information
  - Processing date/time
  - Multiple labels per page (up to 4 per A4 sheet)
  - "SeaBasket Online Seafood Store" branding

### 🍽️ Recipes Module (Unique Feature)
- Admin can assign recipes to one or more seafood products
- Recipe includes: title, description, ingredients list (as array), preparation steps (as array), cooking time, difficulty level, image, and optional video link
- Public-facing recipe listing with filters by seafood type
- Recipe rating system (1-5 stars)
- Customer reviews with comments
- Related recipes suggestions

### 👤 User Profile Management
- User registration and authentication
- Profile information management (name, email, address, phone)
- Avatar/profile picture upload
- Order history and tracking
- Saved payment methods (optional)
- Address book for shipping/billing

### 🔍 Search & Filter
- Search by name, type (e.g., shrimp, crab)
- Filter by category, availability, price range
- Sort by popularity, price, or newest

### 📱 Mobile-Friendly UI
- Responsive layout using Tailwind CSS
- Touch-friendly interface for mobile users
- Optimized images and performance

## 6. Database Tables (Schema Outline)
- **users**: id, name, email, password, role, google_id, avatar, address, phone, city, state, postal_code, country, email_verified_at, remember_token
- **products**: id, name, description, price, stock_quantity, image_url, category, unit_type, is_available
- **orders**: id, user_id, order_number, total_amount, status, shipping_address, billing_address, payment_status, created_at, updated_at
- **order_items**: order_id, product_id, quantity, price (with composite primary key)
- **product_labels**: id, order_id, product_id, qr_code_path, label_path, is_printed
- **recipes**: id, title, description, ingredients (JSON), instructions (JSON), cooking_time, difficulty_level, image_url, video_url
- **recipe_product**: recipe_id, product_id, quantity, unit (pivot table for many-to-many)
- **recipe_reviews**: id, user_id, recipe_id, rating, comment

## 7. Wireframe Suggestions
You can sketch or prototype the following views:
- Home page (product listings)
- Product details
- Cart and checkout
- Admin dashboard
- Recipe creation and listing page
- Recipe details view with reviews
- Order management and label printing interface
- User profile management

## 8. Non-Functional Requirements
- **Performance**: Optimized for fast loading on mobile
- **Security**: Authentication with Laravel Breeze, input validation, CSRF protection
- **Scalability**: Code modularity and clean architecture
- **Accessibility**: Color contrast and text size for mobile users
- **Reliability**: Error handling and logging

## 9. Additional Feature Suggestions
- **Subscription Service**: Implement recurring seafood boxes with customizable contents
- **Loyalty Program**: Points system for purchases and recipe reviews
- **Seasonal Promotions**: Feature for highlighting seasonal seafood with special pricing
- **Cooking Class Integration**: Virtual cooking classes tied to specific recipes
- **Sustainability Badges**: Highlight sustainably sourced seafood products
- **Nutritional Information**: Add detailed nutritional data for products and recipes
- **Recipe Collections**: Allow users to save favorite recipes to collections
- **Social Sharing**: Enable sharing recipes and products on social media
- **Delivery Tracking**: Real-time order tracking with estimated delivery times
- **Multi-language Support**: Localization for serving diverse customer base
