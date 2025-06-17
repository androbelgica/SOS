import React, { useState } from 'react';

const REACTION_TYPES = {
    like: { emoji: '👍', label: 'Like' },
    love: { emoji: '❤️', label: 'Love' },
    yum: { emoji: '😋', label: 'Yum' },
    fire: { emoji: '🔥', label: 'Fire' },
    clap: { emoji: '👏', label: 'Clap' }
};

export default function ReactionButton({ 
    reactionCounts = {}, 
    userReaction = null, 
    onReactionToggle,
    size = 'md',
    showCounts = true,
    disabled = false
}) {
    const [showPicker, setShowPicker] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

    const handleReactionClick = async (reactionType) => {
        if (disabled || isAnimating) return;
        
        setIsAnimating(true);
        setShowPicker(false);
        
        try {
            await onReactionToggle(reactionType);
        } catch (error) {
            console.error('Failed to toggle reaction:', error);
        } finally {
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    const sizeClasses = {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-3'
    };

    const emojiSizeClasses = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl'
    };

    return (
        <div className="relative inline-block">
            {/* Main Reaction Button */}
            <button
                onClick={() => setShowPicker(!showPicker)}
                disabled={disabled}
                className={`
                    ${sizeClasses[size]}
                    inline-flex items-center space-x-2 rounded-full border transition-all duration-200
                    ${userReaction
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 transform'}
                `}
            >
                <span className={emojiSizeClasses[size]}>
                    {userReaction ? REACTION_TYPES[userReaction]?.emoji : '👍'}
                </span>
                {showCounts && totalReactions > 0 && (
                    <span className="font-medium">
                        {totalReactions}
                    </span>
                )}
            </button>

            {/* Reaction Picker */}
            {showPicker && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowPicker(false)}
                    />

                    {/* Picker Panel */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
                            <div className="flex space-x-1">
                                {Object.entries(REACTION_TYPES).map(([type, { emoji, label }]) => (
                                    <button
                                        key={type}
                                        onClick={() => handleReactionClick(type)}
                                        disabled={isAnimating}
                                        className={`
                                            relative p-2 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95
                                            ${userReaction === type
                                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }
                                            ${isAnimating ? 'pointer-events-none' : ''}
                                        `}
                                        title={label}
                                    >
                                        <span className="text-xl">{emoji}</span>
                                        {reactionCounts[type] > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                                                {reactionCounts[type]}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-700"></div>
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800 -mt-1"></div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Loading Animation */}
            {isAnimating && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-full">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
