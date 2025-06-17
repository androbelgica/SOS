import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import FlashMessage from "@/Components/FlashMessage";
import DarkModeToggle from "@/Components/DarkModeToggle";
import NotificationDropdown from "@/Components/NotificationDropdown";
import { useDarkMode } from "@/Contexts/DarkModeContext";

export default function MainLayout({ auth, children, title = "SeaBasket Seafood Store" }) {
    const { darkMode } = useDarkMode();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Get cart count from shared props
    const { cartCount } = usePage().props;

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [usePage().url]);

    // Helper to get the correct products route based on role
    const getProductsRoute = () => {
        if (auth?.user?.role === "admin") {
            return route("admin.products.index");
        }
        return route("products.index");
    };

    // Helper to get the correct recipes route based on role
    const getRecipesRoute = () => {
        if (auth?.user?.role === "admin") {
            return route("admin.recipes.index");
        }
        return route("recipes.index");
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <FlashMessage />
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/" className="flex items-center">
                                    <img
                                        src="/storage/brand/seabasket.png"
                                        alt="SeaBasket"
                                        className="h-12 w-auto"
                                        onError={(e) => {
                                            console.error("Failed to load logo image");
                                            // Try with a different path as fallback
                                            e.target.src = "/brand/seabasket.png";
                                            // If that fails too, use a text fallback
                                            e.target.onerror = () => {
                                                e.target.style.display = "none";
                                            };
                                        }}
                                    />
                                    <span className="ml-2 text-xl font-bold text-blue-600 dark:text-blue-400">
                                        SeaBasket Online Seafood Store
                                    </span>
                                </Link>
                            </div>
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link
                                    href={getProductsRoute()}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-700 dark:focus:text-gray-100 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                                >
                                    Products
                                </Link>
                                <Link
                                    href={getRecipesRoute()}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-700 dark:focus:text-gray-100 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                                >
                                    Recipes
                                </Link>
                                {auth?.user && auth.user.role !== "admin" && (
                                    <Link
                                        href={route("user.recipes.index")}
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-700 dark:focus:text-gray-100 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                                    >
                                        My Recipes
                                    </Link>
                                )}
                                {auth?.user && (
                                    <Link
                                        href={route("product-recognition.create")}
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-700 dark:focus:text-gray-100 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                                    >
                                        🔍 Recognize
                                    </Link>
                                )}
                                {auth?.user && auth.user.role !== "admin" && (
                                    <Link
                                        href={route("orders.index")}
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-700 dark:focus:text-gray-100 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                                    >
                                        Orders
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            {auth?.user ? (
                                <div className="ml-3 relative flex items-center space-x-4">
                                    {/* Notification Dropdown */}
                                    <NotificationDropdown auth={auth} />
                                    {auth.user.role === "admin" && (
                                        <Link
                                            href={route("admin.dashboard")}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none transition-all duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Admin Dashboard
                                        </Link>
                                    )}

                                    {auth.user.role !== "admin" && (
                                        <Link
                                            href={route("cart.index")}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none transition-all duration-200 relative"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            Cart
                                            {cartCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </Link>
                                    )}

                                    <div className="relative">
                                        <button
                                            onClick={() =>
                                                setDropdownOpen(!dropdownOpen)
                                            }
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200"
                                        >
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">
                                                    {auth.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="ml-2">{auth.user.name}</span>
                                            </div>
                                            <svg
                                                className="ml-2 -mr-0.5 h-4 w-4"
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
                                        </button>

                                        <Transition
                                            show={dropdownOpen}
                                            enter="transition ease-out duration-200"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                                                <Link
                                                    href={route("dashboard")}
                                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 group"
                                                >
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                        Dashboard
                                                    </div>
                                                </Link>
                                                {auth.user.role !== "admin" && (
                                                    <Link
                                                        href={route("user.recipes.index")}
                                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 group"
                                                    >
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                            </svg>
                                                            My Recipes
                                                        </div>
                                                    </Link>
                                                )}
                                                <Link
                                                    href={route("profile.edit")}
                                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 group"
                                                >
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Profile
                                                    </div>
                                                </Link>
                                                <DarkModeToggle />
                                                <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                                <Link
                                                    href={route("logout")}
                                                    method="post"
                                                    as="button"
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 group"
                                                >
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Log Out
                                                    </div>
                                                </Link>
                                            </div>
                                        </Transition>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-x-4">
                                    <Link
                                        href={route("login")}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-500 dark:focus:text-gray-100 transition duration-150 ease-in-out"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !mobileMenuOpen
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            mobileMenuOpen
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className={`${
                        mobileMenuOpen ? "block" : "hidden"
                    } sm:hidden`}
                >
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            href={getProductsRoute()}
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-800 dark:focus:text-gray-100 focus:bg-gray-50 dark:focus:bg-gray-700 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                        >
                            Products
                        </Link>
                        <Link
                            href={getRecipesRoute()}
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-800 dark:focus:text-gray-100 focus:bg-gray-50 dark:focus:bg-gray-700 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                        >
                            Recipes
                        </Link>
                        {auth?.user && auth.user.role !== "admin" && (
                            <Link
                                href={route("user.recipes.index")}
                                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-800 dark:focus:text-gray-100 focus:bg-gray-50 dark:focus:bg-gray-700 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                            >
                                My Recipes
                            </Link>
                        )}
                        {auth?.user && (
                            <Link
                                href={route("product-recognition.create")}
                                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-800 dark:focus:text-gray-100 focus:bg-gray-50 dark:focus:bg-gray-700 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                            >
                                🔍 Recognize Product
                            </Link>
                        )}
                        {auth?.user && auth.user.role !== "admin" && (
                            <Link
                                href={route("orders.index")}
                                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-800 dark:focus:text-gray-100 focus:bg-gray-50 dark:focus:bg-gray-700 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                            >
                                Orders
                            </Link>
                        )}
                    </div>

                    {auth?.user ? (
                        <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-700">
                            <div className="px-4">
                                <div className="font-medium text-base text-gray-800 dark:text-gray-200">
                                    {auth.user.name}
                                </div>
                                <div className="font-medium text-sm text-gray-500 dark:text-gray-400">
                                    {auth.user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <Link
                                    href={route("dashboard")}
                                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                                >
                                    Dashboard
                                </Link>
                                {auth.user.role !== "admin" && (
                                    <Link
                                        href={route("user.recipes.index")}
                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                                    >
                                        My Recipes
                                    </Link>
                                )}
                                {auth.user.role !== "admin" && (
                                    <Link
                                        href={route("cart.index")}
                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out relative"
                                    >
                                        <div className="flex items-center">
                                            Cart
                                            {cartCount > 0 && (
                                                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                )}
                                <Link
                                    href={route("profile.edit")}
                                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                                >
                                    Profile
                                </Link>
                                <div className="block pl-3 pr-4 py-2 border-l-4 border-transparent">
                                    <DarkModeToggle className="w-full text-left pl-0 py-0" />
                                </div>
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
                                >
                                    Log Out
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-700">
                            <div className="space-y-1">
                                <Link
                                    href={route("login")}
                                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-800 dark:focus:text-gray-100 focus:bg-gray-50 dark:focus:bg-gray-700 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:text-gray-800 dark:focus:text-gray-100 focus:bg-gray-50 dark:focus:bg-gray-700 focus:border-gray-300 dark:focus:border-gray-500 transition duration-150 ease-in-out"
                                >
                                    Register
                                </Link>
                                <div className="block pl-3 pr-4 py-2 border-l-4 border-transparent">
                                    <DarkModeToggle className="w-full text-left pl-0 py-0" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

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
    );
}
