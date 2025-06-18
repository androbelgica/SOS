import React from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

const CategoryFilter = ({ 
    categories = [], 
    currentCategory = '', 
    onCategoryChange,
    routeName,
    filters = {},
    showIcons = true,
    showCounts = false,
    layout = 'dropdown' // 'dropdown', 'tabs', 'pills'
}) => {
    const handleCategoryChange = (categoryValue) => {
        if (onCategoryChange) {
            onCategoryChange(categoryValue);
        } else if (routeName) {
            router.get(
                route(routeName),
                { ...filters, category: categoryValue || null },
                { preserveState: true }
            );
        }
    };

    const getCategoryColorClass = (color) => {
        const colorMap = {
            blue: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
            cyan: 'text-cyan-600 bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
            orange: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100',
            red: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100',
            green: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100',
            yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
            gray: 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100',
        };
        return colorMap[color] || colorMap.gray;
    };

    const getSelectedColorClass = (color) => {
        const colorMap = {
            blue: 'text-white bg-blue-600 border-blue-600',
            cyan: 'text-white bg-cyan-600 border-cyan-600',
            orange: 'text-white bg-orange-600 border-orange-600',
            red: 'text-white bg-red-600 border-red-600',
            green: 'text-white bg-green-600 border-green-600',
            yellow: 'text-white bg-yellow-600 border-yellow-600',
            gray: 'text-white bg-gray-600 border-gray-600',
        };
        return colorMap[color] || colorMap.gray;
    };

    if (layout === 'dropdown') {
        return (
            <div className="w-full md:w-64">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                </label>
                <select
                    id="category"
                    name="category"
                    value={currentCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.value || category} value={category.value || category}>
                            {showIcons && category.icon ? `${category.icon} ` : ''}
                            {category.label || category}
                            {showCounts && category.count ? ` (${category.count})` : ''}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    if (layout === 'tabs') {
        return (
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    <button
                        onClick={() => handleCategoryChange('')}
                        className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                            !currentCategory
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.value || category}
                            onClick={() => handleCategoryChange(category.value || category)}
                            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center ${
                                currentCategory === (category.value || category)
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            {showIcons && category.icon && (
                                <span className="mr-2">{category.icon}</span>
                            )}
                            {category.label || category}
                            {showCounts && category.count && (
                                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                                    {category.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        );
    }

    if (layout === 'pills') {
        return (
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleCategoryChange('')}
                    className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${
                        !currentCategory
                            ? 'text-white bg-indigo-600 border-indigo-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                >
                    All Categories
                </button>
                {categories.map((category) => {
                    const isSelected = currentCategory === (category.value || category);
                    const colorClass = isSelected 
                        ? getSelectedColorClass(category.color)
                        : getCategoryColorClass(category.color);
                    
                    return (
                        <button
                            key={category.value || category}
                            onClick={() => handleCategoryChange(category.value || category)}
                            className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${colorClass}`}
                        >
                            {showIcons && category.icon && (
                                <span className="mr-2">{category.icon}</span>
                            )}
                            {category.label || category}
                            {showCounts && category.count && (
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                    isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {category.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    return null;
};

export default CategoryFilter;
