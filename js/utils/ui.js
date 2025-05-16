/**
 * UI Utilities
 * Helper functions for UI manipulation
 */

const UIUtils = {
    /**
     * Update a progress bar
     * @param {HTMLElement} progressBar - The progress bar element
     * @param {HTMLElement} progressText - The progress text element
     * @param {number} percent - Percentage value (0-100)
     */
    updateProgress(progressBar, progressText, percent) {
        if (progressBar && progressText) {
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `${Math.round(percent)}%`;
        }
    },
    
    /**
     * Prevent default browser behavior for events
     * @param {Event} e - The event object
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    },
    
    /**
     * Highlight an element (for drag operations)
     * @param {Event} e - The event object
     * @param {HTMLElement} element - The element to highlight
     */
    highlight(e, element) {
        element.classList.add('dragover');
        
        // Add animation for visual feedback
        element.animate([
            { transform: 'scale(1)', boxShadow: '0 0 0 rgba(67, 97, 238, 0)' },
            { transform: 'scale(1.02)', boxShadow: '0 0 20px rgba(67, 97, 238, 0.3)' }
        ], {
            duration: 300,
            fill: 'forwards',
            easing: 'ease-out'
        });
    },
    
    /**
     * Remove highlight from an element
     * @param {Event} e - The event object
     * @param {HTMLElement} element - The element to un-highlight
     */
    unhighlight(e, element) {
        element.classList.remove('dragover');
        
        // Reverse animation
        element.animate([
            { transform: 'scale(1.02)', boxShadow: '0 0 20px rgba(67, 97, 238, 0.3)' },
            { transform: 'scale(1)', boxShadow: '0 0 0 rgba(67, 97, 238, 0)' }
        ], {
            duration: 300,
            fill: 'forwards',
            easing: 'ease-out'
        });
    }
};
