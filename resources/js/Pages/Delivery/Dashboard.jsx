import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import DeliveryLayout from "@/Layouts/DeliveryLayout";

const DeliveryDashboard = ({ orders }) => {
    const [qrCode, setQrCode] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [cancelOrderId, setCancelOrderId] = useState(null);

    const handleAccept = (orderId) => {
        Inertia.post(`/delivery/orders/${orderId}/accept`);
    };

    const handleDelivered = (orderId) => {
        Inertia.post(`/delivery/orders/${orderId}/delivered`);
    };

    const handleCancel = (orderId) => {
        if (!cancelReason)
            return alert("Please provide a reason for cancellation.");
        Inertia.post(`/delivery/orders/${orderId}/cancelled`, {
            reason: cancelReason,
        });
        setCancelOrderId(null);
        setCancelReason("");
    };

    const handleQrLookup = (e) => {
        e.preventDefault();
        if (!qrCode) return;
        Inertia.post("/delivery/orders/lookup-qr", { code: qrCode });
    };

    return (
        <DeliveryLayout>
            <form onSubmit={handleQrLookup} className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="Scan or enter order number"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    className="border rounded px-2 py-1 flex-1 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-1 rounded dark:bg-blue-500"
                >
                    Lookup
                </button>
            </form>

            <div className="space-y-4">
                {orders.length === 0 && (
                    <div className="text-gray-500 dark:text-gray-300">
                        No assigned orders.
                    </div>
                )}
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="border rounded p-4 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <span className="font-semibold dark:text-gray-100 text-gray-900">
                                    Order #
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white ml-1">
                                    {order.order_number}
                                </span>
                                <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded">
                                    {order.delivery_status.replace(/_/g, " ")}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                Customer: {order.user?.name}
                            </div>
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold dark:text-gray-100">
                                Items:
                            </span>
                            <ul className="list-disc ml-6">
                                {order.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="dark:text-gray-200"
                                    >
                                        {item.product?.name} x {item.quantity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                            Payment: {order.payment_method} (
                            {order.payment_status})
                        </div>
                        <div className="flex gap-2 mt-2">
                            {order.delivery_status === "for_delivery" && (
                                <button
                                    className="bg-green-600 text-white px-3 py-1 rounded dark:bg-green-500"
                                    onClick={() => handleAccept(order.id)}
                                >
                                    Accept
                                </button>
                            )}
                            {order.delivery_status === "out_for_delivery" &&
                                order.payment_status === "paid" && (
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 rounded dark:bg-blue-500"
                                        onClick={() =>
                                            handleDelivered(order.id)
                                        }
                                    >
                                        Mark as Delivered
                                    </button>
                                )}
                            {(order.delivery_status === "for_delivery" ||
                                order.delivery_status ===
                                    "out_for_delivery") && (
                                <>
                                    <button
                                        className="bg-red-600 text-white px-3 py-1 rounded dark:bg-red-500"
                                        onClick={() =>
                                            setCancelOrderId(order.id)
                                        }
                                    >
                                        Cancel
                                    </button>
                                    {cancelOrderId === order.id && (
                                        <div className="flex gap-2 mt-2">
                                            <input
                                                type="text"
                                                placeholder="Reason for cancellation"
                                                value={cancelReason}
                                                onChange={(e) =>
                                                    setCancelReason(
                                                        e.target.value
                                                    )
                                                }
                                                className="border rounded px-2 py-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                                            />
                                            <button
                                                className="bg-red-700 text-white px-2 py-1 rounded dark:bg-red-600"
                                                onClick={() =>
                                                    handleCancel(order.id)
                                                }
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                className="bg-gray-300 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200"
                                                onClick={() => {
                                                    setCancelOrderId(null);
                                                    setCancelReason("");
                                                }}
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </DeliveryLayout>
    );
};

export default DeliveryDashboard;
