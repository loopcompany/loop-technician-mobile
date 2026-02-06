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

import ScreenHeaders from '../../components/ScreenHeaders';
import ScreenTitle from '../../components/ScreenTitle';
import NewStyles from '../../styles/NewStyles';
import { themeColor10 } from '../../theme/Color';
import CheckBox from '../../components/CheckBox';

export default function LaptopDispatchScreen({ navigation }) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <LinearGradient
      colors={['#7FDBFF', '#0074D9', '#001f3f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders
        title={'اعزام به لوپ / لپ تاپ بصورت امانت'}
      />
      <ScrollView contentContainerStyle={styles.container}>

        {/* بخش اعزام به لپی */}
        <View style={styles.dispatchSection}>
          <Text style={[NewStyles.text4, styles.sectionTitle]}>اعزام به لوپ</Text>

          {/* نام تحویل دهنده */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>نام تحویل دهنده :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="نام تحویل دهنده را وارد کنید"
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

          {/* وضعیت محصول / باور / باطری */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>وضعیت محصول / پاور / باطری :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="وضعیت محصول / باور / باطری را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* کد لپیل امول */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>کد لپیل امول :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="کد لیبل اموال را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* دکمه‌های ساعت */}
          <View style={styles.timeSection}>
            <Text style={[NewStyles.text4, styles.label]}>ساعت اعزام به لوپ :</Text>
            <TouchableOpacity style={styles.timeButton}>
              <Text style={[NewStyles.text4, styles.timeButtonText]}>تاریخ اعزام به لوپ</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.timeButton}>
              <Text style={[NewStyles.text4, styles.timeButtonText]}>ساعت تحویل به کاربر</Text>
            </TouchableOpacity> */}
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

          {/* روز / پیش حیسابی کاربری سیستم عامل - ریز یمیش */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>رمز / پین حساب کاربری سیستم عامل -رمز بایوس :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="مز / پین حساب کاربری سیستم عامل -رمز بایوس : را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>

          {/* ایراد های نرم افزاری */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>ایراد های نرم افزاری :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="ایراد های نرم افزاری را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>

          {/* ایراد های سخت افزاری */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>ایراد های سخت افزاری :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="ایراد های سخت افزاری را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>

          {/* توضیحات / خدمات درخواستی کاربر */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>توضیحات / خدمات درخواستی کاربر :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="توضیحات / خدمات درخواستی کاربر را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>

          {/* حداقل هزینه موافقت کاربر */}
          <View style={styles.priceSection}>
            <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input, { width: '85%' }]} placeholder='حداقل هزینه موافقت کاربر :' />
            <Text style={[NewStyles.text10, styles.priceValue]}>ریال</Text>
          </View>

          {/* حداقل هزینه تعمین شده از سوی کاربر */}
          <View style={styles.priceSection}>
            <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input, { width: '85%' }]} placeholder='حداکثر هزینه موافقت کاربر :' />
            <Text style={[NewStyles.text10, styles.priceValue]}>ریال</Text>
          </View>

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

          {/* چک باکس امضا تایید کاربر */}
          <View style={styles.checkboxContainer}>
            <CheckBox
              checked={isConfirmed}
              onPress={() => setIsConfirmed(!isConfirmed)}
            />
            <Text style={[NewStyles.text10, styles.checkboxText]}>امضا تایید کاربر</Text>
          </View>
        </View>

        {/* بخش تحویل لپ تاپ بصورت امانت */}
        <View style={styles.loanSection}>
          <Text style={[NewStyles.text4, styles.loanTitle]}>تحویل لپ تاپ بصورت امانت</Text>

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

          {/* کد کاربر */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>کد کاربر :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="کد کاربر را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* متولد / روز / ماه / سال */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>متولد / روز / ماه / سال :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="متولد / روز / ماه / سال را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* شماره موبایل */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>شماره موبایل :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="شماره موبایل را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              keyboardType="phone-pad"
            />
          </View>

          {/* مارک لپ تاپ */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>مارک لپ تاپ :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="مارک لپ تاپ را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* مدل لپ تاپ */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>مدل لپ تاپ :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="مدل لپ تاپ را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
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

          {/* شماره سریال لپ تاپ */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>شماره سریال لپ تاپ :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="شماره سریال لپ تاپ را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* ایراد ظاهری لپ تاپ */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>ایراد ظاهری لپ تاپ :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="ایراد ظاهری لپ تاپ را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* کد لپایل لپ تاپ */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>کد لیبل لپ تاپ :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="کد لپایل لپ تاپ را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* زمان، ساعت / تاریخ */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>زمان، ساعت / تاریخ :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="زمان، ساعت / تاریخ را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* آدرس */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>آدرس :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="آدرس را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>

          {/* توضیحات */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>توضیحات :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="توضیحات را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>

        </View>

        {/* بخش تحویل محصول به لوپی */}
        <View style={styles.productDeliverySection}>
          <Text style={[NewStyles.text4, styles.sectionTitle]}>تحویل محصول به لوپ</Text>

          {/* نام تحویل گیرنده */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>نام تحویل گیرنده :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="نام تحویل گیرنده را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* کد پرسنل / تکنسین */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>کد پرسنل / تکنسین :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="کد پرسنل / تکنسین را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* زمان : ساعت / تاریخ */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>زمان : ساعت / تاریخ :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="زمان : ساعت / تاریخ را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* کد لیبل اموال / محصول */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>کد لیبل اموال / محصول :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="کد لیبل اموال / محصول را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
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

          {/* چک باکس امضا تایید پزشک / تکنسین */}
          <View style={styles.checkboxContainer}>
            <CheckBox
              checked={isConfirmed}
              onPress={() => setIsConfirmed(!isConfirmed)}
            />
            <Text style={[NewStyles.text4, styles.checkboxLabel]}>امضا تایید پزشک / تکنسین</Text>
          </View>

        </View>

        {/* بخش لپ تاپ امانت - چک باکس نهایی */}


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
  section: {
    marginVertical: 8,
  },
  dispatchSection: {
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
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  priceLabel: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    color: '#000',
  },
  priceValue: {
    marginLeft: 10,
    backgroundColor: '#FFEB3B',
    borderRadius: 5,
    padding: 8,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
    width: "25%",
    alignSelf: "flex-end",
    gap: 10
  },
  checkboxText: {
    marginLeft: 10,
    color: '#fff',
  },
  loanSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  loanTitle: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    marginBottom: 15,
  },
  productDeliverySection: {
    backgroundColor: 'rgba(173, 216, 230, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },
  productDeliveryTitle: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    marginBottom: 15,
  },
});