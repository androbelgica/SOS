import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function AdminDashboard({ auth, stats, recentOrders }) {
    return (
        <AdminLayout auth={auth} title="Dashboard Overview">
            <Head title="Admin Dashboard - Seafood Online Store" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Order Stats */}
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
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    New Orders
                                </h2>
                                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {stats?.orders?.pending || 0}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href={route("admin.orders.index")}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center"
                            >
                                View all orders
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Revenue Stats */}
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
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Revenue (Today)
                                </h2>
                                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    ₱{parseFloat(stats?.revenue?.today || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Daily sales tracking
                            </span>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
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
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Low Stock Items
                                </h2>
                                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {stats?.inventory?.lowStock || 0}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href={route("admin.products.index", { filter: "low-stock" })}
                                className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 font-medium flex items-center"
                            >
                                View low stock items
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Total Products */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl border-l-4 border-purple-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-full p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-purple-600 dark:text-purple-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Products
                                </h2>
                                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {stats?.inventory?.totalProducts || 0}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href={route("admin.products.index")}
                                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium flex items-center"
                            >
                                Manage products
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href={route("admin.products.create")}
                        className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-blue-600 dark:text-blue-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Add New Product
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Create a new seafood product listing
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href={route("admin.recipes.create")}
                        className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-full p-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-green-600 dark:text-green-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Create New Recipe
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Add a new seafood recipe
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href={route("admin.orders.index")}
                        className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-full p-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-purple-600 dark:text-purple-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        View All Orders
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Manage customer orders
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Order Statistics */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Order Statistics
                </h2>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    {/* Order Status Breakdown */}
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{stats?.orders?.pending || 0}</span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                        {stats?.orders?.total ? Math.round((stats.orders.pending / stats.orders.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats?.orders?.total ? (stats.orders.pending / stats.orders.total) * 100 : 0}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Processing</span>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{stats?.orders?.processing || 0}</span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                        {stats?.orders?.total ? Math.round((stats.orders.processing / stats.orders.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats?.orders?.total ? (stats.orders.processing / stats.orders.total) * 100 : 0}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Delivered</span>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{stats?.orders?.delivered || 0}</span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                        {stats?.orders?.total ? Math.round((stats.orders.delivered / stats.orders.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.orders?.total ? (stats.orders.delivered / stats.orders.total) * 100 : 0}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Cancelled</span>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{stats?.orders?.cancelled || 0}</span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                        {stats?.orders?.total ? Math.round((stats.orders.cancelled / stats.orders.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats?.orders?.total ? (stats.orders.cancelled / stats.orders.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status Breakdown */}
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{stats?.payments?.pending || 0}</span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                        {stats?.orders?.total ? Math.round((stats.payments.pending / stats.orders.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats?.orders?.total ? (stats.payments.pending / stats.orders.total) * 100 : 0}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Paid</span>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{stats?.payments?.paid || 0}</span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                        {stats?.orders?.total ? Math.round((stats.payments.paid / stats.orders.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.orders?.total ? (stats.payments.paid / stats.orders.total) * 100 : 0}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Failed</span>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{stats?.payments?.failed || 0}</span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                        {stats?.orders?.total ? Math.round((stats.payments.failed / stats.orders.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats?.orders?.total ? (stats.payments.failed / stats.orders.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Overview */}
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Today</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">₱{parseFloat(stats?.revenue?.today || 0).toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Yesterday</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">₱{parseFloat(stats?.revenue?.yesterday || 0).toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{
                                        width: `${stats?.revenue?.today && stats.revenue.today > 0
                                            ? Math.min(100, (stats.revenue.yesterday / stats.revenue.today) * 100)
                                            : (stats?.revenue?.yesterday > 0 ? 100 : 0)}%`
                                    }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">This Week</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">₱{parseFloat(stats?.revenue?.thisWeek || 0).toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">This Month</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">₱{parseFloat(stats?.revenue?.thisMonth || 0).toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Orders Summary */}
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Orders Summary</h3>
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.orders?.total || 0}</span>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Average Order Value</span>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                        ₱{stats?.orders?.total && stats?.revenue?.thisMonth
                                            ? (stats.revenue.thisMonth / stats.orders.total).toFixed(2)
                                            : "0.00"}
                                    </span>
                                </div>
                            </div>

                            <Link
                                href={route("admin.orders.index")}
                                className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                View All Orders
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                {recentOrders && recentOrders.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentOrders.map((order) => {
                                        const statusColors = {
                                            pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
                                            processing: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
                                            delivered: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
                                            cancelled: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
                                        };

                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    #{order.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {order.user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    ₱{parseFloat(order.total_amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={route("admin.orders.show", order.id)}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
