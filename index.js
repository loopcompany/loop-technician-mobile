import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// حالا App اصلی را تست می‌کنیم
import App from './App';

console.log('📦 index.js loaded, registering root component...');
console.log('🌐 Platform:', Platform.OS);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

console.log('✅ Root component registered successfully');
