import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { getImageProps } from "@/Utils/imageHelpers";
import CategoryFilter from "@/Components/CategoryFilter";
import CategoryBadge from "@/Components/CategoryBadge";

export default function Index({ auth, products, filters, categories }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || "");

    // Handle search input change
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Debounced search - could use a proper debounce function in production
        setTimeout(() => {
            router.get(
                route("products.index"),
                { ...filters, search: query },
                { preserveState: true }
            );
        }, 300);
    };

    return (
        <MainLayout auth={auth} title="Fresh Grocery Products">
            <Head title="Products - Online Grocery Store" />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Fresh Grocery Products
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Discover our premium selection of fresh groceries, from seafood and meat to vegetables and fruits.
                </p>
            </div>

            {/* Category Filter Pills */}
            {categories && categories.length > 0 && (
                <div className="mb-6">
                    <CategoryFilter
                        categories={categories}
                        currentCategory={filters.category || ''}
                        routeName="products.index"
                        filters={filters}
                        layout="pills"
                        showIcons={true}
                    />
                </div>
            )}

            {/* Search and filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Search Products
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                                placeholder="Search by name or description..."
                            />
                        </div>
                    </div>

                    {categories && categories.length > 0 && (
                        <CategoryFilter
                            categories={categories}
                            currentCategory={filters.category || ''}
                            routeName="products.index"
                            filters={filters}
                            layout="dropdown"
                            showIcons={true}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.data &&
                    products.data.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-200 dark:border-gray-700"
                        >
                            <div className="relative">
                                {product.image_url && (
                                    <img
                                        {...getImageProps({
                                            src: product.image_url,
                                            alt: product.name,
                                            className: "w-full h-48 object-cover",
                                            type: "product"
                                        })}
                                    />
                                )}
                                <div className="absolute top-2 right-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            product.stock_quantity > 10
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : product.stock_quantity > 0
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        }`}
                                    >
                                        {product.stock_quantity > 10
                                            ? "In Stock"
                                            : product.stock_quantity > 0
                                            ? "Low Stock"
                                            : "Out of Stock"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex-1">
                                        {product.name}
                                    </h2>
                                    {product.category && (
                                        <CategoryBadge
                                            category={product.category_display_name || product.category}
                                            icon={product.category_icon}
                                            color={product.category_color}
                                            size="xs"
                                            className="ml-2 flex-shrink-0"
                                        />
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="mt-4">
                                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                        ₱{product.price !== null && product.price !== undefined
                                            ? typeof product.price === "number"
                                                ? product.price.toFixed(2)
                                                : parseFloat(product.price || 0).toFixed(2)
                                            : "0.00"}
                                        {product.unit_type === 'kg' ? '/kg' : '/piece'}
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <Link
                                        href={route("products.show", product.id)}
                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                                    >
                                        <span>View Details</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                    {product.stock_quantity > 0 && (
                                        <Link
                                            href={route("cart.add", product.id)}
                                            method="post"
                                            data={{
                                                quantity: product.unit_type === 'kg' ? 250 : 1,
                                            }}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                            preserveScroll
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Add to Cart
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                            </div>

            {/* Pagination */}
            {products.links && products.links.length > 3 && (
                <div className="mt-6">
                    <div className="flex items-center justify-center gap-1">
                        {products.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-4 py-2 text-sm rounded-md ${
                                    link.active
                                        ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                } ${
                                    !link.url
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
