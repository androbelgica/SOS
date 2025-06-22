import React, { useState, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import axios from "axios";
import MainLayout from "@/Layouts/MainLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import ImageBrowser from "@/Components/ImageBrowser";
import { getImageUrl, getFallbackImage } from "@/Utils/imageHelpers";

export default function Create({ auth, products }) {
    const { asset } = usePage().props;

    const [clientTimestamp, setClientTimestamp] = useState(Date.now());

    // Initialize image and video preview states
    const [imagePreview, setImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [imageBrowserOpen, setImageBrowserOpen] = useState(false);

    // AI generation states
    const [isGeneratingDescription, setIsGeneratingDescription] =
        useState(false);
    const [isGeneratingIngredients, setIsGeneratingIngredients] =
        useState(false);
    const [isGeneratingInstructions, setIsGeneratingInstructions] =
        useState(false);
    const [generationError, setGenerationError] = useState(null);

    // For dynamic ingredients and instructions
    const [ingredients, setIngredients] = useState([""]);
    const [instructions, setInstructions] = useState([""]);

    // For debugging component loading
    useEffect(() => {
        console.log("Create Recipe component mounted");
    }, []);

    // Function to generate recipe description using AI
    const generateRecipeDescription = async () => {
        if (!data.title || data.title.trim() === "") {
            setGenerationError("Please enter a recipe title first");
            return;
        }

        setIsGeneratingDescription(true);
        setGenerationError(null);

        try {
            const response = await axios.post(
                route("api.ai.generate-recipe-description"),
                {
                    recipe_title: data.title,
                }
            );

            if (response.data.success) {
                setData({
                    ...data,
                    description: response.data.description || data.description,
                });
            } else {
                setGenerationError(
                    response.data.message ||
                        "Failed to generate recipe description"
                );
            }
        } catch (error) {
            console.error("AI Description Generation Error:", error);
            setGenerationError(
                error.response?.data?.message ||
                    "An error occurred during description generation"
            );
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    // Function to generate recipe ingredients using AI
    const generateRecipeIngredients = async () => {
        if (!data.title || data.title.trim() === "") {
            setGenerationError("Please enter a recipe title first");
            return;
        }

        setIsGeneratingIngredients(true);
        setGenerationError(null);

        try {
            const response = await axios.post(
                route("api.ai.generate-recipe-ingredients"),
                {
                    recipe_title: data.title,
                }
            );

            if (
                response.data.success &&
                response.data.ingredients &&
                response.data.ingredients.length > 0
            ) {
                setIngredients(response.data.ingredients);
                setData({
                    ...data,
                    ingredients: response.data.ingredients,
                });
            } else {
                setGenerationError(
                    response.data.message ||
                        "Failed to generate recipe ingredients"
                );
            }
        } catch (error) {
            console.error("AI Ingredients Generation Error:", error);
            setGenerationError(
                error.response?.data?.message ||
                    "An error occurred during ingredients generation"
            );
        } finally {
            setIsGeneratingIngredients(false);
        }
    };

    // Function to generate recipe instructions using AI
    const generateRecipeInstructions = async () => {
        if (!data.title || data.title.trim() === "") {
            setGenerationError("Please enter a recipe title first");
            return;
        }

        setIsGeneratingInstructions(true);
        setGenerationError(null);

        try {
            const response = await axios.post(
                route("api.ai.generate-recipe-instructions"),
                {
                    recipe_title: data.title,
                }
            );

            if (
                response.data.success &&
                response.data.instructions &&
                response.data.instructions.length > 0
            ) {
                setInstructions(response.data.instructions);
                setData({
                    ...data,
                    instructions: response.data.instructions,
                });
            } else {
                setGenerationError(
                    response.data.message ||
                        "Failed to generate recipe instructions"
                );
            }
        } catch (error) {
            console.error("AI Instructions Generation Error:", error);
            setGenerationError(
                error.response?.data?.message ||
                    "An error occurred during instructions generation"
            );
        } finally {
            setIsGeneratingInstructions(false);
        }
    };

    const { data, setData, post, processing, errors, reset, progress } =
        useForm({
            title: "",
            description: "",
            ingredients: [],
            instructions: [],
            cooking_time: "",
            difficulty_level: "medium",
            image: null,
            video: null,
            youtube_url: "",
            product_ids: [],
        });

    // Handle image file selection
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

    // Handle selecting an existing image from the browser
    const handleExistingImageSelect = (image) => {
        console.log("Selected image:", image);

        // Set the image URL directly in the form data
        // We'll use a special format to indicate this is an existing image
        setData("image_url", image.url);

        // Try multiple alternative URL formats for the preview
        const tryAlternativeUrls = (originalUrl, callback) => {
            // First try the original URL
            const img1 = new Image();
            img1.onload = () => {
                console.log("Original URL loaded successfully:", originalUrl);
                callback(originalUrl);
            };
            img1.onerror = () => {
                console.error("Original URL failed:", originalUrl);

                // Try alternative URL 1: add 'public/' after '/storage/'
                const altUrl1 = originalUrl.replace(
                    "/storage/",
                    "/storage/public/"
                );
                console.log("Trying alternative URL 1:", altUrl1);

                const img2 = new Image();
                img2.onload = () => {
                    console.log(
                        "Alternative URL 1 loaded successfully:",
                        altUrl1
                    );
                    callback(altUrl1);
                };
                img2.onerror = () => {
                    console.error("Alternative URL 1 failed:", altUrl1);

                    // Try alternative URL 2: try direct path for recipes
                    const altUrl2 = originalUrl.replace(
                        "/storage/recipes/",
                        "/storage/public/recipes/"
                    );
                    console.log("Trying alternative URL 2:", altUrl2);

                    const img3 = new Image();
                    img3.onload = () => {
                        console.log(
                            "Alternative URL 2 loaded successfully:",
                            altUrl2
                        );
                        callback(altUrl2);
                    };
                    img3.onerror = () => {
                        console.error("Alternative URL 2 failed:", altUrl2);

                        // Try alternative URL 3: try with double public
                        const altUrl3 = originalUrl.replace(
                            "/storage/recipes/",
                            "/storage/public/public/recipes/"
                        );
                        console.log("Trying alternative URL 3:", altUrl3);

                        const img4 = new Image();
                        img4.onload = () => {
                            console.log(
                                "Alternative URL 3 loaded successfully:",
                                altUrl3
                            );
                            callback(altUrl3);
                        };
                        img4.onerror = () => {
                            console.error("Alternative URL 3 failed:", altUrl3);
                            // Fall back to the original URL
                            callback(originalUrl);
                        };
                        img4.src = altUrl3;
                    };
                    img3.src = altUrl2;
                };
                img2.src = altUrl1;
            };
            img1.src = originalUrl;
        };

        // Try to find a working URL for the preview
        tryAlternativeUrls(image.url, (workingUrl) => {
            setImagePreview(workingUrl);
        });
    };

    // Handle video file selection
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        setData("video", file);

        // Create a preview URL for video
        if (file) {
            const videoUrl = URL.createObjectURL(file);
            setVideoPreview(videoUrl);
        }
    };

    // Handle ingredient changes
    const handleIngredientChange = (index, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
        setData(
            "ingredients",
            newIngredients.filter((item) => item.trim() !== "")
        );
    };

    // Add new ingredient field
    const addIngredient = () => {
        setIngredients([...ingredients, ""]);
    };

    // Remove ingredient field
    const removeIngredient = (index) => {
        const newIngredients = [...ingredients];
        newIngredients.splice(index, 1);
        setIngredients(newIngredients);
        setData(
            "ingredients",
            newIngredients.filter((item) => item.trim() !== "")
        );
    };

    // Handle instruction changes
    const handleInstructionChange = (index, value) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
        setData(
            "instructions",
            newInstructions.filter((item) => item.trim() !== "")
        );
    };

    // Add new instruction field
    const addInstruction = () => {
        setInstructions([...instructions, ""]);
    };

    // Remove instruction field
    const removeInstruction = (index) => {
        const newInstructions = [...instructions];
        newInstructions.splice(index, 1);
        setInstructions(newInstructions);
        setData(
            "instructions",
            newInstructions.filter((item) => item.trim() !== "")
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Update ingredients and instructions before submitting
        setData(
            "ingredients",
            ingredients.filter((item) => item.trim() !== "")
        );
        setData(
            "instructions",
            instructions.filter((item) => item.trim() !== "")
        );

        post(route("admin.recipes.store"), {
            forceFormData: true,
            onSuccess: () => {
                // Reset the form after successful submission
                reset();
                setImagePreview(null);
                setVideoPreview(null);
                setIngredients([""]);
                setInstructions([""]);
                // The controller will redirect to the admin recipes index page
            },
        });
    };

    return (
        <MainLayout auth={auth}>
            <Head title="Create New Recipe" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Create New Recipe
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="title" value="Title" />
                                    <TextInput
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData("title", e.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError
                                        message={errors.title}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel
                                            htmlFor="description"
                                            value="Description"
                                        />
                                        {/* <button
                                            type="button"
                                            onClick={generateRecipeDescription}
                                            disabled={isGeneratingDescription || !data.title}
                                            className="px-2 py-1 text-xs bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                        >
                                            {isGeneratingDescription ? "Generating..." : "Generate with AI"}
                                        </button> */}
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
                                    {generationError && (
                                        <div
                                            className="mt-2 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
                                            role="alert"
                                        >
                                            <strong className="font-bold">
                                                Error:{" "}
                                            </strong>
                                            <span className="block sm:inline">
                                                {generationError}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="cooking_time"
                                        value="Cooking Time (minutes)"
                                    />
                                    <TextInput
                                        id="cooking_time"
                                        type="number"
                                        min="1"
                                        value={data.cooking_time}
                                        onChange={(e) =>
                                            setData(
                                                "cooking_time",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError
                                        message={errors.cooking_time}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="difficulty_level"
                                        value="Difficulty Level"
                                    />
                                    <select
                                        id="difficulty_level"
                                        value={data.difficulty_level}
                                        onChange={(e) =>
                                            setData(
                                                "difficulty_level",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-300 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400"
                                        required
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                    <InputError
                                        message={errors.difficulty_level}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="image"
                                        value="Recipe Image"
                                    />
                                    <div className="flex flex-col sm:flex-row sm:items-center mt-1 space-y-2 sm:space-y-0 sm:space-x-2">
                                        <input
                                            id="image"
                                            type="file"
                                            onChange={handleImageChange}
                                            className="block w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-100 dark:hover:file:bg-gray-600"
                                            accept="image/*"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setImageBrowserOpen(true)
                                            }
                                            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 whitespace-nowrap"
                                        >
                                            Browse Existing Images
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Upload a new image or select an existing
                                        one from the recipes folder.
                                    </p>
                                    <InputError
                                        message={errors.image}
                                        className="mt-2"
                                    />
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-32 w-32 object-cover rounded-md"
                                                onError={(e) => {
                                                    console.error(
                                                        "Image preview failed to load:",
                                                        imagePreview
                                                    );
                                                    e.target.onerror = null;
                                                    // Use a data URI for the placeholder image
                                                    e.target.src =
                                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjYWFhYWFhIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+";
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="video"
                                        value="Recipe Video (Optional)"
                                    />
                                    <input
                                        id="video"
                                        type="file"
                                        onChange={handleVideoChange}
                                        className="mt-1 block w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-100 dark:hover:file:bg-gray-600"
                                        accept="video/mp4,video/quicktime,video/x-msvideo,video/x-flv,video/x-ms-wmv"
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Supported formats: MP4, MOV, AVI, FLV,
                                        WMV (max 20MB)
                                    </p>
                                    <InputError
                                        message={errors.video}
                                        className="mt-2"
                                    />
                                    {videoPreview && (
                                        <div className="mt-2">
                                            <video
                                                src={videoPreview}
                                                controls
                                                className="h-48 w-full object-cover rounded-md"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="youtube_url"
                                        value="YouTube Video URL (Optional)"
                                    />
                                    <TextInput
                                        id="youtube_url"
                                        type="url"
                                        value={data.youtube_url}
                                        onChange={(e) =>
                                            setData(
                                                "youtube_url",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Enter a YouTube video URL (e.g.,
                                        https://www.youtube.com/watch?v=...)
                                    </p>
                                    <InputError
                                        message={errors.youtube_url}
                                        className="mt-2"
                                    />
                                </div>

                                {progress && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">
                                            Uploading files...
                                        </p>
                                        <progress
                                            value={progress.percentage}
                                            max="100"
                                            className="w-full"
                                        >
                                            {progress.percentage}%
                                        </progress>
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel value="Ingredients" />
                                        {/* <button
                                            type="button"
                                            onClick={generateRecipeIngredients}
                                            disabled={isGeneratingIngredients || !data.title}
                                            className="px-2 py-1 text-xs bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                        >
                                            {isGeneratingIngredients ? "Generating..." : "Generate with AI"}
                                        </button> */}
                                    </div>
                                    {ingredients.map((ingredient, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center mt-2"
                                        >
                                            <TextInput
                                                type="text"
                                                value={ingredient}
                                                onChange={(e) =>
                                                    handleIngredientChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                className="block w-full"
                                                placeholder={`Ingredient ${
                                                    index + 1
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeIngredient(index)
                                                }
                                                className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                disabled={
                                                    ingredients.length === 1
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addIngredient}
                                        className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                    >
                                        Add Ingredient
                                    </button>
                                    <InputError
                                        message={errors.ingredients}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center">
                                        <InputLabel value="Instructions" />
                                        {/* <button
                                            type="button"
                                            onClick={generateRecipeInstructions}
                                            disabled={
                                                isGeneratingInstructions ||
                                                !data.title
                                            }
                                            className="px-2 py-1 text-xs bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                        >
                                            {isGeneratingInstructions
                                                ? "Generating..."
                                                : "Generate with AI"}
                                        </button> */}
                                    </div>
                                    {instructions.map((instruction, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start mt-2"
                                        >
                                            <div className="flex-shrink-0 mt-2 mr-2 text-gray-900 dark:text-gray-100">
                                                {index + 1}.
                                            </div>
                                            <textarea
                                                value={instruction}
                                                onChange={(e) =>
                                                    handleInstructionChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-300 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400"
                                                rows="2"
                                                placeholder={`Step ${
                                                    index + 1
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeInstruction(index)
                                                }
                                                className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                disabled={
                                                    instructions.length === 1
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addInstruction}
                                        className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                    >
                                        Add Step
                                    </button>
                                    <InputError
                                        message={errors.instructions}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Associated Products" />
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {products.map((product) => (
                                            <label
                                                key={product.id}
                                                className="flex items-center"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={product.id}
                                                    checked={data.product_ids.includes(
                                                        product.id
                                                    )}
                                                    onChange={(e) => {
                                                        const newIds = e.target
                                                            .checked
                                                            ? [
                                                                  ...data.product_ids,
                                                                  product.id,
                                                              ]
                                                            : data.product_ids.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      product.id
                                                              );
                                                        setData(
                                                            "product_ids",
                                                            newIds
                                                        );
                                                    }}
                                                    className="rounded border-gray-300 dark:border-gray-700 text-blue-600 shadow-sm focus:border-blue-300 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-400"
                                                />
                                                <span className="ml-2 text-gray-900 dark:text-gray-100">
                                                    {product.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError
                                        message={errors.product_ids}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <Link
                                        href={route("admin.recipes.index")}
                                        className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mr-4"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-300 disabled:opacity-25 transition"
                                        disabled={processing}
                                    >
                                        Create Recipe
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Browser Modal */}
            <ImageBrowser
                isOpen={imageBrowserOpen}
                onClose={() => setImageBrowserOpen(false)}
                onSelect={handleExistingImageSelect}
                type="recipes"
                title="Select Recipe Image"
            />
        </MainLayout>
    );
}
