/**
 * Utility functions for handling images
 */

/**
 * Add a cache-busting parameter to an image URL
 * @param {string} url - The original image URL
 * @param {number} timestamp - The timestamp to use for cache busting
 * @returns {string} - The URL with a cache-busting parameter
 */
export const addCacheBuster = (url, timestamp = Date.now()) => {
    if (!url) return null;

    // Check if the URL already has a query parameter
    if (url.includes('?')) {
        return `${url}&t=${timestamp}`;
    } else {
        return `${url}?t=${timestamp}`;
    }
};

/**
 * Get a fallback image URL for a specific type
 * @param {string} type - The type of image (product, recipe, etc.)
 * @returns {string} - The fallback image URL
 */
export const getFallbackImage = (type) => {
    // Default fallback that should always exist
    const defaultFallback = '/images/placeholder.jpg';

    // For now, just use the default fallback for all types to ensure it works
    return defaultFallback;
};

/**
 * Get the full image URL with optional cache busting
 * @param {string} imagePath - The image path or URL
 * @param {number} timestamp - The timestamp to use for cache busting
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imagePath, timestamp, type = 'product') => {
    // If no image path is provided, return the appropriate placeholder
    if (!imagePath) {
        return getFallbackImage(type);
    }

    // If it's already a full URL (like Unsplash), return it with cache busting
    if (imagePath.startsWith('http')) {
        // Remove any existing timestamp parameters to prevent duplicates
        const cleanUrl = imagePath.split('?')[0];
        const queryParams = imagePath.includes('?') ?
            imagePath.substring(imagePath.indexOf('?')).replace(/[?&]t=\d+/g, '') : '';

        // Add our timestamp parameter
        const separator = queryParams ? '&' : '?';
        return `${cleanUrl}${queryParams}${separator}t=${timestamp}`;
    }

    // For local storage paths, use relative paths that work with Vite's dev server
    // This is important because the files are served through the Laravel public directory

    // Ensure the path starts with /storage
    let path = imagePath.startsWith('/storage')
        ? imagePath
        : `/storage/${imagePath}`;

    // Remove any existing timestamp parameters to prevent duplicates
    const cleanPath = path.split('?')[0];

    // Return the relative path with timestamp
    // This will be resolved relative to the current page URL
    return `${cleanPath}?t=${timestamp}`;
};

/**
 * Create an image component with error handling and cache busting
 * @param {Object} options - The options object
 * @param {string} options.src - The image source URL
 * @param {number} options.timestamp - The timestamp to use for cache busting
 * @param {string} options.type - The type of image (product, recipe, etc.)
 * @param {string} options.alt - The image alt text
 * @param {string} options.className - The image CSS class
 * @param {Function} options.onLoad - Optional callback when image loads
 * @returns {Object} - The image props with error handling and cache busting
 */
export const getImageProps = (options) => {
    // Extract options with defaults
    const {
        src,
        timestamp = Date.now(),
        type = 'default',
        alt = 'Image',
        className = '',
        onLoad
    } = options;

    const fallbackSrc = getFallbackImage(type);

    // Use getImageUrl to handle the src, or fallback if src is null/undefined
    const cacheBustedSrc = src ? getImageUrl(src, timestamp, type) : fallbackSrc;

    // Custom onLoad handler that combines the provided one with our logging
    const handleLoad = (e) => {
        console.log(`✓ Image loaded: ${alt} from ${cacheBustedSrc}`);
        if (typeof onLoad === 'function') {
            onLoad(e);
        }
    };

    return {
        src: cacheBustedSrc,
        alt: alt,
        className: className,
        onLoad: handleLoad,
        onError: (e) => {
            console.error(`Failed to load image: ${cacheBustedSrc}`);
            e.target.onerror = null;
            e.target.src = fallbackSrc;
        }
    };
};
