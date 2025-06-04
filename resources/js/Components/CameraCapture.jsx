import React, { useState, useRef, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function CameraCapture({ isOpen, onClose, onCapture, title = 'Take Photo' }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' for front camera, 'environment' for back camera

    const startCamera = useCallback(async (requestedFacingMode) => {
        try {
            setError(null);

            // Stop any existing stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
                setIsStreaming(false);
            }

            const currentFacingMode = requestedFacingMode || facingMode;

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: currentFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
                setIsStreaming(true);
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            let errorMessage = 'Unable to access camera. ';

            if (err.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera permissions and try again.';
            } else if (err.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else if (err.name === 'NotSupportedError') {
                errorMessage += 'Camera is not supported in this browser.';
            } else {
                errorMessage += err.message || 'Unknown error occurred.';
            }

            setError(errorMessage);
            setIsStreaming(false);
        }
    }, [stream, facingMode]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsStreaming(false);
    }, [stream]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (blob) {
                // Create a File object from the blob
                const file = new File([blob], `photo-${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });

                // Create preview URL
                const previewUrl = URL.createObjectURL(blob);
                setCapturedImage(previewUrl);

                // Call the onCapture callback with the file
                onCapture(file, previewUrl);
            }
        }, 'image/jpeg', 0.9);
    }, [onCapture]);

    const switchCamera = useCallback(() => {
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);
        if (isStreaming) {
            startCamera(newFacingMode);
        }
    }, [facingMode, isStreaming, startCamera]);

    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
        if (!isStreaming) {
            startCamera();
        }
    }, [isStreaming, startCamera]);

    const handleClose = useCallback(() => {
        stopCamera();
        setCapturedImage(null);
        setError(null);
        onClose();
    }, [stopCamera, onClose]);

    // Start camera when modal opens
    React.useEffect(() => {
        if (isOpen && !isStreaming && !capturedImage) {
            startCamera();
        }
    }, [isOpen]); // Only depend on isOpen to avoid loops

    // Cleanup on unmount and when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [isOpen]); // Only depend on isOpen

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </Dialog.Title>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-4">
                        {error ? (
                            <div className="text-center py-8">
                                <div className="text-red-600 dark:text-red-400 mb-4">
                                    <CameraIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">{error}</p>
                                </div>
                                <button
                                    onClick={startCamera}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : capturedImage ? (
                            <div className="text-center">
                                <img
                                    src={capturedImage}
                                    alt="Captured photo"
                                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                                />
                                <div className="flex justify-center space-x-4 mt-4">
                                    <button
                                        onClick={retakePhoto}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                    >
                                        Retake
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Use Photo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    className="w-full max-h-96 bg-black rounded-lg"
                                    autoPlay
                                    playsInline
                                    muted
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="hidden"
                                />
                                
                                {isStreaming && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                                        <button
                                            onClick={switchCamera}
                                            className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                                            title="Switch Camera"
                                        >
                                            <ArrowPathIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={capturePhoto}
                                            className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                            title="Take Photo"
                                        >
                                            <CameraIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
