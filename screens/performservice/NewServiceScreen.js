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

export default function NewServiceScreen({ navigation }) {
  return (
    <LinearGradient 
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'  انجام سرویس'} 
        onPressLeft={() => navigation.goBack('')} 
        onPressRight={() => navigation.navigate('NextScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'سرویس جدید'} />

        {/* کارت سرویس 2 */}
        <View style={styles.serviceCard}>
          <View style={styles.cardNumber}>
            <Text style={[NewStyles.text4, styles.numberText]}>2</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardRow}>
              <Text style={[NewStyles.text10, styles.cardLabel]}>شماره سرویس :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>59999437</Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={[NewStyles.text10, styles.cardLabel]}>نوع کاربر :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>سازمانی ویژه</Text>
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
              <Text style={[NewStyles.text10, styles.cardLabel]}>دسته بندی :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>نرم افزار</Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={[NewStyles.text10, styles.cardLabel]}>ثبت سفارش :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>اپلیکیشن</Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={[NewStyles.text10, styles.cardLabel]}>زمان مراجعه :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>12 الی 14 ساعت 1403/09/22</Text>
            </View>
          </View>
        </View>

        {/* کارت سرویس 1 */}
        <View style={styles.serviceCard}>
          <View style={styles.cardNumber}>
            <Text style={[NewStyles.text4, styles.numberText]}>1</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardRow}>
              <Text style={[NewStyles.text10, styles.cardLabel]}>شماره سرویس :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>59999437</Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={[NewStyles.text10, styles.cardLabel]}>نوع کاربر :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>سازمانی ویژه</Text>
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
              <Text style={[NewStyles.text10, styles.cardLabel]}>دسته بندی :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>نرم افزار</Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={[NewStyles.text10, styles.cardLabel]}>ثبت سفارش :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>اپلیکیشن</Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={[NewStyles.text10, styles.cardLabel]}>زمان درخواست اعزام :</Text>
              <Text style={[NewStyles.text10, styles.cardValue]}>12 الی 14 ساعت</Text>
            </View>
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
  serviceCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardNumber: {
    backgroundColor: '#FFEB3B',
    borderRadius: 20,
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  numberText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cardContent: {
    flex: 1,
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
    textAlign: 'left',
    color: '#000',
  },
});