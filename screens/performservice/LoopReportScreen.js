import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

export default function LoopReportScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [technicianInfo, setTechnicianInfo] = useState('');
  const [explanations, setExplanations] = useState('');

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders 
        title={'گزارش لوپ'} 
        onPressLeft={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* دکمه گزارش لوپ آبی */}
        <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
          <Text style={styles.buttonText}>گزارش لوپ</Text>
        </TouchableOpacity>

        {/* دکمه جستجو بر آخر به اول */}
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>جستجو بر آخر به اول</Text>
        </TouchableOpacity>

        {/* دکمه جستجو بر اساس تاریخ */}
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>جستجو بر اساس تاریخ</Text>
        </TouchableOpacity>

        {/* باکس اطلاعات تکنسین */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            تکنسین محترم، سرویس شماره ............ ۵۸۹۹۲۳۶۸
          </Text>
          <Text style={styles.infoText}>
            گزارش ، برخورد نامناسب
          </Text>
          <TouchableOpacity style={styles.smallButton}>
            <Text style={styles.smallButtonText}>توضیحات :</Text>
          </TouchableOpacity>
        </View>

        {/* باکس توضیحات تکنسین */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>توضیحات تکنسین :</Text>
        </View>

        {/* دکمه پاسخ لوپ آبی */}
        <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
          <Text style={styles.buttonText}>پاسخ لوپ</Text>
        </TouchableOpacity>

        {/* دکمه جستجو بر آخر به اول */}
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>جستجو بر آخر به اول</Text>
        </TouchableOpacity>

        {/* دکمه جستجو بر اساس تاریخ */}
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>جستجو بر اساس تاریخ</Text>
        </TouchableOpacity>

        {/* باکس اطلاعات پاسخ */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            تکنسین محترم پاسخ سرویس ............ ۵۸۹۹۲۳۶۸
          </Text>
          <Text style={styles.infoText}>
            طی ۲ روز کار آینده، جهت جلب رضایت کاربر به آدرس مراجعه شود
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
    paddingVertical: 10,
    alignItems: 'center',
    gap: 15,
  },
  mainButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchButton: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 3,
  },
  searchButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
    lineHeight: 20,
  },
  smallButton: {
    backgroundColor: 'rgba(0, 150, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 5,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  explanationBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    minHeight: 80,
   alignItems:'flex-end',
  explanationTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
   
  },
  },
});