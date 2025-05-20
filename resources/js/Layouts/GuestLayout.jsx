import { Link } from '@inertiajs/react';
import { useDarkMode } from '@/Contexts/DarkModeContext';

export default function GuestLayout({ children }) {
    const { darkMode } = useDarkMode();

    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-6 sm:justify-center sm:pt-0">
            <div className="mt-8 sm:mt-0">
                <Link href="/" className="flex flex-col items-center">
                    <img
                        src="/storage/brand/seabasket.png"
                        alt="SeaBasket"
                        className="h-20 w-auto"
                        onError={(e) => {
                            console.error("Failed to load logo image");
                            // Try with a different path as fallback
                            e.target.src = "/brand/seabasket.png";
                            // If that fails too, use a text fallback
                            e.target.onerror = () => {
                                e.target.style.display = "none";
                                // Add a text fallback if image fails to load
                                const textLogo = document.createElement('span');
                                textLogo.className = "text-3xl font-bold text-blue-600 dark:text-blue-400";
                                textLogo.innerText = "SB";
                                e.target.parentNode.appendChild(textLogo);
                            };
                        }}
                    />
                    <span className="mt-2 text-xl font-bold text-gray-800 dark:text-white">SeaBasket</span>
                </Link>
            </div>

            <div className="mt-8 w-full overflow-hidden bg-white dark:bg-gray-800 px-8 py-8 shadow-xl sm:max-w-md sm:rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200">
                {children}
            </div>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} SeaBasket. All rights reserved.
            </div>
        </div>
    );
}
