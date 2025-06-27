import React, { useEffect, useRef } from "react";
import { Head } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";

export default function FeaturedProducts({ featuredProducts }) {
    const carouselRef = useRef(null);

    useEffect(() => {
        // Simple auto-scroll carousel effect
        const carousel = carouselRef.current;
        if (!carousel) return;
        let interval;
        if (featuredProducts.length > 1) {
            let scrollAmount = 0;
            interval = setInterval(() => {
                if (carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth) {
                    carousel.scrollTo({ left: 0, behavior: 'smooth' });
                    scrollAmount = 0;
                } else {
                    scrollAmount += carousel.offsetWidth;
                    carousel.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                }
            }, 3500);
        }
        return () => clearInterval(interval);
    }, [featuredProducts]);

    return (
        <MainLayout>
            <Head title="Featured Products" />
            <div className="max-w-5xl mx-auto py-8">
                <h2 className="text-2xl font-bold mb-6 text-center animate-fade-in">
                    Featured Products
                </h2>
                <div
                    ref={carouselRef}
                    className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {featuredProducts.length === 0 && (
                        <div className="w-full text-center text-gray-500 animate-fade-in">
                            No featured products at this time.
                        </div>
                    )}
                    {featuredProducts.map((product, idx) => (
                        <div
                            key={product.id}
                            className="min-w-[280px] max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center transform transition duration-500 hover:scale-105 hover:shadow-xl animate-fade-in snap-center"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-32 w-32 object-cover rounded mb-4 border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-110"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/placeholder.png";
                                }}
                            />
                            <h3 className="text-lg font-semibold mb-2 text-center">
                                {product.name}
                            </h3>
                            <div className="text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                                ₱{parseFloat(product.price).toFixed(2)}
                            </div>
                            <a
                                href={`/products/${product.id}`}
                                className="mt-auto inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-transform duration-300 hover:scale-105 shadow-md"
                            >
                                View Details
                            </a>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .animate-fade-in {
                    opacity: 0;
                    animation: fadeIn 0.7s forwards;
                }
                @keyframes fadeIn {
                    to { opacity: 1; }
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </MainLayout>
    );
}
