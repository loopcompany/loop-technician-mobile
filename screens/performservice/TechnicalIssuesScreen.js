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
import { themeColor0, themeColor10, themeColor2, themeColor8 } from '../../theme/Color';

export default function TechnicalIssuesScreen({ navigation }) {
  return (
    <LinearGradient 
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'ایرادهای فنی'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('PartsExpensesScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'ایرادهای فنی'} />

        {/* ایرادهای فنی در محل */}
        <View style={styles.localSection}>
          <Text style={[NewStyles.text4, styles.sectionTitle]}>ایرادهای فنی در محل</Text>

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

          {/* رفع ایراد */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>رفع ایراد :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="رفع ایراد را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
          </View>
        </View>

        {/* خط جداکننده */}
        <View style={styles.separator} />

        {/* ایرادهای فنی در لپی */}
        <View style={styles.laptopSection}>
          <Text style={[NewStyles.text4, styles.laptopTitle]}>ایرادهای فنی در لوپ</Text>

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

          {/* رفع ایراد */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>رفع ایراد :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="رفع ایراد را وارد کنید"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
            />
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
  localSection: {
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
  inputLarge: {
    minHeight: 80,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  separator: {
    height: 2,
    backgroundColor: '#2196F3',
    marginVertical: 20,
  },
  laptopSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  laptopTitle: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    marginBottom: 15,
  },
});