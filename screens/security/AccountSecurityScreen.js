import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import { createStyles } from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor10, themeColor11 } from '../../theme/Color';

// "Account security", opened from the account screens (technician edits —
// «فیلد امنیت حساب در اپ تکنسین»): signed-in devices, signing out of the other
// devices, and session management.
export default function AccountSecurityScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const isRTL = i18n.language === 'fa';

  const options = [
    {
      id: 'devices',
      icon: 'phone-portrait-outline',
      title: t('Active devices'),
      description: t('Devices your account is signed in on'),
      screen: 'ActiveDevicesScreen',
    },
    {
      id: 'logout-others',
      icon: 'log-out-outline',
      title: t('Sign out of other devices'),
      description: t('Keep only this device signed in'),
      screen: 'LogoutOtherDevicesScreen',
    },
    {
      id: 'sessions',
      icon: 'key-outline',
      title: t('Session management'),
      description: t('Active sessions of your account in the system'),
      screen: 'SessionsScreen',
    },
  ];

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <CustomStatusBar />
      <ScreenHeaders title={t('Account security')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, NewStyles.center]}>
          <View style={[styles.heroIcon, NewStyles.center]}>
            <Ionicons name="shield-checkmark" size={34} color={themeColor4.bgColor(1)} />
          </View>
          <Text style={[NewStyles.title10, styles.heroText]}>
            {t('Review where your account is signed in and sign out of devices you do not recognise.')}
          </Text>
        </View>

        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            testID={`security-${option.id}`}
            style={[NewStyles.row, styles.option]}
            onPress={() => navigation.navigate(option.screen)}
          >
            <View style={[styles.optionIcon, NewStyles.center]}>
              <Ionicons name={option.icon} size={22} color={themeColor0.bgColor(1)} />
            </View>
            <View style={styles.optionBody}>
              <Text style={[NewStyles.title10, styles.optionTitle]}>{option.title}</Text>
              <Text style={[NewStyles.text10, styles.optionDescription]}>{option.description}</Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={20}
              color={themeColor3.bgColor(1)}
            />
          </TouchableOpacity>
        ))}

        <View style={[NewStyles.row, styles.tip]}>
          <Ionicons name="information-circle-outline" size={20} color={themeColor11.bgColor(1)} />
          <Text style={[NewStyles.text10, styles.tipText]}>
            {t('If you notice a sign-in or activity you do not recognise, sign out of the other devices, change your password and let LOOP support know.')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 130,
    gap: 12,
  },
  hero: {
    paddingVertical: 8,
    gap: 10,
  },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: themeColor0.bgColor(1),
  },
  heroText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 24,
  },
  option: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: themeColor4.bgColor(1),
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.2),
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: themeColor0.bgColor(0.1),
  },
  optionBody: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 15,
  },
  optionDescription: {
    fontSize: 12,
    color: themeColor10.bgColor(0.55),
  },
  tip: {
    gap: 8,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    backgroundColor: themeColor11.bgColor(0.08),
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 22,
  },
});
