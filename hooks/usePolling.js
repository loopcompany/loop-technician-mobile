import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

/**
 * Calls `callback` every `intervalMs` while the screen is focused and the app
 * is in the foreground. Stack screens stay mounted underneath the current one,
 * so a plain setInterval would keep hitting the API from hidden screens and in
 * the background. Runs once immediately when polling (re)starts.
 */
export default function usePolling(callback, intervalMs, enabled = true) {
  const isFocused = useIsFocused();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || !isFocused) return undefined;

    let timer = null;
    const start = () => {
      if (timer) return;
      callbackRef.current();
      timer = setInterval(() => callbackRef.current(), intervalMs);
    };
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };

    if (AppState.currentState !== 'background') start();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') start();
      else if (state === 'background') stop();
    });

    return () => {
      stop();
      subscription.remove();
    };
  }, [enabled, isFocused, intervalMs]);
}
