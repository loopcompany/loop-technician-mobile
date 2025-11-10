// Shim برای react-native-maps در وب
// این فایل وقتی در وب import می‌شود، MapView وب را برمی‌گرداند

import MapView, { Marker } from './MapView.web';

export default MapView;
export { Marker };
export const PROVIDER_GOOGLE = null;
export const PROVIDER_DEFAULT = null;
