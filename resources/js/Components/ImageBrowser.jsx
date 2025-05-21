import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ImageBrowser({
    isOpen,
    onClose,
    onSelect,
    type = 'products', // 'products' or 'recipes'
    title = 'Select an Image'
}) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen, type]);

    const fetchImages = async () => {
        setLoading(true);
        setError(null);

        try {
            // Try the regular API endpoint first
            let response;
            try {
                response = await axios.get(route('api.files.images', type));
                console.log('API response:', response.data);
            } catch (apiError) {
                // If the regular API fails, try the debug endpoint
                console.warn('Regular API failed, trying debug endpoint:', apiError);
                response = await axios.get(`/debug/files/${type}/images`);
                console.log('Debug API response:', response.data);
            }

            // Process the images to ensure URLs are correct
            const processedImages = (response.data.images || []).map(image => {
                // Make sure the URL is absolute if it's not already
                let imageUrl = image.url;
                if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                    imageUrl = '/' + imageUrl;
                }

                // Log the image URL for debugging
                console.log('Image URL:', imageUrl);

                return {
                    ...image,
                    url: imageUrl
                };
            });

            setImages(processedImages);

            // If no images were found, show a warning
            if (processedImages.length === 0) {
                console.warn('No images found in the response');
            }
        } catch (err) {
            console.error('Error fetching images:', err);
            setError(err.response?.data?.error || 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = () => {
        if (selectedImage) {
            onSelect(selectedImage);
            onClose();
        }
    };

    const handleRefresh = () => {
        fetchImages();
    };

    if (!isOpen) return null;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            {/* The backdrop, rendered as a fixed sibling to the panel container */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            {title} from {type === 'products' ? 'Products' : 'Recipes'} Folder
                        </h3>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="inline-flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Select an existing image from the {type} folder to reuse it.
                        </p>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-red-500 dark:text-red-400 text-center">
                                    <p className="text-lg font-semibold">Error</p>
                                    <p>{error}</p>
                                    <button
                                        onClick={handleRefresh}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : images.length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-gray-500 dark:text-gray-400 text-center">
                                    <p className="text-lg font-semibold">No Images Found</p>
                                    <p>There are no images in the {type} folder.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedImage(image)}
                                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedImage?.url === image.url
                                                ? 'border-blue-500 ring-2 ring-blue-300'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.filename}
                                            className="w-full h-32 object-cover"
                                            onLoad={() => console.log('Image loaded successfully:', image.url)}
                                            onError={(e) => {
                                                console.error('Image failed to load:', image.url);
                                                e.target.onerror = null;

                                                // Try an alternative URL format
                                                const altUrl = image.url.replace('/storage/', '/storage/public/');
                                                console.log('Trying alternative URL:', altUrl);

                                                // Try the alternative URL
                                                const img = new Image();
                                                img.onload = () => {
                                                    console.log('Alternative URL loaded successfully:', altUrl);
                                                    e.target.src = altUrl;
                                                };
                                                img.onerror = () => {
                                                    console.error('Alternative URL also failed:', altUrl);
                                                    // Use a data URI for the placeholder to avoid additional HTTP requests
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjYWFhYWFhIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                                                };
                                                img.src = altUrl;
                                            }}
                                        />
                                        {selectedImage?.url === image.url && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircleIcon className="w-6 h-6 text-blue-500 bg-white rounded-full" />
                                            </div>
                                        )}
                                        <div className="p-2 bg-white dark:bg-gray-700 text-xs">
                                            <p className="truncate font-medium text-gray-900 dark:text-white">{image.filename}</p>
                                            <p className="text-gray-500 dark:text-gray-400">{image.size_formatted}</p>
                                            <p className="text-gray-500 dark:text-gray-400">{image.last_modified_formatted}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSelect}
                            disabled={!selectedImage}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                                selectedImage
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-blue-400 cursor-not-allowed'
                            }`}
                        >
                            Select Image
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
