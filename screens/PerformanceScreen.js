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
import Footer from './Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor10 } from '../theme/Color';

export default function PerformanceScreen({ navigation }) {
  const [fromDate, setFromDate] = useState('1403/08/22');
  const [toDate, setToDate] = useState('1403/10/22');

  const performanceData = [
    {
      id: 1,
      amount: '3,500,0000',
      date: '1403/05/12',
      time: '16:50',
      customerNumber: '55818244'
    },
    {
      id: 2,
      amount: '7,500,0000',
      date: '1403/05/12',
      time: '16:42',
      customerNumber: '55784332'
    }
  ];

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'عملکرد من'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* فیلتر تاریخ */}
        <View style={styles.dateFilterContainer}>
          <View style={styles.dateInputContainer}>
            <Text style={[NewStyles.text4, styles.dateLabel]}>از تاریخ</Text>
            <TextInput
              style={[NewStyles.textInput, styles.dateInput]}
              value={fromDate}
              onChangeText={setFromDate}
              placeholder="1403/08/22"
              placeholderTextColor={themeColor10.bgColor(0.7)}
            />
          </View>
          
          <View style={styles.dateInputContainer}>
            <Text style={[NewStyles.text4, styles.dateLabel]}>تا تاریخ</Text>
            <TextInput
              style={[NewStyles.textInput, styles.dateInput]}
              value={toDate}
              onChangeText={setToDate}
              placeholder="1403/10/22"
              placeholderTextColor={themeColor10.bgColor(0.7)}
            />
          </View>
        </View>

        {/* جزئیات عملکرد */}
        <View style={styles.performanceContainer}>
          {performanceData.map((item) => (
            <View key={item.id} style={styles.performanceCard}>
              <Text style={[NewStyles.text4, styles.performanceAmount]}>
                {item.amount} ریال
              </Text>
              <Text style={[NewStyles.text4, styles.performanceDate]}>
                {item.date} ساعت {item.time}
              </Text>
              <Text style={[NewStyles.text4, styles.customerNumber]}>
                شماره مشتری: {item.customerNumber}
              </Text>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>▼</Text>
              </View>
            </View>
          ))}
        </View>

        {/* دکمه‌های عملیات */}
        <View style={styles.actionContainer}>
          <View style={styles.actionBox}>
            <Text style={[NewStyles.text4, styles.actionTitle]}>
              توضیحات پنل: عملکرد خوب
            </Text>
            <Text style={[NewStyles.text4, styles.actionSubtitle]}>
              امتیاز مشتری، خوب
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={[NewStyles.text4, styles.actionButtonText]}>
                بستن
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1 
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  dateFilterContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dateInputContainer: {
    alignItems: 'center',
  },
  dateLabel: {
    color: '#fff',
    backgroundColor: '#64B5F6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 5,
    textAlign: 'center',
    minWidth: 60,
  },
  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
    minWidth: 120,
  },
  performanceContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  performanceCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
  },
  performanceAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  performanceDate: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  customerNumber: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  arrow: {
    backgroundColor: '#FFEB3B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  actionBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 30,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});