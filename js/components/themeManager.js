/**
 * Theme Manager Component
 * Handles theme switching between light and dark modes
 */

const ThemeManager = {
    // DOM elements
    elements: {
        themeToggle: null,
        iconElement: null
    },
    
    /**
     * Initialize theme manager
     */
    init() {
        // Get DOM elements
        this.elements.themeToggle = document.getElementById('themeToggle');
        
        if (!this.elements.themeToggle) {
            console.error('Theme toggle element not found');
            return;
        }
        
        this.elements.iconElement = this.elements.themeToggle.querySelector('.theme-toggle-icon');
        
        // Set initial theme
        this.initTheme();
        
        // Add event listeners
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    },
    
    /**
     * Initialize theme based on saved preference or system preference
     */
    initTheme() {
        // Check for saved theme preference or use user's system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.updateThemeIcon('dark');
        }
    },
    
    /**
     * Update the theme icon based on the current theme
     * @param {string} theme - The current theme ('light' or 'dark')
     */
    updateThemeIcon(theme) {
        if (this.elements.iconElement) {
            this.elements.iconElement.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    },
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
};
