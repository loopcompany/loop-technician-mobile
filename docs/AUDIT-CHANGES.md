# App Audit — What Changed and Why

This document explains every change made during the audit of the Loop Technician app. It covers bug fixes, security fixes, speed and size improvements, build readiness, and the files that were removed.

Each section says **what was wrong**, **what was changed**, and **where** the change lives, so you can review it file by file.

---

## At a glance

| Area | Result |
|---|---|
| Login and session handling | Rebuilt around one module: [`services/session.js`](../services/session.js) |
| Crashes fixed | 2 (Directions button, Device Status screen) |
| Security issues fixed | 5 (plain-text password, token in web `localStorage`, personal data in logs, map WebView script injection, vulnerable `axios`) |
| Assets folder | 16 MB → 3.6 MB |
| Icon fonts shipped in the app | 19 → 2 (about 4 MB less) |
| npm packages removed | 16 unused packages |
| Files deleted | 42, each re-checked for references (see [Deleted files](#7-deleted-files)) |
| Verification | Production bundles for Android, iOS and web build; ESLint reports 0 errors; `expo prebuild` succeeds |

---

## 1. Login, tokens and redirects

The login flow had several problems: some left the app in a half-logged-in state, and others sent users to the wrong screen.

### The new design

All session handling now goes through **[`services/session.js`](../services/session.js)**:

- `saveSession(token, userData)` is called after a successful login.
- `clearSession()` is called on logout, on an expired token, and after a password change.
- `getToken()` reads the token from memory, so there is no storage read on every request.
- `notifyUnauthorized()` runs when the server rejects the token. It clears the session and triggers the handler that `App.js` registers.

When any request gets a **401 (token rejected)**:

```
Api.js response interceptor
   └─> session.notifyUnauthorized(tokenThatWasRejected)
          ├─ ignores it if that token is no longer the current one (for example, after a re-login)
          ├─ clears storage
          └─ App.js handler: removes the token from Redux, empties the user, sends the user to Login
```

A 401 from the login or forgot/reset-password endpoints is **not** treated as an expired session. There, it means the credentials were wrong.

### Bugs fixed

| # | Problem | Fix | File |
|---|---|---|---|
| 1 | On a 401, the token was removed from storage but Redux still thought the user was logged in. The user stayed on a broken screen. | The global 401 handler clears storage and Redux together and redirects to Login. | `services/Api.js`, `App.js` |
| 2 | Startup waited for a network request before drawing anything (up to 30 s with no internet). The token was also validated twice: in `App.js` and again in `Welcome.js`. | Startup now only reads the saved token from storage, which is instant. The profile loads in the background. | `App.js`, `screens/Welcome.js` |
| 3 | Offline, a network error at startup logged the user out. | Only a real 401 logs the user out. | `App.js`, `slices/userSlice.js` |
| 4 | After the intro video, a logged-in user was sent to the sign-in page if the profile hadn't loaded yet. If the video never finished (for example, autoplay blocked on web), the app stayed on the intro forever. | The next screen is chosen by the saved token. The intro ends after at most 10 s, and tapping it skips it. | `screens/Welcome.js` |
| 5 | Auto-login after a password reset always failed: `loginTechnician` was called with an object instead of `(code, password)`. | Called correctly. | `screens/auth/ResetPasswordScreen.js` |
| 6 | Changing the password removed the token from storage only. Redux and the push-notification registration were left behind. | Uses the normal logout, then clears Redux. | `screens/ChangePasswordScreen.js` |
| 7 | Pull-to-refresh on Extra Services sent `Bearer undefined`, so the server rejected it. | Extra Services uses the shared API client, which always adds the token. | `slices/extraSlice.js`, `screens/performservice/ExtraServices.js` |
| 8 | `fetchUser` swallowed errors and saved `undefined` as the user's profile. | It uses the shared API client and reports errors. On a network error, the last known profile is kept. | `slices/userSlice.js` |
| 9 | On web, a logged-out user could open protected pages directly, for example `/orders`. | Every navigation is checked. A logged-out user on a protected screen is sent to Login. The public screens are listed in `PUBLIC_ROUTES` in `App.js`. | `App.js` |
| 10 | Some deep links used screen names that don't exist, so the links did nothing. | Fixed `verify-phone`, `game`, `game/play`, `game/result` and `notes/edit`. Removed the link to a screen that no longer exists. | `App.js` |
| 12 | During sign-up, "resend code" did not send `hashApp`, so Android could not autofill the resent SMS code (the first send and both password-reset sends already did). | `resendVerificationCode(phone, hashApp)` now sends it. The backend must add it to the resent SMS the same way it does for the first one. | `services/Api.js`, `screens/auth/PhoneVerificationScreen.js` |
| 11 | The `Accept-Language` header was read once, before translations had loaded, so it never followed the user's language. | It is read on every request. | `services/Api.js` |

---

## 2. Security

| Problem | Fix |
|---|---|
| **"Remember me" stored the password as plain text** in AsyncStorage (and in `localStorage` on web). | On phones, the password now goes to the secure keychain via `expo-secure-store`. On web, it is not stored at all. Old plain-text copies are deleted the first time the Login screen opens after the update. |
| **On web, the whole app state was written to `localStorage`** on every change, including the auth token and the user's personal data. | Removed. The session is restored from storage at launch instead. Old copies are deleted on startup. |
| **Release builds printed full API responses to the log**, including personal data. | `babel.config.js` removes every `console.log`, `warn` and `info` from production builds. `console.error` is kept. Verified: the production web bundle contains 0 `console.log` calls. |
| **Map popup could break the map script.** An address was placed inside a JavaScript string with HTML escaping only, so a backslash or line break in an address broke the script. | The popup text is embedded with `JSON.stringify`. Pop-up windows are disabled. See `components/ShowMapDetailComponent.js`. |
| **Known vulnerabilities in `axios` and other packages.** | `npm audit fix` updated them. The remaining warnings are in build tools only (not shipped in the app) and need the Expo SDK 57 upgrade to fix. |

---

## 3. Other bugs fixed

| Problem | Fix | File |
|---|---|---|
| **Crash:** the "Directions" button on the order map used `Platform` without importing it. | Imported. Web now opens Google Maps in the browser. | `screens/performservice/DetailConponent.js` |
| **Crash:** the Device Status screen used colors it never imported. | Imported. | `screens/performservice/DeviceStatusScreen.js` |
| **Fake income shown as real.** When the income request failed, the Index screen showed made-up income figures to the technician. | It shows an empty chart and an error message instead. | `screens/performservice/IndexScreen.js` |
| `hexToRgb` returned no blue value (the green key was written twice). | Fixed. | `helpers/Common.js` |
| After login, the success message showed only the word "Success". | Shows the real message. | `screens/auth/Login.js` |
| Some style objects set the same key twice. Only the second value was used. | Removed the unused first values. The screens look the same as before. | `FolderScreen.js`, `HardwareIssueScreen.js`, `RequestsScreen.js` |
| `pdfDocumentSlice` imported something that does not exist. | Removed the import. | `slices/pdfDocumentSlice.js` |
| `contactSlice` hid request errors. | Errors are reported. | `slices/contactSlice.js` |
| Unread-message counting crashed when the server returned no message list. | Handles an empty list. | `screens/performservice/OrderDetailScreen.js` |

---

## 4. Speed

| Change | Effect | File |
|---|---|---|
| **Screens load only when first opened.** All ~60 screens were loaded at startup; they now use `getComponent`. | Faster app start. | `App.js` |
| **Polling runs only when the screen is visible.** The chat room polled 2 requests every 5 s, and order detail polled every 10 s, even behind other screens or with the app minimized. | Less battery and mobile data use, and less server load. | New [`hooks/usePolling.js`](../hooks/usePolling.js), used in `ChatRoom.js` and `OrderDetailScreen.js` |
| Chat marks messages as read only when something is actually unread. | Half as many chat requests. | `screens/chat/ChatRoom.js` |
| The token is kept in memory. | No storage read on every API request. | `services/session.js` |
| Folder icons are cached on the device (`expo-image`). | Home screen icons appear instantly after the first load. | `components/Folder.js` |
| The home screen made the same order-count request twice on open. | Now made once. | `screens/FolderScreen.js` |
| The web app no longer saves the whole app state on every change. | Less work on every action. | `store.js` |

---

## 5. App size

### Images and video

| File | Before | After | How |
|---|---|---|---|
| `assets/video/InShot_…mp4` (intro) | 6.9 MB | 1.6 MB | Re-encoded, same 720p resolution. Frames checked by eye. |
| `assets/logo.png` | 548 KB | 27 KB | 2700×1800 → 900×600. The logo is shown at 200×100 at most. |
| `assets/gif/prev.gif` (back arrow) | 1.0 MB | 318 KB | 428×240 → 150×84. It is shown at 50×50. |
| `assets/images/support.webp` | 106 KB | 16 KB | Resized to 256×256. |
| `assets/favicon.png` | 162 KB | 10 KB | 1024 → 196 px. |
| `icon.png`, `adaptive-icon.png`, `splash-icon.png`, `technician.png` | — | slightly smaller | Lossless optimization. The sizes Expo requires are unchanged. |

### Icon fonts

Every file imported icons as `import { Ionicons } from '@expo/vector-icons'`. That form bundles **all 19 icon fonts** into the app. Imports now use the direct path (`@expo/vector-icons/Ionicons`), so only the 2 fonts actually used ship: **about 4 MB less**.

### npm packages removed (not imported anywhere)

`@react-native-community/checkbox`, `@react-native-community/datetimepicker`, `@react-native-community/slider`, `@react-navigation/bottom-tabs`, `@react-navigation/drawer`, `@react-navigation/material-top-tabs`, `expo-audio`, `expo-status-bar`, `lottie-react-native`, `moment`, `react-native-bouncy-checkbox`, `react-native-element-dropdown`, `react-native-gesture-handler`, `react-native-pager-view`, `react-native-reanimated`, `redux` (still installed indirectly through `@reduxjs/toolkit`).

Several of these include native code, so removing them also makes native builds smaller and faster.

### Packages added

| Package | Why |
|---|---|
| `expo-secure-store` | Secure storage for the remembered password. |
| `babel-plugin-transform-remove-console` (dev only) | Removes logs from production builds. |

---

## 6. Build readiness

| Change | File |
|---|---|
| Registered the `expo-secure-store` config plugin. | `app.config.js` |
| Removed a Metro setting that could make Android/iOS builds pick up web-only files (`*.web.js`). Metro already handles platform files correctly. | `metro.config.js` |
| Removed the `test:zoom` script, which pointed to a deleted file. | `package.json` |

**Verified:**
- `npx expo export --platform all` builds Android, iOS and web without errors.
- `npx expo prebuild --platform android` succeeds, so every config plugin applies cleanly.
- `npx expo-doctor` reports no dependency version problems.
- ESLint (undefined variables, broken imports, hook rules, duplicate keys) reports 0 errors.

---

## 7. Deleted files

Every file below was checked in three ways:

1. **Import graph:** nothing imports it (starting from `index.js`, `App.js` and the config files).
2. **Text search:** its exact filename and import path appear nowhere in the project (code, JSON, HTML, CSS, config or docs).
3. **Build:** all three platforms bundle successfully without it.

If you ever need one of them back, restore it from commit `dade061` (the last commit before the audit): `git checkout dade061 -- "<path>"`.

### Code

| File | Why it was safe to remove |
|---|---|
| `SimpleTest.js`, `TestApp.js`, `test-zoom.html` | Test files. The app never loads them. |
| `examples/FooterContextExample.js` | Documentation example, never imported. |
| `components/Menuitem.js`, `NewButton.js`, `RadioButton.js`, `ResponsiveContainer.js` | Never imported. |
| `screens/EducationRequestDetailScreen.js`, `EducationRequestsListScreen.js` | Not registered in the navigator. |
| `screens/ManpowerRequestDetailScreen.js`, `TransferRequestDetailScreen.js` | Not registered in the navigator. |
| `screens/auth/LoginModal.js`, `LoginScreen.js` | Old login screens, replaced by `Login.js`. Not registered. |
| `screens/performservice/IncentiveSchemeScreen.js` | Not registered. It only had a deep-link entry, which was also removed. |
| `screens/resources/PrivacyScreen.js` | The app uses `screens/performservice/PrivacyScreen.js`. |
| `screens/Footer.js` | Imported in two screens but never rendered, and every menu item in it pointed to a screen that doesn't exist. The footer the app actually uses is `contexts/FooterProvider.js`. |
| `slices/cartSlice.js`, `wishlistSlice.js` | Never used. |
| `slices/weightSlice.js`, `newUserSlice.js`, `minPriceSlice.js` | Registered in the store but never read by any screen. |

### Assets

| File | Note |
|---|---|
| `assets/back.png`, `back2.jpeg`, `background2.jpg`, `camera.png`, `folder.png`, `next.png`, `webbackground.jpg` | Not referenced. The folder icons come from the server (`/storage/folder/…`), not from `folder.png`. |
| `assets/gif/next.gif` | Not referenced. Only `prev.gif` is used. |
| `assets/images/start.png`, `images/support.png` | Not referenced. The app uses `support.webp`. |
| `assets/fonts/Vazirmatn-Bold copy.ttf`, `Vazirmatn-Light copy.ttf` | Accidental duplicates of the fonts the app loads. |
| `assets/ios-dark.png`, `ios-light.png`, `ios-tinted.png`, `splash-icon-dark.png`, `splash-icon-light.png` | Not used by `app.json` or `app.config.js`. |
| `assets/sounds/notification.wav` | Not referenced. Notifications use the system sound. |
| `assets/svg/Icon.js`, `svg/file.json` | Not imported. |

### Kept on purpose

- `components/MapView.web.js` is loaded indirectly by `components/react-native-maps.web.js` (the web map shim). It is needed.
- `web/styles.css` and `web/index.html` are used by `postbuild.js` for the web build.

---

## 8. Not changed — decisions for you

These were found but left alone, because they need a product or account decision:

1. **Screens users can't reach.** `DeviceModelInfoScreen`, `ThinkingScreen` and `LaptopDeliveryScreen` are registered, but nothing in the app opens them. Most other `performservice` screens (Attendance, User History, Parts Expenses, and others) are only reachable from `DeviceModelInfoScreen`. A few buttons inside them point to screens that don't exist (`UserLocationScreen`, `MessageToUserScreen`, `NextScreen`, `WindowsInstallScreen`). Because screens now load lazily, they cost nothing at startup. Delete them if they are no longer planned.
2. **Map API keys.** The Google Maps key (`app.json`) and the Neshan key (`ShowMapDetailComponent.js`) can be read from the app package. Restrict the Google key in Google Cloud Console to the package `com.clpiran.looptech` and your signing certificate, and restrict the Neshan key to your domain.
3. **iOS push notifications.** `GoogleService-Info.plist` is missing, so iOS builds have push turned off. Download it from the Firebase Console into the project root.
4. **Older libraries.** `react-native-otp-verify` doesn't support React Native's New Architecture (it's disabled in `app.json`, so this is fine for now). `react-native-modern-datepicker` is no longer maintained.
5. **Optional Android size cut.** Setting `enableProguardInReleaseBuilds` and `enableShrinkResourcesInReleaseBuilds` in the `expo-build-properties` plugin would shrink the APK further. It wasn't enabled because it has to be tested on a real build.
6. **Warnings from `expo prebuild` (they existed before this audit).** `userInterfaceStyle` needs the `expo-system-ui` package to take effect, and Expo suggests setting a notification icon in `app.json`. Neither blocks a build.

---

## 9. How to test before release

Build a preview APK (`npm run build:preview:android`) and check:

- [ ] **Fresh install:** the intro plays, then the sign-in landing page opens. Tapping the intro skips it.
- [ ] **Login** with "remember me" on. Close the app completely and reopen it: you land on the home screen without logging in again.
- [ ] **Logout,** then open Login: the personnel code is filled in (and the password too, if remembered).
- [ ] **Expired session:** revoke the token on the server (or log in on another device, if that revokes it). The next action sends you to Login, not to an empty screen.
- [ ] **Offline start** while logged in: the app opens immediately and stays logged in.
- [ ] **Forgot password → reset:** you are logged in automatically afterwards.
- [ ] **Change password:** you are sent to Login and must log in again.
- [ ] **Chat:** new messages arrive while the chat is open. Polling stops when you leave the chat.
- [ ] **Order detail:** the "Directions" button opens the map app.
- [ ] **Index (income) screen** with the network off: an error is shown, not sample numbers.
- [ ] **Web:** open `/orders` while logged out. You are sent to Login.
