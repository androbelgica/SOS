# 📄 Project Document Requirement: Cart & Cook Web App

## 1. Project Overview

A mobile-friendly web application built with **Laravel 12** and **React Kit** (integrated via Inertia.js) using **SQLite** as the database. The platform is designed to manage product listings (including seafood, meat, vegetables, and fruits), handle inventory, process orders, and include a unique section where the admin/owner and users can post and discover recipes tied to specific products.

## 2. Project Objectives

-   Provide an intuitive platform for customers to browse and purchase products (seafood, meat, vegetables, fruits).
-   Allow the admin to manage product inventory efficiently across multiple categories.
-   Integrate a unique recipe feature to enhance product value and customer engagement for all product types.
-   Ensure the application is responsive and mobile-friendly for optimal usability.
-   **Enable customers to pay for orders using Cash on Delivery (COD).**
-   **Display GCash and Maya as payment options with a 'coming soon' remark for future availability.**

## 3. Technology Stack

| Component               | Technology                                                                      |
| ----------------------- | ------------------------------------------------------------------------------- |
| Backend                 | Laravel 12                                                                      |
| Frontend                | React Kit (Inertia.js)                                                          |
| Database                | SQLite                                                                          |
| UI Framework            | Tailwind CSS (default with React Kit)                                           |
| Hosting/Server          | Optional: Shared Hosting / Localhost                                            |
| Deployment Tools        | Laravel Sail / Vite / Git                                                       |
| **Payment Integration** | **Cash on Delivery (COD) (available), GCash (coming soon), Maya (coming soon)** |

## 4. User Roles

### 1. Admin/Owner

-   Login/logout
-   Manage products (CRUD) across all categories (seafood, meat, vegetables, fruits)
-   Manage inventory (stock levels)
-   View and manage customer orders
-   **Moderate user-generated recipes** (approve/reject/edit/delete)
-   **Review and approve pending recipes** before publication
-   View recipe usage reports (optional future feature)
-   **Full recipe management privileges** (can edit any recipe)
-   **View and manage payment statuses and methods for orders**

### 2. Customer/Registered User

-   View product listings by category (seafood, meat, vegetables, fruits)
-   Search/filter products
-   View recipes (public access)
-   **Create and submit recipes for admin approval**
-   **Edit/delete their own recipes** (before approval)
-   **Comment on recipes** (authenticated users only)
-   **React to recipes** with emojis/likes (authenticated users only)
-   **View recipe comments and reactions** from other users
-   Add items to cart and place orders
-   View order history and status
-   **Pay for orders using Cash on Delivery (COD).**
-   **See GCash and Maya as payment options marked as 'coming soon.'**

## 5. Core Features

### 📦 Product & Inventory Management

-   Product name, description, price, image, stock quantity, category (seafood, meat, vegetables, fruits)
-   Product availability toggle
-   Inventory alerts (optional)

### 🧾 Orders & Payment Module

-   Shopping cart system
-   Order placement
-   **Integrated payment options:**
    -   **Cash on Delivery (COD)** (currently available)
    -   **GCash (coming soon)**
    -   **Maya (coming soon)**
-   At checkout, users can see all options, but only COD is selectable. GCash and Maya are marked as "coming soon."
-   Payment status tracking (Pending, Paid, Failed, Refunded)
-   Order status (Pending, Processing, Delivered, Canceled)
-   Payment confirmation and receipt generation

> **Note:** GCash and Maya payment integrations are planned for future releases. For now, users can only complete orders using Cash on Delivery (COD). Attempts to use GCash or Maya will be prevented, and users will see a message such as "Payment option coming soon."

### 🍽️ Recipes Module (Unique Feature)

-   **All authenticated users can create and submit recipes for admin approval**
-   Recipe includes: title, image, ingredients list, preparation steps, and optional video link
-   Public-facing recipe listing with filters by product category (seafood, meat, vegetables, fruits)
-   **Recipe Creation and Approval Workflow:**
    -   **User-Generated Content**: Any authenticated user can create and submit recipes
    -   **Recipe Status**: Draft/Submitted/Under Review/Approved/Rejected
    -   **Admin Review Process**: All recipes require admin approval before publication
    -   **Recipe Drafts**: Save recipes as drafts before submission
    -   **Recipe Categories**: Tag recipes with relevant product types (seafood, meat, vegetables, fruits)
    -   **Image Upload**: Support for multiple recipe images
    -   **Video Integration**: Optional video links for cooking demonstrations
    -   **Recipe Analytics**: View engagement metrics for own recipes
    -   **Notification System**: Users are notified of recipe approval/rejection
