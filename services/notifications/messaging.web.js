/**
 * Web stub for messaging.js.
 *
 * @react-native-firebase is native-only, so on web every entry point resolves to
 * an inert no-op and the rest of the notification code can stay platform-blind.
 * Web push would need the Firebase JS SDK plus a service worker and a VAPID key;
 * until that exists, notifications are simply off on web.
 */
const noop = () => {};

export const isSupported = false;

export const platformName = 'web';

export const requestPermission = async () => false;

export const getFcmToken = async () => null;

export const onTokenRefreshed = () => noop;

export const onForegroundMessage = () => noop;

export const onNotificationOpened = () => noop;

export const getNotificationThatOpenedApp = async () => null;
