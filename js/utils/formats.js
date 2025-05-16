/**
 * Format Utilities
 * Helper functions for handling image formats
 */

const FormatUtils = {
    /**
     * Get the MIME type for a format
     * @param {string} format - The format (webp, jpeg, png, etc.)
     * @returns {string} The corresponding MIME type
     */
    getMimeType(format) {
        return Config.mimeTypes[format] || 'image/webp';
    },
    
    /**
     * Format a file size in a human-readable way
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size (e.g., "2.5 MB")
     */
    formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    },
    
    /**
     * Calculate size reduction percentage
     * @param {number} originalSize - Original file size in bytes
     * @param {number} newSize - New file size in bytes
     * @returns {number} Size reduction percentage
     */
    calculateSizeReduction(originalSize, newSize) {
        if (originalSize <= 0) return 0;
        const reduction = ((originalSize - newSize) / originalSize) * 100;
        return reduction < 0 ? 0 : Math.round(reduction);
    },
    
    /**
     * Check if a format requires quality setting
     * @param {string} format - The format (webp, jpeg, png, etc.)
     * @param {boolean} isLossless - Whether lossless mode is enabled
     * @returns {boolean} Whether the format requires quality setting
     */
    requiresQualitySetting(format, isLossless) {
        // PNG and GIF don't use quality settings as they are lossless by default
        if (format === 'png' || format === 'gif') {
            return false;
        }
        
        // If lossless mode is enabled, quality setting is irrelevant
        if (isLossless) {
            return false;
        }
        
        // WebP, JPEG, and AVIF support quality settings in lossy mode
        return ['webp', 'jpeg', 'avif'].includes(format);
    },
    
    /**
     * Get the extension for a format
     * @param {string} format - The format (webp, jpeg, png, etc.)
     * @returns {string} The file extension
     */
    getExtension(format) {
        return format === 'jpeg' ? 'jpg' : format;
    },
    
    /**
     * Check if a format supports lossless compression
     * @param {string} format - The format (webp, jpeg, png, etc.)
     * @returns {boolean} Whether the format supports lossless compression
     */
    supportsLossless(format) {
        return ['webp', 'png', 'gif'].includes(format);
    }
};
