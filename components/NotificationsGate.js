/**
 * Binds the push notification lifecycle to authentication state.
 *
 * The backend ties a device token to the logged-in technician, so registration
 * has to follow the auth token rather than the mount of any one screen. Driving
 * it from `state.auth.token` covers every way the app becomes authenticated —
 * password login, auto-login on launch, login after a password reset — and every
 * way it stops being, without touching those screens.
 *
 * Renders nothing.
 */
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useSelector } from 'react-redux';

import {
  initializeNotifications,
  registerForPushNotifications,
  startNotificationListeners,
  stopNotificationListeners,
  unregisterFromPushNotifications,
} from '../services/notifications';

const NotificationsGate = () => {
  const authToken = useSelector((state) => state.auth.token);

  // Logout clears the token from both redux and storage, so the value needed to
  // authenticate the de-registration call has to be captured beforehand.
  const previousToken = useRef(null);

  useEffect(() => {
    initializeNotifications();
  }, []);

  useEffect(() => {
    if (authToken) {
      previousToken.current = authToken;
      registerForPushNotifications();
      startNotificationListeners();
      return;
    }

    const staleToken = previousToken.current;
    previousToken.current = null;

    if (staleToken) {
      stopNotificationListeners();
      unregisterFromPushNotifications(staleToken);
    }
  }, [authToken]);

  // Permission can be revoked in system settings, and FCM tokens can be rotated
  // by the OS while the app is backgrounded. Re-checking on resume keeps the
  // backend current; it no-ops when nothing changed.
  useEffect(() => {
    if (Platform.OS === 'web' || !authToken) return undefined;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        registerForPushNotifications();
      }
    });

    return () => subscription.remove();
  }, [authToken]);

  useEffect(() => stopNotificationListeners, []);

  return null;
};

export default NotificationsGate;
