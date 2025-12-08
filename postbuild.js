const fs = require('fs');
const path = require('path');

// Paths
const distIndexPath = path.join(__dirname, 'dist', 'index.html');
const distStylesPath = path.join(__dirname, 'dist', 'styles.css');
const webStylesPath = path.join(__dirname, 'web', 'styles.css');

console.log('🔧 Post-build: Applying responsive fixes...');

// 1. Copy styles.css to dist
if (fs.existsSync(webStylesPath)) {
  fs.copyFileSync(webStylesPath, distStylesPath);
  console.log('✅ Copied styles.css to dist/');
}

// 2. Fix dist/index.html
if (fs.existsSync(distIndexPath)) {
  let html = fs.readFileSync(distIndexPath, 'utf8');
  
  // Replace viewport
  html = html.replace(
    /<meta name="viewport"[^>]*>/,
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />'
  );
  
  // Add styles.css link if not exists
  if (!html.includes('styles.css')) {
    html = html.replace(
      '</title>',
      '</title>\n    \n    <!-- Web-specific responsive styles -->\n    <link rel="stylesheet" href="/styles.css" />'
    );
  }
  
  // Replace expo-reset styles
  const responsiveStyles = `    <style id="expo-reset">
      html, body, #root {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        position: fixed;
        overscroll-behavior: none;
      }
      
      html {
        touch-action: pan-y;
        -webkit-text-size-adjust: 100%;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Vazir', 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }
      
      #root {
        display: flex;
        flex-direction: column;
        overflow: auto;
        position: relative;
      }
      
      * {
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
      }
    </style>`;
  
  html = html.replace(/<style id="expo-reset">[\s\S]*?<\/style>/, responsiveStyles);
  
  // Change lang and dir
  html = html.replace('<html lang="en">', '<html lang="fa" dir="rtl">');
  
  fs.writeFileSync(distIndexPath, html, 'utf8');
  console.log('✅ Fixed dist/index.html with responsive styles');
}

console.log('✨ Post-build fixes completed!');
