import React, { useState, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { getImageUrl, getFallbackImage } from "@/Utils/imageHelpers";

export default function Edit({ auth, recipe, products, timestamp }) {
    const { asset } = usePage().props;

    const [clientTimestamp, setClientTimestamp] = useState(Date.now());
    const cacheTimestamp = timestamp || clientTimestamp;

    // Initialize image preview with the recipe's image URL
    const [imagePreview, setImagePreview] = useState(
        getImageUrl(recipe.image_url, cacheTimestamp)
    );

    // Initialize video preview with the recipe's video URL
    const [videoPreview, setVideoPreview] = useState(
        recipe.video_url ? getImageUrl(recipe.video_url, cacheTimestamp) : null
    );

    // For dynamic ingredients and instructions
    const [ingredients, setIngredients] = useState(recipe.ingredients || [""]);
    const [instructions, setInstructions] = useState(recipe.instructions || [""]);

    // For debugging component loading
    useEffect(() => {
        console.log("Edit Recipe component mounted");
    }, []);

    const { data, setData, post, processing, errors, reset, progress } =
        useForm({
            _method: "PUT", // Use POST with _method for file uploads
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || [],
            cooking_time: recipe.cooking_time,
            difficulty_level: recipe.difficulty_level,
            image: null,
            video: null,
            youtube_url: recipe.video_url && (recipe.video_url.includes('youtube.com') || recipe.video_url.includes('youtu.be')) ? recipe.video_url : '',
            product_ids: recipe.products.map((p) => p.id),
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
        setData("ingredients", newIngredients.filter(item => item.trim() !== ""));
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
        setData("ingredients", newIngredients.filter(item => item.trim() !== ""));
    };

    // Handle instruction changes
    const handleInstructionChange = (index, value) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
        setData("instructions", newInstructions.filter(item => item.trim() !== ""));
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
        setData("instructions", newInstructions.filter(item => item.trim() !== ""));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Update ingredients and instructions before submitting
        setData("ingredients", ingredients.filter(item => item.trim() !== ""));
        setData("instructions", instructions.filter(item => item.trim() !== ""));

        // Use post instead of put for file uploads
        post(route("admin.recipes.update", recipe.id), {
            forceFormData: true,
            onSuccess: (page) => {
                // Reset the file fields after successful upload
                setData("image", null);
                setData("video", null);

                // The controller will redirect to the admin recipes index page
                // No need to do anything else here
            },
        });
    };

    return (
        <MainLayout auth={auth}>
            <Head title={`Edit ${recipe.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Edit Recipe
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
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
                                    <div className="mt-2 flex items-center">
                                        {imagePreview && (
                                            <div className="mr-4">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="h-32 w-32 object-cover rounded-md"
                                                />
                                            </div>
                                        )}
                                        <input
                                            id="image"
                                            type="file"
                                            onChange={handleImageChange}
                                            className="block w-full"
                                            accept="image/*"
                                        />
                                    </div>
                                    <InputError
                                        message={errors.image}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="video"
                                        value="Recipe Video (Optional)"
                                    />
                                    <div className="mt-2">
                                        {videoPreview && !data.youtube_url && (
                                            <div className="mb-4">
                                                <video
                                                    src={videoPreview}
                                                    controls
                                                    className="h-48 w-full object-cover rounded-md"
                                                />
                                            </div>
                                        )}
                                        <input
                                            id="video"
                                            type="file"
                                            onChange={handleVideoChange}
                                            className="block w-full"
                                            accept="video/mp4,video/quicktime,video/x-msvideo,video/x-flv,video/x-ms-wmv"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Supported formats: MP4, MOV, AVI, FLV, WMV (max 20MB)
                                        </p>
                                    </div>
                                    <InputError
                                        message={errors.video}
                                        className="mt-2"
                                    />
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
                                            setData("youtube_url", e.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter a YouTube video URL (e.g., https://www.youtube.com/watch?v=...)
                                    </p>
                                    <InputError
                                        message={errors.youtube_url}
                                        className="mt-2"
                                    />
                                    {data.youtube_url && (
                                        <div className="mt-4 p-2 border border-gray-200 rounded-md">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Current YouTube Video:</p>
                                            <p className="text-sm text-blue-600 break-all">{data.youtube_url}</p>
                                        </div>
                                    )}
                                </div>

                                {progress && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Uploading files...</p>
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
                                    <InputLabel value="Ingredients" />
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
                                                className="ml-2 text-red-600 hover:text-red-800"
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
                                        className="mt-2 text-blue-600 hover:text-blue-800"
                                    >
                                        Add Ingredient
                                    </button>
                                    <InputError
                                        message={errors.ingredients}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Instructions" />
                                    {instructions.map((instruction, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start mt-2"
                                        >
                                            <div className="flex-shrink-0 mt-2 mr-2">
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
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
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
                                                className="ml-2 text-red-600 hover:text-red-800"
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
                                        className="mt-2 text-blue-600 hover:text-blue-800"
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
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                />
                                                <span className="ml-2">
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
                                        className="underline text-sm text-gray-600 hover:text-gray-900 mr-4"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-300 disabled:opacity-25 transition"
                                        disabled={processing}
                                    >
                                        Update Recipe
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
