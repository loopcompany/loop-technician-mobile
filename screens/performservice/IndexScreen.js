import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

const { width } = Dimensions.get('window');

export default function IndexScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // داده‌های نمودار
  const chartData = [
    { label: 'تیر', value: 200, height: 80 },
    { label: 'مرداد', value: 190, height: 76 },
    { label: 'شهریور', value: 60, height: 24 },
    { label: 'مهر', value: 150, height: 60 },
    { label: 'آبان', value: 70, height: 28 },
    { label: 'آذر', value: 170, height: 68 },
  ];

  const maxValue = 200;

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders 
        title={'شاخص'} 
        onPressLeft={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* دکمه گزارش عملکرد */}
        <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
          <Text style={styles.buttonText}>گزارش عملکرد</Text>
        </TouchableOpacity>

        {/* دکمه‌های جستجو */}
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>جستجو بر اساس زمان</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>انتخاب تاریخ :</Text>
        </TouchableOpacity>

        {/* نمودار عملکرد */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>میلیون ریال</Text>
          <Text style={styles.chartSubtitle}>خالص دریافت 165</Text>
          
          <View style={styles.chartWrapper}>
            <View style={styles.yAxis}>
              <Text style={styles.yAxisLabel}>{maxValue}</Text>
              <Text style={styles.yAxisLabel}>{maxValue * 0.75}</Text>
              <Text style={styles.yAxisLabel}>{maxValue * 0.5}</Text>
              <Text style={styles.yAxisLabel}>{maxValue * 0.25}</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>
            
            <View style={styles.chart}>
              <View style={styles.barsContainer}>
                {chartData.map((item, index) => (
                  <View key={index} style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: item.height,
                          backgroundColor: index % 2 === 0 ? '#4CAF50' : '#2196F3'
                        }
                      ]} 
                    />
                    <Text style={styles.barLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
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
  chartContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    height: 120,
  },
  yAxis: {
    height: 100,
    justifyContent: 'space-between',
    marginRight: 10,
    paddingVertical: 5,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666',
  },
  chart: {
    flex: 1,
    height: 100,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 25,
    backgroundColor: '#4CAF50',
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
  },
});