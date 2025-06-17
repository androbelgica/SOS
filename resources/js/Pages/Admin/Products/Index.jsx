import React, { useState, useEffect, useCallback } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { getImageProps } from "@/Utils/imageHelpers";
import { debounce } from "lodash";
import CategoryBadge from "@/Components/CategoryBadge";

export default function AdminProducts({
    auth,
    products,
    filters,
    stats,
    categoryStats,
    timestamp,
}) {

    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [editingStock, setEditingStock] = useState({});
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [clientTimestamp, setClientTimestamp] = useState(Date.now());

    // Use server timestamp if available, otherwise use client timestamp
    const cacheTimestamp = timestamp || clientTimestamp;

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get(
                route("admin.products.index"),
                { ...filters, search: query },
                { preserveState: true }
            );
        }, 300),
        [filters]
    );

    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    // Update client timestamp when component mounts or products change
    useEffect(() => {
        setClientTimestamp(Date.now());

        // Log all product images for debugging
        if (products && products.data) {
            console.log("Products data loaded:", products.data.length, "items");
            products.data.forEach((product) => {
                console.log(
                    `Product ID: ${product.id}, Name: ${
                        product.name
                    }, Image URL: ${product.image_url || "No image"}`
                );

                // Preload images to check if they're accessible
                if (product.image_url) {
                    const img = new Image();
                    img.onload = () =>
                        console.log(
                            `✅ Image loaded successfully for product ${product.id}`
                        );
                    img.onerror = () =>
                        console.error(
                            `❌ Failed to load image for product ${product.id}: ${product.image_url}`
                        );
                    img.src = `${product.image_url}?t=${Date.now()}`;
                }
            });
        }
    }, [products]);

    const { post, processing } = useForm({
        updates: [],
    });

    const confirmDelete = (product) => {
        setDeleteConfirmation(product);
    };

    const handleDelete = () => {
        if (deleteConfirmation) {
            router.delete(
                route("admin.products.destroy", deleteConfirmation.id),
                {
                    onSuccess: () => {
                        setDeleteConfirmation(null);
                    },
                }
            );
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    const handleSort = (field) => {
        const direction =
            filters.sort === field && filters.direction === "asc"
                ? "desc"
                : "asc";
        window.location.href = route("admin.products.index", {
            ...filters,
            sort: field,
            direction,
        });
    };

    const handleStockChange = (productId, value) => {
        setEditingStock({
            ...editingStock,
            [productId]: parseInt(value) || 0,
        });
    };

    const saveStockUpdates = () => {
        const updates = Object.entries(editingStock).map(
            ([id, stock_quantity]) => ({
                id: parseInt(id),
                stock_quantity,
            })
        );

        post(route("admin.products.stock.batch-update"), {
            data: { updates },
            onSuccess: () => setEditingStock({}),
        });
    };

    return (
        <AdminLayout auth={auth} title="Products Management">
            <Head title="Manage Products - Admin Dashboard" />

            {/* Action Button */}
            <div className="mb-6 flex justify-end">
                <Link
                    href={route("admin.products.create")}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Product
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-full p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Products
                                </dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    {stats.total}
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Low Stock Products
                                </dt>
                                <dd className="mt-1 text-3xl font-semibold text-yellow-600 dark:text-yellow-400">
                                    {stats.lowStock}
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-full p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Out of Stock
                                </dt>
                                <dd className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-400">
                                    {stats.outOfStock}
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Statistics */}
            {categoryStats && categoryStats.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Products by Category
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {categoryStats.map((stat) => (
                            <div
                                key={stat.category}
                                className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg"
                            >
                                <div className="px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-2">{stat.icon}</span>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {stat.label}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {stat.category}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {stat.count}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                products
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and Actions Bar */}
            <div className="mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="max-w-lg w-full">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Search Products
                    </label>
                    <div className="relative rounded-md shadow-sm">
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
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                            placeholder="Search by name or description..."
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onBlur={() => debouncedSearch(searchQuery)}
                        />
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                        <div className="shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                            onClick={() =>
                                                handleSort("name")
                                            }
                                        >
                                            <div className="flex items-center">
                                                <span>Name</span>
                                                {filters.sort === "name" ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d={filters.direction === "asc"
                                                                ? "M5 15l7-7 7 7"
                                                                : "M19 9l-7 7-7-7"}
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                            onClick={() =>
                                                handleSort("price")
                                            }
                                        >
                                            <div className="flex items-center">
                                                <span>Price</span>
                                                {filters.sort === "price" ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d={filters.direction === "asc"
                                                                ? "M5 15l7-7 7 7"
                                                                : "M19 9l-7 7-7-7"}
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                            onClick={() =>
                                                handleSort(
                                                    "stock_quantity"
                                                )
                                            }
                                        >
                                            <div className="flex items-center">
                                                <span>Stock</span>
                                                {filters.sort === "stock_quantity" ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d={filters.direction === "asc"
                                                                ? "M5 15l7-7 7 7"
                                                                : "M19 9l-7 7-7-7"}
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12 relative">
                                                        {(() => {
                                                            // For external URLs (like Unsplash), use them directly
                                                            if (product.image_url) {
                                                                return (
                                                                    <>
                                                                        <img
                                                                            key={`product-image-${product.id}-${cacheTimestamp}`}
                                                                            src={product.image_url.includes('?') ?
                                                                                `${product.image_url}&t=${cacheTimestamp}` :
                                                                                `${product.image_url}?t=${cacheTimestamp}`}
                                                                            alt={product.name}
                                                                            className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600 shadow-sm"
                                                                            onError={(e) => {
                                                                                // Replace with a div on error
                                                                                const parent = e.target.parentNode;
                                                                                if (parent) {
                                                                                    const div = document.createElement('div');
                                                                                    div.className = "h-12 w-12 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 border border-gray-200 dark:border-gray-600 shadow-sm";
                                                                                    div.innerHTML = `<span class="text-indigo-700 dark:text-indigo-300 font-bold text-lg">${product.name.charAt(0).toUpperCase()}</span>`;
                                                                                    parent.replaceChild(div, e.target);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </>
                                                                );
                                                            }

                                                            // For missing images, use a div with the first letter
                                                            return (
                                                                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 border border-gray-200 dark:border-gray-600 shadow-sm">
                                                                    <span className="text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                                                                        {product.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {product.name}
                                                        </div>
                                                        <div className="flex items-center mt-1 space-x-2">
                                                            <CategoryBadge
                                                                category={product.category}
                                                                color="gray"
                                                                size="xs"
                                                            />
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {product.unit_type === 'kg' ? 'By Kilogram' : 'By Piece'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ₱{product.price !== null && product.price !== undefined
                                                        ? typeof product.price === "number"
                                                            ? product.price.toFixed(2)
                                                            : parseFloat(product.price || 0).toFixed(2)
                                                        : "0.00"}
                                                    {product.unit_type === 'kg' ? '/kg' : '/piece'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-20 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                        value={editingStock[product.id] ?? product.stock_quantity}
                                                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                                                    />
                                                    <span
                                                        className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            product.stock_quantity === 0
                                                                ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                                                : product.stock_quantity <= 10
                                                                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                                                : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                                        }`}
                                                    >
                                                        {product.stock_quantity === 0
                                                            ? "Out of Stock"
                                                            : product.stock_quantity <= 10
                                                            ? "Low Stock"
                                                            : "In Stock"}
                                                        {product.unit_type === 'kg' ? ' (kg)' : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        product.is_available
                                                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                                    }`}
                                                >
                                                    {product.is_available ? "Available" : "Unavailable"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route("admin.products.edit", product.id)}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 mr-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => confirmDelete(product)}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

            {/* Batch Update Button */}
            {Object.keys(editingStock).length > 0 && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={saveStockUpdates}
                        disabled={processing}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Stock Changes
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Pagination */}
            {products.links && products.links.length > 3 && (
                <div className="mt-6">
                    <nav className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 sm:px-0 py-3">
                        <div className="hidden sm:block">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{products.from}</span> to <span className="font-medium">{products.to}</span> of{' '}
                                <span className="font-medium">{products.total}</span> products
                            </p>
                        </div>
                        <div className="flex-1 flex justify-between sm:justify-end">
                            {products.prev_page_url && (
                                <Link
                                    href={products.prev_page_url}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Previous
                                </Link>
                            )}
                            {products.next_page_url && (
                                <Link
                                    href={products.next_page_url}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-full p-2">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white ml-3">
                                Confirm Deletion
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete the product "<span className="font-semibold text-gray-800 dark:text-gray-200">{deleteConfirmation.name}</span>"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
