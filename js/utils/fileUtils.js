/**
 * File Utilities
 * Helper functions for file operations
 */

const FileUtils = {
    /**
     * Create a download link for a blob
     * @param {Blob} blob - The blob to download
     * @param {string} fileName - The filename to use
     */
    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    /**
     * Create a thumbnail URL for an image file
     * @param {File} file - The image file
     * @returns {string} The thumbnail URL
     */
    createThumbnailUrl(file) {
        return URL.createObjectURL(file);
    },
    
    /**
     * Revoke a thumbnail URL after a timeout
     * @param {string} url - The URL to revoke
     */
    revokeThumbnailUrl(url) {
        setTimeout(() => URL.revokeObjectURL(url), Config.processing.thumbnailTimeout);
    },
    
    /**
     * Create a ZIP file from a list of blobs
     * @param {Array} files - Array of {name, blob} objects
     * @returns {Promise<Blob>} The ZIP file as a blob
     */
    async createZipFile(files) {
        const zip = new JSZip();
        
        // Add all converted files to the zip
        files.forEach(file => {
            zip.file(file.name, file.blob);
        });

        // Generate the zip file
        return await zip.generateAsync({type: "blob"});
    }
};
