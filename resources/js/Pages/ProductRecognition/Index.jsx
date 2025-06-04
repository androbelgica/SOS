import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    SparklesIcon, 
    EyeIcon, 
    TrashIcon, 
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, recognitions, canViewAll }) {
    const [deleteId, setDeleteId] = useState(null);

    const Layout = auth.user.role === 'admin' ? AdminLayout : MainLayout;

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this recognition record?')) {
            router.delete(route('admin.product-recognition.destroy', id), {
                onSuccess: () => {
                    setDeleteId(null);
                }
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 80) return 'text-green-600 dark:text-green-400';
        if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <Layout auth={auth}>
            <Head title={canViewAll ? "Product Recognition Management" : "My Recognitions"} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {canViewAll ? 'Product Recognition Management' : 'My Recognition History'}
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {canViewAll 
                                                ? 'View and manage all product recognition records'
                                                : 'View your product recognition history and results'
                                            }
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={route('product-recognition.create')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    New Recognition
                                </Link>
                            </div>

                            {/* Statistics */}
                            {canViewAll && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
                                            <div>
                                                <p className="text-sm text-blue-600 dark:text-blue-400">Total Recognitions</p>
                                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                                    {recognitions.total}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                                            <div>
                                                <p className="text-sm text-green-600 dark:text-green-400">Seafood Detected</p>
                                                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                    {recognitions.data.filter(r => r.seafood_detected).length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <XCircleIcon className="h-8 w-8 text-yellow-600 mr-3" />
                                            <div>
                                                <p className="text-sm text-yellow-600 dark:text-yellow-400">No Seafood</p>
                                                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                                                    {recognitions.data.filter(r => !r.seafood_detected).length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <ClockIcon className="h-8 w-8 text-purple-600 mr-3" />
                                            <div>
                                                <p className="text-sm text-purple-600 dark:text-purple-400">This Month</p>
                                                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                                    {recognitions.data.filter(r => 
                                                        new Date(r.created_at).getMonth() === new Date().getMonth()
                                                    ).length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recognition List */}
                            {recognitions.data.length > 0 ? (
                                <div className="space-y-4">
                                    {recognitions.data.map((recognition) => (
                                        <div
                                            key={recognition.id}
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-3">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium mr-3 ${
                                                            recognition.seafood_detected
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                                        }`}>
                                                            {recognition.seafood_detected ? '🐟 Seafood Detected' : '⚠️ No Seafood'}
                                                        </span>

                                                        {recognition.is_mock_data && (
                                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                                                                Demo Data
                                                            </span>
                                                        )}

                                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                                                            {formatDate(recognition.created_at)}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Detection Results */}
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                                Top Detections
                                                            </h4>
                                                            {recognition.detected_labels && recognition.detected_labels.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {recognition.detected_labels.slice(0, 3).map((label, index) => (
                                                                        <div key={index} className="flex justify-between text-sm">
                                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                                {label.description}
                                                                            </span>
                                                                            <span className={`font-medium ${getConfidenceColor(label.confidence)}`}>
                                                                                {label.confidence}%
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    No labels detected
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Suggested Products */}
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                                Product Suggestions
                                                            </h4>
                                                            {recognition.suggested_products && recognition.suggested_products.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {recognition.suggested_products.slice(0, 2).map((product, index) => (
                                                                        <div key={index} className="text-sm">
                                                                            <p className="text-gray-900 dark:text-white font-medium">
                                                                                {product.name}
                                                                            </p>
                                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                                ₱{product.price}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                    {recognition.suggested_products.length > 2 && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            +{recognition.suggested_products.length - 2} more
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    No suggestions
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* User Info (Admin only) */}
                                                        {canViewAll && (
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                                    User Info
                                                                </h4>
                                                                <div className="text-sm">
                                                                    <p className="text-gray-900 dark:text-white">
                                                                        {recognition.user ? recognition.user.name : 'Unknown User'}
                                                                    </p>
                                                                    <p className="text-gray-600 dark:text-gray-400">
                                                                        Confidence: {recognition.confidence_score}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <Link
                                                        href={route('admin.product-recognition.show', recognition.id)}
                                                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        <EyeIcon className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(recognition.id)}
                                                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                    >
                                                        <TrashIcon className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <SparklesIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Recognition Records
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {canViewAll 
                                            ? 'No users have performed product recognition yet.'
                                            : 'You haven\'t performed any product recognition yet.'
                                        }
                                    </p>
                                    <Link
                                        href={route('product-recognition.create')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Start Recognition
                                    </Link>
                                </div>
                            )}

                            {/* Pagination */}
                            {recognitions.links && recognitions.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {recognitions.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
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
        </Layout>
    );
}
