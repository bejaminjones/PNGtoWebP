# Multi-Format Image Converter - Project Summary

## Overview
The Multi-Format Image Converter is a browser-based application that converts images between different formats (PNG, WebP, JPEG, GIF, AVIF) with various optimization options. The entire application runs client-side using HTML, CSS, and JavaScript, with no server-side processing required.

## Key Features

### Format Support
- Input formats: Supports all image formats the browser can read
- Output formats: WebP, JPEG, PNG, GIF, AVIF
- Browser compatibility detection for newer formats like WebP and AVIF

### User Interface
- Modern, responsive design with CSS variables
- Dark/light mode toggle with preference saving
- Drag-and-drop file upload with visual feedback
- Progress indicators with percentage display
- File thumbnails with before/after comparisons

### Conversion Options
- Quality adjustment slider (0-100%)
- Lossless conversion option
- Metadata preservation toggle
- Format-specific options:
  - WebP: Alpha channel toggle
  - JPEG: Progressive loading option
  - PNG: Compression level slider
  - AVIF: Low data mode option

### Advanced Features
- Image resizing with aspect ratio maintenance
- Target file size optimization with automatic quality adjustment
- Batch processing with concurrent conversion (max 3 files at once)
- Individual file download and "download all" as ZIP
- Error handling with retry capability
- Conversion statistics (processing time, size reduction)

### Technologies Used
- HTML5
- CSS3 with variables and modern layout techniques
- Vanilla JavaScript (ES6+)
- Canvas API for image processing
- Browser's native toBlob API for format conversion
- JSZip library for downloading all files as a ZIP
- Browser Image Compression library for advanced compression options

## Project Structure
The application is contained in a single HTML file (index.html) with embedded CSS and JavaScript:
- HTML structure defines the UI elements
- CSS styling with variables for theming
- JavaScript for all the application logic

## License
The project is licensed under GNU General Public License v3.0, which allows for free use, modification, and distribution while ensuring that modifications remain open source. 