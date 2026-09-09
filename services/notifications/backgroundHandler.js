/**
 * Registers the FCM background/quit-state message handler.
 *
 * This must run at module scope before the root component is registered —
 * Firebase looks the handler up when it wakes the JS context for a background
 * message, long before any React code has mounted.
 *
 * Notifications that carry a `notification` block are drawn by the OS itself;
 * this handler exists for data-only messages and for any bookkeeping we want to
 * do before the user taps. Keep it fast: Android kills the headless task after
 * messaging_android_headless_task_timeout (see firebase.json).
 */
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

export const registerBackgroundMessageHandler = () => {
  try {
    setBackgroundMessageHandler(getMessaging(getApp()), async (remoteMessage) => {
      console.log('[notifications] background message:', remoteMessage?.messageId);
    });
  } catch (error) {
    console.log('[notifications] could not register background handler:', error?.message ?? error);
  }
};
