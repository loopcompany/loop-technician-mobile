import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor3, themeColor4, themeColor7, themeColor8 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import DatePickerModal from '../../components/DatePickerModal';
import { getFormatedDate } from 'react-native-modern-datepicker';
import { updatePersonalInfo } from '../../services/Api';
import { showAlert } from '../../helpers/Common';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData } from '../../slices/userSlice';
import { uri as BASE_URL } from '../../services/URL';
import Button from '../../components/Button';

export default function PersonalInfoScreen({ navigation }) {
  const dispatch = useDispatch();
  const userToken = useSelector(state => state.auth.token);
  const userData = useSelector(state => state.user.data);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [saving, setSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null); // For newly selected photo

  // State for DatePicker
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [selectedBirthDate, setSelectedBirthDate] = useState('');

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

  // Load user data from AsyncStorage if not in Redux
  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔄 PersonalInfoScreen: useEffect اجرا شد');

      // If no data in Redux, try to load from AsyncStorage
      if (!userData) {
        console.log('⚠️ PersonalInfoScreen: userData در Redux خالی است، از AsyncStorage می‌خوانیم...');
        setIsLoadingData(true);
        try {
          const storedData = await AsyncStorage.getItem('userData');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log('✅ PersonalInfoScreen: داده از AsyncStorage خوانده شد:', parsedData.technician?.name);
            dispatch(setUserData(parsedData));
          } else {
            console.log('❌ PersonalInfoScreen: هیچ داده‌ای در AsyncStorage نیست');
          }
        } catch (error) {
          console.error('❌ PersonalInfoScreen: خطا در خواندن از AsyncStorage:', error);
        } finally {
          setIsLoadingData(false);
        }
        return;
      }

      // API returns data in format: { technician: {...}, token_info: {...} }
      const technicianData = userData.technician || userData;

      // Update form with user data (use 'phone' as fallback for 'telephone')
      setPersonalData({
        birth_date: technicianData.birth_date || '',
        telephone: technicianData.telephone || technicianData.phone || '',
        email: technicianData.email || '',
        certificate_number: technicianData.certificate_number || '',
        certificate_expiry_date: technicianData.certificate_expiry_date || '',
        certificate_issue_date: technicianData.certificate_issue_date || '',
        home_address: technicianData.home_address || '',
        home_postal_code: technicianData.home_postal_code || '',
        technician_type: technicianData.technician_type || '',
        other_referral_code: technicianData.other_referral_code || ''
      });

      console.log('✅ فرم با این اطلاعات پر شد:', {
        email: technicianData.email,
        telephone: technicianData.telephone || technicianData.phone || '',
        home_address: technicianData.home_address || ''
      });

      // Set profile photo URL if available (only if no new photo is selected)
      if (!selectedPhotoUrl) {
        if (technicianData.profile_photo_path) {
          // User has uploaded photo
          const photoUrl = technicianData.profile_photo_path.startsWith('http')
            ? technicianData.profile_photo_path
            : `${BASE_URL}${technicianData.profile_photo_path}`;
          setProfilePhotoUrl(photoUrl);
        } else {
          // No photo - will show default icon
          setProfilePhotoUrl(null);
        }
      }
    };

    loadUserData();
  }, [userData, dispatch]);

  // وقتی modal بسته می‌شود و تاریخ جدید انتخاب شده، به personalData اضافه کن
  useEffect(() => {
    if (!showBirthDatePicker && selectedBirthDate && selectedBirthDate !== personalData.birth_date) {
      updateField('birth_date', selectedBirthDate);
    }
  }, [showBirthDatePicker, selectedBirthDate]);

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
        showAlert('خطا', 'دسترسی به گالری مورد نیاز است');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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
        // Set the selected photo URL for preview (won't be overwritten by useEffect)
        setSelectedPhotoUrl(asset.uri);

        showAlert('موفق', 'عکس انتخاب شد');
      }
    } catch (error) {
      console.error('خطا در انتخاب عکس:', error);
      showAlert('خطا', 'مشکلی در انتخاب عکس پیش آمد');
    }
  };

  // محاسبه حداکثر تاریخ (18 سال پیش از امروز به شمسی)
  const getMaxBirthDate = () => {
    const today = new Date();
    // 18 سال پیش
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    // تبدیل به فرمت شمسی
    return getFormatedDate(maxDate, 'jYYYY/jMM/jDD');
  };

  // Handler for birth date selection
  const handleBirthDateConfirm = () => {
    if (selectedBirthDate) {
      updateField('birth_date', selectedBirthDate);
    }
    setShowBirthDatePicker(false);
  };

  // Save personal info
  const handleSave = async () => {
    // Validation
    if (personalData.email && !personalData.email.includes('@')) {
      showAlert('خطا', 'لطفاً ایمیل معتبر وارد کنید');
      return;
    }

    if (personalData.home_postal_code && personalData.home_postal_code.length !== 10) {
      showAlert('خطا', 'کد پستی باید 10 رقم باشد');
      return;
    }

    setSaving(true);
    try {
      const result = await updatePersonalInfo(personalData, profilePhoto);

      if (result.success) {
        console.log('✅ نتیجه دریافتی از API:', JSON.stringify(result, null, 2));

        showAlert('موفق', 'اطلاعات شخصی با موفقیت به‌روزرسانی شد');

        // Update Redux with new user data
        if (result.data) {
          console.log('💾 به‌روزرسانی Redux با اطلاعات جدید');
          console.log('🔍 result.data:', JSON.stringify(result.data, null, 2));

          // Preserve the original structure (technician and token_info)
          const technicianData = userData.technician || userData;
          const updatedTechnicianData = { ...technicianData, ...personalData };

          // Check if server returned photo (profile_photo_path or profile_photo_url)
          const photoPath = result.data?.technician?.profile_photo_path;
          const photoUrl = result.data?.technician?.profile_photo_url;

          if (photoPath && photoPath !== null) {
            console.log('✅ سرور profile_photo_path را برگرداند:', photoPath);
            updatedTechnicianData.profile_photo_path = photoPath;

            // Check if it's a full URL or relative path
            const fullPhotoUrl = photoPath.startsWith('http')
              ? photoPath
              : `${BASE_URL}${photoPath}`;

            setProfilePhotoUrl(fullPhotoUrl);
            setSelectedPhotoUrl(null);
          } else if (photoUrl && photoUrl !== null) {
            console.log('✅ سرور profile_photo_url را برگرداند:', photoUrl);
            updatedTechnicianData.profile_photo_path = photoUrl;

            const fullPhotoUrl = photoUrl.startsWith('http')
              ? photoUrl
              : `${BASE_URL}${photoUrl}`;

            setProfilePhotoUrl(fullPhotoUrl);
            setSelectedPhotoUrl(null);
          } else {
            console.log('❌ Backend هیچ URL عکسی برنگرداند!');
            console.log('⚠️ عکس محلی نگه داشته می‌شود');
            // Keep the selected photo URL - don't clear it
            // Don't update Redux to keep showing local photo
            showAlert(
              'هشدار',
              'اطلاعات ذخیره شد ولی عکس آپلود نشد.\n\nلطفاً با تیم Backend تماس بگیرید:\n- Backend باید profile_photo_path یا profile_photo_url را با مقدار واقعی در response برگرداند',
              [{ text: 'متوجه شدم' }]
            );
            return; // Don't update Redux
          }

          // Keep the same structure as received from API
          const updatedUserData = {
            ...userData,
            technician: updatedTechnicianData
          };

          // Update Redux
          dispatch(setUserData(updatedUserData));

          // ⭐ IMPORTANT: Update AsyncStorage as well!
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
          console.log('✅ AsyncStorage هم به‌روز شد');
        }

        // Clear profile photo file object
        setProfilePhoto(null);
      } else {
        showAlert('خطا', result.message || 'مشکلی در به‌روزرسانی پیش آمد');
      }
    } catch (error) {
      console.error('خطا در ذخیره:', error);
      showAlert('خطا', 'مشکلی در ارتباط با سرور پیش آمد');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <LinearGradient
          colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
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

            {/* account/name area with avatar */}
            <View style={styles.accountBox}>
              <View style={styles.accountText}>
                <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
                  <Text style={styles.changePhotoText}>تغییر عکس پروفایل</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={pickImage}>
                {(selectedPhotoUrl || profilePhotoUrl) ? (
                  <Image
                    source={{ uri: selectedPhotoUrl || profilePhotoUrl }}
                    style={styles.avatar}
                    onError={(error) => {
                      console.log('❌ خطا در بارگذاری عکس:', error.nativeEvent?.error);
                      setSelectedPhotoUrl(null);
                      setProfilePhotoUrl(null);
                    }}
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>📷</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* form fields as boxed rows */}
            <View style={styles.formContainer}>
              <TouchableOpacity
                style={styles.boxedRow}
                onPress={() => !saving && setShowBirthDatePicker(true)}
                disabled={saving}
              >
                <View style={styles.boxedInput}>
                  <Text style={[
                    styles.dateText,
                    !personalData.birth_date && styles.placeholderText
                  ]}>
                    {personalData.birth_date || 'متولد : روز / ماه / سال (مثال: 1370/05/15)'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.boxedRow}>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.telephone}
                  onChangeText={(value) => updateField('telephone', value)}
                  placeholder="شماره تلفن ثابت : 02112345678"
                  placeholderTextColor={themeColor3.bgColor(1)}
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
                  placeholderTextColor={themeColor3.bgColor(1)}
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
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.certificate_expiry_date}
                  onChangeText={(value) => updateField('certificate_expiry_date', value)}
                  placeholder="مدت اعتبار گواهینامه : 1405/05/15"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.certificate_issue_date}
                  onChangeText={(value) => updateField('certificate_issue_date', value)}
                  placeholder="تاریخ صدور گواهینامه : 1400/05/15"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <TextInput
                  style={[styles.boxedInput, { minHeight: 60 }]}
                  value={personalData.home_address}
                  onChangeText={(value) => updateField('home_address', value)}
                  placeholder="آدرس منزل :"
                  placeholderTextColor={themeColor3.bgColor(1)}
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
                  placeholderTextColor={themeColor3.bgColor(1)}
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
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <TextInput
                  style={[styles.boxedInput, styles.disabledInput]}
                  value={personalData.other_referral_code}
                  placeholder="کد معرف (غیرقابل ویرایش)"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={false}
                />
              </View>

              {/* Save Button */}
              
              <Button title={'ذخیره تغییرات'} onPress={handleSave}
                loading={saving}/>
            </View>

          </ScrollView>


        </LinearGradient>
      </KeyboardAvoidingView>

      {/* DatePicker Modal for Birth Date */}
      <DatePickerModal
        datePickerModal={showBirthDatePicker}
        setDatePickerModal={setShowBirthDatePicker}
        birthDate={selectedBirthDate || personalData.birth_date}
        setBirthDate={setSelectedBirthDate}
        maximumDate={getMaxBirthDate()}
        isCurrentDate={getMaxBirthDate()}
      />
    </SafeAreaView>
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
    backgroundColor: themeColor0.bgColor(0.8),
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bigHeaderText: {
    ...NewStyles.title4,
    fontSize: 20,
  },
  triangleContainer: {
    marginTop: 6,
    alignItems: 'center',
  },
  triangleText: {
    color: themeColor1.bgColor(1),
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
    color: themeColor10.bgColor(1),
  },
  accountNumber: {
    fontSize: 14,
    color: themeColor8.bgColor(1),
    fontWeight: '700',
    marginTop: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: themeColor4.bgColor(1),
    borderWidth: 1,
    borderColor: themeColor3.bgColor(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 30,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: themeColor0.bgColor(0.5),
    borderRadius: 8,
  },
  changePhotoText: {
    ...NewStyles.title4,
    color: themeColor4.bgColor(1),
    fontSize: 14,
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  boxedRow: {
    borderWidth: 1,
    borderColor: themeColor3.bgColor(1),
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 6,
    marginVertical: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  boxedInput: {
    ...NewStyles.text,
    fontSize: 16,
    color: themeColor10.bgColor(1),
    textAlign: 'right',
  },
  disabledInput: {
    backgroundColor: themeColor4.bgColor(1),
    color: themeColor3.bgColor(1),
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: themeColor4.bgColor(1),
  },
  saveButton: {
    backgroundColor: themeColor7.bgColor(1),
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveButtonDisabled: {
    backgroundColor: themeColor3.bgColor(1),
  },
  saveButtonText: {
    color: themeColor4.bgColor(1),
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    ...NewStyles.text,
    fontSize: 16,
    textAlign: 'right',
  },
  placeholderText: {
    color: themeColor3.bgColor(1),
  },
});


