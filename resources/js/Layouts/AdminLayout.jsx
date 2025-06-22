import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import FlashMessage from "@/Components/FlashMessage";
import DarkModeToggle from "@/Components/DarkModeToggle";
import NotificationDropdown from "@/Components/NotificationDropdown";
import { useDarkMode } from "@/Contexts/DarkModeContext";

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { darkMode } = useDarkMode();

    // Safe route helper that handles errors
    const safeRoute = (routeName, params = {}) => {
        try {
            return route(routeName, params);
        } catch (error) {
            console.error(`Route error for ${routeName}:`, error);
            return "#";
        }
    };

    // Close sidebar on mobile when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [usePage().url]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <FlashMessage />

            {/* Top Navigation */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and mobile menu button */}
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                                >
                                    <span className="sr-only">
                                        Open sidebar menu
                                    </span>
                                    <svg
                                        className="h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>

                                {/* Logo */}
                                <Link
                                    href="/"
                                    className="flex items-center ml-3 lg:ml-0"
                                >
                                    <img
                                        src="/storage/brand/C&C_image.png"
                                        alt="Cart & Cook"
                                        className="h-10 w-auto"
                                        onError={(e) => {
                                            e.target.src =
                                                "/brand/C&C_image.png";
                                            e.target.onerror = () => {
                                                e.target.style.display = "none";
                                            };
                                        }}
                                    />
                                    <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                                        Cart & Cook
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* User dropdown */}
                        <div className="flex items-center space-x-4">
                            {/* Notification Dropdown */}
                            <NotificationDropdown auth={auth} />

                            <div className="ml-3 relative">
                                <div>
                                    <button
                                        onClick={() =>
                                            setDropdownOpen(!dropdownOpen)
                                        }
                                        className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <span className="sr-only">
                                            Open user menu
                                        </span>
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                                {auth.user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="ml-2 text-gray-700 dark:text-gray-300 hidden sm:block">
                                                {auth.user.name}
                                            </span>
                                            <svg
                                                className="ml-2 h-5 w-5 text-gray-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </button>
                                </div>

                                <Transition
                                    show={dropdownOpen}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                                        <Link
                                            href={safeRoute("profile.edit")}
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Your Profile
                                        </Link>
                                        <Link
                                            href="/"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            View Store
                                        </Link>
                                        <DarkModeToggle />
                                        <button
                                            onClick={() => {
                                                try {
                                                    router.post(
                                                        route("logout")
                                                    );
                                                } catch (error) {
                                                    console.error(
                                                        "Logout error:",
                                                        error
                                                    );
                                                    // Fallback to window location
                                                    window.location.href =
                                                        "/logout";
                                                }
                                            }}
                                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <div className="lg:flex">
                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar */}
                <div
                    className={`fixed inset-y-0 left-0 pt-16 flex flex-col flex-shrink-0 w-64 transition-all duration-300 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }`}
                >
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            <Link
                                href={safeRoute("admin.dashboard")}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    route().current("admin.dashboard")
                                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-6 w-6 ${
                                        route().current("admin.dashboard")
                                            ? "text-indigo-500 dark:text-indigo-400"
                                            : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                Dashboard
                            </Link>

                            <Link
                                href={safeRoute("admin.products.index")}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    route().current("admin.products.*")
                                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-6 w-6 ${
                                        route().current("admin.products.*")
                                            ? "text-indigo-500 dark:text-indigo-400"
                                            : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
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
                                Products
                            </Link>

                            <Link
                                href={safeRoute("admin.recipes.index")}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    route().current("admin.recipes.*")
                                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-6 w-6 ${
                                        route().current("admin.recipes.*")
                                            ? "text-indigo-500 dark:text-indigo-400"
                                            : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
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
                                Recipes
                            </Link>

                            <Link
                                href={safeRoute("admin.orders.index")}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    route().current("admin.orders.*")
                                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-6 w-6 ${
                                        route().current("admin.orders.*")
                                            ? "text-indigo-500 dark:text-indigo-400"
                                            : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
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
                                Orders
                            </Link>

                            <Link
                                href={safeRoute("admin.delivery-staff.index")}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    route().current("admin.delivery-staff.*")
                                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-6 w-6 ${
                                        route().current(
                                            "admin.delivery-staff.*"
                                        )
                                            ? "text-indigo-500 dark:text-indigo-400"
                                            : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                                Delivery Staff Management
                            </Link>

                            <span
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-not-allowed opacity-50 ${
                                    route().current(
                                        "admin.product-recognition.*"
                                    )
                                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                                        : "text-gray-600 dark:text-gray-300"
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-6 w-6 ${
                                        route().current(
                                            "admin.product-recognition.*"
                                        )
                                            ? "text-indigo-500 dark:text-indigo-400"
                                            : "text-gray-400 dark:text-gray-400"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                                Product Recognition
                            </span>
                        </nav>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 lg:pl-64 pt-16">
                    <main className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Page header */}
                            <div className="pb-5 border-b border-gray-200 dark:border-gray-700 mb-5 flex justify-between items-center">
                                <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                                    {title}
                                </h1>
                            </div>

                            {/* Page content */}
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
