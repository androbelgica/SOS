import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function EditUserRecipe({ auth, recipe, products, categories }) {
    const [ingredients, setIngredients] = useState(recipe.ingredients || ['']);
    const [instructions, setInstructions] = useState(recipe.instructions || ['']);
    const [imagePreview, setImagePreview] = useState(recipe.image_url || null);

    const { data, setData, put, processing, errors, reset } = useForm({
        title: recipe.title || '',
        description: recipe.description || '',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        cooking_time: recipe.cooking_time || '',
        difficulty_level: recipe.difficulty_level || 'medium',
        category: recipe.category || '',
        image: null,
        video: null,
        youtube_url: recipe.video_url || '',
        product_ids: recipe.products ? recipe.products.map(p => p.id) : [],
        action: 'save_draft'
    });

    useEffect(() => {
        setIngredients(recipe.ingredients || ['']);
        setInstructions(recipe.instructions || ['']);
    }, [recipe]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addIngredient = () => {
        setIngredients([...ingredients, '']);
    };

    const removeIngredient = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const updateIngredient = (index, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const addInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const removeInstruction = (index) => {
        const newInstructions = instructions.filter((_, i) => i !== index);
        setInstructions(newInstructions);
    };

    const updateInstruction = (index, value) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
    };

    const handleSubmit = (action) => {
        setData('action', action);
        setData('ingredients', ingredients.filter(item => item.trim() !== ''));
        setData('instructions', instructions.filter(item => item.trim() !== ''));

        put(route('user.recipes.update', recipe.id), {
            forceFormData: true,
            onSuccess: () => {
                // Don't reset on success for edit form
            },
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Submitted',
            under_review: 'Under Review',
            approved: 'Approved',
            rejected: 'Rejected'
        };
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <MainLayout auth={auth}>
            <Head title={`Edit Recipe - ${recipe.title}`} />
            
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Recipe</h1>
                                        <p className="text-gray-600 dark:text-gray-300">Update your seafood recipe</p>
                                    </div>
                                    {getStatusBadge(recipe.status)}
                                </div>
                                <div className="flex gap-3">
                                    <Link
                                        href={route('user.recipes.show', recipe.id)}
                                        className="bg-gray-500 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Cancel
                                    </Link>
                                    <Link
                                        href={route('user.recipes.index')}
                                        className="bg-gray-400 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Back to My Recipes
                                    </Link>
                                </div>
                            </div>

                            {/* Rejection Reason Alert */}
                            {recipe.status === 'rejected' && recipe.rejection_reason && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Recipe was rejected</h3>
                                    <p className="text-red-700 dark:text-red-300">
                                        <strong>Reason:</strong> {recipe.rejection_reason}
                                    </p>
                                    <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                                        Please address the feedback above and resubmit your recipe.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Recipe Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Enter recipe title"
                                        />
                                        {errors.title && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Select a category</option>
                                            {Object.entries(categories).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.category}</p>}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Describe your recipe..."
                                    />
                                    {errors.description && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description}</p>}
                                </div>

                                {/* Recipe Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Cooking Time (minutes) *
                                        </label>
                                        <input
                                            type="number"
                                            value={data.cooking_time}
                                            onChange={(e) => setData('cooking_time', e.target.value)}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="30"
                                            min="1"
                                        />
                                        {errors.cooking_time && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.cooking_time}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Difficulty Level *
                                        </label>
                                        <select
                                            value={data.difficulty_level}
                                            onChange={(e) => setData('difficulty_level', e.target.value)}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                        {errors.difficulty_level && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.difficulty_level}</p>}
                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Ingredients *
                                    </label>
                                    {ingredients.map((ingredient, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={ingredient}
                                                onChange={(e) => updateIngredient(index, e.target.value)}
                                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder={`Ingredient ${index + 1}`}
                                            />
                                            {ingredients.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeIngredient(index)}
                                                    className="bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-2 rounded transition-colors duration-200"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addIngredient}
                                        className="bg-green-500 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                                    >
                                        Add Ingredient
                                    </button>
                                    {errors.ingredients && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.ingredients}</p>}
                                </div>

                                {/* Instructions */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Instructions *
                                    </label>
                                    {instructions.map((instruction, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <div className="flex-shrink-0 w-8 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                                                {index + 1}
                                            </div>
                                            <textarea
                                                value={instruction}
                                                onChange={(e) => updateInstruction(index, e.target.value)}
                                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder={`Step ${index + 1}`}
                                                rows={2}
                                            />
                                            {instructions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeInstruction(index)}
                                                    className="bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-2 rounded transition-colors duration-200"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addInstruction}
                                        className="bg-green-500 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                                    >
                                        Add Step
                                    </button>
                                    {errors.instructions && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.instructions}</p>}
                                </div>

                                {/* Media Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Recipe Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300 dark:hover:file:bg-blue-900/30"
                                        />
                                        {imagePreview && (
                                            <img src={imagePreview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-600" />
                                        )}
                                        {errors.image && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.image}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            YouTube URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={data.youtube_url}
                                            onChange={(e) => setData('youtube_url', e.target.value)}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                        {errors.youtube_url && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.youtube_url}</p>}
                                    </div>
                                </div>

                                {/* Related Products */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Related Products (Optional)
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700">
                                        {products.map((product) => (
                                            <label key={product.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    value={product.id}
                                                    checked={data.product_ids.includes(product.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setData('product_ids', [...data.product_ids, product.id]);
                                                        } else {
                                                            setData('product_ids', data.product_ids.filter(id => id !== product.id));
                                                        }
                                                    }}
                                                    className="rounded text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-600 dark:border-gray-500"
                                                />
                                                <span className="text-sm text-gray-900 dark:text-gray-300">{product.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit('save_draft')}
                                        disabled={processing}
                                        className="bg-gray-500 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    {(recipe.status === 'draft' || recipe.status === 'rejected') && (
                                        <button
                                            type="button"
                                            onClick={() => handleSubmit('submit_for_review')}
                                            disabled={processing}
                                            className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 transition-colors duration-200"
                                        >
                                            {processing ? 'Submitting...' : 'Submit for Review'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
