/**
 * Describes this device to the backend so the "Account security" screens can
 * list where the account is signed in (technician edits, account security).
 *
 * Sent with the login request and re-synced once per session (see
 * DeviceSessionGate), so the app version stays current after an update.
 * Field names match docs/Backend-Account-Security.md.
 */
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { getDeviceId } from './notifications/deviceId';

const DEVICE_TYPES = {
  [Device.DeviceType.PHONE]: 'phone',
  [Device.DeviceType.TABLET]: 'tablet',
  [Device.DeviceType.DESKTOP]: 'desktop',
  [Device.DeviceType.TV]: 'tv',
};

const clean = (value, max = 100) => {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text ? text.slice(0, max) : undefined;
};

export const getDeviceInfo = async () => {
  const info = {
    device_id: await getDeviceId(),
    platform: Platform.OS,
    device_type: DEVICE_TYPES[Device.deviceType] ?? (Platform.OS === 'web' ? 'web' : 'unknown'),
    device_brand: clean(Device.brand || Device.manufacturer),
    device_model: clean(Device.modelName),
    os_name: clean(Device.osName || Platform.OS),
    os_version: clean(Device.osVersion ?? Platform.Version),
    app_version: clean(Constants.expoConfig?.version, 50),
  };

  // Drop empty fields instead of sending nulls.
  return Object.fromEntries(Object.entries(info).filter(([, value]) => value !== undefined));
};
