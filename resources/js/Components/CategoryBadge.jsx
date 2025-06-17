import React from 'react';

const CategoryBadge = ({ 
    category, 
    icon, 
    color = 'gray', 
    size = 'sm', 
    showIcon = true,
    className = '' 
}) => {
    const getColorClasses = (color) => {
        const colorMap = {
            blue: 'text-blue-700 bg-blue-100 border-blue-200',
            cyan: 'text-cyan-700 bg-cyan-100 border-cyan-200',
            orange: 'text-orange-700 bg-orange-100 border-orange-200',
            red: 'text-red-700 bg-red-100 border-red-200',
            green: 'text-green-700 bg-green-100 border-green-200',
            yellow: 'text-yellow-700 bg-yellow-100 border-yellow-200',
            gray: 'text-gray-700 bg-gray-100 border-gray-200',
            indigo: 'text-indigo-700 bg-indigo-100 border-indigo-200',
            purple: 'text-purple-700 bg-purple-100 border-purple-200',
            pink: 'text-pink-700 bg-pink-100 border-pink-200',
        };
        return colorMap[color] || colorMap.gray;
    };

    const getSizeClasses = (size) => {
        const sizeMap = {
            xs: 'px-2 py-1 text-xs',
            sm: 'px-2.5 py-1.5 text-sm',
            md: 'px-3 py-2 text-base',
            lg: 'px-4 py-2 text-lg',
        };
        return sizeMap[size] || sizeMap.sm;
    };

    const colorClasses = getColorClasses(color);
    const sizeClasses = getSizeClasses(size);

    return (
        <span 
            className={`inline-flex items-center rounded-full border font-medium ${colorClasses} ${sizeClasses} ${className}`}
        >
            {showIcon && icon && (
                <span className="mr-1">{icon}</span>
            )}
            {category}
        </span>
    );
};

export default CategoryBadge;
