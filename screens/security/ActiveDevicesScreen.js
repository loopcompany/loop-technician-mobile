import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import { createStyles } from '../../styles/NewStyles';
import { themeColor10 } from '../../theme/Color';
import { securityAPI } from '../../services/Api';
import { signOut } from '../../services/signOut';
import { showAlert, showToastOrAlert } from '../../helpers/Common';
import {
  useSecurityList,
  pickList,
  errorText,
  formatDateTime,
  deviceTitle,
  deviceTypeLabel,
  deviceIcon,
  osLabel,
  orDash,
  InfoRow,
  Badge,
  CardHeader,
  DangerAction,
  ListState,
  createSharedStyles,
} from './securityShared';

const pickDevices = pickList('devices');

const byCurrentThenRecent = (a, b) => {
  if (!!a.is_current !== !!b.is_current) return a.is_current ? -1 : 1;
  return String(b.last_active_at ?? '').localeCompare(String(a.last_active_at ?? ''));
};

// Account security › Active devices: every device the account is signed in on,
// with the option to sign out of each one.
export default function ActiveDevicesScreen() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const shared = useMemo(() => createSharedStyles(NewStyles), [NewStyles]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const { loading, refreshing, items, error, reload, refresh } = useSecurityList(securityAPI.getDevices, pickDevices);
  const devices = useMemo(() => [...items].sort(byCurrentThenRecent), [items]);
  const [busyId, setBusyId] = useState(null);

  const logoutDevice = async (device) => {
    setBusyId(device.id);
    const result = await securityAPI.logoutDevice(device.id);
    setBusyId(null);
    if (result.success) {
      showToastOrAlert(t('The device was signed out.'));
      reload();
    } else {
      showAlert(t('Error'), errorText(result, t), [], t);
    }
  };

  const confirmLogout = (device) => {
    if (device.is_current) {
      showAlert(
        t('Sign out of this device'),
        t('You are about to sign out of the device you are using. You will need your password to sign in again.'),
        [
          { text: t('Cancel'), style: 'cancel' },
          { text: t('Sign out'), style: 'destructive', onPress: () => signOut(dispatch) },
        ],
        t
      );
      return;
    }
    showAlert(
      t('Sign out of this device'),
      t('Your account will be signed out on «{{device}}».', { device: deviceTitle(device, t) }),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Sign out'), style: 'destructive', onPress: () => logoutDevice(device) },
      ],
      t
    );
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <CustomStatusBar />
      <ScreenHeaders title={t('Active devices')} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <ListState
          loading={loading}
          error={error}
          isEmpty={devices.length === 0}
          emptyText={t('No active device was found.')}
          onRetry={reload}
        />

        {!loading && devices.length > 0 && (
          <Text style={[NewStyles.text10, styles.summary]}>
            {t('Your account is signed in on {{n}} device(s).', { n: devices.length })}
          </Text>
        )}

        {!loading && devices.map((device) => (
          <View key={String(device.id)} style={[shared.card, device.is_current && shared.cardCurrent]}>
            <CardHeader icon={deviceIcon(device.device_type)} title={deviceTitle(device, t)}>
              <Badge
                text={device.is_current ? t('Current device') : t('Active status')}
                tone={device.is_current ? 'current' : 'active'}
              />
            </CardHeader>

            <InfoRow label={t('Device type')} value={deviceTypeLabel(device.device_type, t)} />
            <InfoRow label={t('Device model')} value={orDash(device.device_model)} />
            <InfoRow label={t('Operating system')} value={osLabel(device)} />
            <InfoRow label={t('App version')} value={orDash(device.app_version)} />
            <InfoRow label={t('Device ID')} value={orDash(device.device_id)} />
            <InfoRow label={t('Last connection IP')} value={orDash(device.last_ip)} />
            {device.location ? (
              <InfoRow label={t('Approximate location')} value={String(device.location)} />
            ) : null}
            <InfoRow label={t('Last activity')} value={formatDateTime(device.last_active_at, t, i18n.language)} />
            <InfoRow
              label={t('Status')}
              value={device.is_current ? t('Current device') : t('Active status')}
            />

            <DangerAction
              testID={`device-logout-${device.id}`}
              title={t('Sign out of this device')}
              loading={busyId === device.id}
              disabled={busyId !== null && busyId !== device.id}
              onPress={() => confirmLogout(device)}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 130,
  },
  summary: {
    fontSize: 13,
    color: themeColor10.bgColor(0.6),
    marginBottom: 10,
  },
});
