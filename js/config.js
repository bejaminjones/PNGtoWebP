/**
 * Application Configuration and Constants
 */

const Config = {
    // Conversion defaults
    defaults: {
        quality: 90,
        pngCompression: 6
    },
    
    // Processing settings
    processing: {
        maxConcurrentProcessing: 3, // Process up to 3 files simultaneously
        thumbnailTimeout: 5000 // Cleanup thumbnail URLs after 5 seconds
    },
    
    // Supported formats (to be updated at runtime with browser compatibility check)
    supportedFormats: {
        webp: false,
        avif: false,
        jpeg: true, // Almost universally supported
        png: true,  // Almost universally supported
        gif: true   // Almost universally supported
    },
    
    // MIME types for each format
    mimeTypes: {
        'webp': 'image/webp',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'avif': 'image/avif'
    }
};
