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

export default function CompletionInfoScreen({ navigation }) {
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
        onPressRight={() => navigation.navigate('UserHistoryScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'اطلاعات تکمیلی'} />

        {/* زمان مراجعه */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>زمان مراجعه :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="12 الی 14 ساعت 1403/09/22"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* اطلاعات شخصی در هارد دیسک */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>اطلاعات شخصی در هارد دیسک : توسط تکنسین جا به جا شود</Text>
        </View>

        {/* لپ تاپ بصورت امانت */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>لپ تاپ بصورت امانت :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="می خواهد"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* نوع گارانتی */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>نوع گارانتی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="ندارد"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* هزینه معامله شده */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>هزینه معامله شده :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="4,000,000 ریال"
            placeholderTextColor={themeColor10.bgColor(0.5)}
            keyboardType="numeric"
          />
        </View>

        {/* توضیحات کاربر پژل */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>توضیحات کاربر پنل :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        {/* توضیحات تکنسین داخلی */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>توضیحات تکنسین داخلی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        {/* دکمه‌های پایینی */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#2196F3' }]}
            onPress={() => navigation.navigate('UserLocationScreen')}
          >
            <Text style={NewStyles.text4}>لوکیشن کاربر</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('MessageToUserScreen')}
          >
            <Text style={NewStyles.text4}>پیام به کاربر</Text>
          </TouchableOpacity>
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
    minHeight: 60,
    fontSize: 13,
    backgroundColor: '#fff',
    textAlign: 'right',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
});