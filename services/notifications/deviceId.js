/**
 * A stable per-installation id, sent to the backend as `device_id` so it can
 * recognise the same device across token refreshes and re-logins.
 *
 * It is generated once and kept in AsyncStorage; uninstalling the app resets it,
 * which is exactly the lifetime the backend expects of a device row.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'notificationDeviceId';

const randomId = () => {
  const random = () => Math.random().toString(36).slice(2, 10);
  return `${Platform.OS}-${Date.now().toString(36)}-${random()}${random()}`;
};

let cached = null;

export const getDeviceId = async () => {
  if (cached) {
    return cached;
  }

  try {
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (stored) {
      cached = stored;
      return cached;
    }

    const generated = randomId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
    cached = generated;
    return cached;
  } catch (error) {
    console.log('[notifications] could not persist device id:', error?.message ?? error);
    // A non-persistent id is still better than none for this session.
    cached = cached || randomId();
    return cached;
  }
};
