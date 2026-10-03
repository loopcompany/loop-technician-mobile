/**
 * Tells the backend which device the current session runs on, once per session
 * and app launch. Login already sends these details; this covers sessions that
 * started before the feature existed and refreshes the app version after an
 * update, so "Account security" shows every device correctly.
 *
 * Best effort: a failure (e.g. an older backend without the endpoint) is ignored.
 * Renders nothing.
 */
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { securityAPI } from '../services/Api';

const DeviceSessionGate = () => {
  const authToken = useSelector((state) => state.auth.token);
  const syncedToken = useRef(null);

  useEffect(() => {
    if (!authToken || syncedToken.current === authToken) return;
    syncedToken.current = authToken;

    securityAPI.syncCurrentDevice().then((result) => {
      if (!result?.success) {
        console.log('[security] current device not synced:', result?.error_code);
      }
    });
  }, [authToken]);

  return null;
};

export default DeviceSessionGate;
