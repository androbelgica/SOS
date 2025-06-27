import React, { useEffect, useRef } from "react";

export default function FeaturedProducts({ featuredProducts }) {
    const products = Array.isArray(featuredProducts) ? featuredProducts : [];
    const carouselRef = useRef(null);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel || products.length <= 1) return;

        let scrollAmount = 0;
        const interval = setInterval(() => {
            if (carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth) {
                scrollAmount = 0;
                carousel.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                scrollAmount += carousel.offsetWidth;
                carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [products]);

    return (
        <div className="max-w-5xl mx-auto py-8 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center animate-fade-in">
                Featured Products
            </h2>

            <div
                ref={carouselRef}
                className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollBehavior: "smooth" }}
            >
                {products.length === 0 && (
                    <div className="w-full text-center text-white animate-fade-in">
                        No featured products at this time.
                    </div>
                )}

                {products.map((product, idx) => {
                    if (!product || !product.name) return null;

                    return (
                        <div
                            key={product.id}
                            className="min-w-[280px] max-w-xs bg-gray-900 rounded-lg shadow-md p-4 flex flex-col items-center transform transition duration-500 hover:scale-105 hover:shadow-xl animate-fade-in snap-center"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="w-full flex justify-center items-center mb-4">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="max-w-full max-h-40 object-contain rounded border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-110"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/images/placeholder.png";
                                    }}
                                />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-center">
                                {product.name}
                            </h3>
                            <div className="text-indigo-300 font-bold mb-2">
                                ₱{parseFloat(product.price).toFixed(2)}
                            </div>
                            <a
                                href={`/products/${product.id}`}
                                className="mt-auto inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-transform duration-300 hover:scale-105 shadow-md"
                            >
                                View Details
                            </a>
                        </div>
                    );
                })}
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
        </div>
    );
}
