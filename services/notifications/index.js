/**
 * Push notification orchestration.
 *
 * Firebase Cloud Messaging delivers the message; this module owns everything
 * around it — permission, the FCM token lifecycle against our backend, Android
 * notification channels, foreground presentation and tap routing.
 *
 * Division of labour on Android:
 *   - background / quit : FCM displays the notification itself
 *   - foreground        : FCM hands us the message and we present it locally
 *                         through expo-notifications
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { registerDeviceToken, unregisterDeviceToken } from '../Api';
import { getDeviceId } from './deviceId';
import { setLogoutTask } from './logoutTask';
import { navigateFromNotification } from './routing';
import {
  isSupported,
  platformName,
  requestPermission,
  getFcmToken,
  onTokenRefreshed,
  onForegroundMessage,
  onNotificationOpened,
  getNotificationThatOpenedApp,
} from './messaging';

/**
 * Must match `messaging_android_notification_channel_id` in firebase.json —
 * that is the channel FCM falls back to when the payload names none.
 * Channels the backend addresses by `android.notification.channel_id` have to
 * exist on the device or Android silently drops the notification.
 */
const CHANNELS = [
  { id: 'default', name: 'اعلان‌های عمومی' },
  { id: 'orders', name: 'سفارش‌ها' },
];

const appVersion = Constants.expoConfig?.version;

/** What we last successfully told the backend, to avoid redundant calls. */
let lastRegistration = null;
/** Teardown functions for the active listeners. */
let subscriptions = [];
let handlerConfigured = false;

const isEnabled = () => isSupported && Platform.OS !== 'web';

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

