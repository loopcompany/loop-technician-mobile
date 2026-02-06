const fs = require('fs');
const path = require('path');

// Paths
const distIndexPath = path.join(__dirname, 'dist', 'index.html');
const distStylesPath = path.join(__dirname, 'dist', 'styles.css');
const webStylesPath = path.join(__dirname, 'web', 'styles.css');

// Generate version timestamp for cache busting
const buildVersion = Date.now();

console.log('🔧 Post-build: Applying responsive fixes...');
console.log('📦 Build Version:', buildVersion);

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
  
  // Add cache control meta tags if not exists
  if (!html.includes('Cache-Control')) {
    html = html.replace(
      '<meta name="viewport"',
      `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n    <meta http-equiv="Pragma" content="no-cache" />\n    <meta http-equiv="Expires" content="0" />\n    <meta name="app-version" content="${buildVersion}" />\n    <meta name="viewport"`
    );
  }
  
  // Add styles.css link with cache-busting version
  if (!html.includes('styles.css')) {
    html = html.replace(
      '</title>',
      `</title>\n    \n    <!-- Web-specific responsive styles -->\n    <link rel="stylesheet" href="/styles.css?v=${buildVersion}" />`
    );
  } else {
    // Add version to existing styles.css
    html = html.replace(
      /href="\/styles\.css"/g,
      `href="/styles.css?v=${buildVersion}"`
    );
  }
  
  // Add cache-busting version to all JS bundles
  html = html.replace(
    /(src="[^"]+\.js)(")(?!\?v=)/g,
    `$1?v=${buildVersion}$2`
  );
  
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
  html = html.replace('<html lang="en">', '<html lang="fa">');
  
  // Add service worker cleanup script before closing body tag if not exists
  if (!html.includes('serviceWorker')) {
    const swCleanupScript = `
    
    <!-- Service Worker Auto-Cleanup -->
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for (let registration of registrations) {
            registration.unregister().then(function(success) {
              if (success) console.log('SW unregistered');
            });
          }
        });
      }
      if (window.location.hostname === 'localhost' && 'caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) caches.delete(name);
        });
      }
    </script>
  </body>`;
    
    html = html.replace('</body>', swCleanupScript);
  }
  
  fs.writeFileSync(distIndexPath, html, 'utf8');
  console.log('✅ Fixed dist/index.html with responsive styles');
  console.log('✅ Added cache-busting version:', buildVersion);
  console.log('✅ Added service worker cleanup');
}

console.log('✨ Post-build fixes completed!');
