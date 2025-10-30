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
import ScreenTitle from '../../components/ScreenTitle';
import NewStyles from '../../styles/NewStyles';
import { themeColor10 } from '../../theme/Color';

export default function UserHistoryScreen({ navigation }) {
  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={' انجام سرویس'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('AttendanceScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'سابقه کاربر'} />

        {/* کارت سرویس 1 */}
        <View style={styles.serviceCard}>
          <View style={styles.cardHeader}>
            <Text style={[NewStyles.text4, styles.serviceNumber]}>شماره سرویس :</Text>
            <Text style={[NewStyles.text10, styles.serviceValue]}>59999437</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[NewStyles.text10, styles.cardLabel]}>نوع محصول :</Text>
            <Text style={[NewStyles.text10, styles.cardValue]}>لپ تاپ</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[NewStyles.text10, styles.cardLabel]}>مدل محصول :</Text>
            <Text style={[NewStyles.text10, styles.cardValue]}>**********</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[NewStyles.text10, styles.cardLabel]}>ثبت سفارش :</Text>
            <Text style={[NewStyles.text10, styles.cardValue]}>اپلیکیشن</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[NewStyles.text10, styles.cardLabel]}>زمان اتمام سرویس :</Text>
            <Text style={[NewStyles.text10, styles.cardValue]}>15:30 ساعت 1403/09/22</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[NewStyles.text10, styles.cardLabel]}>ایرادهای فنی :</Text>
            <Text style={[NewStyles.text10, styles.cardValue]}>**********</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[NewStyles.text10, styles.cardLabel]}>قطعات :</Text>
            <Text style={[NewStyles.text10, styles.cardValue]}>**********</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={[NewStyles.text10, styles.cardLabel]}>هزینه کلی :</Text>
            <Text style={[NewStyles.text10, styles.cardValue]}>**********</Text>
          </View>

          <TouchableOpacity style={styles.detailsButton}>
            <Text style={NewStyles.text4}>توضیحات</Text>
          </TouchableOpacity>
        </View>

        {/* بخش توضیحات */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>توضیحات کاربر پنل :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>توضیحات تکنسین اعزامی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        {/* دکمه پیستن */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={NewStyles.text4}>بستن</Text>
        </TouchableOpacity>

      </ScrollView>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  fullWidthField: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
  fullWidthLabel: {
    textAlign: 'right',
    color: '#000',
    marginBottom: 5,
  },
  fullWidthInput: {
    minHeight: 60,
    fontSize: 13,
    backgroundColor: '#fff',
    textAlign: 'right',
    textAlignVertical: 'top',
  },
  serviceCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
   
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
    

    
  },
  serviceNumber: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 8,
    marginLeft: 10,
  },
  serviceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: 3,
    paddingVertical: 2,
  },
  cardLabel: {
    flex: 1,
    textAlign: 'right',
    color: '#000',
  },
  cardValue: {
    flex: 1,
    textAlign: 'right',
    color: '#000',
  },
  detailsButton: {
    backgroundColor: '#FFEB3B',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },

  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
});