const configureForegroundPresentation = () => {
  if (handlerConfigured) return;
  handlerConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

/** Channel ids already created on this device, to avoid redundant native calls. */
const createdChannels = new Set();

/**
 * Android drops any notification addressed to a channel that does not exist, so
 * a channel the backend invents must be created before we present anything on
 * it. Creating an existing channel is a no-op, and the name is only used the
 * first time.
 */
const ensureAndroidChannel = async (id, name) => {
  if (Platform.OS !== 'android' || createdChannels.has(id)) return;

  await Notifications.setNotificationChannelAsync(id, {
    name: name ?? CHANNELS.find((channel) => channel.id === id)?.name ?? id,
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  createdChannels.add(id);
};

const createAndroidChannels = async () => {
  if (Platform.OS !== 'android') return;

  await Promise.all(CHANNELS.map((channel) => ensureAndroidChannel(channel.id, channel.name)));
};

/**
 * Presents a foreground message as a real notification. FCM does not display
 * anything while the app is in the foreground on either platform, so without
 * this the user would see nothing.
 */
const presentForegroundMessage = async (remoteMessage) => {
  const { notification, data } = remoteMessage ?? {};
  const title = notification?.title ?? data?.title;
  const body = notification?.body ?? data?.body;

  // Data-only messages with nothing to show are handled silently.
  if (!title && !body) return;

  // The backend sets the channel through android.notification.channel_id, which
  // reaches us as notification.android.channelId. Fall back to a data key, then
  // to the channel FCM itself defaults to.
  const channelId = notification?.android?.channelId ?? data?.channel_id ?? 'default';

  try {
    await ensureAndroidChannel(channelId);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title ?? '',
        body: body ?? '',
        data: data ?? {},
        sound: true,
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger: null,
    });
  } catch (error) {
    console.log('[notifications] could not present foreground message:', error?.message ?? error);
  }
};

// ---------------------------------------------------------------------------
// Token lifecycle
// ---------------------------------------------------------------------------

const sendTokenToBackend = async (token) => {
  const deviceId = await getDeviceId();
  const result = await registerDeviceToken({
    token,
    platform: platformName,
    deviceId,
    appVersion,
  });

  if (result.success) {
    lastRegistration = token;
  } else {
    // Leave lastRegistration untouched so the next trigger retries.
    console.log('[notifications] backend rejected token:', result.message);
  }

  return result.success;
};

/**
 * Asks for permission if needed, then registers the device's FCM token with the
 * backend. Safe to call repeatedly — it no-ops when nothing has changed.
 * Returns true when the backend holds a current token for this device.
 */
export const registerForPushNotifications = async () => {
  if (!isEnabled()) return false;

  const granted = await requestPermission();
  if (!granted) {
    console.log('[notifications] permission not granted');
    return false;
  }

  const token = await getFcmToken();
  if (!token) return false;

  if (token === lastRegistration) return true;

  return sendTokenToBackend(token);
};

/** Guards against the logout path and the auth-state watcher racing each other. */
let unregisterInFlight = null;

/**
 * Removes this device's token from the account.
 *
 * Takes the auth token explicitly because logout clears storage while this runs,
 * and the request must still be authenticated to identify the device row.
 *
 * The FCM token itself is deliberately left in place: deleting the backend row
 * is what stops delivery, and a stable token keeps this operation idempotent and
 * lets the next login re-register instantly.
 */
export const unregisterFromPushNotifications = async (authToken) => {
  if (!isEnabled()) return false;
  if (unregisterInFlight) return unregisterInFlight;

  unregisterInFlight = (async () => {
    lastRegistration = null;

    const token = await getFcmToken();
    if (!token) return false;

    const result = await unregisterDeviceToken({
      token,
      platform: platformName,
      authToken,
    });

    return result.success;
  })();

  try {
    return await unregisterInFlight;
  } finally {
    unregisterInFlight = null;
  }
};

// ---------------------------------------------------------------------------
// Listeners
// ---------------------------------------------------------------------------

const handleTap = (data) => {
  if (!data) return;
  // Fire and forget: navigation may need to wait for the navigator to mount.
  navigateFromNotification(data).catch((error) =>
    console.log('[notifications] navigation failed:', error?.message ?? error)
  );
};

/**
 * Starts every foreground-side listener. Returns a teardown function.
 * Calling it again replaces the previous set rather than stacking duplicates.
 */
export const startNotificationListeners = () => {
  if (!isEnabled()) return () => {};

  stopNotificationListeners();
  configureForegroundPresentation();

  subscriptions = [
    // A new FCM token must reach the backend or the device goes silent.
    onTokenRefreshed((token) => {
      console.log('[notifications] FCM token refreshed');
      lastRegistration = null;
      sendTokenToBackend(token);
    }),

    onForegroundMessage(presentForegroundMessage),

    // Tap on a notification the system displayed (app was backgrounded).
    onNotificationOpened((remoteMessage) => handleTap(remoteMessage?.data)),
  ];

  // Tap on a notification we presented ourselves while in the foreground.
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) =>
    handleTap(response?.notification?.request?.content?.data)
  );
  subscriptions.push(() => responseSubscription.remove());

  // A notification may have cold-started the app.
  getNotificationThatOpenedApp().then((remoteMessage) => {
    if (remoteMessage) {
      handleTap(remoteMessage.data);
    }
  });

  return stopNotificationListeners;
};

export const stopNotificationListeners = () => {
  subscriptions.forEach((unsubscribe) => {
    try {
      unsubscribe?.();
    } catch (error) {
      console.log('[notifications] listener teardown failed:', error?.message ?? error);
    }
  });
  subscriptions = [];
};

/**
 * One-time setup that must happen regardless of auth state, so that channels
 * exist before any notification is delivered.
 */
export const initializeNotifications = async () => {
  if (!isEnabled()) return;

  configureForegroundPresentation();

  try {
    await createAndroidChannels();
  } catch (error) {
    console.log('[notifications] could not create channels:', error?.message ?? error);
  }
};

// Let the logout flow detach this device before it revokes the bearer token.
setLogoutTask(unregisterFromPushNotifications);
