import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function UserRecipeShow({ auth, recipe }) {
    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Submitted',
            under_review: 'Under Review',
            approved: 'Approved',
            rejected: 'Rejected'
        };
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const handleSubmitForReview = () => {
        if (confirm('Are you sure you want to submit this recipe for admin review?')) {
            router.post(route('user.recipes.submit', recipe.id));
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
            router.delete(route('user.recipes.destroy', recipe.id));
        }
    };

    return (
        <MainLayout auth={auth}>
            <Head title={`${recipe.title} - My Recipe`} />
            
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{recipe.title}</h1>
                                        {getStatusBadge(recipe.status)}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg">{recipe.description}</p>
                                </div>
                                <div className="flex gap-3 ml-6">
                                    <Link
                                        href={route('user.recipes.index')}
                                        className="bg-gray-500 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Back to My Recipes
                                    </Link>
                                    {(recipe.status === 'draft' || recipe.status === 'rejected') && (
                                        <Link
                                            href={route('user.recipes.edit', recipe.id)}
                                            className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                        >
                                            Edit Recipe
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Recipe Meta Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Cooking Time</div>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{recipe.cooking_time} minutes</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Difficulty</div>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{recipe.difficulty_level}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Category</div>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{recipe.category || 'Not specified'}</div>
                                </div>
                            </div>

                            {/* Status-specific Messages */}
                            {recipe.status === 'rejected' && recipe.rejection_reason && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Recipe Rejected</h3>
                                    <p className="text-red-700 dark:text-red-300">
                                        <strong>Reason:</strong> {recipe.rejection_reason}
                                    </p>
                                    <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                                        You can edit this recipe and resubmit it for review.
                                    </p>
                                </div>
                            )}

                            {recipe.status === 'submitted' && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Under Review</h3>
                                    <p className="text-blue-700 dark:text-blue-300">
                                        Your recipe has been submitted for admin review. You'll be notified once it's been reviewed.
                                    </p>
                                </div>
                            )}

                            {recipe.status === 'approved' && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Recipe Approved!</h3>
                                    <p className="text-green-700 dark:text-green-300">
                                        Congratulations! Your recipe has been approved and is now visible to all users.
                                        <Link 
                                            href={route('recipes.show', recipe.id)} 
                                            className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline"
                                        >
                                            View public page
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recipe Content */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            {/* Recipe Image */}
                            {recipe.image_url && (
                                <div className="mb-8">
                                    <img
                                        src={recipe.image_url}
                                        alt={recipe.title}
                                        className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                    />
                                </div>
                            )}

                            {/* Ingredients */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ingredients</h2>
                                <ul className="space-y-2">
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="inline-block w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Instructions</h2>
                                <ol className="space-y-4">
                                    {recipe.instructions.map((instruction, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 dark:bg-blue-600 text-white rounded-full text-sm font-semibold mr-4 flex-shrink-0 mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{instruction}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Video */}
                            {recipe.video_url && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Video</h2>
                                    {recipe.video_url.includes('youtube.com') || recipe.video_url.includes('youtu.be') ? (
                                        <div className="aspect-w-16 aspect-h-9">
                                            <iframe
                                                src={recipe.video_url.replace('watch?v=', 'embed/')}
                                                title="Recipe Video"
                                                className="w-full h-64 rounded-lg"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <video
                                            src={recipe.video_url}
                                            controls
                                            className="w-full h-64 rounded-lg bg-gray-100 dark:bg-gray-700"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                </div>
                            )}

                            {/* Related Products */}
                            {recipe.products && recipe.products.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Related Products</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recipe.products.map((product) => (
                                            <div key={product.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">{product.description}</p>
                                                <p className="text-blue-600 dark:text-blue-400 font-semibold mt-2">${product.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-4">
                        {recipe.status === 'draft' && (
                            <>
                                <button
                                    onClick={handleSubmitForReview}
                                    className="bg-green-500 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors duration-200"
                                >
                                    Submit for Review
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors duration-200"
                                >
                                    Delete Recipe
                                </button>
                            </>
                        )}
                        
                        {recipe.status === 'rejected' && (
                            <button
                                onClick={handleSubmitForReview}
                                className="bg-green-500 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors duration-200"
                            >
                                Resubmit for Review
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
