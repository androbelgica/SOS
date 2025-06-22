import React from "react";
import { Link, usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import DarkModeToggle from "@/Components/DarkModeToggle";
import NotificationDropdown from "@/Components/NotificationDropdown";

const DeliveryLayout = ({ children }) => {
    const user = usePage().props.auth?.user;
    const auth = usePage().props.auth;
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 border-b mb-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between py-4 px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <img
                                src="/storage/brand/C&C_image.png"
                                alt="Cart & Cook"
                                className="h-12 w-auto"
                                onError={(e) => {
                                    console.error("Failed to load logo image");
                                    // Try with a different path as fallback
                                    e.target.src = "/brand/C&C_image.png";
                                    // If that fails too, use a text fallback
                                    e.target.onerror = () => {
                                        e.target.style.display = "none";
                                    };
                                }}
                            />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-xl font-bold text-blue-600 dark:text-blue-300 hover:underline"
                        >
                            Delivery Dashboard
                        </Link>
                    </div>
                    <div className="flex gap-2 items-center">
                        <NotificationDropdown auth={auth} />
                        <DarkModeToggle className="mr-2" />
                        <span className="text-gray-700 dark:text-gray-200 text-sm">
                            {user?.name} ({user?.email})
                        </span>
                        <Link
                            href={route("profile.edit")}
                            className="text-blue-600 dark:text-blue-400 hover:underline ml-4"
                        >
                            Profile
                        </Link>
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="text-red-600 dark:text-red-400 hover:underline ml-2"
                        >
                            Log Out
                        </Link>
                    </div>
                </div>
            </header>
            <main className="max-w-3xl mx-auto p-4">{children}</main>
        </div>
    );
};

export default DeliveryLayout;
