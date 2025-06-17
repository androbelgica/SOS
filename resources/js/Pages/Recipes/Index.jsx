import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { getImageProps } from "@/Utils/imageHelpers";

export default function Index({ auth, recipes }) {
    const [cacheTimestamp, setCacheTimestamp] = useState(Date.now());

    return (
        <MainLayout auth={auth} title="Delicious Seafood Recipes">
            <Head title="Recipes - Seafood Online Store" />

            {/* Header with Create Recipe Button */}
            {auth.user && (
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Share Your Seafood Recipe
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Have a delicious seafood recipe? Share it with our community and help others discover amazing dishes!
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={route('user.recipes.index')}
                                className="inline-flex items-center px-4 py-2 border border-indigo-300 dark:border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                My Recipes
                            </Link>
                            <Link
                                href={route('user.recipes.create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Recipe
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.data && recipes.data.map((recipe) => (
                    <Link
                        key={recipe.id}
                        href={route("recipes.show", recipe.id)}
                        className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700 group"
                    >
                        <div className="relative">
                            <img
                                {...getImageProps({
                                    src: recipe.image_url || "/images/recipes/placeholder.jpg",
                                    alt: recipe.title,
                                    className: "w-full h-48 object-cover group-hover:opacity-90 transition-opacity",
                                    type: "recipe",
                                    timestamp: cacheTimestamp
                                })}
                            />

                            {/* Owner Badge - Top Left */}
                            {auth.user && recipe.creator && recipe.creator.id === auth.user.id && (
                                <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-full px-3 py-1 flex items-center shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-xs font-semibold">My Recipe</span>
                                </div>
                            )}

                            {/* Rating Badge - Top Right */}
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

                            {/* Creator Info */}
                            {recipe.creator && (
                                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>
                                        {auth.user && recipe.creator.id === auth.user.id ? 'You' : `by ${recipe.creator.name}`}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {recipe.cooking_time} mins
                                <span className="mx-2">•</span>
                                <span className="capitalize">{recipe.difficulty_level || 'medium'} difficulty</span>
                            </div>
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

            {/* Pagination */}
            {recipes.links && recipes.links.length > 3 && (
                <div className="mt-6">
                    <div className="flex items-center justify-center gap-1">
                        {recipes.links.map((link, i) => (
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

            {/* Empty State */}
            {(!recipes.data || recipes.data.length === 0) && (
                <div className="text-center py-12">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                    <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                        No recipes found
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        We're working on adding delicious seafood recipes. Check back soon!
                    </p>
                </div>
            )}
        </MainLayout>
    );
}