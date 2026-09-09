/**
 * Thin wrapper over @react-native-firebase/messaging.
 *
 * Everything that talks to Firebase goes through this module so the rest of the
 * app never imports the native SDK directly — that keeps the web bundle free of
 * it (see messaging.web.js, which metro picks for platform "web").
 */
import { Platform, PermissionsAndroid } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import messagingStatics from '@react-native-firebase/messaging';
import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
  requestPermission as requestFirebasePermission,
  hasPermission,
  getAPNSToken,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
} from '@react-native-firebase/messaging';

const { AuthorizationStatus } = messagingStatics;

export const isSupported = true;

export const platformName = Platform.OS === 'ios' ? 'ios' : 'android';

const messaging = () => getMessaging(getApp());

const isAuthorized = (status) =>
  status === AuthorizationStatus.AUTHORIZED ||
  status === AuthorizationStatus.PROVISIONAL ||
  status === AuthorizationStatus.EPHEMERAL;

/**
 * Android 13 (API 33) gates notifications behind a runtime permission that the
 * Firebase SDK does not ask for, so we ask for it ourselves. On older Android
 * versions the permission is granted at install time.
 */
const requestAndroidPermission = async () => {
  if (Platform.Version < 33) {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (await PermissionsAndroid.check(permission)) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

/**
 * Returns true when the user has granted notification permission.
 * Never throws — a denied permission is a normal outcome, not an error.
 */
export const requestPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      return await requestAndroidPermission();
    }

    const existing = await hasPermission(messaging());
    if (isAuthorized(existing)) {
      return true;
    }
    if (existing === AuthorizationStatus.DENIED) {
      // iOS only shows the system prompt once; asking again is a no-op.
      return false;
    }

    const status = await requestFirebasePermission(messaging(), {
      alert: true,
      badge: true,
      sound: true,
    });
    return isAuthorized(status);
  } catch (error) {
    console.log('[notifications] permission request failed:', error?.message ?? error);
    return false;
  }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * On iOS, FCM cannot mint a token until APNs has handed us a device token.
 * Registration is automatic (messaging_ios_auto_register_for_remote_messages in
 * firebase.json) but it is asynchronous, so we give it a bounded window rather
 * than letting getToken() throw on a cold start.
 */
const waitForApnsToken = async ({ attempts = 10, delayMs = 500 } = {}) => {
  if (!isDeviceRegisteredForRemoteMessages(messaging())) {
    await registerDeviceForRemoteMessages(messaging());
  }

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const apnsToken = await getAPNSToken(messaging());
    if (apnsToken) {
      return apnsToken;
    }
    await wait(delayMs);
  }

  return null;
};

/**
 * Returns the FCM registration token, or null when one cannot be obtained.
 */
export const getFcmToken = async () => {
  try {
    if (Platform.OS === 'ios') {
      const apnsToken = await waitForApnsToken();
      if (!apnsToken) {
        console.log('[notifications] no APNs token yet — skipping FCM token fetch');
        return null;
      }
    }

    const token = await getToken(messaging());
    return token || null;
  } catch (error) {
    console.log('[notifications] could not get FCM token:', error?.message ?? error);
    return null;
  }
};

export const onTokenRefreshed = (listener) => onTokenRefresh(messaging(), listener);

export const onForegroundMessage = (listener) => onMessage(messaging(), listener);

/** Fires when a notification is tapped while the app is backgrounded. */
export const onNotificationOpened = (listener) => onNotificationOpenedApp(messaging(), listener);

/** The notification that cold-started the app, if any. Consumed once. */
export const getNotificationThatOpenedApp = async () => {
  try {
    return await getInitialNotification(messaging());
  } catch (error) {
    console.log('[notifications] could not read initial notification:', error?.message ?? error);
    return null;
  }
};
