import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import MainLayout from "@/Layouts/MainLayout";
import { getImageProps } from "@/Utils/imageHelpers";

// Function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
    // Handle different YouTube URL formats
    let videoId = '';

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be')) {
        videoId = url.split('youtu.be/')[1];
        // Remove any query parameters
        if (videoId.includes('?')) {
            videoId = videoId.split('?')[0];
        }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export default function RecipeShow({ auth, recipe, relatedRecipes }) {
    const [cacheTimestamp, setCacheTimestamp] = useState(Date.now());
    const [showReviewForm, setShowReviewForm] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        rating: 5,
        comment: "",
    });

    const submitReview = (e) => {
        e.preventDefault();
        post(route("recipes.reviews.store", recipe.id), {
            onSuccess: () => {
                reset();
                setShowReviewForm(false);
            },
        });
    };

    return (
        <MainLayout auth={auth} title={recipe.title}>
            <Head title={`${recipe.title} - Seafood Online Store`} />
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg">
                <div className="flex flex-col lg:flex-row">
                    {/* Recipe Image and Video */}
                    <div className="lg:w-1/2">
                        <div className="relative">
                            <img
                                {...getImageProps({
                                    src: recipe.image_url || "/images/recipe-placeholder.jpg",
                                    alt: recipe.title,
                                    className: "h-96 w-full object-cover",
                                    type: "recipe",
                                    timestamp: cacheTimestamp
                                })}
                            />

                            {recipe.video_url && (
                                <div className="absolute bottom-4 right-4">
                                    <button
                                        onClick={() => document.getElementById('recipe-video-modal').showModal()}
                                        className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-full p-3 shadow-lg transition-all duration-200"
                                        title="Watch Recipe Video"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Video Modal */}
                        {recipe.video_url && (
                            <dialog id="recipe-video-modal" className="modal rounded-lg shadow-xl backdrop:bg-gray-900/80 dark:backdrop:bg-gray-900/90">
                                <div className="modal-box bg-white dark:bg-gray-800 p-1 w-11/12 max-w-4xl mx-auto rounded-lg">
                                    <div className="relative">
                                        {recipe.video_url.includes('youtube.com') || recipe.video_url.includes('youtu.be') ? (
                                            // YouTube Embed
                                            <iframe
                                                src={getYouTubeEmbedUrl(recipe.video_url)}
                                                className="w-full aspect-video rounded-lg"
                                                title={`${recipe.title} Video`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        ) : (
                                            // Regular Video
                                            <video
                                                src={`${recipe.video_url}?t=${cacheTimestamp}`}
                                                controls
                                                className="w-full rounded-lg"
                                                autoPlay
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                        <button
                                            onClick={() => document.getElementById('recipe-video-modal').close()}
                                            className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-900/90 text-white rounded-full p-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </dialog>
                        )}
                    </div>

                    {/* Recipe Details */}
                    <div className="lg:w-1/2 p-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {recipe.title}
                        </h1>

                        {/* Rating */}
                        <div className="mt-2 flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                    key={star}
                                    className={`h-5 w-5 ${
                                        star <=
                                        Math.round(
                                            recipe.reviews_avg_rating || 0
                                        )
                                            ? "text-yellow-400"
                                            : "text-gray-300 dark:text-gray-600"
                                    }`}
                                />
                            ))}
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                                ({recipe.reviews?.length || 0} reviews)
                            </span>
                        </div>

                        {/* Description */}
                        <p className="mt-4 text-gray-600 dark:text-gray-300">
                            {recipe.description}
                        </p>

                        {/* Ingredients */}
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Ingredients
                            </h2>
                            <div className="mt-2 grid grid-cols-1 gap-4">
                                {recipe.products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2"
                                    >
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {product.name}
                                        </span>
                                        <Link
                                            href={route(
                                                "products.show",
                                                product.id
                                            )}
                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center"
                                        >
                                            <span>View Product</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Instructions
                            </h2>
                            <div className="mt-2 prose prose-indigo dark:prose-invert dark:text-gray-300">
                                <div className="text-gray-600 dark:text-gray-300">
                                    {recipe.instructions}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Reviews
                        </h2>
                        <button
                            onClick={() =>
                                setShowReviewForm(!showReviewForm)
                            }
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Write a Review
                        </button>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <form onSubmit={submitReview} className="mt-6">
                            <div className="flex items-center mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                            setData("rating", star)
                                        }
                                        className="focus:outline-none"
                                    >
                                        {star <= data.rating ? (
                                            <StarIcon className="h-6 w-6 text-yellow-400" />
                                        ) : (
                                            <StarOutlineIcon className="h-6 w-6 text-gray-300" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={data.comment}
                                onChange={(e) =>
                                    setData("comment", e.target.value)
                                }
                                rows="4"
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Write your review..."
                            ></textarea>
                            <div className="mt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Reviews List */}
                    <div className="mt-6 space-y-6">
                        {recipe.reviews?.length > 0 ? (
                            recipe.reviews.map((review) => (
                                <div key={review.id} className="flex space-x-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">
                                            {review.user.name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {review.user.name}
                                            </span>
                                            <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">
                                                {new Date(
                                                    review.created_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIcon
                                                    key={star}
                                                    className={`h-4 w-4 ${
                                                        star <= review.rating
                                                            ? "text-yellow-400"
                                                            : "text-gray-300 dark:text-gray-600"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this recipe!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Recipes */}
                {relatedRecipes.length > 0 && (
                    <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Related Recipes
                        </h2>
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedRecipes.map((relatedRecipe) => (
                                <Link
                                    key={relatedRecipe.id}
                                    href={route(
                                        "recipes.show",
                                        relatedRecipe.id
                                    )}
                                    className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700 group"
                                >
                                    <div className="relative">
                                        <img
                                            {...getImageProps({
                                                src: relatedRecipe.image_url || "/images/recipe-placeholder.jpg",
                                                alt: relatedRecipe.title,
                                                className: "h-48 w-full object-cover group-hover:opacity-90 transition-opacity",
                                                type: "recipe",
                                                timestamp: cacheTimestamp
                                            })}
                                        />
                                        {relatedRecipe.reviews_avg_rating && (
                                            <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 flex items-center shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {parseFloat(relatedRecipe.reviews_avg_rating).toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 dark:text-white text-lg">
                                            {relatedRecipe.title}
                                        </h3>
                                        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {relatedRecipe.cooking_time} mins
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
