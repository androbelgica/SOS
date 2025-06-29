# 📄 Project Document Requirement: Cart & Cook Android App

## 1. Project Overview

A native Android application designed for **Cart & Cook** to serve two main user groups: **Customers** (for browsing, ordering, and tracking) and **Delivery/Couriers** (for managing and fulfilling deliveries). The app will provide a seamless, mobile-first experience, integrating with the existing backend (Laravel API) and supporting real-time order and delivery management.

---

## 2. Project Objectives

-   Provide a fast, intuitive mobile experience for customers to browse products, place orders, and track deliveries.
-   Enable couriers to efficiently manage assigned deliveries, update order statuses, and navigate to customer locations.
-   Ensure secure authentication and role-based access for both user types.
-   Support real-time notifications for order updates and delivery status changes.

---

## 3. Technology Stack

| Component          | Technology                |
| ------------------ | ------------------------- |
| Platform           | Android (Kotlin/Java)     |
| Backend            | Laravel REST API          |
| Database (local)   | Room/SQLite (for caching) |
| Push Notifications | Firebase Cloud Messaging  |
| Maps/Navigation    | Google Maps SDK           |
| Authentication     | JWT/OAuth via API         |

---

## 4. User Roles

### 1. Customer (User)

-   Register/Login/Logout
-   Browse products by category (seafood, meat, vegetables, fruits)
-   Search/filter products
-   Add to cart, update quantities, remove items
-   Place orders (Cash on Delivery only; GCash/Maya shown as "coming soon")
-   View order history and order details
-   Track order status and delivery in real-time (map view)
-   Receive push notifications for order updates
-   View and comment on recipes (optional, if included)
-   Edit profile and manage addresses

### 2. Delivery/Courier

-   Login/Logout
-   View assigned deliveries (list and map)
-   View order and customer details
-   Update order status (Picked Up, Out for Delivery, Delivered, Failed)
-   Navigate to customer address (integrated with Google Maps)
-   Call/message customer (click-to-call/SMS)
-   Receive push notifications for new/updated deliveries
-   View delivery history

---

## 5. Core Features

### For Customers

-   **Product Browsing & Search**

    -   Category-based product listing
    -   Product details (name, price, description, image, stock)
    -   Search and filter by name/category/availability

-   **Cart & Checkout**

    -   Add/remove/update products in cart
    -   Checkout with address selection
    -   Payment options: Cash on Delivery (selectable), GCash/Maya (disabled, "coming soon" label)
    -   Order summary and confirmation

-   **Order Management**

    -   View current and past orders
    -   Order status tracking (Pending, Processing, Out for Delivery, Delivered, Canceled)
    -   Real-time delivery tracking (map with courier location)
    -   Push notifications for order status changes

-   **Profile & Address Management**

    -   Edit profile details
    -   Manage delivery addresses

-   **Recipe Module (Optional)**
    -   View recipes
    -   Comment/react to recipes

---

### For Delivery/Courier

-   **Delivery Dashboard**

    -   List of assigned deliveries (with status)
    -   Map view of delivery locations

-   **Order Fulfillment**

    -   View order and customer details
    -   Update status: Picked Up, Out for Delivery, Delivered, Failed
    -   Capture proof of delivery (photo, signature)
    -   Call/message customer

-   **Navigation**

    -   Integrated Google Maps navigation to customer address

-   **Notifications**

    -   Push notifications for new assignments and status updates

-   **History**
    -   View completed and past deliveries

---

## 6. User Flows

### Customer

1. **Login/Register → Browse Products → Add to Cart → Checkout → Select Payment (COD) → Place Order → Track Order → Receive Delivery**
2. **View Orders → Select Order → Track Status/Location**
3. **Edit Profile/Addresses**

### Courier

1. **Login → View Assigned Deliveries → Select Delivery → View Details → Update Status (Picked Up/Out for Delivery/Delivered) → Navigate to Address → Complete Delivery**
2. **View Delivery History**

---

## 7. Non-Functional Requirements

-   **Performance:** Fast loading, responsive UI, offline caching for product catalog
-   **Security:** Secure API communication (HTTPS, JWT), role-based access
-   **Reliability:** Graceful error handling, retry for failed network requests
-   **Scalability:** Modular codebase for future features (e.g., in-app payments)
-   **Accessibility:** Large touch targets, readable fonts, color contrast
-   **Localization:** Support for multiple languages (optional/future)

---

## 8. Database (Local/Cache)

-   **products**: id, name, description, price, image, stock, category
-   **cart_items**: id, product_id, quantity
-   **orders**: id, status, total_price, payment_method, payment_status, created_at
-   **order_items**: id, order_id, product_id, quantity, price
-   **addresses**: id, user_id, address, label, lat, lng
-   **deliveries**: id, order_id, status, assigned_at, completed_at

---

## 9. Wireframe Suggestions

-   Customer Home (product list)
-   Product Details
-   Cart & Checkout
-   Order Tracking (map)
-   Profile/Addresses
-   Courier Dashboard (list/map)
-   Delivery Details
-   Navigation/Proof of Delivery

---

## 10. Future Enhancements

-   Enable GCash/Maya payments
-   In-app chat between customer and courier
-   Ratings and feedback for deliveries
-   Recipe creation and engagement (if not in v1)

---

## 11. Enhancement Recommendations

### 1. Address Management API
- Add RESTful endpoints for managing user delivery addresses:
    - `GET /addresses` (list)
    - `POST /addresses` (create)
    - `PUT /addresses/{id}` (update)
    - `DELETE /addresses/{id}` (delete)
- Enables server-side address book and sync across devices.

### 2. Real-Time Courier Location
- Add endpoint or WebSocket for live courier location updates:
    - `POST /delivery/location` (courier updates location)
    - `GET /orders/{order}/courier-location` (customer fetches courier location)
- Enables real-time map tracking for customers.

### 3. Proof of Delivery
- Add endpoints for uploading delivery proof:
    - `POST /delivery/orders/{order}/proof` (upload photo/signature)
    - `GET /delivery/orders/{order}/proof` (view proof)
- Supports photo or signature capture at delivery.

### 4. Ratings & Feedback
- Add endpoints for order/delivery feedback:
    - `POST /orders/{order}/rating` (customer rates delivery)
    - `GET /orders/{order}/rating` (view rating)
- Enables customer feedback and quality tracking.

### 5. In-App Chat (Future)
- Add endpoints for chat between customer and courier:
    - `GET /chats/{order}` (fetch chat history)
    - `POST /chats/{order}` (send message)
- Requires real-time backend (WebSocket or polling).

### 6. Payment Integration (Future)
- Add endpoints for GCash/Maya payments when enabled:
    - `POST /orders/{order}/pay` (initiate payment)
    - `GET /orders/{order}/payment-status` (check status)

### 7. Recipe Creation (Optional/Future)
- Add endpoints for user-generated recipes:
    - `POST /recipes` (create)
    - `PUT /recipes/{id}` (update)
    - `DELETE /recipes/{id}` (delete)

---

> These enhancements will further future-proof the app, improve user experience, and support advanced features as your platform grows.
