/**
 * Single source of truth for the persisted auth session.
 *
 * The token is cached in memory so the axios request interceptor does not hit
 * AsyncStorage on every request, and every place that logs in or out goes
 * through here so storage, the cache and redux cannot drift apart.
 *
 * Deliberately imports nothing from Api.js or the store to avoid require cycles.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'userToken';
export const USER_DATA_KEY = 'userData';
const REMEMBERED_CODE_KEY = 'savedReferralCode';
const REMEMBERED_PASSWORD_KEY = 'savedPassword';
// SecureStore keys may only contain alphanumerics, ".", "-" and "_".
const SECURE_PASSWORD_KEY = 'looptech.savedPassword';

// undefined = not read from storage yet, null = logged out.
let cachedToken;

export const getToken = async () => {
  if (cachedToken !== undefined) return cachedToken;
  try {
    cachedToken = (await AsyncStorage.getItem(TOKEN_KEY)) || null;
  } catch {
    cachedToken = null;
  }
  return cachedToken;
};

export const saveSession = async (token, userData) => {
  cachedToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  if (userData !== undefined) {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
};

export const clearSession = async () => {
  cachedToken = null;
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_DATA_KEY]);
  } catch (error) {
    console.log('Error clearing session:', error);
  }
};

// ---------------------------------------------------------------------------
// "Remember me" credentials. The password never goes to AsyncStorage (plain
// text on disk / localStorage); on native it lives in the Keychain/Keystore,
// on web it is not remembered at all.
// ---------------------------------------------------------------------------

const canStorePassword = Platform.OS !== 'web';

export const saveRememberedCredentials = async (referralCode, password) => {
  await AsyncStorage.setItem(REMEMBERED_CODE_KEY, referralCode);
  if (canStorePassword) {
    await SecureStore.setItemAsync(SECURE_PASSWORD_KEY, password);
  }
};

export const clearRememberedCredentials = async () => {
  await AsyncStorage.multiRemove([REMEMBERED_CODE_KEY, REMEMBERED_PASSWORD_KEY]);
  if (canStorePassword) {
    await SecureStore.deleteItemAsync(SECURE_PASSWORD_KEY).catch(() => {});
  }
};

export const getRememberedCredentials = async () => {
  // Older builds kept the password in AsyncStorage in plain text; wipe it.
  await AsyncStorage.removeItem(REMEMBERED_PASSWORD_KEY).catch(() => {});

  const referralCode = await AsyncStorage.getItem(REMEMBERED_CODE_KEY);
  const password = canStorePassword
    ? await SecureStore.getItemAsync(SECURE_PASSWORD_KEY).catch(() => null)
    : null;
  return { referralCode, password };
};

// ---------------------------------------------------------------------------
// Unauthorized handling. App.js registers a handler that clears redux and
// sends the user to the login screen; Api.js calls notifyUnauthorized on 401.
// ---------------------------------------------------------------------------

let unauthorizedHandler = null;
let unauthorizedPending = false;

export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

export const notifyUnauthorized = async (rejectedToken) => {
  // A late 401 for a token that is no longer the current one (e.g. after a
  // re-login) must not end the new session.
  const current = await getToken();
  if (!current || (rejectedToken && rejectedToken !== current)) return;

  // Several requests usually fail together; handle the burst once.
  if (unauthorizedPending) return;
  unauthorizedPending = true;
  try {
    await clearSession();
    unauthorizedHandler?.();
  } finally {
    setTimeout(() => {
      unauthorizedPending = false;
    }, 1000);
  }
};
