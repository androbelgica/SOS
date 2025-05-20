import React from "react";

export default function NotificationPanel({ notifications, onMarkAsRead }) {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Notifications
            </h2>

            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg border ${
                                notification.read_at
                                    ? "bg-gray-50"
                                    : "bg-blue-50 border-blue-200"
                            }`}
                        >
                            {notification.type.includes("LowStockAlert") && (
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-yellow-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            Low Stock Alert
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Product "
                                            {notification.data.product_name}" is
                                            running low on stock. Current stock:{" "}
                                            {notification.data.current_stock}
                                        </p>
                                        <div className="mt-2">
                                            <a
                                                href={`/admin/products/${notification.data.product_id}/edit`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                            >
                                                View Product
                                            </a>
                                            {!notification.read_at && (
                                                <button
                                                    onClick={() =>
                                                        onMarkAsRead(
                                                            notification.id
                                                        )
                                                    }
                                                    className="ml-4 text-sm font-medium text-gray-600 hover:text-gray-500"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {notification.type.includes(
                                "OrderStatusChanged"
                            ) && (
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-blue-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            Order Status Update
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Order #{notification.data.order_id}{" "}
                                            status changed to{" "}
                                            {notification.data.status}
                                        </p>
                                        <div className="mt-2">
                                            <a
                                                href={`/admin/orders/${notification.data.order_id}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                            >
                                                View Order
                                            </a>
                                            {!notification.read_at && (
                                                <button
                                                    onClick={() =>
                                                        onMarkAsRead(
                                                            notification.id
                                                        )
                                                    }
                                                    className="ml-4 text-sm font-medium text-gray-600 hover:text-gray-500"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-4">
                    No new notifications
                </p>
            )}
        </div>
    );
}
