/**
 * Multi-Format Image Converter - Main Application Entry Point
 * This file handles the initialization of the application and coordinates
 * between the different modules.
 */

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    ThemeManager.init();
    DropZone.init();
    Controls.init();
    FileList.init();
    
    // Initialize services
    CompatibilityService.checkBrowserCompatibility().then(() => {
        CompatibilityService.updateFormatOptionsBasedOnSupport();
    });
});
