/**
 * Controls Component
 * Handles the format and quality control panels
 */

const Controls = {
    // DOM elements
    elements: {
        outputFormat: null,
        qualitySlider: null,
        qualityValue: null,
        losslessOption: null,
        advancedToggle: null,
        advancedPanel: null,
        sizeOptimizationToggle: null,
        sizeOptimizationOptions: null,
        resizeOption: null,
        resizeDimensions: null,
        widthInput: null,
        heightInput: null,
        maintainAspectRatio: null,
        scalePercent: null
    },
    
    // Format-specific panels
    formatPanels: {},
    
    /**
     * Initialize controls
     */
    init() {
        // Get DOM elements
        this.getElements();
        
        // Initialize format panels
        this.getFormatPanels();
        
        // Add event listeners
        this.addEventListeners();
    },
    
    /**
     * Get all DOM elements
     */
    getElements() {
        // Main controls
        this.elements.outputFormat = document.getElementById('outputFormat');
        this.elements.qualitySlider = document.getElementById('qualitySlider');
        this.elements.qualityValue = document.getElementById('qualityValue');
        this.elements.losslessOption = document.getElementById('losslessOption');
        
        // Advanced panel
        this.elements.advancedToggle = document.getElementById('advancedToggle');
        this.elements.advancedPanel = document.getElementById('advancedPanel');
        
        // Size optimization
        this.elements.sizeOptimizationToggle = document.getElementById('sizeOptimizationToggle');
        this.elements.sizeOptimizationOptions = document.getElementById('sizeOptimizationOptions');
        
        // Resize options
        this.elements.resizeOption = document.getElementById('resizeOption');
        this.elements.resizeDimensions = document.getElementById('resizeDimensions');
        this.elements.widthInput = document.getElementById('widthInput');
        this.elements.heightInput = document.getElementById('heightInput');
        this.elements.maintainAspectRatio = document.getElementById('maintainAspectRatio');
        this.elements.scalePercent = document.getElementById('scalePercent');
        
        // Validate elements
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) {
                console.error(`Control element not found: ${key}`);
            }
        });
    },
    
    /**
     * Get format-specific panels
     */
    getFormatPanels() {
        this.formatPanels = {
            webp: document.getElementById('webpOptions'),
            jpeg: document.getElementById('jpegOptions'),
            png: document.getElementById('pngOptions'),
            avif: document.getElementById('avifOptions')
        };
    },
    
    /**
     * Add event listeners to controls
     */
    addEventListeners() {
        const {
            outputFormat, qualitySlider, qualityValue, losslessOption,
            advancedToggle, advancedPanel, sizeOptimizationToggle,
            sizeOptimizationOptions, resizeOption, resizeDimensions
        } = this.elements;
        
        // Format change handler
        if (outputFormat) {
            outputFormat.addEventListener('change', () => {
                this.handleFormatChange();
            });
        }
        
        // Quality slider handler
        if (qualitySlider && qualityValue) {
            qualitySlider.addEventListener('input', () => {
                qualityValue.textContent = qualitySlider.value;
            });
        }
        
        // Lossless option handler
        if (losslessOption && qualitySlider) {
            losslessOption.addEventListener('change', () => {
                this.handleLosslessChange();
            });
        }
        
        // Advanced panel toggle
        if (advancedToggle && advancedPanel) {
            advancedToggle.addEventListener('click', () => {
                this.toggleAdvancedPanel();
            });
        }
        
        // Size optimization toggle
        if (sizeOptimizationToggle && sizeOptimizationOptions) {
            sizeOptimizationToggle.addEventListener('change', () => {
                sizeOptimizationOptions.style.display = 
                    sizeOptimizationToggle.checked ? 'block' : 'none';
                
                // Disable quality slider when size optimization is enabled
                this.updateQualityControlState();
            });
        }
        
        // Resize option handler
        if (resizeOption && resizeDimensions) {
            resizeOption.addEventListener('change', () => {
                resizeDimensions.style.display = resizeOption.checked ? 'block' : 'none';
            });
        }
        
        // PNG compression handler
        const pngCompression = document.getElementById('pngCompression');
        const pngCompressionValue = document.getElementById('pngCompressionValue');
        if (pngCompression && pngCompressionValue) {
            pngCompression.addEventListener('input', () => {
                pngCompressionValue.textContent = pngCompression.value;
            });
        }
        
        // Handle aspect ratio maintenance
        const { widthInput, heightInput, maintainAspectRatio } = this.elements;
        if (widthInput && heightInput && maintainAspectRatio) {
            let aspectRatio = 1; // Default aspect ratio
            
            widthInput.addEventListener('change', () => {
                if (maintainAspectRatio.checked && widthInput.value && aspectRatio) {
                    heightInput.value = Math.round(widthInput.value / aspectRatio);
                }
            });
            
            heightInput.addEventListener('change', () => {
                if (maintainAspectRatio.checked && heightInput.value && aspectRatio) {
                    widthInput.value = Math.round(heightInput.value * aspectRatio);
                }
            });
            
            // Calculate aspect ratio when both values are set
            const calculateAspectRatio = () => {
                if (widthInput.value && heightInput.value) {
                    aspectRatio = widthInput.value / heightInput.value;
                }
            };
            
            widthInput.addEventListener('blur', calculateAspectRatio);
            heightInput.addEventListener('blur', calculateAspectRatio);
        }
        
        // Handle scale percent
        const { scalePercent } = this.elements;
        if (scalePercent) {
            scalePercent.addEventListener('change', () => {
                // Make sure value is between 1-100
                if (scalePercent.value < 1) scalePercent.value = 1;
                if (scalePercent.value > 100) scalePercent.value = 100;
            });
        }
    },
    
    /**
     * Handle format change
     */
    handleFormatChange() {
        const format = this.elements.outputFormat.value;
        
        // Hide all format panels
        Object.values(this.formatPanels).forEach(panel => {
            if (panel) panel.style.display = 'none';
        });
        
        // Show selected format panel
        if (this.formatPanels[format]) {
            this.formatPanels[format].style.display = 'block';
        }
        
        // Update quality control state
        this.updateQualityControlState();
    },
    
    /**
     * Handle lossless option change
     */
    handleLosslessChange() {
        this.updateQualityControlState();
    },
    
    /**
     * Update quality control state based on format and lossless setting
     */
    updateQualityControlState() {
        const { outputFormat, qualitySlider, losslessOption, sizeOptimizationToggle } = this.elements;
        
        const format = outputFormat.value;
        const isLossless = losslessOption.checked;
        const isSizeOptimization = sizeOptimizationToggle.checked;
        
        // Check if quality setting is applicable to this format
        const qualityApplicable = FormatUtils.requiresQualitySetting(format, isLossless);
        
        // Disable quality slider if format doesn't support quality or lossless is checked
        qualitySlider.disabled = !qualityApplicable || isSizeOptimization;
        
        if (qualitySlider.disabled) {
            qualitySlider.classList.add('disabled');
        } else {
            qualitySlider.classList.remove('disabled');
        }
    },
    
    /**
     * Toggle advanced panel
     */
    toggleAdvancedPanel() {
        const { advancedToggle, advancedPanel } = this.elements;
        
        const isExpanded = advancedToggle.getAttribute('aria-expanded') === 'true';
        
        // Toggle panel visibility
        advancedPanel.classList.toggle('visible');
        
        // Update aria attributes
        advancedToggle.setAttribute('aria-expanded', !isExpanded);
    }
};
