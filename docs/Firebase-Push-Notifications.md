# Firebase Push Notifications — Mobile Implementation

Client-side implementation of the FCM contract described in
[`FIREBASE_NOTIFICATIONS.md`](../FIREBASE_NOTIFICATIONS.md).

The app uses **React Native Firebase** (not Expo Push). The backend sends
directly to FCM device tokens via HTTP v1, so the app must hand it a real FCM
registration token — which is what `@react-native-firebase/messaging` provides on
both Android and iOS.

---

## ⚠️ Required before the first Android build

`google-services.json` in the project root is currently registered for
`com.clpiran.loop` (the customer app), but this app's package is
`com.clpiran.looptech`. **The Android build will fail until this is fixed.**

1. Firebase Console → project `loop-1efb6` → Project settings → Your apps
2. **Add app → Android**, package name `com.clpiran.looptech`
3. Download the regenerated `google-services.json` (it will contain *both* apps)
4. Replace `google-services.json` in the project root

`app.config.js` checks this and fails `eas build` / `expo prebuild` with these
instructions, so a mismatch cannot slip into a build unnoticed.

### For iOS

1. Firebase Console → Add app → iOS, bundle id `com.clpiran.looptech`
2. Download `GoogleService-Info.plist` → project root
3. Upload the **APNs authentication key** (`.p8`) under
   Project settings → Cloud Messaging → Apple app configuration

Without the plist, iOS builds succeed but push is inert (a warning is printed).

---

## Files

| File | Role |
|---|---|
| `app.config.js` | Extends `app.json` with the Firebase plugins, permissions and the config sanity check |
| `firebase.json` | Native RNFirebase settings — default Android channel, auto-init |
| `google-services.json` | Firebase Android config (see above) |
| `services/notifications/index.js` | Orchestration: permission, token lifecycle, channels, listeners |
| `services/notifications/messaging.js` | Wrapper over `@react-native-firebase/messaging` |
| `services/notifications/messaging.web.js` | Inert stub so web builds carry no native code |
| `services/notifications/routing.js` | Maps a notification `data` payload to a screen |
| `services/notifications/deviceId.js` | Stable per-install `device_id` |
| `services/notifications/logoutTask.js` | Cycle-free hook letting logout detach the device |
| `services/notifications/backgroundHandler.js` | Background/quit-state FCM handler (registered in `index.js`) |
| `components/NotificationsGate.js` | Binds the whole lifecycle to `state.auth.token` |
| `assets/notification-icon.png` | White-on-transparent Android status bar icon |

---

## How registration is wired

`NotificationsGate` (mounted in `App.js`) watches `state.auth.token`, so
registration follows authentication rather than any one screen. That covers
password login, auto-login on launch, and login after a password reset without
touching those screens.

```
auth.token set    → request permission → getToken() → POST /notifications/device-token
auth.token clear  → DELETE /notifications/device-token
FCM token rotates → onTokenRefresh   → POST /notifications/device-token
app resumes       → re-check (no-ops when unchanged)
```

Logout ordering matters: `logoutTechnician()` deletes the device token **before**
`POST /technician/logout` revokes the bearer token, otherwise the delete would
come back `401` and leave a stale row. The gate's reactive delete is a fallback
for paths that clear the token without calling `logoutTechnician()`; the two are
de-duplicated by an in-flight guard.

The FCM token is deliberately **not** deleted on logout — removing the backend
row is what stops delivery, and a stable token makes the operation idempotent and
the next login instant.

---

## Message handling

| App state | Who displays it | Tap handled by |
|---|---|---|
| Foreground | We do, via `expo-notifications` | `addNotificationResponseReceivedListener` |
| Background | Android/iOS, from the FCM payload | `onNotificationOpenedApp` |
| Quit | Android/iOS, from the FCM payload | `getInitialNotification` |

FCM does not display anything while the app is in the foreground on either
platform, which is why foreground messages are presented locally.

`expo-notifications` and RNFirebase coexist safely: `expo-notifications` declares
its FCM service with `android:priority="-1"`, so RNFirebase's service wins and
receives every remote message. `expo-notifications` is used only for local
presentation and channel management.

### Android channels

Android silently drops notifications sent to a channel that does not exist.
`default` and `orders` are created at startup, and any other channel the backend
uses is created on demand on first receipt. `default` matches
`messaging_android_notification_channel_id` in `firebase.json`, which is the
channel FCM falls back to when a payload names none.

---

## Deep linking

`services/notifications/routing.js` maps the payload to a screen. `screen` wins
over `type`; ids arrive as strings and are parsed. Unknown payloads are ignored
rather than guessed at, so a new backend `type` can never strand the user on the
wrong screen.

| `screen` / `type` | Destination |
|---|---|
| `order-detail`, `order_status`, `order_assigned`, `order_cancelled`, `order_updated` | `OrderDetailScreen` (`orderId`), or `OrderListScreen` without an id |
| `order-list`, `orders` | `OrderListScreen` |
| `chat`, `chat-room` | `ChatRoom` (`user_id`, `user_name`), or `ChatListScreen` |
| `chat-list` | `ChatListScreen` |
| `message`, `messages` | `MessageScreen` |
| `violation`, `admin-violation` | `RequestsListScreen` |
| `performance` | `PerformanceScreen` |
| `financial-report` | `FinancialReportScreen` |

Cold-start taps wait (up to 4s) for the navigator to mount before navigating.

To add a route, extend the `switch` in `resolveRoute` — that is the only place
that needs to change.

---

## Building and testing

Push notifications need a **development build**; they do not work in Expo Go.

```bash
eas build --profile development --platform android
npx expo start --dev-client
```

Test from the backend:

```php
app(FirebaseNotificationService::class)->sendToUser(
    $technician,
    'وضعیت سفارش تغییر کرد',
    'سفارش شما آماده بررسی است.',
    ['type' => 'order_status', 'order_id' => '123', 'screen' => 'order-detail'],
    ['android' => ['priority' => 'HIGH', 'notification' => ['channel_id' => 'orders']]]
);
```

Check each state: app open, app backgrounded, app killed. Filter logs with
`[notifications]`.

### Troubleshooting

| Symptom | Cause |
|---|---|
| Build fails on `google-services.json` | Package not registered in Firebase — see the top of this document |
| No token on Android 13+ | `POST_NOTIFICATIONS` denied; check system settings |
| No token on iOS | APNs `.p8` key not uploaded to Firebase, or running in the simulator (push needs a real device) |
| Delivered but not shown on Android | Payload names a channel that does not exist |
| Nothing on web | Expected — web push is not implemented (see `messaging.web.js`) |

---

## Web

Web is explicitly out of scope: `messaging.web.js` stubs every entry point, so
the web bundle contains no Firebase code at all. Adding web push would need the
Firebase JS SDK, a service worker and a VAPID key; only `messaging.web.js` and
the plumbing behind it would have to change.
