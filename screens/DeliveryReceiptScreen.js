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

export default function DeliveryReceiptScreen({ navigation }) {
  const [expandedSections, setExpandedSections] = useState({});

  const deliveryFields = [
    'نام و نام خانوادگی',
    'کد پرسنلی',
    'کد لپیل اموال',
    'نام محصول',
    'شماره سریال محصول',
    'لوازم همراه',
    'ساعت دریافت',
    'تاریخ دریافت',
    'ایرادات',
    'توضیحات'
  ];

  const deliveryToUserFields = [
    'نام و نام خانوادگی',
    'کد پرسنلی',
    'کد لپیل اموال',
    'نام محصول',
    'شماره سریال محصول',
    'لوازم همراه',
    'ساعت تحویل',
    'تاریخ تحویل',
    'ایرادات',
    'توضیحات',
    'مبلغ قابل پرداخت',
    'پرداخت شده از طریق',
    'تسویه / مانده'
  ];

  const peakFields = [
    'کد لپیل اموال',
    'ساعت دریافت',
    'تاریخ دریافت', 
    'توضیحات'
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderFieldInputs = (fields, sectionType) => (
    <View style={styles.fieldsContainer}>
      {fields.map((field, index) => (
        <View key={index} style={styles.fieldContainer}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>{field}:</Text>
          <TextInput
            style={[NewStyles.textInput, styles.fieldInput]}
            placeholder={`${field} را وارد کنید`}
            placeholderTextColor={themeColor10.bgColor(0.7)}
            multiline={field.includes('توضیحات')}
          />
        </View>
      ))}
      {sectionType === 'deliveryToUser' && (
        <View style={styles.signatureContainer}>
          <Text style={[NewStyles.text4, styles.signatureLabel]}>امضا تایید کاربر</Text>
          <View style={styles.signatureBox}></View>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'دریافت / تحویل'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.deliveryContainer}>
          
          {/* دریافت از لوپ */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionButton}
              onPress={() => toggleSection('receiveFromLoop')}
            >
              <Text style={[NewStyles.text4, styles.sectionButtonText]}>
                دریافت از لوپ
              </Text>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>
                  {expandedSections['receiveFromLoop'] ? '▲' : '▼'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {expandedSections['receiveFromLoop'] && renderFieldInputs(deliveryFields, 'receive')}
          </View>

          {/* تحویل به لوپ */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionButton}
              onPress={() => toggleSection('deliverToLoop')}
            >
              <Text style={[NewStyles.text4, styles.sectionButtonText]}>
                تحویل به لوپ
              </Text>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>
                  {expandedSections['deliverToLoop'] ? '▲' : '▼'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {expandedSections['deliverToLoop'] && renderFieldInputs(deliveryFields, 'deliver')}
          </View>

          {/* دریافت از پیک */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionButton}
              onPress={() => toggleSection('receiveFromPeak')}
            >
              <Text style={[NewStyles.text4, styles.sectionButtonText]}>
                دریافت از پیک
              </Text>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>
                  {expandedSections['receiveFromPeak'] ? '▲' : '▼'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {expandedSections['receiveFromPeak'] && renderFieldInputs(peakFields, 'peakReceive')}
          </View>

          {/* تحویل به پیک */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionButton}
              onPress={() => toggleSection('deliverToPeak')}
            >
              <Text style={[NewStyles.text4, styles.sectionButtonText]}>
                تحویل به پیک
              </Text>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>
                  {expandedSections['deliverToPeak'] ? '▲' : '▼'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {expandedSections['deliverToPeak'] && renderFieldInputs(peakFields, 'peakDeliver')}
          </View>

          {/* تحویل به کاربر */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionButton}
              onPress={() => toggleSection('deliverToUser')}
            >
              <Text style={[NewStyles.text4, styles.sectionButtonText]}>
                تحویل به کاربر
              </Text>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>
                  {expandedSections['deliverToUser'] ? '▲' : '▼'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {expandedSections['deliverToUser'] && renderFieldInputs(deliveryToUserFields, 'deliveryToUser')}
          </View>

          {/* دریافت از کاربر */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionButton}
              onPress={() => toggleSection('receiveFromUser')}
            >
              <Text style={[NewStyles.text4, styles.sectionButtonText]}>
                دریافت از کاربر
              </Text>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>
                  {expandedSections['receiveFromUser'] ? '▲' : '▼'}
                </Text>
              </View>
            </TouchableOpacity>
            
            {expandedSections['receiveFromUser'] && renderFieldInputs(deliveryToUserFields, 'receiveFromUser')}
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
  deliveryContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  sectionContainer: {
    marginVertical: 8,
  },
  sectionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
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
  fieldsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 15,
    marginTop: 5,
  },
  fieldContainer: {
    marginVertical: 8,
  },
  fieldLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
    color: '#000',
    textAlign: 'right',
    fontSize: 14,
  },
  fieldInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
    textAlignVertical: 'top',
    color: '#000',
    textAlign: 'right',
  },
  signatureContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signatureLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    color: '#000',
    textAlign: 'center',
    fontSize: 14,
  },
  signatureBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    width: 200,
    height: 80,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
});