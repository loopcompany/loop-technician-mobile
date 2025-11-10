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

export default function PartsExpensesScreen({ navigation }) {
  const [selectedItems, setSelectedItems] = useState([]);

  const softwareItems = [
    'برنامه های نرم افزاری',
    'قطعات سخت افزاری'
  ];

  const hardwareItems = [
    'جمع کل هزینه برنامه های نرم افزاری',
    'جمع کل هزینه قطعات سخت افزاری',
    'اجرت',
    'تخفیف',
    'انعام',
    'قابل پرداخت',
    'مبلغ پرداختی'
  ];

  const toggleItem = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  return (
    <LinearGradient 
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'قطعات / هزینه ها'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('DeliveryReceiptScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'قطعات / هزینه ها'} />

        {/* قطعات / هزینه ها در محل */}
        <View style={styles.localSection}>
          <Text style={[NewStyles.text4, styles.sectionTitle]}>قطعات / هزینه ها در محل</Text>



          {softwareItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <TextInput style={[NewStyles.text4, styles.itemLabel]}>{item} :</TextInput>
              
            </View>
          ))}

          {hardwareItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={[NewStyles.text4, styles.itemLabel]}>{item} :</Text>
              <TextInput
                style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.priceInput]}
                placeholder="ریال"
                placeholderTextColor={themeColor10.bgColor(0.5)}
                keyboardType="numeric"
              />
            </View>
          ))}

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

        {/* خط جداکننده */}
        <View style={styles.separator} />

        {/* قطعات / هزینه ها در لپی */}
        <View style={styles.laptopSection}>
          <Text style={[NewStyles.text4, styles.laptopTitle]}>قطعات / هزینه ها در لوپ</Text>

          {/* توضیحات لپی */}
          <View style={styles.section}>
            <Text style={[NewStyles.text4, styles.label]}>توضیحات لوپ :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.inputLarge]}
              placeholder="توضیحات لوپ را وارد کنید"
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
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 8,
    gap:10
  },
  itemLabel: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    color: '#000',
    marginRight: 10,
  },
  priceInput: {
    width: 100,
    minHeight: 40,
    fontSize: 13,
    textAlign: 'center',
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