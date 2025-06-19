import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { getImageUrl, getFallbackImage } from "@/Utils/imageHelpers";

export default function Show({ auth, recipe }) {
    return (
        <AdminLayout auth={auth} title={`View Recipe: ${recipe.title}`}>
            <Head title={`View Recipe: ${recipe.title} - Admin Dashboard`} />

            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href={route("admin.recipes.index")}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Recipes
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                {/* Recipe Header */}
                <div className="relative h-64 sm:h-96">
                    <img
                        src={getImageUrl(recipe.image_path) || getFallbackImage()}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = getFallbackImage();
                        }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                        <h1 className="text-3xl font-bold text-white">{recipe.title}</h1>
                    </div>
                </div>

                {/* Recipe Content */}
                <div className="p-6">
                    {/* Recipe Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cooking Time</h3>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                {recipe.cooking_time} minutes
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Difficulty Level</h3>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                {recipe.difficulty_level}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                            <p className={`mt-1 text-lg font-semibold capitalize
                                ${recipe.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                                    recipe.status === 'rejected' ? 'text-red-600 dark:text-red-400' :
                                        recipe.status === 'under_review' ? 'text-yellow-600 dark:text-yellow-400' :
                                            'text-gray-900 dark:text-white'
                                }`}>
                                {recipe.status.replace('_', ' ')}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</h3>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                {recipe.creator ? recipe.creator.name : 'Unknown'}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Description</h2>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                            {recipe.description}
                        </p>
                    </div>

                    {/* Ingredients */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Ingredients</h2>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index} className="mb-2">
                                    {ingredient}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Instructions</h2>
                        <div className="space-y-4">
                            {recipe.instructions.map((instruction, index) => (
                                <div key={index} className="flex">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-full mr-3">
                                        <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 flex-1">
                                        {instruction}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews Section */}
                    {recipe.reviews && recipe.reviews.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Reviews</h2>
                            <div className="space-y-4">
                                {recipe.reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, index) => (
                                                        <svg
                                                            key={index}
                                                            className={`h-5 w-5 ${
                                                                index < review.rating
                                                                    ? "text-yellow-400"
                                                                    : "text-gray-300 dark:text-gray-600"
                                                            }`}
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    {review.user ? review.user.name : 'Anonymous'}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <Link
                            href={route("admin.recipes.edit", recipe.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Recipe
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
