import { registerRootComponent } from 'expo';

// Must be registered before the root component: Firebase looks this handler up
// when it wakes the JS context for a background message.
import { registerBackgroundMessageHandler } from './services/notifications/backgroundHandler';

// حالا App اصلی را تست می‌کنیم
import App from './App';

registerBackgroundMessageHandler();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
