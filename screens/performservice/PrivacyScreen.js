import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10, themeColor2, themeColor8 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

export default function PrivacyScreen({ navigation }) {

  const privacyOptions = [
    {
      id: 1,
      title: 'مشخصات فردی',
      screen: 'PersonalInfoScreen'
    },
    {
      id: 2,
      title: 'مشخصات وسیله نقلیه',
      screen: 'VehicleInfoScreen'
    },
    {
      id: 3,
      title: 'اطلاعات مالی',
      screen: 'FinancialInfoScreen'
    }
  ];

  return (
    <LinearGradient 
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders 
        title={'حریم خصوصی'} 
        onPressLeft={() => navigation.goBack()} 
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
      

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
    ...NewStyles.text4,
    fontSize: 16,
    fontWeight: 'bold',
  },
});