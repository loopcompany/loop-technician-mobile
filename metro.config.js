const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Metro already resolves *.web.js / *.native.js by platform, so sourceExts and
// platforms stay at their defaults (overriding them let native builds pick up
// web-only files).

// Custom resolver برای react-native-maps در وب
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // برای وب، react-native-maps را با shim جایگزین می‌کنیم
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, 'components/react-native-maps.web.js'),
      type: 'sourceFile',
    };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