-   **Interactive Recipe Engagement System:**
    -   **Comments System**: Users can leave detailed comments on recipes
    -   **Reaction System**: Users can react with emojis (👍, ❤️, 😋, 🔥, 👏)
    -   **Comment Threading**: Support for replies to comments
    -   **Moderation Tools**: Admin can moderate/delete inappropriate comments
    -   **Real-time Updates**: Live updates for new comments and reactions
    -   **User Interaction History**: Track user's comments and reactions

### 🔍 Search & Filter

-   Search by name, category (seafood, meat, vegetables, fruits)
-   Filter by availability, price range

### 📱 Mobile-Friendly UI

-   Responsive layout using Tailwind CSS
-   Touch-friendly interface for mobile users

### 💬 Recipe Interaction System (New Feature)

**Comments Feature:**

-   **Authenticated Access**: Only logged-in users can comment
-   **Rich Text Comments**: Support for formatted text, mentions, and basic markdown
-   **Comment Threading**: Users can reply to specific comments (up to 3 levels deep)
-   **Edit/Delete**: Users can edit/delete their own comments within 24 hours
-   **Timestamp Display**: Show relative time (e.g., "2 hours ago")
-   **Character Limit**: 500 characters per comment to encourage concise feedback

**Reactions Feature:**

-   **Emoji Reactions**: 5 predefined reactions
    -   👍 **Like** - General approval
    -   ❤️ **Love** - Really enjoyed the recipe
    -   😋 **Yum** - Looks delicious
    -   🔥 **Fire** - Amazing/impressive recipe
    -   👏 **Clap** - Appreciation for the chef
-   **One Reaction Per User**: Users can change their reaction but only have one active
-   **Reaction Counts**: Display total count for each reaction type
-   **Quick Toggle**: Easy one-click reaction system

**Moderation & Management:**

-   **Admin Controls**: Admins can delete any comment or hide inappropriate content
-   **Report System**: Users can report inappropriate comments
-   **Auto-moderation**: Basic profanity filter and spam detection
-   **User Blocking**: Admins can temporarily restrict users from commenting

**User Experience Enhancements:**

-   **Real-time Updates**: New comments and reactions appear without page refresh
-   **Notification System**: Recipe authors get notified of new comments
-   **User Profiles**: Click on usernames to view their recipe interaction history
-   **Sort Options**: Sort comments by newest, oldest, or most reactions

## 6. Database Tables (Schema Outline)

-   **users**: id, name, email, password, role (admin/customer)
-   **products**: id, name, description, price, stock, image, available (bool), category
-   **orders**: id, user_id, status, total_price, **payment_status, payment_method (cod, gcash, maya), payment_reference, payment_proof_url, payment_date**, created_at
-   **order_items**: id, order_id, product_id, quantity, price
-   **recipes**: id, title, description, image, video_url, created_by
-   **recipe_product**: id, recipe_id, product_id (pivot table for many-to-many, supports all categories)
-   **recipe_comments**: id, recipe_id, user_id, comment, parent_id (for threading), created_at, updated_at
-   **recipe_reactions**: id, recipe_id, user_id, reaction_type (like, love, yum, fire, clap), created_at
-   **comment_reactions**: id, comment_id, user_id, reaction_type, created_at (reactions on comments)
-   **payments** (optional): id, order_id, user_id, amount, method (cod, gcash, maya), status, reference, proof_url, paid_at, created_at

## 7. Wireframe Suggestions

You can sketch or prototype the following views:

-   Home page (product listings by category)
-   Product details
-   Cart and checkout
-   Admin dashboard
-   Recipe creation and listing page (with category filter)
-   Recipe details view
-   **Recipe comments section** (below recipe details)
-   **Comment thread view** (nested replies)
-   **User interaction dashboard** (user's comments and reactions history)

## 8. Non-Functional Requirements

-   **Performance**: Optimized for fast loading on mobile
-   **Security**: Basic auth (Laravel Breeze or Jetstream), input validation
-   **Payment Security**: Secure handling of payment data and proof uploads
-   **Reliability**: Payment confirmation and error handling for GCash and Maya (when available)
-   **Scalability**: Code modularity and clean architecture
-   **Accessibility**: Color contrast and text size for mobile users
