import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

export default function FinancialReportScreen({ navigation }) {
  const [selectedReport, setSelectedReport] = useState(null);

  const reportData = [
    {
      id: 1,
      date: '۱۴۰۳/۰۹/۱۲',
      time: '۱۱:۵۳',
      amount: '۳۵,۰۰۰,۰۰۰ ریال',
      status: 'مانده در پنل'
    },
    {
      id: 2,
      date: '۱۴۰۳/۱۰/۱۲',
      time: '۱۵:۴۵',
      amount: '۷,۵۰۰,۰۰۰ ریال',
      status: 'تسویه حساب'
    }
  ];

  const handleConfirmAction = () => {
    Alert.alert(
      'تایید عملیات',
      'چگونه قصد دارید وقت مشاوره از طرف اداره با شما صحبت شود؟',
      [
        { text: 'حضوری', onPress: () => console.log('حضوری selected') },
        { text: 'تلفنی', onPress: () => console.log('تلفنی selected') }
      ]
    );
  };

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders 
        title={'گزارش مالی'} 
        onPressLeft={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* لیست گزارش‌های مالی */}
        {reportData.map((report) => (
          <TouchableOpacity 
            key={report.id}
            style={styles.reportItem}
            onPress={() => setSelectedReport(report.id)}
          >
            <View style={styles.reportHeader}>
              <Text style={styles.reportDate}>
                {report.date} {report.time}
              </Text>
              <Text style={styles.reportAmount}>{report.amount}</Text>
            </View>
            <View style={styles.reportStatus}>
              <Text style={styles.statusText}>{report.status}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* باکس تایید */}
        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>
            چنانچه خطایی در تراکنش شما وجود دارد به پنل گزارش دهید
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.attendanceButton]}
              onPress={handleConfirmAction}
            >
              <Text style={styles.buttonText}>بستن</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.phoneButton]}
              onPress={handleConfirmAction}
            >
              <Text style={styles.buttonText}>خطا</Text>
            </TouchableOpacity>
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
  reportItem: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
  },
  reportHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  reportAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  reportStatus: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusText: {
    fontSize: 13,
    color: '#666',
  },
  confirmationBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmationText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    marginBottom: 15,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  attendanceButton: {
    backgroundColor: '#4CAF50',
  },
  phoneButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});