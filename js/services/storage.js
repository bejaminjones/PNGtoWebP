/**
 * Storage Service
 * Handles storing and retrieving application data
 */

const StorageService = {
    /**
     * Save settings to localStorage
     * @param {Object} settings - Application settings to save
     */
    saveSettings(settings) {
        try {
            localStorage.setItem('converter_settings', JSON.stringify(settings));
        } catch (err) {
            console.error('Failed to save settings:', err);
        }
    },
    
    /**
     * Load settings from localStorage
     * @returns {Object|null} The saved settings or null if none exist
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem('converter_settings');
            return settings ? JSON.parse(settings) : null;
        } catch (err) {
            console.error('Failed to load settings:', err);
            return null;
        }
    },
    
    /**
     * Clear all saved settings
     */
    clearSettings() {
        try {
            localStorage.removeItem('converter_settings');
        } catch (err) {
            console.error('Failed to clear settings:', err);
        }
    }
};
