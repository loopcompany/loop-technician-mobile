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
import { themeColor0, themeColor10, themeColor2, themeColor8 } from '../../theme/Color';

export default function UserInfoScreen({ navigation }) {
  return (
    <LinearGradient
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders
        title={'اطلاعات کاربر'}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'اطلاعات کاربر'} />

        {/* ملیت */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>ملیت :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="ایرانی"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* شماره ملی */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>شماره ملی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="0054601304"
            placeholderTextColor={themeColor10.bgColor(0.5)}
            keyboardType="numeric"
          />
        </View>

        {/* کد کاربر */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>کد کاربر :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="21146598847"
            placeholderTextColor={themeColor10.bgColor(0.5)}
            keyboardType="numeric"
          />
        </View>

        {/* نام کاربر */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>نام کاربر :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="اکبر احمدی"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* نوع کاربر */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>نوع کاربر :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="سازمانی ویژه"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* نام مدیر */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>نام مدیر :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="سیاوش اسدی"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* نام اپراتور */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>نام اپراتور :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="محمود قدیری"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* آدرس */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>آدرس :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder="تهران، خیابان پیروزی، خیابان ملکی کوچه ستوری، پلاک 12، واحد 2 طبقه اول"
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        {/* شماره موبایل اول */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>شماره موبایل اول :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="09190990269"
            placeholderTextColor={themeColor10.bgColor(0.5)}
            keyboardType="phone-pad"
          />
        </View>

        {/* شماره موبایل اپراتور */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>شماره موبایل اپراتور :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="09190990269"
            placeholderTextColor={themeColor10.bgColor(0.5)}
            keyboardType="phone-pad"
          />
        </View>

        {/* شماره تلفن ثابت */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>شماره تلفن ثابت :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="02166245129"
            placeholderTextColor={themeColor10.bgColor(0.5)}
            keyboardType="phone-pad"
          />
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
  fieldRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
  fieldLabel: {
    flex: 1,
    textAlign: 'right',
    color: '#000',
    marginLeft: 10,
  },
  fieldInput: {
    flex: 1,
    minHeight: 35,
    fontSize: 13,
    backgroundColor: '#fff',
    textAlign: 'right',
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
    minHeight: 80,
    fontSize: 13,
    backgroundColor: '#fff',
    textAlign: 'right',
    textAlignVertical: 'top',
  },
});