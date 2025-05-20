import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { getImageProps } from "@/Utils/imageHelpers";

export default function OrdersIndex({ auth, orders }) {
    const [filters, setFilters] = useState({
        status: "",
        search: "",
        date_from: "",
        date_to: "",
        sort_by: "created_at",
        sort_direction: "desc",
    });

    const [filteredOrders, setFilteredOrders] = useState(orders);

    const statusColors = {
        pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        processing: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
        delivered: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        cancelled: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };

    useEffect(() => {
        let result = [...orders];

        // Filter by status
        if (filters.status) {
            result = result.filter(order => order.status === filters.status);
        }

        // Filter by search term (order ID or order number)
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(order =>
                order.id.toString().includes(searchTerm) ||
                (order.order_number && order.order_number.toLowerCase().includes(searchTerm)) ||
                order.total_amount.toString().includes(searchTerm)
            );
        }

        // Filter by date range
        if (filters.date_from) {
            const fromDate = new Date(filters.date_from);
            result = result.filter(order => new Date(order.created_at) >= fromDate);
        }

        if (filters.date_to) {
            const toDate = new Date(filters.date_to);
            toDate.setHours(23, 59, 59, 999); // End of the day
            result = result.filter(order => new Date(order.created_at) <= toDate);
        }

        // Sort results
        result.sort((a, b) => {
            let aValue = a[filters.sort_by];
            let bValue = b[filters.sort_by];

            // Handle dates
            if (filters.sort_by === 'created_at') {
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
            }

            // Handle numeric values
            if (filters.sort_by === 'total_amount') {
                aValue = parseFloat(a.total_amount);
                bValue = parseFloat(b.total_amount);
            }

            if (filters.sort_direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredOrders(result);
    }, [filters, orders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSortChange = (field) => {
        setFilters(prev => ({
            ...prev,
            sort_by: field,
            sort_direction: prev.sort_by === field && prev.sort_direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    return (
        <MainLayout auth={auth} title="Your Orders">
            <Head title="Your Orders - Seafood Online Store" />

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Order History
                        </h2>
                        <Link
                            href={route("products.index")}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Continue Shopping
                        </Link>
                    </div>

                    {orders.length > 0 ? (
                        <>
                            {/* Filters */}
                            <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Search
                                        </label>
                                        <input
                                            type="text"
                                            name="search"
                                            id="search"
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                            placeholder="Order number or amount"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={filters.status}
                                            onChange={handleFilterChange}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date_from"
                                            id="date_from"
                                            value={filters.date_from}
                                            onChange={handleFilterChange}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date_to"
                                            id="date_to"
                                            value={filters.date_to}
                                            onChange={handleFilterChange}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setFilters({
                                            status: "",
                                            search: "",
                                            date_from: "",
                                            date_to: "",
                                            sort_by: "created_at",
                                            sort_direction: "desc",
                                        })}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSortChange('id')}
                                                className="group inline-flex items-center"
                                            >
                                                Order #
                                                {filters.sort_by === 'id' && (
                                                    <span className="ml-1">
                                                        {filters.sort_direction === 'desc' ? (
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                )}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSortChange('created_at')}
                                                className="group inline-flex items-center"
                                            >
                                                Date
                                                {filters.sort_by === 'created_at' && (
                                                    <span className="ml-1">
                                                        {filters.sort_direction === 'desc' ? (
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                )}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSortChange('total_amount')}
                                                className="group inline-flex items-center"
                                            >
                                                Total
                                                {filters.sort_by === 'total_amount' && (
                                                    <span className="ml-1">
                                                        {filters.sort_direction === 'desc' ? (
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                )}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSortChange('status')}
                                                className="group inline-flex items-center"
                                            >
                                                Status
                                                {filters.sort_by === 'status' && (
                                                    <span className="ml-1">
                                                        {filters.sort_direction === 'desc' ? (
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                )}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.order_number || '#' + order.id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                    ₱{parseFloat(order.total_amount).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={route("orders.show", order.id)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No orders match your filters. Try adjusting your search criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Results summary */}
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600 sm:px-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing <span className="font-medium">{filteredOrders.length}</span> of{' '}
                                    <span className="font-medium">{orders.length}</span> orders
                                </p>
                            </div>
                        </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                                No orders yet
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                You haven't placed any orders yet. Start shopping to place your first order.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route("products.index")}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}