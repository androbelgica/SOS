import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import QRScanner from "@/Components/QRScanner";
import Modal from "@/Components/Modal";

export default function OrderScanner({ auth, order }) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [scannedProducts, setScannedProducts] = useState([]);

    const handleScanSuccess = (decodedText, decodedResult) => {
        console.log('QR Code scanned:', decodedText);
        
        // Check if the scanned URL is a verification URL for this order
        if (decodedText.includes('/orders/') && decodedText.includes('/verify/')) {
            // Extract order ID and product ID from the URL
            const urlParts = decodedText.split('/');
            const orderIndex = urlParts.indexOf('orders');
            const verifyIndex = urlParts.indexOf('verify');
            
            if (orderIndex !== -1 && verifyIndex !== -1) {
                const scannedOrderId = urlParts[orderIndex + 1];
                const scannedProductId = urlParts[verifyIndex + 1];
                
                // Verify this matches our current order
                if (scannedOrderId == order.id) {
                    // Check if this product is in our order
                    const orderItem = order.items.find(item => item.product.id == scannedProductId);
                    
                    if (orderItem) {
                        // Check if already scanned
                        if (!scannedProducts.includes(scannedProductId)) {
                            setScannedProducts(prev => [...prev, scannedProductId]);
                            setScanResult({
                                success: true,
                                product: orderItem.product,
                                orderItem: orderItem,
                                message: 'Product verified successfully!'
                            });
                            setVerificationStatus('success');
                        } else {
                            setScanResult({
                                success: false,
                                message: 'This product has already been verified.'
                            });
                            setVerificationStatus('warning');
                        }
                    } else {
                        setScanResult({
                            success: false,
                            message: 'This product is not part of your order.'
                        });
                        setVerificationStatus('error');
                    }
                } else {
                    setScanResult({
                        success: false,
                        message: 'This QR code is for a different order.'
                    });
                    setVerificationStatus('error');
                }
            } else {
                setScanResult({
                    success: false,
                    message: 'Invalid QR code format.'
                });
                setVerificationStatus('error');
            }
        } else {
            setScanResult({
                success: false,
                message: 'This is not a valid product verification QR code.'
            });
            setVerificationStatus('error');
        }
        
        setShowResultModal(true);
        setIsScanning(false);
    };

    const handleScanError = (errorMessage) => {
        console.error('QR Scan error:', errorMessage);
    };

    const closeResultModal = () => {
        setShowResultModal(false);
        setScanResult(null);
        setVerificationStatus(null);
    };

    const startNewScan = () => {
        closeResultModal();
        setIsScanning(true);
    };

    const getVerificationProgress = () => {
        const totalItems = order.items.length;
        const verifiedItems = scannedProducts.length;
        return { total: totalItems, verified: verifiedItems };
    };

    const progress = getVerificationProgress();

    return (
        <MainLayout auth={auth} title={`Verify Order ${order.order_number || '#' + order.id}`}>
            <Head title={`Verify Order ${order.order_number || '#' + order.id} - Seafood Online Store`} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Verify Order {order.order_number || '#' + order.id}
                            </h2>
                            <Link
                                href={route("orders.show", order.id)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Order
                            </Link>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Verification Progress
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {progress.verified} of {progress.total} products verified
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress.total > 0 ? (progress.verified / progress.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Scan the QR codes on your delivered products to verify they match your order.
                            </p>
                            {progress.verified === progress.total && progress.total > 0 && (
                                <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md">
                                    <svg className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-green-800 dark:text-green-200 font-medium">
                                        All products verified successfully!
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* QR Scanner */}
                <div className="mb-6">
                    <QRScanner
                        onScanSuccess={handleScanSuccess}
                        onScanError={handleScanError}
                        isActive={isScanning}
                    />
                </div>

                {/* Order Items List */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Items</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div 
                                    key={item.id} 
                                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                                        scannedProducts.includes(item.product.id.toString()) 
                                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-12 w-12">
                                            <img
                                                src={item.product.image_url || "/images/placeholder.jpg"}
                                                alt={item.product.name}
                                                className="h-12 w-12 rounded-lg object-cover"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.product.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Quantity: {item.quantity}{item.product.unit_type === 'kg' ? 'g' : ' pcs'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {scannedProducts.includes(item.product.id.toString()) ? (
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Verified
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Pending
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scan Result Modal */}
            <Modal show={showResultModal} onClose={closeResultModal}>
                <div className="p-6">
                    <div className="text-center">
                        {verificationStatus === 'success' && (
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        {verificationStatus === 'error' && (
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        {verificationStatus === 'warning' && (
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}

                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {scanResult?.success ? 'Product Verified!' : 'Verification Failed'}
                        </h3>
                        
                        {scanResult?.product && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Product:</p>
                                <p className="font-medium text-gray-900 dark:text-white">{scanResult.product.name}</p>
                            </div>
                        )}
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            {scanResult?.message}
                        </p>

                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={startNewScan}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                                Scan Another
                            </button>
                            <button
                                onClick={closeResultModal}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    );
}
