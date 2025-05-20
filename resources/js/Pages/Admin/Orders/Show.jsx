import React, { useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Show({ auth, order }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [isGeneratingLabels, setIsGeneratingLabels] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        status: order.status,
    });

    const {
        data: paymentData,
        setData: setPaymentData,
        put: putPayment,
        processing: processingPayment,
        errors: paymentErrors,
        reset: resetPayment
    } = useForm({
        payment_status: order.payment_status,
    });

    const statusColors = {
        pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        processing: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
        delivered: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        cancelled: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };

    const paymentStatusColors = {
        pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        paid: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        failed: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };

    const handleStatusChange = (e) => {
        setData("status", e.target.value);
    };

    const handlePaymentStatusChange = (e) => {
        setPaymentData("payment_status", e.target.value);
    };

    const updateStatus = (e) => {
        e.preventDefault();
        setIsUpdating(true);

        put(route("admin.orders.status.update", order.id), {
            onSuccess: () => {
                setIsUpdating(false);
            },
        });
    };

    const updatePaymentStatus = (e) => {
        e.preventDefault();
        setIsUpdatingPayment(true);

        putPayment(route("admin.orders.payment-status.update", order.id), {
            onSuccess: () => {
                setIsUpdatingPayment(false);
            },
        });
    };

    const generateLabels = () => {
        setIsGeneratingLabels(true);

        router.post(route("admin.orders.labels.generate", order.id), {}, {
            onSuccess: () => {
                setIsGeneratingLabels(false);
            },
            onError: () => {
                setIsGeneratingLabels(false);
            }
        });
    };

    const printAllLabels = () => {
        window.open(route("admin.orders.labels.print", order.id), "_blank");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <AdminLayout auth={auth} title={`Order #${order.id}`}>
            <Head title={`Order #${order.id} - Admin Dashboard`} />

            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href={route("admin.orders.index")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Orders
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Summary */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Order Details</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Order ID:</span> #{order.id}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Date:</span> {formatDate(order.created_at)}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Payment Status:</span>{" "}
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStatusColors[order.payment_status]}`}>
                                                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Customer Information</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Name:</span> {order.user.name}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Email:</span> {order.user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shipping Address</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                        {order.shipping_address}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Billing Address</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                        {order.billing_address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Items</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr key="header-row">
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {order.items && order.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {item.product.image_url ? (
                                                            <img
                                                                className="h-10 w-10 rounded-md object-cover"
                                                                src={item.product.image_url}
                                                                alt={item.product.name}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                <span className="text-gray-500 dark:text-gray-400 text-xs">No img</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {item.product.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                ₱{parseFloat(item.price).toFixed(2)}{item.product.unit_type === 'kg' ? '/kg' : '/pc'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {item.quantity}{item.product.unit_type === 'kg' ? 'g' : ' pcs'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                ₱{(item.product.unit_type === 'kg'
                                                    ? parseFloat(item.price) * (item.quantity / 1000)
                                                    : parseFloat(item.price) * item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-700">
                                    <tr key="total-row">
                                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                                            Total:
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            ₱{parseFloat(order.total_amount).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Order Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Actions</h2>
                        </div>
                        <div className="p-6">
                            <form onSubmit={updateStatus} className="mb-6">
                                <div className="mb-4">
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Update Order Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={data.status}
                                        onChange={handleStatusChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing || data.status === order.status}
                                    className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                        (processing || data.status === order.status) ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Status"
                                    )}
                                </button>
                            </form>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6"></div>

                            <form onSubmit={updatePaymentStatus}>
                                <div className="mb-4">
                                    <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Update Payment Status
                                    </label>
                                    <select
                                        id="payment_status"
                                        name="payment_status"
                                        value={paymentData.payment_status}
                                        onChange={handlePaymentStatusChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processingPayment || paymentData.payment_status === order.payment_status}
                                    className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                        (processingPayment || paymentData.payment_status === order.payment_status) ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {processingPayment ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Payment Status"
                                    )}
                                </button>
                            </form>

                            {/* Product Labels Section */}
                            {order.status === 'processing' && (
                                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                        Product Labels
                                    </h3>
                                    <div className="space-y-4">
                                        <button
                                            type="button"
                                            onClick={generateLabels}
                                            disabled={isGeneratingLabels}
                                            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                                                isGeneratingLabels ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            {isGeneratingLabels ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Generating Labels...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                    </svg>
                                                    Generate Product Labels
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={printAllLabels}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            Print All Labels
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Labels include QR codes that customers can scan to verify products before payment.
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Order Timeline</h3>
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        <li key="order-placed">
                                            <div className="relative pb-8">
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                                                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Order placed</p>
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                            {formatDate(order.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                        <li key="current-status">
                                            <div className="relative pb-8">
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                                                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Current status: <span className="font-medium">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></p>
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                            {formatDate(order.updated_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
