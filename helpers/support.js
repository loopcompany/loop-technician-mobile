import { Linking, Platform } from 'react-native';
import { showAlert } from './Common';

// Loop support line (edits list 1405/07/03, item 8). Every "call support"
// action in the app goes through this constant.
export const SUPPORT_PHONE = '+982191693909';

/** Opens the dialer on the support line; `t` translates the error messages. */
export const callSupport = async (t) => {
  const url = `tel:${SUPPORT_PHONE}`;
  try {
    await Linking.openURL(url);
  } catch (err) {
    if (Platform.OS === 'web') {
      try {
        window.open(url, '_self');
      } catch (webErr) {
        showAlert(t('Error'), t('There was a problem starting the call.'));
      }
    } else {
      showAlert(t('Error'), t('Phone calls are not available on your device.'));
    }
  }
};
