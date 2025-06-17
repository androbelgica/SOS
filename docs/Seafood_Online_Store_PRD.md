
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
- **Comment on recipes** (authenticated users only)
- **React to recipes** with emojis/likes (authenticated users only)
- **View recipe comments and reactions** from other users
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
- **Interactive Recipe Engagement System:**
  - **Comments System**: Users can leave detailed comments on recipes
  - **Reaction System**: Users can react with emojis (👍, ❤️, 😋, 🔥, 👏)
  - **Comment Threading**: Support for replies to comments
  - **Moderation Tools**: Admin can moderate/delete inappropriate comments
  - **Real-time Updates**: Live updates for new comments and reactions
  - **User Interaction History**: Track user's comments and reactions

### 🔍 Search & Filter
- Search by name, type (e.g., shrimp, crab)
- Filter by availability, price range

### 📱 Mobile-Friendly UI
- Responsive layout using Tailwind CSS
- Touch-friendly interface for mobile users

### 💬 Recipe Interaction System (New Feature)
**Comments Feature:**
- **Authenticated Access**: Only logged-in users can comment
- **Rich Text Comments**: Support for formatted text, mentions, and basic markdown
- **Comment Threading**: Users can reply to specific comments (up to 3 levels deep)
- **Edit/Delete**: Users can edit/delete their own comments within 24 hours
- **Timestamp Display**: Show relative time (e.g., "2 hours ago")
- **Character Limit**: 500 characters per comment to encourage concise feedback

**Reactions Feature:**
- **Emoji Reactions**: 5 predefined reactions
  - 👍 **Like** - General approval
  - ❤️ **Love** - Really enjoyed the recipe
  - 😋 **Yum** - Looks delicious
  - 🔥 **Fire** - Amazing/impressive recipe
  - 👏 **Clap** - Appreciation for the chef
- **One Reaction Per User**: Users can change their reaction but only have one active
- **Reaction Counts**: Display total count for each reaction type
- **Quick Toggle**: Easy one-click reaction system

**Moderation & Management:**
- **Admin Controls**: Admins can delete any comment or hide inappropriate content
- **Report System**: Users can report inappropriate comments
- **Auto-moderation**: Basic profanity filter and spam detection
- **User Blocking**: Admins can temporarily restrict users from commenting

**User Experience Enhancements:**
- **Real-time Updates**: New comments and reactions appear without page refresh
- **Notification System**: Recipe authors get notified of new comments
- **User Profiles**: Click on usernames to view their recipe interaction history
- **Sort Options**: Sort comments by newest, oldest, or most reactions

## 6. Database Tables (Schema Outline)
- **users**: id, name, email, password, role (admin/customer)
- **products**: id, name, description, price, stock, image, available (bool)
- **orders**: id, user_id, status, total_price, created_at
- **order_items**: id, order_id, product_id, quantity, price
- **recipes**: id, title, description, image, video_url, created_by
- **recipe_product**: id, recipe_id, product_id (pivot table for many-to-many)
- **recipe_comments**: id, recipe_id, user_id, comment, parent_id (for threading), created_at, updated_at
- **recipe_reactions**: id, recipe_id, user_id, reaction_type (like, love, yum, fire, clap), created_at
- **comment_reactions**: id, comment_id, user_id, reaction_type, created_at (reactions on comments)

## 7. Wireframe Suggestions
You can sketch or prototype the following views:
- Home page (product listings)
- Product details
- Cart and checkout
- Admin dashboard
- Recipe creation and listing page
- Recipe details view
- **Recipe comments section** (below recipe details)
- **Comment thread view** (nested replies)
- **User interaction dashboard** (user's comments and reactions history)

## 8. Non-Functional Requirements
- **Performance**: Optimized for fast loading on mobile
- **Security**: Basic auth (Laravel Breeze or Jetstream), input validation
- **Scalability**: Code modularity and clean architecture
- **Accessibility**: Color contrast and text size for mobile users
``