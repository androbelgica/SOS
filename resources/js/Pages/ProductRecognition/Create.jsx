import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ProductRecognition from '@/Components/ProductRecognition';
import { SparklesIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function Create({ auth }) {
    const [showRecognition, setShowRecognition] = useState(false);
    const [recentRecognitions, setRecentRecognitions] = useState([]);

    const handleRecognitionComplete = (data) => {
        // Add the new recognition to recent recognitions
        setRecentRecognitions(prev => [data.recognition, ...prev.slice(0, 4)]);
        setShowRecognition(false);
    };

    return (
        <MainLayout auth={auth}>
            <Head title="Product Recognition" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center mb-4">
                                    <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Product Recognition
                                    </h1>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    Use AI to identify seafood products and get instant product suggestions from our catalog.
                                </p>
                            </div>

                            {/* Main Action */}
                            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-xl mb-8">
                                <SparklesIcon className="h-20 w-20 mx-auto text-blue-600 mb-6" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Identify Your Seafood
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                                    Take a photo or upload an image of any seafood product. Our AI will analyze it and suggest matching products from our store.
                                </p>
                                <button
                                    onClick={() => setShowRecognition(true)}
                                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                                >
                                    <SparklesIcon className="h-6 w-6 mr-2" />
                                    Start Recognition
                                </button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📸</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Camera & Upload
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Take photos directly or upload existing images from your device
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">🤖</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        AI Recognition
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Advanced AI identifies seafood types with high accuracy
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">🛒</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Product Suggestions
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Get instant suggestions for matching products in our store
                                    </p>
                                </div>
                            </div>

                            {/* Recent Recognitions */}
                            {recentRecognitions.length > 0 && (
                                <div>
                                    <div className="flex items-center mb-4">
                                        <ClockIcon className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-2" />
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Recent Recognitions
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recentRecognitions.map((recognition, index) => (
                                            <div
                                                key={recognition.id || index}
                                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        recognition.seafood_detected
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                                    }`}>
                                                        {recognition.seafood_detected ? 'Seafood Detected' : 'No Seafood'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(recognition.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                
                                                {recognition.detected_labels && recognition.detected_labels.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                            Top Detection:
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {recognition.detected_labels[0].description} ({recognition.detected_labels[0].confidence}%)
                                                        </p>
                                                    </div>
                                                )}

                                                {recognition.suggested_products && recognition.suggested_products.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                            Suggested Products: {recognition.suggested_products.length}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mt-3 flex justify-end">
                                                    <a
                                                        href={route('product-recognition.show', recognition.id)}
                                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        <EyeIcon className="h-3 w-3 mr-1" />
                                                        View Details
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Help Section */}
                            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    Tips for Better Recognition
                                </h3>
                                <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• Ensure good lighting when taking photos</li>
                                    <li>• Keep the seafood clearly visible and in focus</li>
                                    <li>• Avoid cluttered backgrounds</li>
                                    <li>• Take photos from multiple angles for better results</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ProductRecognition
                isOpen={showRecognition}
                onClose={() => setShowRecognition(false)}
                onRecognitionComplete={handleRecognitionComplete}
            />
        </MainLayout>
    );
}
