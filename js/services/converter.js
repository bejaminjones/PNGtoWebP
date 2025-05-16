/**
 * Converter Service
 * Handles the core image conversion functionality
 */

const ConverterService = {
    /**
     * Convert a file to the specified format
     * @param {File} file - The file to convert
     * @param {Function} progressCallback - Callback for progress updates
     * @param {Function} successCallback - Callback for successful conversion
     * @param {Function} errorCallback - Callback for conversion errors
     */
    convertFile(file, progressCallback, successCallback, errorCallback) {
        const startTime = performance.now();
        
        try {
            // Get conversion options from the UI
            const options = this.getConversionOptions();
            
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Create image element for loading the file
            const img = new Image();
            img.onload = async () => {
                try {
                    // Handle image loaded successfully
                    progressCallback(10); // Image loaded, 10% progress
                    
                    // Set canvas dimensions based on resize options
                    const dimensions = this.calculateDimensions(img.width, img.height, options);
                    canvas.width = dimensions.width;
                    canvas.height = dimensions.height;
                    
                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    progressCallback(30); // Image drawn to canvas, 30% progress
                    
                    // Convert to selected format
                    const blob = await this.applyConversion(canvas, ctx, options);
                    progressCallback(90); // Conversion done, 90% progress
                    
                    // Prepare result
                    const originalFormat = file.type.split('/')[1] || 'unknown';
                    const result = {
                        blob,
                        fileName: this.getOutputFileName(file.name, options.format),
                        originalFile: file,
                        originalFormat,
                        format: options.format,
                        originalSize: file.size,
                        processingTime: performance.now() - startTime
                    };
                    
                    // Clean up
                    URL.revokeObjectURL(img.src);
                    progressCallback(100); // Process complete, 100% progress
                    
                    // Call success callback
                    successCallback(result);
                } catch (err) {
                    errorCallback(err);
                }
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                errorCallback(new Error('Failed to load image. The file may be corrupted or not supported.'));
            };
            
            // Load the image file
            img.src = URL.createObjectURL(file);
            progressCallback(5); // Started loading image, 5% progress
            
        } catch (err) {
            errorCallback(err);
        }
    },
    
    /**
     * Get conversion options from the UI
     * @returns {Object} Options object
     */
    getConversionOptions() {
        // Output format
        const outputFormat = document.getElementById('outputFormat').value;
        
        // Quality settings
        const quality = parseInt(document.getElementById('qualitySlider').value, 10) / 100;
        
        // Lossless option
        const lossless = document.getElementById('losslessOption').checked;
        
        // Size optimization
        const sizeOptimization = document.getElementById('sizeOptimizationToggle').checked;
        const targetFileSize = sizeOptimization ? 
            parseInt(document.getElementById('targetFileSize').value, 10) * 1024 : null;
        
        // Resize options
        const resize = document.getElementById('resizeOption').checked;
        let width = null;
        let height = null;
        let maintainAspectRatio = true;
        let scalePercent = 100;
        
        if (resize) {
            width = parseInt(document.getElementById('widthInput').value, 10) || null;
            height = parseInt(document.getElementById('heightInput').value, 10) || null;
            maintainAspectRatio = document.getElementById('maintainAspectRatio').checked;
            scalePercent = parseInt(document.getElementById('scalePercent').value, 10) || 100;
        }
        
        // Format-specific options
        const formatOptions = {};
        
        // WebP options
        if (outputFormat === 'webp') {
            formatOptions.alpha = document.getElementById('webpAlpha').checked;
        }
        
        // JPEG options
        if (outputFormat === 'jpeg') {
            formatOptions.progressive = document.getElementById('jpegProgressive').checked;
        }
        
        // PNG options
        if (outputFormat === 'png') {
            formatOptions.compressionLevel = parseInt(document.getElementById('pngCompression').value, 10);
        }
        
        // AVIF options
        if (outputFormat === 'avif') {
            formatOptions.lowDataMode = document.getElementById('avifLowDataMode').checked;
        }
        
        // Return compiled options
        return {
            format: outputFormat,
            quality,
            lossless,
            sizeOptimization,
            targetFileSize,
            resize,
            width,
            height,
            maintainAspectRatio,
            scalePercent,
            formatOptions,
            preserveMetadata: document.getElementById('preserveMetadata').checked
        };
    },
    
    /**
     * Calculate dimensions based on resize options
     * @param {number} originalWidth - Original image width
     * @param {number} originalHeight - Original image height
     * @param {Object} options - Resize options
     * @returns {Object} New dimensions {width, height}
     */
    calculateDimensions(originalWidth, originalHeight, options) {
        if (!options.resize) {
            return { width: originalWidth, height: originalHeight };
        }
        
        let width = originalWidth;
        let height = originalHeight;
        
        // Apply scaling percentage if specified
        if (options.scalePercent && options.scalePercent !== 100) {
            width = Math.round(originalWidth * (options.scalePercent / 100));
            height = Math.round(originalHeight * (options.scalePercent / 100));
            return { width, height };
        }
        
        // Apply specific dimensions
        if (options.width && options.height) {
            // Both dimensions specified
            width = options.width;
            height = options.height;
        } else if (options.width) {
            // Only width specified
            width = options.width;
            if (options.maintainAspectRatio) {
                height = Math.round(originalHeight * (width / originalWidth));
            }
        } else if (options.height) {
            // Only height specified
            height = options.height;
            if (options.maintainAspectRatio) {
                width = Math.round(originalWidth * (height / originalHeight));
            }
        }
        
        return { width, height };
    },
    
    /**
     * Apply the conversion to the image
     * @param {HTMLCanvasElement} canvas - The canvas with the image
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} options - Conversion options
     * @returns {Promise<Blob>} Promise resolving to the converted image blob
     */
    async applyConversion(canvas, ctx, options) {
        return new Promise(async (resolve, reject) => {
            try {
                let blob;
                let compression = {};
                
                // Handle compression options based on format
                if (options.format === 'webp') {
                    compression = {
                        quality: options.lossless ? 1 : options.quality,
                        lossless: options.lossless,
                        alpha: options.formatOptions.alpha
                    };
                    
                    blob = await this.canvasToBlob(canvas, 'image/webp', compression);
                } 
                else if (options.format === 'jpeg') {
                    // JPEG always uses lossy compression
                    blob = await this.canvasToBlob(canvas, 'image/jpeg', { 
                        quality: options.quality,
                        progressive: options.formatOptions.progressive
                    });
                } 
                else if (options.format === 'png') {
                    // PNG is always lossless, so quality doesn't matter
                    blob = await this.canvasToBlob(canvas, 'image/png');
                    
                    // Further compress PNG if needed using browser-image-compression
                    if (options.formatOptions.compressionLevel > 0) {
                        const compressedBlob = await imageCompression(blob, {
                            maxSizeMB: Number.MAX_VALUE, // No size limit
                            useWebWorker: true,
                            maxIteration: options.formatOptions.compressionLevel // Use compression level as iterations
                        });
                        blob = compressedBlob;
                    }
                } 
                else if (options.format === 'gif') {
                    // GIF doesn't support many options
                    blob = await this.canvasToBlob(canvas, 'image/gif');
                } 
                else if (options.format === 'avif') {
                    if (!Config.supportedFormats.avif) {
                        throw new Error('AVIF format is not supported by your browser');
                    }
                    
                    compression = {
                        quality: options.lossless ? 1 : options.quality,
                        speed: options.formatOptions.lowDataMode ? 8 : 4 // Lower is better quality but slower
                    };
                    
                    blob = await this.canvasToBlob(canvas, 'image/avif', compression);
                } 
                else {
                    // Fallback to WebP if format not recognized
                    blob = await this.canvasToBlob(canvas, 'image/webp', { quality: options.quality });
                }
                
                // Apply size optimization if enabled
                if (options.sizeOptimization && options.targetFileSize && 
                    ['webp', 'jpeg', 'avif'].includes(options.format) && !options.lossless) {
                    
                    blob = await this.optimizeFileSize(canvas, options.format, options.targetFileSize);
                }
                
                resolve(blob);
            } catch (err) {
                reject(err);
            }
        });
    },
    
    /**
     * Convert canvas to blob with the specified format and options
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {string} mimeType - MIME type for the output format
     * @param {Object} options - Format-specific options
     * @returns {Promise<Blob>} Promise resolving to the blob
     */
    canvasToBlob(canvas, mimeType, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error(`Failed to convert to ${mimeType}`));
                    }
                }, mimeType, options.quality);
            } catch (err) {
                reject(err);
            }
        });
    },
    
    /**
     * Optimize the image to meet target file size
     * @param {HTMLCanvasElement} canvas - Canvas with image
     * @param {string} format - Output format
     * @param {number} targetSize - Target file size in bytes
     * @returns {Promise<Blob>} Promise resolving to the optimized blob
     */
    async optimizeFileSize(canvas, format, targetSize) {
        // Binary search for optimal quality setting
        let minQuality = 0.01; // 1%
        let maxQuality = 1.0;  // 100%
        let currentQuality = 0.7; // Start at 70%
        let currentBlob = null;
        let attempts = 0;
        const maxAttempts = 10; // Limit iterations to avoid infinite loop
        
        const mimeType = FormatUtils.getMimeType(format);
        
        while (attempts < maxAttempts) {
            attempts++;
            
            // Create blob with current quality
            currentBlob = await this.canvasToBlob(canvas, mimeType, { quality: currentQuality });
            
            // Check if we're close enough to target size
            if (Math.abs(currentBlob.size - targetSize) / targetSize < 0.05) {
                // Within 5% of target, good enough
                break;
            }
            
            // Adjust quality based on current size vs target
            if (currentBlob.size > targetSize) {
                // Too big, reduce quality
                maxQuality = currentQuality;
                currentQuality = (minQuality + currentQuality) / 2;
            } else {
                // Too small, increase quality
                minQuality = currentQuality;
                currentQuality = (currentQuality + maxQuality) / 2;
            }
            
            // If quality range becomes too small, stop
            if (maxQuality - minQuality < 0.01) {
                break;
            }
        }
        
        return currentBlob;
    },
    
    /**
     * Generate output filename based on input name and format
     * @param {string} inputName - Original filename
     * @param {string} format - Output format
     * @returns {string} New filename
     */
    getOutputFileName(inputName, format) {
        // Remove original extension
        let baseName = inputName.replace(/\.[^/.]+$/, "");
        
        // If the extension is already present in the name, handle it
        const extensionRegex = new RegExp(`[-_]${format}$`, 'i');
        if (extensionRegex.test(baseName)) {
            return `${baseName}.${format}`;
        }
        
        return `${baseName}-${format}.${format}`;
    }
};
