import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import { createStyles } from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor6, themeColor7, themeColor10 } from '../../theme/Color';
import { securityAPI } from '../../services/Api';
import { showAlert } from '../../helpers/Common';
import { useSecurityList, pickList, errorText, deviceTitle, ListState } from './securityShared';

const pickDevices = pickList('devices');

// Account security › Sign out of other devices. Kept deliberately simple, as the
// spec asks: the counts, one button and a final confirmation.
export default function LogoutOtherDevicesScreen() {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const { loading, refreshing, items, error, reload, refresh } = useSecurityList(securityAPI.getDevices, pickDevices);
  const [submitting, setSubmitting] = useState(false);

  const activeCount = items.length;
  const currentDevice = items.find((device) => device.is_current);
  const otherCount = Math.max(0, activeCount - (currentDevice ? 1 : 0));

  const logoutOthers = async () => {
    setSubmitting(true);
    const result = await securityAPI.logoutOtherDevices();
    setSubmitting(false);
    if (result.success) {
      showAlert(t('Success'), t('Your account was signed out of the other devices.'), [], t);
      reload();
    } else {
      showAlert(t('Error'), errorText(result, t), [], t);
    }
  };

  const confirm = () => {
    showAlert(
      t('Sign out of other devices'),
      t('{{active}} active device(s). If you continue, your account will be signed out of {{others}} other device(s).', {
        active: activeCount,
        others: otherCount,
      }),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Sign out'), style: 'destructive', onPress: logoutOthers },
      ],
      t
    );
  };

  const stats = [
    { id: 'active', label: t('Active devices'), value: activeCount, color: themeColor0.bgColor(1) },
    { id: 'others', label: t('Other devices'), value: otherCount, color: themeColor6.bgColor(1) },
  ];

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <CustomStatusBar />
      <ScreenHeaders title={t('Sign out of other devices')} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <ListState
          loading={loading}
          error={error}
          isEmpty={activeCount === 0}
          emptyText={t('No active device was found.')}
          onRetry={reload}
        />

        {!loading && activeCount > 0 && (
          <>
            <View style={[NewStyles.row, styles.stats]}>
              {stats.map((stat) => (
                <View key={stat.id} style={[styles.stat, NewStyles.center]}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={[NewStyles.text10, styles.statLabel]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.currentBox}>
              <Text style={[NewStyles.text10, styles.currentLabel]}>{t('Current device')}</Text>
              <Text style={[NewStyles.title10, styles.currentValue]}>
                {currentDevice ? deviceTitle(currentDevice, t) : t('Unknown device')}
              </Text>
            </View>

            {otherCount > 0 ? (
              <>
                <Text style={[NewStyles.text10, styles.note]}>
                  {t('{{active}} active device(s). If you continue, your account will be signed out of {{others}} other device(s).', {
                    active: activeCount,
                    others: otherCount,
                  })}
                </Text>
                <Button
                  title={t('Sign out of other devices')}
                  onPress={confirm}
                  loading={submitting}
                  style={styles.button}
                  textStyle={styles.buttonText}
                />
              </>
            ) : (
              <Text style={[NewStyles.text10, styles.note, styles.onlyThis]}>
                {t('Your account is only signed in on this device.')}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 130,
    gap: 14,
  },
  stats: {
    gap: 12,
  },
  stat: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: themeColor4.bgColor(1),
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.2),
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontFamily: NewStyles.title10.fontFamily,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  currentBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: themeColor7.bgColor(0.1),
    borderWidth: 1,
    borderColor: themeColor7.bgColor(0.4),
    gap: 4,
  },
  currentLabel: {
    fontSize: 12,
    color: themeColor10.bgColor(0.6),
  },
  currentValue: {
    fontSize: 15,
  },
  note: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
  },
  onlyThis: {
    color: themeColor7.bgColor(1),
  },
  button: {
    backgroundColor: themeColor6.bgColor(1),
  },
  buttonText: {
    color: themeColor4.bgColor(1),
  },
});
