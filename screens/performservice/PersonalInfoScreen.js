import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { updatePersonalInfo } from '../../services/Api';
import { useSelector } from 'react-redux';

export default function PersonalInfoScreen({ navigation }) {
  const userToken = useSelector(state => state.auth.token);
  
  const [saving, setSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  
  const [personalData, setPersonalData] = useState({
    birth_date: '',
    telephone: '',
    email: '',
    certificate_number: '',
    certificate_expiry_date: '',
    certificate_issue_date: '',
    home_address: '',
    home_postal_code: '',
    technician_type: '',
    other_referral_code: ''
  });

  // Note: Backend doesn't have GET /technician/profile endpoint yet
  // So we start with empty fields for now

  const updateField = (field, value) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Pick profile photo
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطا', 'دسترسی به گالری مورد نیاز است');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProfilePhoto({
          uri: asset.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
        Alert.alert('موفق', 'عکس انتخاب شد');
      }
    } catch (error) {
      console.error('خطا در انتخاب عکس:', error);
      Alert.alert('خطا', 'مشکلی در انتخاب عکس پیش آمد');
    }
  };

  // Save personal info
  const handleSave = async () => {
    // Validation
    if (personalData.email && !personalData.email.includes('@')) {
      Alert.alert('خطا', 'لطفاً ایمیل معتبر وارد کنید');
      return;
    }

    if (personalData.home_postal_code && personalData.home_postal_code.length !== 10) {
      Alert.alert('خطا', 'کد پستی باید 10 رقم باشد');
      return;
    }

    setSaving(true);
    try {
      const result = await updatePersonalInfo(personalData, profilePhoto);
      
      if (result.success) {
        Alert.alert('موفق', 'اطلاعات شخصی با موفقیت به‌روزرسانی شد');
        if (result.data?.technician?.profile_photo_url) {
          setProfilePhotoUrl(result.data.technician.profile_photo_url);
        }
        setProfilePhoto(null); // Clear selected photo
      } else {
        Alert.alert('خطا', result.message || 'مشکلی در به‌روزرسانی پیش آمد');
      }
    } catch (error) {
      console.error('خطا در ذخیره:', error);
      Alert.alert('خطا', 'مشکلی در ارتباط با سرور پیش آمد');
    } finally {
      setSaving(false);
    }
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
            <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>تغییر عکس پروفایل</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={pickImage}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto.uri }} style={styles.avatar} />
            ) : profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* form fields as boxed rows */}
        <View style={styles.formContainer}>
            <View style={styles.boxedRow}>
              <TextInput
                style={styles.boxedInput}
                value={personalData.birth_date}
                onChangeText={(value) => updateField('birth_date', value)}
                placeholder="متولد : روز / ماه / سال (مثال: 1370/05/15)"
                placeholderTextColor="#999"
                editable={!saving}
              />
            </View>

            <View style={styles.boxedRow}>
              <TextInput
                style={styles.boxedInput}
                value={personalData.telephone}
                onChangeText={(value) => updateField('telephone', value)}
                placeholder="شماره تلفن ثابت : 02112345678"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>

            <View style={styles.boxedRow}>
              <TextInput
                style={styles.boxedInput}
                value={personalData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="آدرس ایمیل :"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
            </View>

            <View style={styles.boxedRow}>
              <TextInput
                style={styles.boxedInput}
                value={personalData.certificate_number}
                onChangeText={(value) => updateField('certificate_number', value)}
                placeholder="شماره گواهینامه :"
                placeholderTextColor="#999"
                editable={!saving}
              />
            </View>

            <View style={styles.boxedRow}>
              <TextInput
                style={styles.boxedInput}
                value={personalData.certificate_expiry_date}
                onChangeText={(value) => updateField('certificate_expiry_date', value)}
                placeholder="مدت اعتبار گواهینامه : 1405/05/15"
                placeholderTextColor="#999"
                editable={!saving}
              />
            </View>

            <View style={styles.boxedRow}>
              <TextInput
                style={styles.boxedInput}
                value={personalData.certificate_issue_date}
                onChangeText={(value) => updateField('certificate_issue_date', value)}
                placeholder="تاریخ صدور گواهینامه : 1400/05/15"
                placeholderTextColor="#999"
                editable={!saving}
              />
            </View>

            <View style={styles.boxedRow}>
              <TextInput
                style={[styles.boxedInput, { minHeight: 60 }]}
                value={personalData.home_address}
                onChangeText={(value) => updateField('home_address', value)}
                placeholder="آدرس منزل :"
                placeholderTextColor="#999"
                multiline
                editable={!saving}
              />
            </View>

            <View style={styles.boxedRow}>
              <TextInput
                style={styles.boxedInput}
                value={personalData.home_postal_code}
                onChangeText={(value) => updateField('home_postal_code', value)}
                placeholder="کد پستی منزل : 10 رقم"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={10}
                editable={!saving}
              />
            </View>

            <View style={styles.boxedRow}>
              <TextInput
                style={styles.boxedInput}
                value={personalData.technician_type}
                onChangeText={(value) => updateField('technician_type', value)}
                placeholder="نوع پرسنلی :"
                placeholderTextColor="#999"
                editable={!saving}
              />
            </View>

            <View style={styles.boxedRow}>
              <TextInput
                style={styles.boxedInput}
                value={personalData.other_referral_code}
                onChangeText={(value) => updateField('other_referral_code', value)}
                placeholder="کد معرف (فقط یک بار قابل تنظیم):"
                placeholderTextColor="#999"
                editable={!saving}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>ذخیره تغییرات</Text>
              )}
            </TouchableOpacity>
          </View>

      </ScrollView>


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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 30,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0D6EFD',
    borderRadius: 8,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
