import React, { useState, useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { getImageProps } from "@/Utils/imageHelpers";
import MainLayout from "@/Layouts/MainLayout";

export default function ProductShow({ product, relatedRecipes, auth, timestamp }) {
    // Use the timestamp from the server for cache busting, or fall back to client timestamp
    const [clientTimestamp, setClientTimestamp] = useState(Date.now());
    const cacheTimestamp = timestamp || clientTimestamp;

    // Update client timestamp when component mounts or product changes
    useEffect(() => {
        setClientTimestamp(Date.now());

        // Log the image URL for debugging
        if (product.image_url) {
            console.log(`Product image URL: ${product.image_url}`);

            // Preload the image to check if it loads correctly
            const img = new Image();
            img.onload = () => console.log(`✅ Product image loaded successfully`);
            img.onerror = (e) => console.error(`❌ Failed to load product image: ${product.image_url}`, e);
            img.src = product.image_url;
        }
    }, [product]);

    const { data, setData, post, processing } = useForm({
        quantity: product.unit_type === 'kg' ? 250 : 1,
    });

    const incrementQuantity = () => {
        if (product.unit_type === 'kg') {
            // Increment by 250 grams for weight-based products
            const newQuantity = data.quantity + 250;
            // Ensure we don't exceed the maximum stock (converted to grams)
            const maxQuantity = product.stock_quantity * 1000;
            setData("quantity", Math.min(newQuantity, maxQuantity));
        } else {
            // Increment by 1 for piece-based products
            const newQuantity = data.quantity + 1;
            setData("quantity", Math.min(newQuantity, product.stock_quantity));
        }
    };

    const decrementQuantity = () => {
        if (product.unit_type === 'kg') {
            // Decrement by 250 grams for weight-based products
            const newQuantity = data.quantity - 250;
            // Ensure minimum quantity is 250 grams
            setData("quantity", Math.max(250, newQuantity));
        } else {
            // Decrement by 1 for piece-based products
            const newQuantity = data.quantity - 1;
            setData("quantity", Math.max(1, newQuantity));
        }
    };

    const addToCart = (e) => {
        e.preventDefault();
        post(route("cart.add", product.id));
    };

    return (
        <MainLayout auth={auth} title={product.name}>
            <Head title={product.name + " - Seafood Online Store"} />

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                                key={`product-image-${product.id}-${cacheTimestamp}`}
                                {...getImageProps({
                                    src: product.image_url,
                                    alt: product.name,
                                    className: "w-full h-72 object-cover",
                                    type: "product",
                                    timestamp: cacheTimestamp,
                                    onLoad: () => console.log(`✓ Product image displayed in show view`)
                                })}
                            />
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
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {product.name}
                        </h1>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                            {product.description}
                        </p>
                        <div className="mt-4 flex items-center">
                            <span className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                                ₱{product.price !== null && product.price !== undefined
                                    ? typeof product.price === "number"
                                        ? product.price.toFixed(2)
                                        : parseFloat(product.price || 0).toFixed(2)
                                    : "0.00"}
                                {product.unit_type === 'kg' ? '/kg' : '/piece'}
                            </span>
                            {product.is_available ? (
                                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Available
                                </span>
                            ) : (
                                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                    Not Available
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Stock: {product.stock_quantity} {product.unit_type === 'kg' ? 'kg' : 'pieces'}
                        </p>

                        {product.is_available && product.stock_quantity > 0 && (
                            <form
                                onSubmit={addToCart}
                                className="mt-6 flex items-center gap-2"
                            >
                                {product.unit_type === 'kg' ? (
                                    <div className="flex items-center border rounded dark:border-gray-600">
                                        <button
                                            type="button"
                                            className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={decrementQuantity}
                                        >
                                            -
                                        </button>
                                        <div className="w-20 px-2 py-1 text-center border-x dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                            {data.quantity}
                                        </div>
                                        <button
                                            type="button"
                                            className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={incrementQuantity}
                                        >
                                            +
                                        </button>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                            g
                                        </span>
                                    </div>
                                ) : (
                                    <div className="relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            min="1"
                                            max={product.stock_quantity}
                                            value={data.quantity}
                                            onChange={(e) => setData("quantity", e.target.value)}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-20 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                                        />
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Add to Cart
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Related Recipes */}
                {relatedRecipes && relatedRecipes.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Recipes Using This Product
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedRecipes.map((recipe) => (
                                <Link
                                    key={recipe.id}
                                    href={route("recipes.show", recipe.id)}
                                    className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700 group"
                                >
                                    <div className="relative">
                                        <img
                                            key={`recipe-image-${recipe.id}-${cacheTimestamp}`}
                                            {...getImageProps({
                                                src: recipe.image_url,
                                                alt: recipe.title,
                                                className: "w-full h-40 object-cover group-hover:opacity-90 transition-opacity",
                                                type: "recipe",
                                                timestamp: cacheTimestamp
                                            })}
                                        />
                                        {recipe.reviews_avg_rating && (
                                            <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 flex items-center shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {parseFloat(recipe.reviews_avg_rating).toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 dark:text-white text-lg">
                                            {recipe.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                            {recipe.description}
                                        </p>
                                        <div className="mt-4 flex justify-end">
                                            <span className="inline-flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                                View Recipe
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
