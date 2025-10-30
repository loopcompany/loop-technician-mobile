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

export default function LaptopDeliveryScreen({ navigation }) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isProcessConfirmed, setIsProcessConfirmed] = useState(false);

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'ادامه تحویل لپ تاپ بصورت امانت'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('NextScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'ادامه تحویل لپ تاپ بصورت امانت'} />

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

        {/* کد لپتویل لپ تاپ */}
        <View style={styles.section}>
          <Text style={[NewStyles.text4, styles.label]}>کد لپتویل لپ تاپ :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
            placeholder="کد لپتویل لپ تاپ را وارد کنید"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* زمان / ساعت / تاریخ */}
        <View style={styles.section}>
          <Text style={[NewStyles.text4, styles.label]}>زمان / ساعت / تاریخ :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
            placeholder="زمان / ساعت / تاریخ را وارد کنید"
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

        {/* چک باکس تایید کاربر */}
        <View style={styles.checkboxContainer}>
          <CheckBox
            checked={isConfirmed}
            onPress={() => setIsConfirmed(!isConfirmed)}
          />
          <Text style={[NewStyles.text10, styles.checkboxText]}>امضا تایید کاربر</Text>
        </View>

        {/* خط جداکننده */}
        <View style={styles.separator} />

        {/* تحویل محصول به لویی */}
        <View style={styles.deliverySection}>
          <Text style={[NewStyles.text4, styles.deliveryTitle]}>تحویل محصول به لویی</Text>

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

          {/* زمان / ساعت / تاریخ */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>زمان / ساعت / تاریخ :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="زمان / ساعت / تاریخ را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
            />
          </View>

          {/* کد اپیل امول / محصول */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>کد اپیل امول / محصول :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
              placeholder="کد اپیل امول / محصول را وارد کنید"
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

          {/* چک باکس امضا تایید پرسنل / تکنسین */}
          <View style={styles.checkboxContainer}>
            <CheckBox
              checked={isProcessConfirmed}
              onPress={() => setIsProcessConfirmed(!isProcessConfirmed)}
            />
            <Text style={[NewStyles.text10, styles.checkboxText]}>امضا تایید پرسنل / تکنسین</Text>
          </View>
        </View>

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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
  },
  checkboxText: {
    marginLeft: 10,
    color: '#fff',
  },
  separator: {
    height: 2,
    backgroundColor: '#2196F3',
    marginVertical: 20,
  },
  deliverySection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  deliveryTitle: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    marginBottom: 15,
  },
});