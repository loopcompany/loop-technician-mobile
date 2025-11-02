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

export default function DeviceStatusScreen({ navigation }) {
  const [selectedOptions, setSelectedOptions] = useState({});

  const toggleOption = (key) => {
    setSelectedOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <LinearGradient 
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'وضعیت محصول'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('CompletionInfoScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'وضعیت محصول'} />

        {/* نوع انتخاب */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>نوع انتخاب : انتخاب سیستماتیک</Text>
        </View>

        {/* نوع محصول */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>نوع محصول :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="لپ تاپ"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* مدل محصول */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>مدل محصول :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="A 595 L"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* تعداد محصول نرم افزار */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>تعداد محصول نرم افزار :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="2 محصول"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* نصب سیستم عامل */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>نصب سیستم عامل :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="ویندوز 10"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* پیش فرض */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>پیش فرض :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        {/* توضیحات نرم افزاری */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>توضیحات نرم افزاری :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        {/* تعداد محصول سخت افزار */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>تعداد محصول سخت افزار :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="2 محصول"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* پیش فرض */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>پیش فرض :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        {/* توضیحات سخت افزاری */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>توضیحات سخت افزاری :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        {/* شبکه چند محصول */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>شبکه چند محصول :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* ایراد ظاهری */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>ایراد ظاهری :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* نصب نرم افزار چاپگر */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>نصب نرم افزار چاپگر :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="دارد"
            placeholderTextColor={themeColor10.bgColor(0.5)}
          />
        </View>

        {/* مارک / مدل چاپگر */}
        <View style={styles.fieldRow}>
          <Text style={[NewStyles.text4, styles.fieldLabel]}>مارک / مدل چاپگر :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fieldInput]}
            placeholder="hp laserjet 1012"
            placeholderTextColor={themeColor10.bgColor(0.5)}
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
    minHeight: 60,
    fontSize: 13,
    backgroundColor: '#fff',
    textAlign: 'right',
    textAlignVertical: 'top',
  },
});