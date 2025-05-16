/**
 * Browser Compatibility Service
 * Checks browser support for different image formats
 */

const CompatibilityService = {
    /**
     * Check browser compatibility for different image formats
     * @returns {Promise} Promise that resolves when checks are complete
     */
    checkBrowserCompatibility() {
        return new Promise(resolve => {
            // Check WebP support
            const webpImage = new Image();
            webpImage.onload = () => { 
                Config.supportedFormats.webp = true;
                this.checkAvif();
            };
            webpImage.onerror = () => { 
                Config.supportedFormats.webp = false;
                this.checkAvif();
            };
            webpImage.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
            
            /**
             * Check AVIF support
             */
            this.checkAvif = () => {
                const avifImage = new Image();
                avifImage.onload = () => { 
                    Config.supportedFormats.avif = true;
                    this.showCompatibilityInfo();
                    resolve();
                };
                avifImage.onerror = () => { 
                    Config.supportedFormats.avif = false;
                    this.showCompatibilityInfo();
                    resolve();
                };
                avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
            };
        });
    },
    
    /**
     * Create a notification about browser compatibility
     */
    showCompatibilityInfo() {
        // Create a compatibility info container
        const compatInfo = document.createElement('div');
        compatInfo.className = 'compat-info';
        compatInfo.style.margin = '10px 0';
        compatInfo.style.padding = '10px 15px';
        compatInfo.style.borderRadius = '8px';
        compatInfo.style.backgroundColor = 'var(--highlight-color)';
        compatInfo.style.fontSize = '14px';
        
        // Prepare a message based on compatibility
        let compatMessage = '<strong>Browser Format Support:</strong>';
        for (const [format, supported] of Object.entries(Config.supportedFormats)) {
            compatMessage += `<span style="margin: 0 5px; display: inline-block; ${supported ? 'color: var(--success-color)' : 'color: var(--error-color)'}">
                ${format.toUpperCase()}: ${supported ? '✓' : '✗'}
            </span>`;
        }
        
        // Add unsupported formats to the compatibility message
        const unsupportedFormats = Object.entries(Config.supportedFormats)
            .filter(([_, supported]) => !supported)
            .map(([format]) => format.toUpperCase());
        
        if (unsupportedFormats.length > 0) {
            compatMessage += `<div style="margin-top: 5px; font-style: italic;">Note: Your browser doesn't support ${unsupportedFormats.join(', ')}. Consider using other formats for better compatibility.</div>`;
        }
        
        compatInfo.innerHTML = compatMessage;
        
        // Insert before the file list
        const container = document.querySelector('.container');
        const fileList = document.getElementById('fileList');
        if (container && fileList) {
            container.insertBefore(compatInfo, fileList);
        }
    },
    
    /**
     * Update format dropdown based on browser support
     */
    updateFormatOptionsBasedOnSupport() {
        const outputFormatSelect = document.getElementById('outputFormat');
        if (!outputFormatSelect) return;
        
        // Loop through all options
        Array.from(outputFormatSelect.options).forEach(option => {
            const format = option.value;
            
            // For unsupported formats, add a warning indicator
            if (!Config.supportedFormats[format]) {
                option.textContent = `${option.textContent} (not supported)`;
                option.style.color = 'var(--error-color)';
            }
        });
        
        // Select the first supported format as default
        const firstSupportedFormat = Object.entries(Config.supportedFormats)
            .find(([_, supported]) => supported)?.[0];
            
        if (firstSupportedFormat && firstSupportedFormat !== outputFormatSelect.value) {
            outputFormatSelect.value = firstSupportedFormat;
            
            // Trigger the change event to update UI
            const event = new Event('change');
            outputFormatSelect.dispatchEvent(event);
        }
    }
};
