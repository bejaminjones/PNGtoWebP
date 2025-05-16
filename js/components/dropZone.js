/**
 * Drop Zone Component
 * Handles file drag and drop functionality
 */

const DropZone = {
    // DOM elements
    elements: {
        dropZone: null,
        fileInput: null
    },
    
    // Files to be processed
    files: [],
    
    /**
     * Initialize drop zone component
     */
    init() {
        // Get DOM elements
        this.elements.dropZone = document.getElementById('dropZone');
        this.elements.fileInput = document.getElementById('fileInput');
        
        if (!this.elements.dropZone || !this.elements.fileInput) {
            console.error('Drop zone elements not found');
            return;
        }
        
        // Add event listeners for drag and drop
        this.addEventListeners();
    },
    
    /**
     * Add event listeners for the drop zone
     */
    addEventListeners() {
        const dropZone = this.elements.dropZone;
        const fileInput = this.elements.fileInput;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, UIUtils.preventDefaults, false);
            document.body.addEventListener(eventName, UIUtils.preventDefaults, false);
        });
        
        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, e => UIUtils.highlight(e, dropZone), false);
        });
        
        // Remove highlight when item is dragged out
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, e => UIUtils.unhighlight(e, dropZone), false);
        });
        
        // Handle dropped files
        dropZone.addEventListener('drop', e => {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleFiles(files);
        }, false);
        
        // Handle file input change
        fileInput.addEventListener('change', () => {
            this.handleFiles(fileInput.files);
        }, false);
    },
    
    /**
     * Handle the selected files
     * @param {FileList} fileList - The list of files
     */
    handleFiles(fileList) {
        if (fileList.length === 0) return;
        
        const imageFiles = Array.from(fileList).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('Please select at least one image file.');
            return;
        }
        
        // Add files to queue and initialize file list
        FileList.addFilesToQueue(imageFiles);
        
        // Clear the file input
        this.elements.fileInput.value = '';
    }
};
