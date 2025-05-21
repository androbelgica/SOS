import React, { useState, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import MainLayout from "@/Layouts/MainLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { getImageProps, getImageUrl } from "@/Utils/imageHelpers";

export default function Edit({ auth, product, recipes, timestamp }) {
    const { asset } = usePage().props;

    const [clientTimestamp, setClientTimestamp] = useState(Date.now());
    const cacheTimestamp = timestamp || clientTimestamp;

    // Initialize image preview with the product's image URL
    const [imagePreview, setImagePreview] = useState(
        getImageUrl(product.image_url, cacheTimestamp)
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState(null);

    // Log the image URL for debugging
    useEffect(() => {
        if (product.image_url) {
            console.log(`Product image URL: ${product.image_url}`);

            // Preload the image to check if it loads correctly
            const img = new Image();
            img.onload = () => console.log(`✅ Product image loaded successfully`);
            img.onerror = (e) => console.error(`❌ Failed to load product image: ${product.image_url}`, e);
            img.src = product.image_url;
        }
    }, [product.image_url]);

    // Function to generate product info using AI
    const generateProductInfo = async () => {
        if (!data.name || data.name.trim() === '') {
            setGenerationError("Please enter a product name first");
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);

        try {
            const response = await axios.post(route('api.ai.generate-product-info'), {
                product_name: data.name
            });

            if (response.data.success) {
                setData({
                    ...data,
                    description: response.data.description || data.description,
                    nutritional_facts: response.data.nutritional_facts || data.nutritional_facts
                });
            } else {
                setGenerationError(response.data.message || "Failed to generate product information");
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            setGenerationError(error.response?.data?.message || "An error occurred during generation");
        } finally {
            setIsGenerating(false);
        }
    };

    const { data, setData, post, processing, errors, reset, progress } =
        useForm({
            _method: "PUT", // Use POST with _method for file uploads
            name: product.name,
            description: product.description,
            nutritional_facts: product.nutritional_facts || "",
            price: product.price,
            stock_quantity: product.stock_quantity,
            category: product.category,
            unit_type: product.unit_type || "piece",
            image: null,
            recipe_ids: product.recipes.map((r) => r.id),
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

        // Use post instead of put for file uploads
        post(route("admin.products.update", product.id), {
            forceFormData: true,
            onSuccess: (page) => {
                // Reset the image field after successful upload
                setData("image", null);

                // The controller will redirect to the admin products index page
                // No need to do anything else here
            },
        });
    };

    return (
        <MainLayout auth={auth}>
            <Head title={`Edit ${product.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                                Edit Product
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
                                    <div className="flex justify-between items-center">
                                        <InputLabel
                                            htmlFor="description"
                                            value="Description"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateProductInfo}
                                            disabled={isGenerating || !data.name}
                                            className="px-2 py-1 text-xs bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                        >
                                            {isGenerating ? "Generating..." : "Generate with AI"}
                                        </button>
                                    </div>
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

                                <div>
                                    <InputLabel
                                        htmlFor="nutritional_facts"
                                        value="Nutritional Facts"
                                    />
                                    <textarea
                                        id="nutritional_facts"
                                        value={data.nutritional_facts}
                                        onChange={(e) =>
                                            setData(
                                                "nutritional_facts",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-300 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400"
                                        rows="4"
                                        placeholder="Enter nutritional information such as calories, protein, fats, etc."
                                    />
                                    <InputError
                                        message={errors.nutritional_facts}
                                        className="mt-2"
                                    />
                                </div>

                                {generationError && (
                                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                                        <strong className="font-bold">Error: </strong>
                                        <span className="block sm:inline">{generationError}</span>
                                    </div>
                                )}

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
                                            {imagePreview ? "Image Preview:" : "Current Image:"}
                                        </p>

                                        {/* Show either the new image preview or the existing product image */}
                                        {imagePreview ? (
                                            // New image preview from file input
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt={data.name}
                                                    className="h-32 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                                />
                                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded-bl">New</div>
                                            </div>
                                        ) : product.image_url && product.image_url.startsWith('http') ? (
                                            // External URL image (like Unsplash)
                                            <div className="relative">
                                                <img
                                                    key={`product-image-${product.id}-${cacheTimestamp}`}
                                                    src={product.image_url.includes('?') ?
                                                        `${product.image_url}&t=${cacheTimestamp}` :
                                                        `${product.image_url}?t=${cacheTimestamp}`}
                                                    alt={data.name}
                                                    className="h-32 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                                    onError={(e) => {
                                                        // Replace with a div on error
                                                        const parent = e.target.parentNode;
                                                        if (parent) {
                                                            const div = document.createElement('div');
                                                            div.className = "h-32 w-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700";
                                                            div.innerHTML = `<span class="text-gray-700 dark:text-gray-300 font-bold text-2xl">${data.name.charAt(0).toUpperCase()}</span>`;
                                                            parent.replaceChild(div, e.target);
                                                        }
                                                    }}
                                                />
                                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl">Current</div>
                                            </div>
                                        ) : (
                                            // No image or local storage image that's not working - show a div with first letter
                                            <div className="relative">
                                                <div className="h-32 w-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <span className="text-gray-700 dark:text-gray-300 font-bold text-2xl">{data.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                {product.image_url && (
                                                    <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-1 rounded-bl">Image Error</div>
                                                )}
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
                                            ? "Saving..."
                                            : "Save Changes"}
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
