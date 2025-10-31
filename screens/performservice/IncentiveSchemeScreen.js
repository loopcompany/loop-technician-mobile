import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

export default function IncentiveSchemeScreen({ navigation }) {
  const [selectedScheme, setSelectedScheme] = useState(null);

  return (
    <LinearGradient 
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders 
        title={'طرح‌های تشویقی'} 
        onPressLeft={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* دکمه جوایز */}
        <TouchableOpacity style={styles.prizeButton}>
          <Text style={styles.prizeButtonText}>جعبه جوایز</Text>
        </TouchableOpacity>

        {/* باکس توضیحات طرح */}
        <View style={styles.schemeBox}>
          <Text style={styles.schemeTitle}> تکنسین محترم</Text>
          <Text style={styles.schemeDescription}>
عملکرد شما در 3 ماه گذشته بررسی گردید          </Text>
          <Text style={styles.schemeDescription}>
از طرف لوپ هزینه یکسال بیمه شخص ثالث به حساب شما در روز اینده واریز می شود.
          </Text>

        </View>

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
    gap: 25,
  },
  prizeButton: {
    backgroundColor: 'rgba(100, 200, 255, 0.8)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  prizeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  schemeBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  schemeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  schemeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
});