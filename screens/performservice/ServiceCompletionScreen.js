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
import CheckBox from '../../components/CheckBox';

export default function ServiceCompletionScreen({ navigation }) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'تحویل به کاربر / اتمام سرویس جاری'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('NextScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>

        {/* بخش تحویل محصول به کاربر */}
        <View style={styles.deliverySection}>
          <Text style={[NewStyles.text4, styles.sectionTitle]}>تحویل محصول به کاربر</Text>

          {/* نام تحویل گیرنده */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>نام تحویل گیرنده :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="نام تحویل گیرنده را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* شماره ملی */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>شماره ملی :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="شماره ملی را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              keyboardType="numeric"
            />
          </View>

          {/* نام و مشخصات کامل محصول */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>نام و مشخصات کامل محصول :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="نام و مشخصات کامل محصول را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>

          {/* لوازم همراه */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>لوازم همراه :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="لوازم همراه را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* کد لپیل امول */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>کد لپیل امول :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="کد لیبل امول را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* دکمه‌های ساعت */}
          <View style={styles.timeSection}>
            <TouchableOpacity style={styles.timeButton}>
              <Text style={[NewStyles.text4, styles.timeButtonText]}>ساعت تحویل به کاربر</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeButton}>
              <Text style={[NewStyles.text4, styles.timeButtonText]}>تاریخ تحویل به کاربر</Text>
            </TouchableOpacity>
          </View>

          {/* ایراد ظاهری */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>ایراد ظاهری :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="ایراد ظاهری را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* توضیحات کاربر */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>توضیحات کاربر :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="توضیحات کاربر را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>

          {/* چک باکس امضا تایید کاربر */}
          <View style={styles.checkboxContainer}>
            <CheckBox
              checked={isConfirmed}
              onPress={() => setIsConfirmed(!isConfirmed)}
            />
            <Text style={[NewStyles.text10, styles.checkboxText]}>امضا تایید کاربر</Text>
          </View>
        </View>

        {/* بخش اتمام سرویس جاری */}
        <View style={styles.completionSection}>
          <Text style={[NewStyles.text4, styles.completionTitle]}>اتمام سرویس جاری</Text>
          <Text style={[NewStyles.text10, styles.completionSubtitle]}>تکنسین محترم</Text>
          <Text style={[NewStyles.text10, styles.completionSubtitle]}>ضمن تشکر از شما</Text>
          <Text style={[NewStyles.text10, styles.completionNote]}>لطفا نظر خود را از این سرویس  با ما در میان بگذارید.

            
          </Text>

          {/* توضیحات تکنسین */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>توضیحات تکنسین :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="توضیحات تکنسین را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>
        </View>

      </ScrollView>
      <Footer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginVertical: 8,
  },
  deliverySection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
    color: '#000',
  },
  input: {
    minHeight: 40,
    fontSize: 13,
  },
  inputLarge: {
    minHeight: 80,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  timeSection: {
    marginVertical: 10,
  },
  timeButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 12,
    marginVertical: 5,
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
    width: "25%",
    alignSelf:"flex-end",
    marginHorizontal:40
  },
  checkboxText: {
    marginLeft: 10,
    color: '#fff',
  },
  completionSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  completionTitle: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    marginBottom: 15,
    width: '100%',
  },
  completionSubtitle: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 5,
  },
  completionNote: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});