/**
 * File List Component
 * Manages the list of files and their conversions
 */

const FileList = {
    // DOM elements
    elements: {
        fileList: null,
        downloadAllBtn: null
    },
    
    // File processing state
    queue: [],
    processing: [],
    completed: [],
    
    /**
     * Initialize the component
     */
    init() {
        // Get DOM elements
        this.elements.fileList = document.getElementById('fileList');
        this.elements.downloadAllBtn = document.getElementById('downloadAll');
        
        if (!this.elements.fileList || !this.elements.downloadAllBtn) {
            console.error('File list elements not found');
            return;
        }
        
        // Add event listeners
        this.elements.downloadAllBtn.addEventListener('click', this.downloadAllFiles.bind(this));
    },
    
    /**
     * Add files to the processing queue
     * @param {Array<File>} files - Array of file objects
     */
    addFilesToQueue(files) {
        // Add files to queue
        this.queue.push(...files);
        
        // Create the file list UI if it doesn't exist
        this.initializeFileListUI();
        
        // Add the new files to the UI
        files.forEach(file => this.addFileItem(file));
        
        // Start processing if not already processing
        this.processQueue();
    },
    
    /**
     * Initialize the file list UI
     */
    initializeFileListUI() {
        const fileList = this.elements.fileList;
        const downloadAllBtn = this.elements.downloadAllBtn;
        
        // Only initialize if empty
        if (fileList.children.length === 0) {
            // Create batch control header
            const batchControls = document.createElement('div');
            batchControls.className = 'batch-controls';
            batchControls.innerHTML = `
                <div class="batch-info">
                    <div>Processing Queue</div>
                    <div id="queueStats" class="file-stats">0 files in queue, 0 completed</div>
                </div>
            `;
            fileList.appendChild(batchControls);
            
            // Show the download all button
            downloadAllBtn.style.display = 'block';
        }
    },
    
    /**
     * Add a file item to the UI
     * @param {File} file - The file to add
     */
    addFileItem(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.filename = file.name;
        
        // Get the selected output format
        const outputFormat = document.getElementById('outputFormat').value;
        
        // Get the file name without extension
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        
        // Create the target file name
        const targetFileName = `${baseName}.${outputFormat}`;
        
        // Create a basic file structure
        fileItem.innerHTML = `
            <div class="file-thumbnail">
                <div class="loading-placeholder">
                    <div class="spinner"></div>
                </div>
            </div>
            <div class="file-info">
                <div class="file-name">${targetFileName}</div>
                <div class="file-size">${FormatUtils.formatFileSize(file.size)}</div>
            </div>
            <div class="file-status">
                <div class="status">Queued</div>
                <div class="progress-container" style="display: none;">
                    <div class="progress-bar" style="width: 0%"></div>
                    <div class="progress-text">0%</div>
                </div>
            </div>
        `;
        
        // Add to file list
        this.elements.fileList.appendChild(fileItem);
        
        // Update queue stats
        this.updateQueueStats();
    },
    
    /**
     * Process the next items in the queue
     */
    processQueue() {
        // Check if we can process more files
        while (this.processing.length < Config.processing.maxConcurrentProcessing && this.queue.length > 0) {
            const file = this.queue.shift();
            this.processing.push(file);
            
            // Update UI to show processing status
            this.updateFileStatus(file.name, 'processing');
            
            // Start the conversion process
            ConverterService.convertFile(file, 
                // Progress callback
                (percent) => this.updateFileProgress(file.name, percent),
                // Success callback
                (result) => this.handleConversionSuccess(file, result),
                // Error callback
                (error) => this.handleConversionError(file, error)
            );
        }
        
        // Update queue stats
        this.updateQueueStats();
    },
    
    /**
     * Update the status of a file in the UI
     * @param {string} fileName - Name of the file
     * @param {string} status - New status (processing, success, error)
     */
    updateFileStatus(fileName, status) {
        const fileItem = this.elements.fileList.querySelector(`[data-filename="${fileName}"]`);
        if (!fileItem) return;
        
        const statusEl = fileItem.querySelector('.status');
        const progressContainer = fileItem.querySelector('.progress-container');
        
        if (statusEl) {
            statusEl.textContent = status === 'processing' ? 'Processing...' : 
                                  status === 'success' ? 'Converted' : 'Error';
            statusEl.className = 'status ' + status;
        }
        
        // Show or hide progress based on status
        if (progressContainer) {
            progressContainer.style.display = status === 'processing' ? 'block' : 'none';
        }
    },
    
    /**
     * Update the progress bar for a file
     * @param {string} fileName - Name of the file
     * @param {number} percent - Progress percentage (0-100)
     */
    updateFileProgress(fileName, percent) {
        const fileItem = this.elements.fileList.querySelector(`[data-filename="${fileName}"]`);
        if (!fileItem) return;
        
        const progressBar = fileItem.querySelector('.progress-bar');
        const progressText = fileItem.querySelector('.progress-text');
        
        UIUtils.updateProgress(progressBar, progressText, percent);
    },
    
    /**
     * Handle successful conversion
     * @param {File} file - The original file
     * @param {Object} result - Conversion result object
     */
    handleConversionSuccess(file, result) {
        // Remove from processing array
        const index = this.processing.indexOf(file);
        if (index > -1) {
            this.processing.splice(index, 1);
        }
        
        // Add to completed array with result
        this.completed.push({
            originalFile: file,
            convertedBlob: result.blob,
            convertedFileName: result.fileName,
            processingTime: result.processingTime
        });
        
        // Update UI
        this.updateFileStatus(file.name, 'success');
        this.updateFileUI(file.name, result);
        
        // Process next file
        this.processQueue();
    },
    
    /**
     * Handle conversion error
     * @param {File} file - The original file
     * @param {Error} error - The error object
     */
    handleConversionError(file, error) {
        console.error(`Error converting ${file.name}:`, error);
        
        // Remove from processing array
        const index = this.processing.indexOf(file);
        if (index > -1) {
            this.processing.splice(index, 1);
        }
        
        // Update UI
        this.updateFileStatus(file.name, 'error');
        
        const fileItem = this.elements.fileList.querySelector(`[data-filename="${file.name}"]`);
        if (fileItem) {
            const statusEl = fileItem.querySelector('.file-status');
            
            // Add error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = error.message || 'Conversion failed';
            statusEl.appendChild(errorMsg);
            
            // Add retry button
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn';
            retryBtn.innerHTML = '<span style="margin-right: 5px;">🔄</span> Retry';
            retryBtn.addEventListener('click', () => {
                // Remove error message and button
                statusEl.removeChild(errorMsg);
                statusEl.removeChild(retryBtn);
                
                // Add back to queue and process
                this.queue.unshift(file);
                this.processQueue();
            });
            statusEl.appendChild(retryBtn);
        }
        
        // Process next file
        this.processQueue();
    },
    
    /**
     * Update the file item UI with conversion results
     * @param {string} fileName - Name of the file
     * @param {Object} result - Conversion result
     */
    updateFileUI(fileName, result) {
        const fileItem = this.elements.fileList.querySelector(`[data-filename="${fileName}"]`);
        if (!fileItem) return;
        
        const thumbnailContainer = fileItem.querySelector('.file-thumbnail');
        const statusEl = fileItem.querySelector('.file-status');
        
        if (thumbnailContainer && statusEl) {
            // Create a split display to show before/after
            thumbnailContainer.innerHTML = '';
            thumbnailContainer.classList.add('split-thumbnail');
            
            // Create a container for the comparison view
            const comparisonDiv = document.createElement('div');
            comparisonDiv.className = 'thumbnail-comparison';
            
            // Create URLs for the original and converted images
            const originalThumbnailUrl = URL.createObjectURL(result.originalFile);
            const convertedThumbnailUrl = URL.createObjectURL(result.blob);
            
            // Add before/after thumbnails
            comparisonDiv.innerHTML = `
                <div class="thumbnail-half">
                    <img src="${originalThumbnailUrl}" class="thumbnail-img" alt="Original">
                </div>
                <div class="thumbnail-divider"></div>
                <div class="thumbnail-half">
                    <img src="${convertedThumbnailUrl}" class="thumbnail-img" alt="Converted">
                </div>
                <div class="format-badge">${result.format.toUpperCase()}</div>
            `;
            
            thumbnailContainer.appendChild(comparisonDiv);
            
            // Clean up URL objects after a timeout
            setTimeout(() => {
                URL.revokeObjectURL(originalThumbnailUrl);
                URL.revokeObjectURL(convertedThumbnailUrl);
            }, Config.processing.thumbnailTimeout);
            
            // Update the filename display in the file info section
            const fileNameElement = fileItem.querySelector('.file-name');
            if (fileNameElement) {
                fileNameElement.textContent = result.fileName;
            }
            
            // Add file size info
            const fileSizeInfo = document.createElement('div');
            fileSizeInfo.className = 'file-stats';
            
            const sizeReduction = FormatUtils.calculateSizeReduction(result.originalSize, result.blob.size);
            
            fileSizeInfo.innerHTML = `
                ${FormatUtils.formatFileSize(result.blob.size)} 
                (${sizeReduction}% smaller)
            `;
            
            const processingTimeInfo = document.createElement('div');
            processingTimeInfo.className = 'processing-time';
            processingTimeInfo.textContent = `Processed in ${result.processingTime.toFixed(2)}ms`;
            
            // Create button container
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.flexDirection = 'column';
            buttonContainer.style.gap = '8px';
            buttonContainer.style.marginTop = '10px';
            
            // Add download button to file item
            const downloadButton = document.createElement('button');
            downloadButton.className = 'btn';
            downloadButton.innerHTML = `<span style="margin-right: 5px;">⬇️</span> Download`;
            downloadButton.style.fontSize = '12px';
            downloadButton.style.padding = '8px 14px';
            
            downloadButton.addEventListener('click', () => {
                const url = URL.createObjectURL(result.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.fileName;
                a.click();
                URL.revokeObjectURL(url);
            });
            
            // Add buttons to container
            buttonContainer.appendChild(downloadButton);
            
            // Add everything to status element
            statusEl.appendChild(fileSizeInfo);
            statusEl.appendChild(processingTimeInfo);
            statusEl.appendChild(buttonContainer);
        }
        
        // Update queue stats
        this.updateQueueStats();
    },
    
    /**
     * Update the queue statistics
     */
    updateQueueStats() {
        const statsEl = document.getElementById('queueStats');
        if (statsEl) {
            statsEl.textContent = `${this.queue.length} files in queue, ${this.processing.length} processing, ${this.completed.length} completed`;
        }
    },
    
    /**
     * Download all converted files as a zip archive
     */
    downloadAllFiles() {
        if (this.completed.length === 0) {
            alert('No converted files to download.');
            return;
        }
        
        // Create a list of files for the zip
        const files = this.completed.map(item => ({
            name: item.convertedFileName,
            blob: item.convertedBlob
        }));
        
        // Create and download the zip file
        FileUtils.createZipFile(files).then(zipBlob => {
            FileUtils.downloadFile(zipBlob, 'converted_images.zip');
        }).catch(error => {
            console.error('Error creating zip file:', error);
            alert('Failed to create zip file. Please try downloading files individually.');
        });
    }
}; 