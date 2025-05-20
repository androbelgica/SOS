import React, { useState, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { getImageProps, getImageUrl, getFallbackImage } from "@/Utils/imageHelpers";

export default function Create({ auth, recipes }) {
    const { asset } = usePage().props;

    const [clientTimestamp, setClientTimestamp] = useState(Date.now());

    // Initialize image preview state
    const [imagePreview, setImagePreview] = useState(null);

    // For debugging image loading
    useEffect(() => {
        console.log("Create Product component mounted");
    }, []);

    const { data, setData, post, processing, errors, reset, progress } =
        useForm({
            name: "",
            description: "",
            price: "",
            stock_quantity: "",
            category: "",
            unit_type: "piece",
            image: null,
            recipe_ids: [],
        });

    // Handle file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData("image", file);

        // Create a preview URL
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("admin.products.store"), {
            forceFormData: true,
            onSuccess: () => {
                // Reset the form after successful submission
                reset();
                setImagePreview(null);
                // The controller will redirect to the admin products index page
            },
        });
    };

    return (
        <MainLayout auth={auth}>
            <Head title="Create New Product" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                                Create New Product
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="description"
                                        value="Description"
                                    />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-300 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400"
                                        rows="4"
                                        required
                                    />
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel
                                            htmlFor="price"
                                            value="Price"
                                        />
                                        <TextInput
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) =>
                                                setData("price", e.target.value)
                                            }
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError
                                            message={errors.price}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="stock_quantity"
                                            value="Stock Quantity"
                                        />
                                        <TextInput
                                            id="stock_quantity"
                                            type="number"
                                            value={data.stock_quantity}
                                            onChange={(e) =>
                                                setData(
                                                    "stock_quantity",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError
                                            message={errors.stock_quantity}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel
                                            htmlFor="category"
                                            value="Category"
                                        />
                                        <select
                                            id="category"
                                            value={data.category}
                                            onChange={(e) =>
                                                setData(
                                                    "category",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-300 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400"
                                            required
                                        >
                                            <option value="">
                                                Select a category
                                            </option>
                                            <option value="fish">Fish</option>
                                            <option value="shellfish">
                                                Shellfish
                                            </option>
                                            <option value="crustaceans">
                                                Crustaceans
                                            </option>
                                            <option value="other">Other</option>
                                        </select>
                                        <InputError
                                            message={errors.category}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="unit_type"
                                            value="Unit Type"
                                        />
                                        <select
                                            id="unit_type"
                                            value={data.unit_type}
                                            onChange={(e) =>
                                                setData(
                                                    "unit_type",
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-300 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400"
                                            required
                                        >
                                            <option value="piece">By Piece</option>
                                            <option value="kg">By Kilogram (kg)</option>
                                        </select>
                                        <InputError
                                            message={errors.unit_type}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="image"
                                        value="Product Image"
                                    />
                                    <input
                                        type="file"
                                        id="image"
                                        onChange={handleImageChange}
                                        className="mt-1 block w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-100 dark:hover:file:bg-gray-600"
                                        accept="image/*"
                                    />
                                    {progress && (
                                        <div className="mt-2">
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                <div
                                                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                                                    style={{
                                                        width: `${progress.percentage}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {progress.percentage}% Uploaded
                                            </p>
                                        </div>
                                    )}
                                    <InputError
                                        message={errors.image}
                                        className="mt-2"
                                    />
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            {imagePreview ? "Image Preview:" : "No image selected:"}
                                        </p>
                                        {imagePreview ? (
                                            // New image preview from file input
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Product preview"
                                                    className="h-32 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                                />
                                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded-bl">New</div>
                                            </div>
                                        ) : (
                                            // No image placeholder - use a simple div instead of trying to load an image
                                            <div className="relative">
                                                <div className="h-32 w-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <span className="text-gray-400 dark:text-gray-500">No image</span>
                                                </div>
                                                <div className="absolute top-0 right-0 bg-gray-500 text-white text-xs px-1 rounded-bl">Placeholder</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Associated Recipes" />
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recipes.map((recipe) => (
                                            <label
                                                key={recipe.id}
                                                className="flex items-center"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={recipe.id}
                                                    checked={data.recipe_ids.includes(
                                                        recipe.id
                                                    )}
                                                    onChange={(e) => {
                                                        const newIds = e.target
                                                            .checked
                                                            ? [
                                                                  ...data.recipe_ids,
                                                                  recipe.id,
                                                              ]
                                                            : data.recipe_ids.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      recipe.id
                                                              );
                                                        setData(
                                                            "recipe_ids",
                                                            newIds
                                                        );
                                                    }}
                                                    className="rounded border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-500 shadow-sm focus:border-blue-300 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400 dark:bg-gray-800"
                                                />
                                                <span className="ml-2 text-gray-700 dark:text-gray-300">
                                                    {recipe.title}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError
                                        message={errors.recipe_ids}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link
                                        href={route("admin.products.index")}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
                                    >
                                        {processing
                                            ? "Creating..."
                                            : "Create Product"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
