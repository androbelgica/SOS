import React, { useRef, useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanError, isActive = true }) {
    const scannerRef = useRef(null);
    const [scanner, setScanner] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isActive && !scanner) {
            initializeScanner();
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(console.error);
            }
        };
    }, [isActive]);

    const initializeScanner = () => {
        try {
            const html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                    showZoomSliderIfSupported: true,
                    defaultZoomValueIfSupported: 2,
                },
                false
            );

            html5QrcodeScanner.render(
                (decodedText, decodedResult) => {
                    setIsScanning(false);
                    setError(null);
                    if (onScanSuccess) {
                        onScanSuccess(decodedText, decodedResult);
                    }
                },
                (errorMessage) => {
                    // Handle scan errors silently for continuous scanning
                    if (onScanError && errorMessage !== "QR code parse error, error = NotFoundException: No MultiFormat Readers were able to detect the code.") {
                        onScanError(errorMessage);
                    }
                }
            );

            setScanner(html5QrcodeScanner);
            setIsScanning(true);
        } catch (err) {
            setError('Failed to initialize camera. Please ensure camera permissions are granted.');
            console.error('QR Scanner initialization error:', err);
        }
    };

    const stopScanning = () => {
        if (scanner) {
            scanner.clear().then(() => {
                setScanner(null);
                setIsScanning(false);
            }).catch(console.error);
        }
    };

    const startScanning = () => {
        if (!scanner && isActive) {
            initializeScanner();
        }
    };

    return (
        <div className="qr-scanner-container">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        QR Code Scanner
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Point your camera at the QR code on the product label to verify
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="scanner-wrapper">
                    <div 
                        id="qr-reader" 
                        className="mx-auto max-w-sm"
                        style={{ 
                            border: isScanning ? '2px solid #10B981' : '2px dashed #D1D5DB',
                            borderRadius: '8px',
                            minHeight: '300px'
                        }}
                    ></div>
                </div>

                <div className="mt-4 flex justify-center space-x-3">
                    {!isScanning ? (
                        <button
                            onClick={startScanning}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Start Camera
                        </button>
                    ) : (
                        <button
                            onClick={stopScanning}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                            Stop Camera
                        </button>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Make sure to allow camera access when prompted by your browser
                    </p>
                </div>
            </div>
        </div>
    );
}
