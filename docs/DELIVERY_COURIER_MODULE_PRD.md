# 📦 Delivery/Courier Staff Module PRD

## 1. Overview

This module introduces a new user role: **Delivery/Courier Staff**. The delivery staff is responsible for handling the delivery of customer orders. Their access is limited to order management, with a focus on orders that are ready for delivery. The module provides a dedicated dashboard and workflow tailored to the delivery process, ensuring clear status transitions and accountability.

## 2. Objectives

-   Provide a secure, role-specific dashboard for delivery staff.
-   Allow delivery staff to view and manage only orders assigned for delivery.
-   Enable status transitions: "For Delivery" → "Out for Delivery" → "Delivered" or "Cancelled".
-   Allow delivery staff to record delivery outcomes and reasons for cancellations.
-   Ensure all actions are logged for audit and tracking.

## 3. User Role: Delivery/Courier Staff

### Permissions

-   **Login/logout** (dedicated delivery staff account)
-   **View assigned orders** with status "For Delivery"
-   **Read-only access** to order details (customer info, address, items, payment method/status)
-   **Change order status**:
    -   Accept order → set status to "Out for Delivery"
    -   Mark as "Delivered" (if successfully delivered and paid, e.g., COD)
    -   Mark as "Cancelled" (if delivery failed, with required reason)
-   **View delivery history** (orders previously handled by the staff)
-   **No access** to product management, recipe modules, or admin/customer features

## 4. Core Features

### 🛵 Delivery Dashboard

-   **Order List View**: Shows all orders assigned to the staff with status "For Delivery" or "Out for Delivery"
-   **Order Details View**: Displays order items, customer name, address, contact, payment method/status, and any delivery notes
-   **QR Code Scanning**: Courier can scan a QR code on the packaging for faster retrieval of order details and to quickly access status change actions
-   **Status Actions**:
    -   **Accept Order**: Changes status from "For Delivery" to "Out for Delivery"
    -   **Mark as Delivered**: Changes status to "Delivered" (only if payment is confirmed for COD)
    -   **Mark as Cancelled**: Changes status to "Cancelled" (requires input of cancellation reason)
-   **Delivery History**: List of all orders previously delivered or cancelled by the staff, with status and timestamps

### 🔒 Access Control

-   Delivery staff can only see and manage orders assigned to them or unassigned orders marked "For Delivery"
-   No access to admin/customer dashboards or recipe/product management

### 📱 Mobile-Friendly UI

-   Responsive dashboard for use on mobile devices
-   Simple, action-focused interface for quick status updates

### 4. **Frontend: Delivery Dashboard**

-   [ ] Build delivery staff dashboard (mobile-friendly):
    -   [ ] Order list view (for_delivery, out_for_delivery)
    -   [ ] Order details view (read-only, with customer info, address, items, payment method/status)
    -   [ ] Action buttons: Accept, Mark as Delivered, Mark as Cancelled
    -   [ ] Delivery history view (delivered/cancelled orders, with status and timestamps)
    -   [ ] **QR code scanning for order retrieval and status change**
-   [ ] Add confirmation dialogs for status changes.
-   [ ] Add input for cancellation reason (required if cancelling).
-   [ ] Add quick filters (e.g., by status).

### 5. **API/Integration**

-   [ ] Create/secure API endpoints for delivery staff actions.
-   [ ] Ensure endpoints return only data relevant to the logged-in delivery staff.
-   [ ] **Support order lookup by QR code (order number or unique code)**
-   [ ] Integrate frontend with new endpoints.

## 5. Workflow

1. **Login**: Delivery staff logs in to their dashboard.
2. **View Orders**: Sees a list of orders with status "For Delivery".
3. **Accept Order**: Staff accepts an order, status changes to "Out for Delivery".
4. **Scan QR Code**: Courier can scan the QR code on the package to instantly retrieve order details and perform status changes.
5. **Deliver Order**:
    - If successful and payment (COD) is received, mark as "Delivered".
    - If delivery fails, mark as "Cancelled" and provide a reason (e.g., customer not available, address incorrect).
6. **History**: Staff can view their delivery history for reference.

## 6. Database Schema Additions/Changes

-   **users**: Add role "delivery" or "courier"
-   **orders**:
    -   Add `assigned_to` (user_id of delivery staff, nullable)
    -   Add `delivery_status` (for_delivery, out_for_delivery, delivered, cancelled)
    -   Add `delivery_cancel_reason` (nullable)
    -   Add `delivered_at`, `cancelled_at` timestamps

## 7. Wireframe Suggestions

-   **Delivery Dashboard**: List of orders with quick action buttons
-   **Order Details**: Read-only view with action buttons for status change
-   **Delivery History**: List of completed/cancelled deliveries with status and timestamps

## 8. Non-Functional Requirements

-   **Security**: Delivery staff cannot access or modify product, recipe, or admin/customer data
-   **Auditability**: All status changes and actions are logged with timestamps and user IDs
-   **Performance**: Fast, mobile-optimized dashboard for on-the-go use

---

**Note:** This module is designed to be integrated with the existing order and user management systems. All delivery actions are tracked for accountability and reporting.
