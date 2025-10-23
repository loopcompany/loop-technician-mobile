import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from './Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';

export default function IncentivePlansScreen({ navigation }) {

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'طرح های تشویقی'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.incentiveContainer}>
          
          {/* دکمه جعبه جوایز */}
          <TouchableOpacity style={styles.prizeBoxButton}>
            <Text style={[NewStyles.text4, styles.prizeBoxText]}>
              جعبه جوایز
            </Text>
          </TouchableOpacity>

          {/* متن توضیحات */}
          <View style={styles.descriptionContainer}>
            <Text style={[NewStyles.text10, styles.descriptionTitle]}>
              تعظین شرح
            </Text>
            <Text style={[NewStyles.text10, styles.descriptionText]}>
              عظیو شدام بره کابیل نام رد که قل تخعش پریس آورید
            </Text>
            <Text style={[NewStyles.text10, styles.descriptionText]}>
              از روز لوپی، مر اینار کسال بیتی تطل لنگ پل شدام خود تیتز لمیند تا تو پیر
            </Text>
          </View>

        </View>
      </ScrollView>
      
      <Footer />
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
    flex: 1,
  },
  incentiveContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 20,
    flex: 1,
    alignItems: 'center',
  },
  prizeBoxButton: {
    backgroundColor: '#64B5F6',
    borderRadius: 10,
    padding: 15,
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  prizeBoxText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descriptionContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
  descriptionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  descriptionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
});