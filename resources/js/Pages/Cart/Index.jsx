import React, { useState, useRef } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { getImageProps } from "@/Utils/imageHelpers";

export default function CartIndex({ auth, cartItems: initialCartItems, total: initialTotal }) {
    const { delete: destroy } = useForm();
    const [cartItems, setCartItems] = useState(initialCartItems);
    const [total, setTotal] = useState(initialTotal);
    const [isProcessing, setIsProcessing] = useState(false);
    const pendingUpdates = useRef([]);

    const updateQuantity = (productId, quantity, redirectToCheckout = false) => {
        console.log(`Updating cart item ${productId} to quantity ${quantity}`);

        // Ensure quantity is a valid number
        if (isNaN(quantity) || quantity <= 0) {
            console.error('Invalid quantity:', quantity);
            return;
        }

        // Update local state immediately for better user experience
        const updatedCartItems = cartItems.map(item => {
            if (item.id === productId) {
                // Calculate new subtotal
                let newSubtotal;
                if (item.unit_type === 'kg') {
                    // Convert grams to kg for price calculation (divide by 1000)
                    newSubtotal = item.price * (quantity / 1000);
                } else {
                    newSubtotal = item.price * quantity;
                }

                return { ...item, quantity, subtotal: newSubtotal };
            }
            return item;
        });

        // Calculate new total
        const newTotal = updatedCartItems.reduce((sum, item) => sum + item.subtotal, 0);

        // Update state
        setCartItems(updatedCartItems);
        setTotal(newTotal);

        // Create a form data object
        const formData = new FormData();
        formData.append('quantity', quantity.toString()); // Ensure quantity is a string
        formData.append('_method', 'PATCH'); // Add method spoofing

        // Add redirect_to_checkout parameter if needed
        if (redirectToCheckout) {
            formData.append('redirect_to_checkout', '1');
        }

        // Get CSRF token safely
        let csrfToken = '';
        const csrfElement = document.querySelector('meta[name="csrf-token"]');
        if (csrfElement) {
            csrfToken = csrfElement.getAttribute('content');
        } else {
            // Fallback: try to get from the page's hidden input
            const csrfInput = document.querySelector('input[name="_token"]');
            if (csrfInput) {
                csrfToken = csrfInput.value;
            }
        }

        // Create a promise for this update
        const updatePromise = fetch(route("cart.update", productId), {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(`Successfully updated cart item ${productId} to quantity ${quantity}`);

            // If redirectToCheckout is true, redirect to checkout page
            if (redirectToCheckout) {
                // Add a timestamp to force a fresh page load
                window.location.href = route("checkout.index") + "?t=" + new Date().getTime();
            }

            // Remove this promise from pending updates when complete
            pendingUpdates.current = pendingUpdates.current.filter(p => p !== updatePromise);

            return data;
        })
        .catch(error => {
            console.error(`Failed to update cart item ${productId}:`, error);
            alert('Failed to update cart: ' + error);

            // Remove this promise from pending updates even on error
            pendingUpdates.current = pendingUpdates.current.filter(p => p !== updatePromise);

            // Revert to initial state on error
            window.location.reload();
            throw error;
        });

        // Add this promise to our pending updates
        pendingUpdates.current.push(updatePromise);

        return updatePromise;
    };

    const removeItem = (productId) => {
        console.log(`Removing cart item ${productId}`);

        // Update local state immediately
        const updatedCartItems = cartItems.filter(item => item.id !== productId);
        const newTotal = updatedCartItems.reduce((sum, item) => sum + item.subtotal, 0);

        setCartItems(updatedCartItems);
        setTotal(newTotal);

        // Send request to server
        destroy(route("cart.remove", productId));
    };

    const checkout = async () => {
        console.log('Proceeding to checkout');

        // Prevent multiple clicks
        if (isProcessing) {
            console.log('Already processing checkout, please wait...');
            return;
        }

        try {
            setIsProcessing(true);

            // Wait for all pending cart updates to complete before proceeding
            if (pendingUpdates.current.length > 0) {
                console.log(`Waiting for ${pendingUpdates.current.length} pending cart updates to complete...`);
                await Promise.all(pendingUpdates.current);
                console.log('All cart updates completed successfully');
            }

            // Create a cart object from the current state
            const cartObject = {};
            cartItems.forEach(item => {
                cartObject[item.id] = item.quantity;
            });

            console.log('Synchronizing cart with server before checkout:', cartObject);

            // Use Inertia's router to handle the request with proper CSRF token
            router.post(route('cart.sync'), {
                cartData: cartObject
            }, {
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Error during cart synchronization:', errors);
                    alert('There was an error processing your checkout. Please try again.');
                    setIsProcessing(false);
                }
            });
        } catch (error) {
            console.error('Error during checkout process:', error);
            alert('There was an error processing your checkout. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <MainLayout auth={auth} title="Shopping Cart">
            <Head title="Shopping Cart - Seafood Online Store" />

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">

                    {cartItems.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <img
                                                {...getImageProps({
                                                    src: item.image_url || "/images/placeholder.jpg",
                                                    alt: item.name,
                                                    className: "w-20 h-20 object-cover rounded mx-auto sm:mx-0",
                                                    type: "product"
                                                })}
                                            />
                                            <div className="text-center sm:text-left">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                                        ₱{item.price !== null && item.price !== undefined
                                                            ? typeof item.price === "number"
                                                                ? item.price.toFixed(2)
                                                                : parseFloat(item.price || 0).toFixed(2)
                                                            : "0.00"}
                                                    </span>{" "}
                                                    {item.unit_type === 'kg' ? '/kg' : '/piece'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                            <div className="flex items-center border rounded dark:border-gray-600 mx-auto sm:mx-0">
                                                <button
                                                    type="button"
                                                    className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    onClick={() => {
                                                        const decrementValue = item.unit_type === 'kg' ? 250 : 1;
                                                        updateQuantity(
                                                            item.id,
                                                            Math.max(
                                                                item.unit_type === 'kg' ? 250 : 1,
                                                                item.quantity - decrementValue
                                                            )
                                                        );
                                                    }}
                                                >
                                                    -
                                                </button>

                                                {item.unit_type === 'kg' ? (
                                                    <input
                                                        type="number"
                                                        min="250"
                                                        step="250"
                                                        max={item.stock_quantity * 1000}
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const newValue = parseInt(e.target.value, 10);
                                                            if (!isNaN(newValue) && newValue >= 250) {
                                                                // Round to nearest 250g
                                                                const roundedValue = Math.round(newValue / 250) * 250;
                                                                updateQuantity(item.id, roundedValue);
                                                            }
                                                        }}
                                                        className="w-20 px-2 py-1 text-center border-x dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                    />
                                                ) : (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        max={item.stock_quantity}
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const newValue = parseInt(e.target.value, 10);
                                                            if (!isNaN(newValue) && newValue >= 1) {
                                                                updateQuantity(item.id, newValue);
                                                            }
                                                        }}
                                                        className="w-16 px-2 py-1 text-center border-x dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                    />
                                                )}

                                                <button
                                                    type="button"
                                                    className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    onClick={() => {
                                                        const incrementValue = item.unit_type === 'kg' ? 250 : 1;
                                                        const maxQuantity = item.unit_type === 'kg' ? item.stock_quantity * 1000 : item.stock_quantity;
                                                        updateQuantity(
                                                            item.id,
                                                            Math.min(
                                                                maxQuantity,
                                                                item.quantity + incrementValue
                                                            )
                                                        );
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-0 sm:ml-2">
                                                {item.unit_type === 'kg' ? 'g' : 'pcs'}
                                            </span>

                                            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                                                ₱{item.subtotal !== null && item.subtotal !== undefined
                                                    ? typeof item.subtotal === "number"
                                                        ? item.subtotal.toFixed(2)
                                                        : parseFloat(item.subtotal || 0).toFixed(2)
                                                    : "0.00"}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                title="Remove item"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 border-t dark:border-gray-700 pt-6">
                                <div className="flex justify-between items-center text-xl font-semibold">
                                    <span className="text-gray-900 dark:text-white">Total:</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">
                                        ₱{total !== null && total !== undefined
                                            ? typeof total === "number"
                                                ? total.toFixed(2)
                                                : parseFloat(total || 0).toFixed(2)
                                            : "0.00"}
                                    </span>
                                </div>

                                <div className="mt-6 flex justify-end space-x-4">
                                    <Link
                                        href={route("products.index")}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Continue Shopping
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={checkout}
                                        disabled={isProcessing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                                Proceed to Checkout
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                                Your cart is empty
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Add some delicious seafood products to your cart and they will appear here.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route("products.index")}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
