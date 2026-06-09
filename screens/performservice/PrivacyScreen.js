import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenHeaders from '../../components/ScreenHeaders'; 
import { themeColor0, themeColor1, themeColor3, themeColor10, themeColor2, themeColor8 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from '../../styles/NewStyles';

export default function PrivacyScreen({ navigation }) { 
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const privacyOptions = [
    {
      id: 1,
      title: t('Personal Information'),
      screen: 'PersonalInfoScreen'
    },
    {
      id: 2,
      title: t('Vehicle Information'),
      screen: 'VehicleInfoScreen'
    },
    {
      id: 3,
      title: t('Financial information'),
      screen: 'FinancialInfoScreen'
    }
  ];

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <CustomStatusBar />
      <ScreenHeaders
        title={t('Privacy')}
      />
      <ScrollView contentContainerStyle={styles.container}>

        {/* لیست گزینه‌های حریم خصوصی */}
        {privacyOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionButton, { backgroundColor: themeColor0.bgColor(0.8) }]}
            onPress={() => navigation.navigate(option.screen)}
          >
            <Text style={styles.optionText}>{option.title}</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 20,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  optionText: {
    ...NewStyles.title4,
    fontSize: 16,
  },
});
