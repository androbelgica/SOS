import React, { useState, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";

export default function CheckoutIndex({
    auth,
    cartItems,
    total,
    user,
    timestamp,
}) {
    // Log the cart items for debugging
    useEffect(() => {
        console.log("Checkout page loaded with cart items:", cartItems);
        console.log("Timestamp:", timestamp);
    }, [cartItems, timestamp]);
    const [sameAsBilling, setSameAsBilling] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("cod");

    const { data, setData, post, processing, errors } = useForm({
        shipping_address: user?.address || "",
        shipping_city: user?.city || "",
        shipping_state: user?.state || "",
        shipping_postal_code: user?.postal_code || "",
        shipping_country: user?.country || "Philippines",
        shipping_phone: user?.phone || "",

        billing_address: user?.address || "",
        billing_city: user?.city || "",
        billing_state: user?.state || "",
        billing_postal_code: user?.postal_code || "",
        billing_country: user?.country || "Philippines",
        billing_phone: user?.phone || "",

        save_address: true,
        payment_method: "cod",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (paymentMethod !== "cod") {
            alert("Only Cash on Delivery is available at this time.");
            return;
        }
        post(route("orders.store"));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);

        // If billing should be same as shipping, update billing fields
        if (sameAsBilling && name.startsWith("shipping_")) {
            const billingField = name.replace("shipping_", "billing_");
            setData(billingField, value);
        }
    };

    const toggleSameAsBilling = () => {
        const newValue = !sameAsBilling;
        setSameAsBilling(newValue);

        // If toggling to true, copy shipping to billing
        if (newValue) {
            setData({
                ...data,
                billing_address: data.shipping_address,
                billing_city: data.shipping_city,
                billing_state: data.shipping_state,
                billing_postal_code: data.shipping_postal_code,
                billing_country: data.shipping_country,
                billing_phone: data.shipping_phone,
            });
        }
    };

    const handlePaymentMethodChange = (e) => {
        const value = e.target.value;
        if (value === "cod") {
            setPaymentMethod("cod");
            setData("payment_method", "cod");
        } else {
            alert("Payment option coming soon.");
        }
    };

    return (
        <MainLayout auth={auth} title="Checkout">
            <Head title="Checkout - Seafood Online Store" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Shipping & Billing Forms */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Shipping Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <InputLabel
                                        htmlFor="shipping_address"
                                        value="Address"
                                    />
                                    <TextInput
                                        id="shipping_address"
                                        name="shipping_address"
                                        value={data.shipping_address}
                                        className="mt-1 block w-full"
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.shipping_address}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="shipping_phone"
                                        value="Phone Number"
                                    />
                                    <TextInput
                                        id="shipping_phone"
                                        name="shipping_phone"
                                        value={data.shipping_phone}
                                        className="mt-1 block w-full"
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.shipping_phone}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <InputLabel
                                        htmlFor="shipping_city"
                                        value="City"
                                    />
                                    <TextInput
                                        id="shipping_city"
                                        name="shipping_city"
                                        value={data.shipping_city}
                                        className="mt-1 block w-full"
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.shipping_city}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="shipping_state"
                                        value="Province/State"
                                    />
                                    <TextInput
                                        id="shipping_state"
                                        name="shipping_state"
                                        value={data.shipping_state}
                                        className="mt-1 block w-full"
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.shipping_state}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="shipping_postal_code"
                                        value="Postal Code"
                                    />
                                    <TextInput
                                        id="shipping_postal_code"
                                        name="shipping_postal_code"
                                        value={data.shipping_postal_code}
                                        className="mt-1 block w-full"
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.shipping_postal_code}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <InputLabel
                                    htmlFor="shipping_country"
                                    value="Country"
                                />
                                <TextInput
                                    id="shipping_country"
                                    name="shipping_country"
                                    value={data.shipping_country}
                                    className="mt-1 block w-full"
                                    onChange={handleInputChange}
                                    required
                                />
                                <InputError
                                    message={errors.shipping_country}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex items-center mb-4">
                                <input
                                    id="save_address"
                                    name="save_address"
                                    type="checkbox"
                                    checked={data.save_address}
                                    onChange={(e) =>
                                        setData(
                                            "save_address",
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="save_address"
                                    className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
                                >
                                    Save this address to my profile
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Billing Information
                                </h2>

                                <div className="flex items-center">
                                    <input
                                        id="same_as_shipping"
                                        name="same_as_shipping"
                                        type="checkbox"
                                        checked={sameAsBilling}
                                        onChange={toggleSameAsBilling}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="same_as_shipping"
                                        className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
                                    >
                                        Same as shipping address
                                    </label>
                                </div>
                            </div>

                            {!sameAsBilling && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <InputLabel
                                                htmlFor="billing_address"
                                                value="Address"
                                            />
                                            <TextInput
                                                id="billing_address"
                                                name="billing_address"
                                                value={data.billing_address}
                                                className="mt-1 block w-full"
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <InputError
                                                message={errors.billing_address}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="billing_phone"
                                                value="Phone Number"
                                            />
                                            <TextInput
                                                id="billing_phone"
                                                name="billing_phone"
                                                value={data.billing_phone}
                                                className="mt-1 block w-full"
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <InputError
                                                message={errors.billing_phone}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <InputLabel
                                                htmlFor="billing_city"
                                                value="City"
                                            />
                                            <TextInput
                                                id="billing_city"
                                                name="billing_city"
                                                value={data.billing_city}
                                                className="mt-1 block w-full"
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <InputError
                                                message={errors.billing_city}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="billing_state"
                                                value="Province/State"
                                            />
                                            <TextInput
                                                id="billing_state"
                                                name="billing_state"
                                                value={data.billing_state}
                                                className="mt-1 block w-full"
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <InputError
                                                message={errors.billing_state}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="billing_postal_code"
                                                value="Postal Code"
                                            />
                                            <TextInput
                                                id="billing_postal_code"
                                                name="billing_postal_code"
                                                value={data.billing_postal_code}
                                                className="mt-1 block w-full"
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors.billing_postal_code
                                                }
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <InputLabel
                                            htmlFor="billing_country"
                                            value="Country"
                                        />
                                        <TextInput
                                            id="billing_country"
                                            name="billing_country"
                                            value={data.billing_country}
                                            className="mt-1 block w-full"
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <InputError
                                            message={errors.billing_country}
                                            className="mt-2"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mt-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Payment Method
                            </h2>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={handlePaymentMethodChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-900 dark:text-gray-200 font-medium">
                                        Cash on Delivery (COD)
                                    </span>
                                </label>
                                <label className="flex items-center opacity-50 cursor-not-allowed">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="gcash"
                                        disabled
                                        className="h-4 w-4 text-indigo-600 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-900 dark:text-gray-200">
                                        GCash{" "}
                                        <span className="ml-1 text-xs text-gray-500">
                                            (Coming soon)
                                        </span>
                                    </span>
                                </label>
                                <label className="flex items-center opacity-50 cursor-not-allowed">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="maya"
                                        disabled
                                        className="h-4 w-4 text-indigo-600 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-900 dark:text-gray-200">
                                        Maya{" "}
                                        <span className="ml-1 text-xs text-gray-500">
                                            (Coming soon)
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center space-x-4"
                                    >
                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                                            {item.image_url && (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                            "/images/placeholder.jpg";
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.unit_type === "kg"
                                                    ? `${item.quantity}g`
                                                    : `${item.quantity} ${
                                                          item.quantity > 1
                                                              ? "pieces"
                                                              : "piece"
                                                      }`}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 text-sm font-medium text-gray-900 dark:text-white">
                                            ₱{item.subtotal.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Subtotal
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        ₱{total.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Shipping
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        Free
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-medium mt-4">
                                    <span className="text-gray-900 dark:text-white">
                                        Total
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                        ₱{total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
                            >
                                {processing ? "Processing..." : "Place Order"}
                            </button>

                            <div className="mt-4">
                                <a
                                    href={route("cart.index")}
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center justify-center"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Force a full page reload with timestamp to ensure fresh data
                                        window.location.href =
                                            route("cart.index") +
                                            "?t=" +
                                            new Date().getTime();
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                        />
                                    </svg>
                                    Return to cart
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
