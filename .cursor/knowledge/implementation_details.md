# Implementation Details

This document provides technical details about the key algorithms and approaches used in the Multi-Format Image Converter.

## Image Conversion Process

The core conversion process uses the HTML5 Canvas API and the browser's native image handling capabilities:

1. **Loading the Image**: 
   ```javascript
   const image = await createImageBitmap(file);
   ```

2. **Creating a Canvas**:
   ```javascript
   const canvas = document.createElement('canvas');
   canvas.width = image.width;
   canvas.height = image.height;
   const ctx = canvas.getContext('2d');
   ```

3. **Drawing the Image on Canvas**:
   ```javascript
   ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
   ```

4. **Converting to Desired Format**:
   ```javascript
   const mimeType = getMimeType(outputFormat); // e.g., 'image/webp'
   canvas.toBlob(blob => {
       // Use the blob (converted image)
   }, mimeType, quality); // quality is 0-1 for lossy formats
   ```

## Target Size Optimization Algorithm

The converter uses a binary search algorithm to find the optimal quality setting that will produce a file size closest to the target:

```javascript
async function findOptimalQuality(file, targetSizeKB, mimeType, canvas) {
    // Convert target size from KB to bytes
    const targetSizeBytes = targetSizeKB * 1024;
    
    // Initial quality range
    let minQuality = 0.01;
    let maxQuality = 1.0;
    let currentQuality = 0.7; // Start with a middle value
    let bestQuality = null;
    let bestSize = null;
    let bestBlob = null;
    
    // Binary search for optimal quality
    for (let iteration = 0; iteration < 6; iteration++) { // Limit iterations for performance
        // Try current quality
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, mimeType, currentQuality);
        });
        
        const blobSize = blob.size;
        
        // Check if this is closer to target than our previous best
        if (bestSize === null || Math.abs(blobSize - targetSizeBytes) < Math.abs(bestSize - targetSizeBytes)) {
            bestQuality = currentQuality;
            bestSize = blobSize;
            bestBlob = blob;
        }
        
        // Adjust quality based on current size
        if (blobSize > targetSizeBytes) {
            // Too big, reduce quality
            maxQuality = currentQuality;
        } else {
            // Too small, increase quality
            minQuality = currentQuality;
        }
        
        // Set new quality for next iteration
        currentQuality = (minQuality + maxQuality) / 2;
        
        // If we're close enough to target size, break early
        if (Math.abs(blobSize - targetSizeBytes) / targetSizeBytes < 0.05) { // Within 5% of target
            break;
        }
    }
    
    return { blob: bestBlob, quality: bestQuality };
}
```

## Browser Compatibility Detection

The application checks browser support for modern formats using feature detection:

```javascript
function checkBrowserCompatibility() {
    return new Promise(resolve => {
        // Check WebP support
        const webpImage = new Image();
        webpImage.onload = function() { 
            supportedFormats.webp = true;
            checkAvif();
        };
        webpImage.onerror = function() { 
            supportedFormats.webp = false;
            checkAvif();
        };
        webpImage.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        
        // Check AVIF support
        function checkAvif() {
            const avifImage = new Image();
            avifImage.onload = function() { 
                supportedFormats.avif = true;
                showCompatibilityInfo();
                resolve();
            };
            avifImage.onerror = function() { 
                supportedFormats.avif = false;
                showCompatibilityInfo();
                resolve();
            };
            avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        }
    });
}
```

## Concurrent Processing Queue

The application uses a simple queue with a concurrency limit to process multiple files efficiently without overloading the browser:

```javascript
// Worker queue for processing files with concurrency limit
const processingQueue = [];
const maxConcurrentProcessing = 3; // Process up to 3 files simultaneously
let activeProcessingCount = 0;
let isPaused = false;

function processQueue() {
    // Don't process if paused
    if (isPaused) return;
    
    // Process files up to the concurrency limit
    while (processingQueue.length > 0 && activeProcessingCount < maxConcurrentProcessing) {
        const nextItem = processingQueue.shift();
        activeProcessingCount++;
        
        // Process file
        processFile(nextItem.file, nextItem.item)
            .finally(() => {
                activeProcessingCount--;
                updateBatchProgress();
                processQueue(); // Continue processing queue
            });
    }
}
```

## Theming System

The application uses CSS variables to implement light and dark themes:

```css
:root {
    /* Light mode colors */
    --bg-color: #f5f5f5;
    --container-bg: #ffffff;
    --text-color: #333333;
    /* other variables... */
}

[data-theme="dark"] {
    /* Dark mode colors */
    --bg-color: #121212;
    --container-bg: #1e1e1e;
    --text-color: #e0e0e0;
    /* other variables... */
}
```

Theme switching is handled in JavaScript:

```javascript
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}
```

## Drag and Drop Implementation

The application uses the HTML5 Drag and Drop API with visual feedback:

```javascript
// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop zone when dragging over it
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
dropZone.addEventListener('drop', handleDrop, false);

function highlight(e) {
    dropZone.classList.add('dragover');
    
    // Add animation for visual feedback
    dropZone.animate([
        { transform: 'scale(1)', boxShadow: '0 0 0 rgba(67, 97, 238, 0)' },
        { transform: 'scale(1.02)', boxShadow: '0 0 20px rgba(67, 97, 238, 0.3)' }
    ], {
        duration: 300,
        fill: 'forwards',
        easing: 'ease-out'
    });
}
```

These implementation details showcase the technical approaches used in the converter to provide efficient and user-friendly image processing directly in the browser. 