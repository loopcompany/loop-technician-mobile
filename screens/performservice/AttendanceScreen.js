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

export default function AttendanceScreen({ navigation }) {
  const [selectedOption, setSelectedOption] = useState('');

  const attendanceOptions = [
    'اعلام حضور / در حال انجام',
    'اعلام حضور / لغو از سوی کاربر',
    'اعلام حضور / لغو از سوی تکنسین',
    'اعلام حضور / نادرست بودن آدرس',
    'اعلام حضور / موکول به زمان دیگر از سوی کاربر',
    'اعلام حضور / عدم پاسخ تماس و پیام از سوی کاربر     ',
    'اعلام حضور/عدم حضورکاربر - حضور خانواده یا آشنایان',
    'اعلام حضور / نادرست بودن مشخصات کاربر',
    'عدم حضور از سوی تکنسین'
  ];

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={' انجام سرویس '} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('LaptopDispatchScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'مراجعه / حضور'} />

        {/* لیست گزینه‌های حضور */}
        {attendanceOptions.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <Text style={[NewStyles.text4, styles.optionText]}>{option}</Text>
          </View>
        ))}

        {/* توضیحات */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>توضیحات :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
          />
        </View>

        {/* بخش انزام لویی مراد چاپگر */}
        <View style={styles.specialSection}>
          <Text style={[NewStyles.text4, styles.specialTitle]}>اعزام  فوری همراه / جایگزین تکنسین / قطعات</Text>
          
          <View style={styles.fullWidthField}>
            <Text style={[NewStyles.text4, styles.fullWidthLabel]}>توضیحات تکنسین ( ضروری ) :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
              placeholder=""
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
  optionRow: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  optionText: {
    textAlign: 'right',
    color: '#000',
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
  specialSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  specialTitle: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    marginBottom: 10,
  },
});