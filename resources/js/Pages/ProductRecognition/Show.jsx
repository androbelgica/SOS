import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    SparklesIcon, 
    ArrowLeftIcon, 
    EyeIcon, 
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, recognition }) {
    const Layout = auth.user.role === 'admin' ? AdminLayout : MainLayout;
    const isAdmin = auth.user.role === 'admin';

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this recognition record?')) {
            router.delete(route('admin.product-recognition.destroy', recognition.id), {
                onSuccess: () => {
                    router.visit(route(isAdmin ? 'admin.product-recognition.index' : 'my-recognitions.index'));
                }
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
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

    const viewProduct = (productId) => {
        router.visit(route('products.show', productId));
    };

    return (
        <Layout auth={auth}>
            <Head title="Recognition Details" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Link
                                        href={route(isAdmin ? 'admin.product-recognition.index' : 'my-recognitions.index')}
                                        className="mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <ArrowLeftIcon className="h-6 w-6" />
                                    </Link>
                                    <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Recognition Details
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Detailed analysis results and product suggestions
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleDelete}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <TrashIcon className="h-5 w-5 mr-2" />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Recognition Status */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center">
                                        {recognition.seafood_detected ? (
                                            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                                        ) : (
                                            <XCircleIcon className="h-8 w-8 text-yellow-600 mr-3" />
                                        )}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {recognition.seafood_detected ? 'Seafood Detected' : 'No Seafood Detected'}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Overall Confidence: {recognition.confidence_score}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                                            <ClockIcon className="h-4 w-4 mr-1" />
                                            <span className="text-sm">{formatDate(recognition.created_at)}</span>
                                        </div>
                                        {isAdmin && recognition.user && (
                                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                <UserIcon className="h-4 w-4 mr-1" />
                                                <span className="text-sm">{recognition.user.name}</span>
                                            </div>
                                        )}
                                        {recognition.is_mock_data && (
                                            <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs mt-1">
                                                Demo Data
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Image Display */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Analyzed Image
                                    </h3>
                                    {recognition.image_path ? (
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                                            <img
                                                src={`/storage/${recognition.image_path}`}
                                                alt="Analyzed image"
                                                className="w-full max-h-96 object-contain rounded-lg"
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Image not available
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Analysis Results */}
                                <div className="space-y-6">
                                    {/* Detected Labels */}
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            Detected Labels
                                        </h3>
                                        {recognition.detected_labels && recognition.detected_labels.length > 0 ? (
                                            <div className="space-y-3">
                                                {recognition.detected_labels.map((label, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                    >
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {label.description}
                                                        </span>
                                                        <span className={`font-bold ${getConfidenceColor(label.confidence)}`}>
                                                            {label.confidence}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                No labels detected
                                            </p>
                                        )}
                                    </div>

                                    {/* Detected Objects */}
                                    {recognition.detected_objects && recognition.detected_objects.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                                Detected Objects
                                            </h3>
                                            <div className="space-y-3">
                                                {recognition.detected_objects.map((object, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                    >
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {object.name}
                                                        </span>
                                                        <span className={`font-bold ${getConfidenceColor(object.confidence)}`}>
                                                            {object.confidence}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Detected Text */}
                                    {recognition.detected_text && recognition.detected_text.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                                Detected Text
                                            </h3>
                                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                {recognition.detected_text.map((text, index) => (
                                                    <p key={index} className="text-gray-900 dark:text-white mb-2 last:mb-0">
                                                        {text}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Suggested Products */}
                            {recognition.suggested_products && recognition.suggested_products.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Suggested Products
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recognition.suggested_products.map((product, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                            ₱{product.price}
                                                        </p>
                                                    </div>
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                                                        {product.confidence}% match
                                                    </span>
                                                </div>
                                                
                                                {product.description && (
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                )}

                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Match: {product.match_term}
                                                    </span>
                                                    <button
                                                        onClick={() => viewProduct(product.id)}
                                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                                    >
                                                        <EyeIcon className="h-4 w-4 mr-1" />
                                                        View Product
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes Section */}
                            {recognition.notes && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Notes
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <p className="text-gray-900 dark:text-white">
                                            {recognition.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
