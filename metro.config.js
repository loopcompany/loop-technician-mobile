const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// تنظیمات resolver
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.jsx', 'web.ts', 'web.tsx'];

// اضافه کردن platformExtensions
config.resolver.platforms = ['web', 'ios', 'android'];

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

  // استفاده از resolver پیش‌فرض برای سایر ماژول‌ها
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
