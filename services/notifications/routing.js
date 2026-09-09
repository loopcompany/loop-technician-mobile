/**
 * Maps a Firebase notification `data` payload onto an in-app route.
 *
 * The backend contract (see FIREBASE_NOTIFICATIONS.md) sends `type` and
 * optionally `screen`, plus ids such as `order_id`. Every value arrives as a
 * string because FCM only carries string data, so ids are parsed here.
 */
import { navigationRef } from '../NavigationService';

/** FCM sends all data values as strings; screens expect numeric ids. */
const toId = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

/**
 * Resolves a payload to { name, params } or null when it maps to no screen.
 * `screen` from the backend wins; `type` is the fallback.
 */
export const resolveRoute = (data = {}) => {
  const key = data.screen || data.type;

  switch (key) {
    case 'order-detail':
    case 'order_status':
    case 'order_assigned':
    case 'order_cancelled':
    case 'order_updated':
      return data.order_id
        ? { name: 'OrderDetailScreen', params: { orderId: toId(data.order_id) } }
        : { name: 'OrderListScreen' };

    case 'order-list':
    case 'orders':
      return { name: 'OrderListScreen' };

    case 'chat':
    case 'chat-room':
      return data.user_id
        ? {
            name: 'ChatRoom',
            params: { userId: toId(data.user_id), userName: data.user_name },
          }
        : { name: 'ChatListScreen' };

    case 'chat-list':
      return { name: 'ChatListScreen' };

    case 'message':
    case 'messages':
      return { name: 'MessageScreen' };

    case 'violation':
    case 'admin-violation':
      return { name: 'RequestsListScreen' };

    case 'performance':
      return { name: 'PerformanceScreen' };

    case 'financial-report':
      return { name: 'FinancialReportScreen' };

    default:
      return null;
  }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A notification can cold-start the app, in which case the tap is handled before
 * NavigationContainer has mounted and navigating would be a silent no-op. Wait
 * for the ref, but not forever.
 */
const waitForNavigation = async ({ attempts = 40, delayMs = 100 } = {}) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (navigationRef.isReady()) {
      return true;
    }
    await wait(delayMs);
  }
  return false;
};

/**
 * Navigates for a tapped notification. Unknown payloads are ignored rather than
 * guessed at, so a new backend `type` can never strand the user on a wrong screen.
 */
export const navigateFromNotification = async (data = {}) => {
  const route = resolveRoute(data);

  if (!route) {
    console.log('[notifications] no route for payload:', JSON.stringify(data));
    return false;
  }

  if (!(await waitForNavigation())) {
    console.log('[notifications] navigation never became ready; ignoring tap');
    return false;
  }

  navigationRef.navigate(route.name, route.params);
  return true;
};
