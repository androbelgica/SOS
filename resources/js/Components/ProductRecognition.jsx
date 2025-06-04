import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CameraIcon, PhotoIcon, EyeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import CameraCapture from './CameraCapture';
import { router } from '@inertiajs/react';

export default function ProductRecognition({ isOpen, onClose, onRecognitionComplete }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setAnalysisResult(null);
            setError(null);
        }
    };

    const handleCameraCapture = (file, previewUrl) => {
        setSelectedImage(file);
        setImagePreview(previewUrl);
        setShowCamera(false);
        setAnalysisResult(null);
        setError(null);
    };

    const analyzeImage = async () => {
        if (!selectedImage) {
            setError('Please select an image first.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        // Create form data with the image
        const formData = new FormData();
        formData.append('image', selectedImage);

        router.post(route('product-recognition.recognize'), formData, {
            forceFormData: true,
            onSuccess: (page) => {
                // Check if we have recognition result in the response
                if (page.props.recognition_result) {
                    const result = page.props.recognition_result;
                    setAnalysisResult(result.analysis);
                    if (onRecognitionComplete) {
                        onRecognitionComplete(result);
                    }
                } else {
                    setError('Unexpected response format.');
                }
            },
            onError: (errors) => {
                console.error('Recognition error:', errors);
                if (errors.error) {
                    setError(errors.error);
                } else if (errors.image) {
                    setError(errors.image[0]);
                } else {
                    setError('An error occurred while analyzing the image.');
                }
            },
            onFinish: () => {
                setIsAnalyzing(false);
            }
        });
    };

    const handleClose = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setAnalysisResult(null);
        setError(null);
        setIsAnalyzing(false);
        onClose();
    };

    const viewProduct = (productId) => {
        router.visit(route('products.show', productId));
    };

    if (!isOpen) return null;

    return (
        <>
            <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
                <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
                
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                <SparklesIcon className="h-6 w-6 mr-2 text-blue-600" />
                                Product Recognition
                            </Dialog.Title>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {!selectedImage ? (
                                <div className="text-center py-8">
                                    <div className="mb-6">
                                        <SparklesIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            Recognize Seafood Products
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Take a photo or upload an image to identify seafood and get product suggestions
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={() => setShowCamera(true)}
                                            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <CameraIcon className="h-5 w-5 mr-2" />
                                            Take Photo
                                        </button>

                                        <label className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                                            <PhotoIcon className="h-5 w-5 mr-2" />
                                            Upload Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Image Preview */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                            Selected Image
                                        </h4>
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Selected for recognition"
                                                className="w-full max-h-80 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                        
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={analyzeImage}
                                                disabled={isAnalyzing}
                                                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <SparklesIcon className="h-4 w-4 mr-2" />
                                                        Analyze Image
                                                    </>
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    setSelectedImage(null);
                                                    setImagePreview(null);
                                                    setAnalysisResult(null);
                                                    setError(null);
                                                }}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {/* Analysis Results */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                            Analysis Results
                                        </h4>
                                        
                                        {error && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                                <p className="text-red-600 dark:text-red-400">{error}</p>
                                            </div>
                                        )}

                                        {analysisResult ? (
                                            <div className="space-y-4">
                                                {/* Seafood Detection Status */}
                                                <div className={`p-3 rounded-lg ${
                                                    analysisResult.seafood_detected 
                                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                                                        : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                                }`}>
                                                    <p className={`font-medium ${
                                                        analysisResult.seafood_detected 
                                                            ? 'text-green-800 dark:text-green-200' 
                                                            : 'text-yellow-800 dark:text-yellow-200'
                                                    }`}>
                                                        {analysisResult.seafood_detected 
                                                            ? '🐟 Seafood detected!' 
                                                            : '⚠️ No seafood detected'}
                                                    </p>
                                                </div>

                                                {/* Detected Labels */}
                                                {analysisResult.labels && analysisResult.labels.length > 0 && (
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Detected Items:</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {analysisResult.labels.slice(0, 5).map((label, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                                                >
                                                                    {label.description} ({label.confidence}%)
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Suggested Products */}
                                                {analysisResult.suggested_products && analysisResult.suggested_products.length > 0 && (
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Products:</h5>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {analysisResult.suggested_products.map((product, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                                >
                                                                    <div className="flex-1">
                                                                        <h6 className="font-medium text-gray-900 dark:text-white">
                                                                            {product.name}
                                                                        </h6>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                            ₱{product.price}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => viewProduct(product.id)}
                                                                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                                                    >
                                                                        <EyeIcon className="h-4 w-4 mr-1" />
                                                                        View
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {analysisResult.mock_data && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                                                            ℹ️ This is demo data. Configure Google Vision API for real recognition.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <SparklesIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>Click "Analyze Image" to start recognition</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>

            <CameraCapture
                isOpen={showCamera}
                onClose={() => setShowCamera(false)}
                onCapture={handleCameraCapture}
                title="Take Photo for Recognition"
            />
        </>
    );
}
