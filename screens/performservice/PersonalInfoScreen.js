import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

export default function PersonalInfoScreen({ navigation }) {
  const [personalData, setPersonalData] = useState({
    accountNumber: '۰۹۱۹۱۰۹۹۰۳۵۹',
    fullName: '',
    nationalId: '',
    birthDate: '',
    phone: '',
    email: '',
    emergencyContact: '',
    duration: '',
    birthCertificateDate: '',
    address: '',
    postalCode: '',
    staffType: '',
    staffCode: '',
    membershipDate: '',
    consumptionCode: ''
  });

  const updateField = (field, value) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <LinearGradient
      colors={["#7FDBFF", "#0074D9", "#001f3f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title={'حساب کاربری / حریم خصوصی'}
        onPressLeft={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>

        {/* big blue header similar to screenshot */}
        <View style={styles.bigHeader}>
          <Text style={styles.bigHeaderText}>مشخصات فردی</Text>
        </View>
        <View style={styles.triangleContainer}>
          <Text style={styles.triangleText}>▼</Text>
        </View>

        {/* account/name area with avatar */}
        <View style={styles.accountBox}>
          <View style={styles.accountText}>
            <Text style={styles.accountLabel}>اکبر امدادی</Text>
            <Text style={styles.accountNumber}>{personalData.accountNumber}</Text>
          </View>
          <View style={styles.avatar} />
        </View>

        {/* form fields as boxed rows */}
        <View style={styles.formContainer}>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.fullName}
              onChangeText={(value) => updateField('fullName', value)}
              placeholder="نام و نام خانوادگی :"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.nationalId}
              onChangeText={(value) => updateField('nationalId', value)}
              placeholder="شماره ملی :"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.birthDate}
              onChangeText={(value) => updateField('birthDate', value)}
              placeholder="متولد : روز / ماه / سال"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="شماره تلفن ثابت :"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="آدرس ایمیل :"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.emergencyContact}
              onChangeText={(value) => updateField('emergencyContact', value)}
              placeholder="شماره گواهینامه :"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.duration}
              onChangeText={(value) => updateField('duration', value)}
              placeholder="مدت اعتبار گواهینامه :"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.birthCertificateDate}
              onChangeText={(value) => updateField('birthCertificateDate', value)}
              placeholder="تاریخ صدور گواهینامه : روز / ماه / سال"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={[styles.boxedInput, { minHeight: 60 }]}
              value={personalData.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="آدرس منزل :"
              placeholderTextColor="#000"
              multiline
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.postalCode}
              onChangeText={(value) => updateField('postalCode', value)}
              placeholder="کد پستی منزل :"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.staffType}
              onChangeText={(value) => updateField('staffType', value)}
              placeholder="نوع پرسنلی :"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.staffCode}
              onChangeText={(value) => updateField('staffCode', value)}
              placeholder="کد پرسنلی :"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.membershipDate}
              onChangeText={(value) => updateField('membershipDate', value)}
              placeholder="تاریخ شروع فعالیت : روز / ماه / سال"
              placeholderTextColor="#000"
            />
          </View>

          <View style={styles.boxedRow}>
            <TextInput
              style={styles.boxedInput}
              value={personalData.consumptionCode}
              onChangeText={(value) => updateField('consumptionCode', value)}
              placeholder="کد مصرف :"
              placeholderTextColor="#000"
            />
          </View>

        </View>

      </ScrollView>

      <Footer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
  },
  bigHeader: {
    width: '100%',
    backgroundColor: '#0D6EFD',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bigHeaderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  triangleContainer: {
    marginTop: 6,
    alignItems: 'center',
  },
  triangleText: {
    color: '#FFEA00',
    fontSize: 18,
  },
  accountBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  accountText: {
    flexDirection: 'column',
  },
  accountLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  accountNumber: {
    fontSize: 14,
    color: '#2B9AE1',
    fontWeight: '700',
    marginTop: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  formContainer: {
    width: '100%',
  },
  boxedRow: {
    borderWidth: 2,
    borderColor: '#222',
    backgroundColor: '#fff',
    borderRadius: 6,
    marginVertical: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  boxedInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 36,
    textAlign: 'right',
  },
});
