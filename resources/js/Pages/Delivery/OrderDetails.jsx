import React, { useState } from "react";
import DeliveryLayout from "@/Layouts/DeliveryLayout";
import { Link } from "@inertiajs/react";
import Modal from "@/Components/Modal";

export default function OrderDetails({ order }) {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const statusColors = {
        for_delivery:
            "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        out_for_delivery:
            "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
        delivered:
            "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        cancelled: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };
    const canAccept = order.delivery_status === "for_delivery";
    const canSettlePayment = order.delivery_status === "out_for_delivery";
    const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState(
        order.delivery_status
    );
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [customCancelReason, setCustomCancelReason] = useState("");
    const cancellationReasons = [
        "Customer not available",
        "Incorrect address",
        "Customer refused delivery",
        "Unable to contact customer",
        "Other (specify)",
    ];

    const handleAcceptOrder = async () => {
        setIsUpdatingStatus(true);
        try {
            await window.axios.post(`/delivery/orders/${order.id}/accept`);
            window.location.reload();
        } catch (e) {
            setIsUpdatingStatus(false);
            alert("Failed to accept order.");
        }
    };

    const handleDeliveryStatusChange = async (e) => {
        const newStatus = e.target.value;
        setSelectedDeliveryStatus(newStatus);
        if (newStatus === "cancelled") {
            setShowCancelModal(true);
            return;
        }
        setIsUpdatingStatus(true);
        try {
            if (newStatus === "delivered") {
                await window.axios.post(
                    `/delivery/orders/${order.id}/delivered`
                );
            }
            window.location.reload();
        } catch (e) {
            setIsUpdatingStatus(false);
            alert("Failed to update delivery status.");
        }
    };

    const handleAcceptPayment = async () => {
        setIsProcessing(true);
        try {
            await window.axios.post(
                `/delivery/orders/${order.id}/settle-payment`
            );
            window.location.reload();
        } catch (e) {
            setIsProcessing(false);
            alert("Failed to settle payment. Please try again.");
        }
    };

    const handleConfirmCancel = async () => {
        setIsUpdatingStatus(true);
        let reason =
            cancelReason === "Other (specify)"
                ? customCancelReason
                : cancelReason;
        if (!reason) {
            alert("Please provide a reason for cancellation.");
            setIsUpdatingStatus(false);
            return;
        }
        try {
            await window.axios.post(`/delivery/orders/${order.id}/cancelled`, {
                reason,
            });
            setShowCancelModal(false);
            window.location.reload();
        } catch (e) {
            setIsUpdatingStatus(false);
            alert("Failed to cancel order.");
        }
    };

    return (
        <DeliveryLayout>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Order {order.order_number || "#" + order.id}
                        </h2>
                        <Link
                            href="/delivery/orders"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Back to Orders
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Order Information
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Date
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {new Date(
                                                order.created_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Status
                                        </p>
                                        <p className="mt-1">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    statusColors[
                                                        order.delivery_status
                                                    ] ||
                                                    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                                }`}
                                            >
                                                {order.delivery_status
                                                    .replace(/_/g, " ")
                                                    .replace(/\b\w/g, (c) =>
                                                        c.toUpperCase()
                                                    )}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Total
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                            ₱
                                            {parseFloat(
                                                order.total_amount
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Payment Status
                                        </p>
                                        <p className="mt-1">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    order.payment_status ===
                                                    "paid"
                                                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                                }`}
                                            >
                                                {order.payment_status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    order.payment_status.slice(
                                                        1
                                                    )}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Payment Method
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {order.payment_method
                                                ? order.payment_method.toUpperCase()
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                                {/* Accept Button for For Delivery */}
                                {canAccept && (
                                    <button
                                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                        onClick={handleAcceptOrder}
                                        disabled={isUpdatingStatus}
                                    >
                                        {isUpdatingStatus
                                            ? "Accepting..."
                                            : "Accept Order"}
                                    </button>
                                )}
                                {/* Delivery Status Selection (only if accepted) */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Delivery Status
                                    </label>
                                    <select
                                        value={selectedDeliveryStatus}
                                        onChange={handleDeliveryStatusChange}
                                        disabled={
                                            !canSettlePayment ||
                                            isUpdatingStatus
                                        }
                                        className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1"
                                    >
                                        <option value="out_for_delivery">
                                            Out for Delivery
                                        </option>
                                        <option value="delivered">
                                            Delivered
                                        </option>
                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>
                                {/* Accept Payment Button for COD (only if accepted) */}
                                {order.payment_method === "cod" &&
                                    order.payment_status !== "paid" &&
                                    canSettlePayment && (
                                        <button
                                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                            onClick={() =>
                                                setShowPaymentModal(true)
                                            }
                                        >
                                            Accept Payment (COD)
                                        </button>
                                    )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Customer & Shipping
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Customer
                                </p>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {order.user?.name} ({order.user?.email})
                                </p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4">
                                    Shipping Address
                                </p>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-line">
                                    {order.shipping_address}
                                </p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4">
                                    Contact
                                </p>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {order.user?.phone || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Order Items
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                    >
                                        Product
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                    >
                                        Price
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                    >
                                        Quantity
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                    >
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {order.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        src={
                                                            item.product
                                                                ?.image_url ||
                                                            "/images/placeholder.jpg"
                                                        }
                                                        alt={item.product?.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.product?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                ₱
                                                {parseFloat(item.price).toFixed(
                                                    2
                                                )}
                                                {item.product?.unit_type ===
                                                "kg"
                                                    ? "/kg"
                                                    : "/pc"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.quantity}
                                                {item.product?.unit_type ===
                                                "kg"
                                                    ? "g"
                                                    : " pcs"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                ₱
                                                {(item.product?.unit_type ===
                                                "kg"
                                                    ? parseFloat(item.price) *
                                                      (item.quantity / 1000)
                                                    : parseFloat(item.price) *
                                                      item.quantity
                                                ).toFixed(2)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Total:
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                        ₱
                                        {parseFloat(order.total_amount).toFixed(
                                            2
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Delivery Details
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Delivery Status
                                    </p>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {order.delivery_status
                                            .replace(/_/g, " ")
                                            .replace(/\b\w/g, (c) =>
                                                c.toUpperCase()
                                            )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Assigned To
                                    </p>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {order.assigned_to
                                            ? order.user?.name
                                            : "Unassigned"}
                                    </p>
                                </div>
                                {order.delivery_status === "cancelled" && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Cancellation Reason
                                        </p>
                                        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                                            {order.delivery_cancel_reason}
                                        </p>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Delivered At
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {new Date(
                                                order.delivered_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {order.cancelled_at && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Cancelled At
                                        </p>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {new Date(
                                                order.cancelled_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                show={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
            >
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Settle Payment & Complete Delivery
                    </h2>
                    <p className="text-gray-700 dark:text-gray-200 mb-4">
                        Are you sure you want to accept payment and mark this
                        order as delivered?
                    </p>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            onClick={() => setShowPaymentModal(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                            onClick={handleAcceptPayment}
                            disabled={isProcessing}
                        >
                            {isProcessing
                                ? "Processing..."
                                : "Confirm & Settle"}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal
                show={showCancelModal}
                onClose={() => setShowCancelModal(false)}
            >
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Cancel Order
                    </h2>
                    <p className="text-gray-700 dark:text-gray-200 mb-4">
                        Please select a reason for cancellation:
                    </p>
                    <select
                        className="w-full mb-3 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    >
                        <option value="">Select reason</option>
                        {cancellationReasons.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                    {cancelReason === "Other (specify)" && (
                        <input
                            type="text"
                            className="w-full mb-3 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1"
                            placeholder="Enter custom reason"
                            value={customCancelReason}
                            onChange={(e) =>
                                setCustomCancelReason(e.target.value)
                            }
                        />
                    )}
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            onClick={() => setShowCancelModal(false)}
                            disabled={isUpdatingStatus}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            onClick={handleConfirmCancel}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus
                                ? "Cancelling..."
                                : "Confirm Cancellation"}
                        </button>
                    </div>
                </div>
            </Modal>
        </DeliveryLayout>
    );
}
