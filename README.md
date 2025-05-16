# Multi-Format Image Converter

A browser-based image converter that allows you to convert images between different formats (WebP, JPEG, PNG, GIF, AVIF) with advanced options for compression, quality, and size optimization.

## Features

- **Multiple Format Support**: Convert to WebP, JPEG, PNG, GIF, and AVIF (browser support dependent)
- **Drag and Drop Interface**: Simple drag and drop file uploading
- **Batch Processing**: Convert multiple images at once
- **Advanced Options**:
  - Quality control for lossy formats
  - Lossless conversion option
  - Resize images during conversion
  - Format-specific options (alpha channel, progressive loading, etc.)
  - Target file size optimization

## How to Use

1. Open `index.html` in your web browser
2. Select a target format from the dropdown menu
3. Adjust quality and other settings as needed
4. Drag and drop image files or click to select files
5. Download converted images individually or as a ZIP archive

## Browser Compatibility

The app checks your browser's format support at startup and disables unsupported formats. All modern browsers support PNG, JPEG, and GIF, but WebP and AVIF support varies.

## Implementation Details

This application is built with vanilla JavaScript and runs entirely in the browser without any server-side processing. It uses HTML5 Canvas for image manipulation and offers a responsive design that works on both desktop and mobile devices.

### Project Structure

```
├── css/
│   ├── components/
│   │   ├── buttons.css
│   │   ├── controls.css
│   │   ├── dropzone.css
│   │   └── preview.css
│   ├── main.css
│   ├── themes.css
│   └── utilities.css
├── js/
│   ├── components/
│   │   ├── controls.js
│   │   ├── dropZone.js
│   │   ├── fileList.js
│   │   ├── preview.js
│   │   └── themeManager.js
│   ├── services/
│   │   ├── compatCheck.js
│   │   ├── converter.js
│   │   └── storage.js
│   ├── utils/
│   │   ├── fileUtils.js
│   │   ├── formats.js
│   │   └── ui.js
│   ├── config.js
│   └── main.js
├── index.html
├── LICENSE
└── README.md
```

## External Libraries

- **JSZip**: For creating downloadable ZIP archives of batch conversions
- **browser-image-compression**: For advanced image compression options

## License

This project is licensed under the terms of the LICENSE file included in this repository. 