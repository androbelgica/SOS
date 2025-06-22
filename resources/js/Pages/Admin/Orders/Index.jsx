import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useState } from "react";
import { router } from "@inertiajs/react";

export default function Index({ auth, orders }) {
    const [filters, setFilters] = useState({
        status: "",
        payment_status: "",
        search: "",
        date_from: "",
        date_to: "",
        sort_by: "created_at",
        sort_direction: "desc",
    });
    const statusColors = {
        pending:
            "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        processing:
            "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
        for_delivery:
            "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
        out_for_delivery:
            "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
        delivered:
            "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        cancelled: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };

    const updateOrderStatus = (orderId, newStatus) => {
        router.put(route("admin.orders.status.update", orderId), {
            status: newStatus,
        });
    };

    const paymentStatusColors = {
        pending:
            "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        paid: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        failed: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
        cancelled: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };

    // Filter orders based on all criteria
    const filteredOrders = orders.filter((order) => {
        // Filter by status
        if (filters.status && order.status !== filters.status) return false;

        // Filter by payment status
        if (
            filters.payment_status &&
            order.payment_status !== filters.payment_status
        )
            return false;

        // Filter by date range
        if (filters.date_from) {
            const dateFrom = new Date(filters.date_from);
            const orderDate = new Date(order.created_at);
            if (orderDate < dateFrom) return false;
        }

        if (filters.date_to) {
            const dateTo = new Date(filters.date_to);
            dateTo.setHours(23, 59, 59); // Set to end of day
            const orderDate = new Date(order.created_at);
            if (orderDate > dateTo) return false;
        }

        // Filter by search term
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                order.user.name.toLowerCase().includes(searchLower) ||
                order.id.toString().includes(searchLower) ||
                order.user.email.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    // Sort the filtered orders
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        let aValue, bValue;

        // Determine which field to sort by
        switch (filters.sort_by) {
            case "id":
                aValue = a.id;
                bValue = b.id;
                break;
            case "total_amount":
                aValue = parseFloat(a.total_amount);
                bValue = parseFloat(b.total_amount);
                break;
            case "customer":
                aValue = a.user.name.toLowerCase();
                bValue = b.user.name.toLowerCase();
                break;
            case "created_at":
            default:
                aValue = new Date(a.created_at);
                bValue = new Date(b.created_at);
                break;
        }

        // Determine sort direction
        const direction = filters.sort_direction === "asc" ? 1 : -1;

        // Compare the values
        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
    });

    return (
        <AdminLayout auth={auth} title="Order Management">
            <Head title="Order Management - Admin Dashboard" />

            {/* Order Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl border-l-4 border-yellow-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-yellow-600 dark:text-yellow-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Pending Orders
                                </h2>
                                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {
                                        orders.filter(
                                            (order) =>
                                                order.status === "pending"
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl border-l-4 border-blue-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-blue-600 dark:text-blue-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Processing
                                </h2>
                                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {
                                        orders.filter(
                                            (order) =>
                                                order.status === "processing"
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl border-l-4 border-green-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-full p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-green-600 dark:text-green-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Delivered
                                </h2>
                                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {
                                        orders.filter(
                                            (order) =>
                                                order.status === "delivered"
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl border-l-4 border-red-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-full p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-red-600 dark:text-red-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Cancelled
                                </h2>
                                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {
                                        orders.filter(
                                            (order) =>
                                                order.status === "cancelled"
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400"
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
                            Orders List
                        </h2>
                        <div className="relative rounded-md shadow-sm w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-400 dark:text-gray-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by order ID, customer name or email..."
                                className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        search: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Order Status Filter */}
                        <div>
                            <label
                                htmlFor="status-filter"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Order Status
                            </label>
                            <select
                                id="status-filter"
                                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        status: e.target.value,
                                    })
                                }
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Payment Status Filter */}
                        <div>
                            <label
                                htmlFor="payment-status-filter"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Payment Status
                            </label>
                            <select
                                id="payment-status-filter"
                                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                                value={filters.payment_status}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        payment_status: e.target.value,
                                    })
                                }
                            >
                                <option value="">All Payment Status</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Date From Filter */}
                        <div>
                            <label
                                htmlFor="date-from-filter"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Date From
                            </label>
                            <input
                                type="date"
                                id="date-from-filter"
                                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                                value={filters.date_from}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        date_from: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Date To Filter */}
                        <div>
                            <label
                                htmlFor="date-to-filter"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Date To
                            </label>
                            <input
                                type="date"
                                id="date-to-filter"
                                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                                value={filters.date_to}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        date_to: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Sort Options */}
                        <div>
                            <label
                                htmlFor="sort-by"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Sort By
                            </label>
                            <div className="flex space-x-2">
                                <select
                                    id="sort-by"
                                    className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 block w-full"
                                    value={filters.sort_by}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            sort_by: e.target.value,
                                        })
                                    }
                                >
                                    <option value="created_at">Date</option>
                                    <option value="id">Order ID</option>
                                    <option value="total_amount">Amount</option>
                                    <option value="customer">Customer</option>
                                </select>
                                <button
                                    type="button"
                                    className="inline-flex items-center p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={() =>
                                        setFilters({
                                            ...filters,
                                            sort_direction:
                                                filters.sort_direction === "asc"
                                                    ? "desc"
                                                    : "asc",
                                        })
                                    }
                                >
                                    {filters.sort_direction === "asc" ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() =>
                                setFilters({
                                    status: "",
                                    payment_status: "",
                                    search: "",
                                    date_from: "",
                                    date_to: "",
                                    sort_by: "created_at",
                                    sort_direction: "desc",
                                })
                            }
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Reset Filters
                        </button>

                        <a
                            href={route("admin.orders.export", {
                                status: filters.status,
                                payment_status: filters.payment_status,
                                date_from: filters.date_from,
                                date_to: filters.date_to,
                            })}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            target="_blank"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Export CSV
                        </a>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                        <div className="shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Order ID
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Customer
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Total Amount
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Payment
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Order Date
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {sortedOrders.length > 0 ? (
                                        sortedOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        #{order.id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                                            <span className="text-indigo-700 dark:text-indigo-300 font-bold">
                                                                {order.user.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {
                                                                    order.user
                                                                        .name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {
                                                                    order.user
                                                                        .email
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        $
                                                        {parseFloat(
                                                            order.total_amount
                                                        ).toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {order.items?.length ||
                                                            0}{" "}
                                                        items
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            statusColors[
                                                                order.status
                                                            ]
                                                        }`}
                                                    >
                                                        {order.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            order.status.slice(
                                                                1
                                                            )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            paymentStatusColors[
                                                                order
                                                                    .payment_status
                                                            ]
                                                        }`}
                                                    >
                                                        {order.payment_status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            order.payment_status.slice(
                                                                1
                                                            )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {new Date(
                                                                order.created_at
                                                            ).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-xs">
                                                            {new Date(
                                                                order.created_at
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        {/* <select
                                                            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                            value={order.status}
                                                            onChange={(e) =>
                                                                updateOrderStatus(
                                                                    order.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                order.status ===
                                                                "delivered"
                                                            }
                                                        >
                                                            <option value="pending">
                                                                Pending
                                                            </option>
                                                            <option value="processing">
                                                                Processing
                                                            </option>
                                                            <option value="delivered">
                                                                Delivered
                                                            </option>
                                                            <option value="cancelled">
                                                                Cancelled
                                                            </option>
                                                        </select> */}
                                                        <Link
                                                            href={route(
                                                                "admin.orders.show",
                                                                order.id
                                                            )}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 mr-1"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                            View
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                <div className="flex flex-col items-center justify-center py-8">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                        />
                                                    </svg>
                                                    <p className="text-lg font-medium">
                                                        No orders found
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        Try adjusting your
                                                        search or filter to find
                                                        what you're looking for.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/* Pagination - Add if needed */}
            {orders.length > 0 && (
                <div className="mt-6">
                    <nav className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 sm:px-0 py-3">
                        <div className="hidden sm:block">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing{" "}
                                <span className="font-medium">
                                    {sortedOrders.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium">
                                    {orders.length}
                                </span>{" "}
                                orders
                            </p>
                        </div>
                    </nav>
                </div>
            )}
        </AdminLayout>
    );
}
