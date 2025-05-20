import React from "react";
import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Verify({ order, product, orderItem }) {
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

    const getStatusColor = (status) => {
        const statusColors = {
            pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
            processing: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
            delivered: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
            cancelled: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
        };
        return statusColors[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    };

    return (
        <GuestLayout>
            <Head title="Verify Order Product" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6 text-center">
                                <h1 className="text-2xl font-semibold mb-2">Product Verification</h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Verify your product details before payment
                                </p>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Order Information */}
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4">Order Information</h2>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="font-medium">Order Number:</span>
                                                <span className="ml-2">{order.order_number}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Order Date:</span>
                                                <span className="ml-2">{formatDate(order.created_at)}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Status:</span>
                                                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Total Amount:</span>
                                                <span className="ml-2">₱{parseFloat(order.total_amount).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Information */}
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4">Product Information</h2>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="font-medium">Product Name:</span>
                                                <span className="ml-2">{product.name}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Quantity:</span>
                                                <span className="ml-2">
                                                    {orderItem.quantity} {product.unit_type === 'kg' ? 'grams' : 'pcs'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Price:</span>
                                                <span className="ml-2">₱{parseFloat(orderItem.price).toFixed(2)}</span>
                                            </div>
                                            {product.image_url && (
                                                <div className="mt-4">
                                                    <img 
                                                        src={product.image_url} 
                                                        alt={product.name} 
                                                        className="w-full max-w-[200px] h-auto rounded-lg shadow-md"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className="text-center">
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        This verification confirms that this product is part of your order.
                                        Please proceed with payment only if the details match your expectations.
                                    </p>
                                    <div className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-500 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                        ✓ Verified
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
