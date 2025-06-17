import React from 'react';
import CategoryBadge from './CategoryBadge';

const CategoryStats = ({ 
    categories = [], 
    title = "Category Overview",
    showCounts = true,
    layout = 'grid' // 'grid', 'list', 'horizontal'
}) => {
    if (!categories || categories.length === 0) {
        return null;
    }

    const totalCount = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);

    if (layout === 'horizontal') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {title}
                </h3>
                <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                        <div
                            key={category.category || category.value}
                            className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2"
                        >
                            <span className="text-xl">{category.icon}</span>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {category.label || category.category}
                                </div>
                                {showCounts && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {category.count || 0} items
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {showCounts && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total: <span className="font-medium text-gray-900 dark:text-white">{totalCount}</span> items
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (layout === 'list') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {categories.map((category) => (
                        <div
                            key={category.category || category.value}
                            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{category.icon}</span>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {category.label || category.category}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {category.category || category.value}
                                    </div>
                                </div>
                            </div>
                            {showCounts && (
                                <div className="text-right">
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {category.count || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        items
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {showCounts && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total: <span className="font-medium text-gray-900 dark:text-white">{totalCount}</span> items
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default grid layout
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                    <div
                        key={category.category || category.value}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                    >
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {category.label || category.category}
                        </div>
                        {showCounts && (
                            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {category.count || 0}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {showCounts ? 'items' : (category.category || category.value)}
                        </div>
                    </div>
                ))}
            </div>
            {showCounts && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total: <span className="font-medium text-gray-900 dark:text-white">{totalCount}</span> items across {categories.length} categories
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryStats;
