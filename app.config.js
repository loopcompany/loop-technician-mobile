const fs = require('fs');
const path = require('path');

const GOOGLE_SERVICES_JSON = './google-services.json';
const GOOGLE_SERVICES_PLIST = './GoogleService-Info.plist';

const exists = (relativePath) => fs.existsSync(path.resolve(__dirname, relativePath));

/**
 * Expo evaluates this config repeatedly, and in forked processes, so an
 * in-memory guard is not enough. Child processes inherit env, which is.
 */
const WARNED_ENV_KEY = 'LOOPTECH_FIREBASE_CONFIG_WARNED';
const warnOnce = (message) => {
  const seen = (process.env[WARNED_ENV_KEY] || '').split('|');
  const key = String(message.length);
  if (seen.includes(key)) return;
  process.env[WARNED_ENV_KEY] = [...seen, key].filter(Boolean).join('|');
  console.warn(message);
};

/**
 * The Firebase Android SDK is configured from google-services.json at build time.
 * The Google Services Gradle plugin aborts the build when the file contains no
 * client entry for the applicationId, and the failure message is fairly cryptic,
 * so we check it here where we can explain what to do about it.
 */
/**
 * A native build only happens during `eas build`, `expo prebuild` or
 * `expo run:*`. Everywhere else (`expo start`, web export, editor tooling) a
 * misconfigured google-services.json is harmless, so we warn instead of failing
 * and keep the project runnable.
 */
const isNativeBuild = () =>
  Boolean(process.env.EAS_BUILD) ||
  process.argv.some((arg) => arg === 'prebuild' || arg === 'run:android' || arg === 'run:ios');

/**
 * The Firebase Android SDK is configured from google-services.json at build time.
 * The Google Services Gradle plugin aborts the build when the file contains no
 * client entry for the applicationId, and the failure message is fairly cryptic,
 * so we check it here where we can explain what to do about it.
 *
 * Returns true when the file is usable for the given package.
 */
const checkGoogleServicesMatchesPackage = (androidPackage) => {
  const report = (message) => {
    if (isNativeBuild()) {
      throw new Error(message);
    }
    warnOnce(message);
  };

  if (!exists(GOOGLE_SERVICES_JSON)) {
    report(
      `\n\u26a0\ufe0f  ${GOOGLE_SERVICES_JSON} is missing \u2014 Android push notifications will not work.\n` +
        `   Download it from Firebase Console \u2192 Project settings \u2192 Your apps \u2192 Android\n` +
        `   and put it in the project root.\n`
    );
    return false;
  }

  let googleServices;
  try {
    googleServices = JSON.parse(fs.readFileSync(path.resolve(__dirname, GOOGLE_SERVICES_JSON), 'utf8'));
  } catch (error) {
    throw new Error(`${GOOGLE_SERVICES_JSON} is not valid JSON: ${error.message}`);
  }

  const packages = (googleServices.client || [])
    .map((client) => client?.client_info?.android_client_info?.package_name)
    .filter(Boolean);

  if (!packages.includes(androidPackage)) {
    report(
      `\n\u274c google-services.json has no app registered for "${androidPackage}".\n` +
        `   It currently registers: ${packages.join(', ') || '(none)'}\n\n` +
        `   Fix it in Firebase Console \u2192 project "${googleServices.project_info?.project_id}" \u2192\n` +
        `   Project settings \u2192 Your apps \u2192 Add app \u2192 Android \u2192\n` +
        `   package name "${androidPackage}" \u2192 download the regenerated google-services.json\n` +
        `   and replace the one in the project root.\n`
    );
    return false;
  }

  return true;
};

const pluginName = (plugin) => (Array.isArray(plugin) ? plugin[0] : plugin);

/**
 * Expo throws on duplicate plugin entries, and `expo install` adds bare entries
 * for plugins we configure here. Ours win.
 */
const mergePlugins = (existing = [], added = []) => {
  const addedNames = new Set(added.map(pluginName));
  return [...existing.filter((plugin) => !addedNames.has(pluginName(plugin))), ...added];
};

module.exports = ({ config }) => {
  const androidPackage = config.android?.package;
  const hasAndroidFirebase = checkGoogleServicesMatchesPackage(androidPackage);
  const hasIosFirebase = exists(GOOGLE_SERVICES_PLIST);

  if (!hasIosFirebase) {
    warnOnce(
      `\n⚠️  ${GOOGLE_SERVICES_PLIST} is missing — iOS push notifications are disabled in this build.\n` +
        `   Download it from Firebase Console → Project settings → Your apps → iOS and put it in the project root.\n`
    );
  }

  return {
    ...config,

    ios: {
      ...config.ios,
      bundleIdentifier: config.ios?.bundleIdentifier ?? 'com.clpiran.looptech',
      ...(hasIosFirebase ? { googleServicesFile: GOOGLE_SERVICES_PLIST } : {}),
    },

    android: {
      ...config.android,
      ...(hasAndroidFirebase ? { googleServicesFile: GOOGLE_SERVICES_JSON } : {}),
      permissions: [...new Set([...(config.android?.permissions ?? []), 'android.permission.POST_NOTIFICATIONS'])],
    },

    plugins: mergePlugins(config.plugins, [
      './plugins/withNotificationColor',
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          ios: {
            // react-native-firebase ships Swift pods that only link correctly
            // when CocoaPods builds static frameworks with modular headers.
            useFrameworks: 'static',
          },
        },
      ],
      [
        'expo-notifications',
        {
          // Android draws the status-bar icon as a mask: it must be white on a
          // transparent background or it renders as a solid square.
          icon: './assets/notification-icon.png',
          color: '#D4A017',
          // Adds UIBackgroundModes: remote-notification, so iOS wakes the JS
          // background handler for data messages instead of only on tap.
          enableBackgroundRemoteNotifications: true,
          // `aps-environment` is intentionally left at the plugin default
          // ("development"); EAS Build rewrites it to match the provisioning
          // profile, so pinning it here would break development builds.
        },
      ],
    ]),
  };
};
