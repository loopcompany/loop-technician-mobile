const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

module.exports = (config) => withAndroidManifest(config, (config) => {
  const manifest = config.modResults;
  const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  const color = app['meta-data']?.find((item) =>
    item.$['android:name'] === 'com.google.firebase.messaging.default_notification_color'
  );

  if (color?.$['android:resource']) {
    AndroidConfig.Manifest.ensureToolsAvailable(manifest);
    const replacements = (color.$['tools:replace'] || '').split(',').map((value) => value.trim()).filter(Boolean);
    color.$['tools:replace'] = [...new Set([...replacements, 'android:resource'])].join(',');
  }

  return config;
});
