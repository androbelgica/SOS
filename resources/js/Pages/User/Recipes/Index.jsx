import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function UserRecipesIndex({ auth, recipes, stats }) {
    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-blue-100 text-blue-800',
            under_review: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Submitted',
            under_review: 'Under Review',
            approved: 'Approved',
            rejected: 'Rejected'
        };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const handleDelete = (recipe) => {
        if (confirm('Are you sure you want to delete this recipe?')) {
            router.delete(route('user.recipes.destroy', recipe.id));
        }
    };

    return (
        <MainLayout auth={auth}>
            <Head title="My Recipes" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Recipes</h1>
                                    <p className="text-gray-600 dark:text-gray-300">Manage your recipe submissions</p>
                                </div>
                                <Link
                                    href={route('user.recipes.create')}
                                    className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                >
                                    Create New Recipe
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Recipes</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.drafts}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Drafts</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
                            </div>
                        </div>
                    </div>

                    {/* Recipes Grid */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            {recipes.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">No recipes found</div>
                                    <Link
                                        href={route('user.recipes.create')}
                                        className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Create Your First Recipe
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recipes.data.map((recipe) => (
                                        <div key={recipe.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                                            {recipe.image_url && (
                                                <img
                                                    src={recipe.image_url}
                                                    alt={recipe.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                        {recipe.title}
                                                    </h3>
                                                    {getStatusBadge(recipe.status)}
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                                    {recipe.description}
                                                </p>
                                                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                    <span>{recipe.cooking_time} mins</span>
                                                    <span className="capitalize">{recipe.difficulty_level}</span>
                                                    <span>{recipe.comments_count} comments</span>
                                                </div>

                                                {recipe.status === 'rejected' && recipe.rejection_reason && (
                                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
                                                        <p className="text-red-800 dark:text-red-300 text-sm">
                                                            <strong>Rejection Reason:</strong> {recipe.rejection_reason}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <Link
                                                        href={route('user.recipes.show', recipe.id)}
                                                        className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-center py-2 px-3 rounded text-sm transition-colors duration-200"
                                                    >
                                                        View
                                                    </Link>
                                                    {(recipe.status === 'draft' || recipe.status === 'rejected') && (
                                                        <Link
                                                            href={route('user.recipes.edit', recipe.id)}
                                                            className="flex-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-center py-2 px-3 rounded text-sm transition-colors duration-200"
                                                        >
                                                            Edit
                                                        </Link>
                                                    )}
                                                    {recipe.status === 'draft' && (
                                                        <button
                                                            onClick={() => handleDelete(recipe)}
                                                            className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 py-2 px-3 rounded text-sm transition-colors duration-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Pagination */}
                            {recipes.links && recipes.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {recipes.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-2 text-sm rounded transition-colors duration-200 ${
                                                    link.active
                                                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
