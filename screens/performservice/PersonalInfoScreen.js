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
  Platform,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
import { fetchUser, setUserData } from '../../slices/userSlice';
import { uri as BASE_URL } from '../../services/URL';
import Button from '../../components/Button';

export default function PersonalInfoScreen({ navigation }) {
  const dispatch = useDispatch();
  const userToken = useSelector(state => state.auth.token);
  const user = useSelector(state => state.user);
  const userData = useSelector(state => state.user.data?.data?.technician); 
  const [isLoadingData, setIsLoadingData] = useState(false); 
  const [saving, setSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null); // For newly selected photo

  // State for DatePicker
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [selectedBirthDate, setSelectedBirthDate] = useState('');
  const [showLicenceDatePicker, setShowLicenceDatePicker] = useState(false);
  const [selectedLicenceDate, setSelectedLicenceDate] = useState('');
  const [showCertificateIssueDatePicker, setShowCertificateIssueDatePicker] = useState(false);
  const [selectedCertificateIssueDate, setSelectedCertificateIssueDate] = useState('');

  const [personalData, setPersonalData] = useState({
    name: '',
    birth_date: '',
    telephone: '',
    email: '',
    melicode: '',
    father_name: '',
    issued_from: '',
    serial_number: '',
    marital_status: '',
    education_status: '',
    city: '',
    region: '',
    certificate_number: '',
    licence_date: '',
    certificate_issue_date: '',
    home_address: '',
    home_postal_code: '',
    technician_type: '',
    referral_code: '',
    other_referral_code: ''
  });

  // Load user data from AsyncStorage if not in Redux
  useEffect(() => {
    const loadUserData = async () => {

      

      setPersonalData({
        name: userData.name && userData.family
          ? `${userData.name} ${userData.family}`
          : userData.name || '',
        birth_date: userData.birth_date || '',
        telephone: userData.telephone || userData.phone || '',
        email: userData.email || '',
        melicode: userData.melicode || '',
        father_name: userData.father_name || '',
        issued_from: userData.issued_from || '',
        serial_number: userData.serial_number || '',
        marital_status: userData.marital_status || '',
        education_status: userData.education_status || '',
        city: userData.city || '',
        region: userData.region || '',
        certificate_number: userData.certificate_number || '',
        licence_date: userData.licence_date || '',
        certificate_issue_date: userData.certificate_issue_date || '',
        home_address: userData.home_address || '',
        home_postal_code: userData.home_postal_code || '',
        technician_type: userData.technician_type || '',
        referral_code: userData.referral_code || '',
        other_referral_code: userData.other_referral_code || ''
      });


      // Set profile photo URL if available (only if no new photo is selected)
      if (!selectedPhotoUrl) {
        if (userData.profile_photo_path) {
          // User has uploaded photo
          const photoUrl = userData.profile_photo_path.startsWith('http')
            ? userData.profile_photo_path
            : `${BASE_URL}${userData.profile_photo_path}`;
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

  // وقتی modal گواهینامه بسته می‌شود و تاریخ جدید انتخاب شده
  useEffect(() => {
    if (!showLicenceDatePicker && selectedLicenceDate && selectedLicenceDate != personalData.licence_date) {
      updateField('licence_date', selectedLicenceDate);
    }
  }, [showLicenceDatePicker, selectedLicenceDate]);

  // وقتی modal تاریخ صدور گواهینامه بسته می‌شود
  useEffect(() => {
    if (!showCertificateIssueDatePicker && selectedCertificateIssueDate && selectedCertificateIssueDate !== personalData.certificate_issue_date) {
      updateField('certificate_issue_date', selectedCertificateIssueDate);
    }
  }, [showCertificateIssueDatePicker, selectedCertificateIssueDate]);

  const updateField = (field, value) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🌐 Web-specific image picker function
  const pickImageWeb = () => {
    return new Promise((resolve, reject) => {
      try {
        // Create hidden input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';

        input.onchange = (e) => {
          const file = e.target.files[0];

          if (!file) {
            resolve({ canceled: true });
            return;
          }

          // Validate file type
          if (!file.type.startsWith('image/')) {
            showAlert('خطا', 'لطفاً فقط فایل تصویری انتخاب کنید');
            resolve({ canceled: true });
            return;
          }

          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            showAlert('خطا', 'حجم تصویر نباید بیشتر از 5 مگابایت باشد');
            resolve({ canceled: true });
            return;
          }

          // Read file as base64 for preview and upload
          const reader = new FileReader();

          reader.onload = (event) => {
            resolve({
              canceled: false,
              uri: event.target.result, // base64 data URL
              name: file.name,
              type: file.type,
              size: file.size,
              file: file, // Keep original file object for upload
            });
          };

          reader.onerror = (error) => {
            reject(new Error('خطا در خواندن فایل تصویر'));
          };

          reader.readAsDataURL(file);

          // Cleanup
          document.body.removeChild(input);
        };

        input.oncancel = () => {
          resolve({ canceled: true });
          document.body.removeChild(input);
        };

        // Trigger file picker
        document.body.appendChild(input);
        input.click();

      } catch (error) {
        reject(error);
      }
    });
  };

  // Pick profile photo (cross-platform)
  const pickImage = async () => {
    try {
      let result;

      // 🌐 Platform-specific image picker
      if (Platform.OS === 'web') {
        console.log('🌐 استفاده از انتخابگر تصویر Web');
        result = await pickImageWeb();
      } else {
        console.log('📱 استفاده از ImagePicker Native');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert('خطا', 'دسترسی به گالری مورد نیاز است');
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      console.log('📸 نتیجه انتخاب تصویر:', JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log('❌ انتخاب تصویر لغو شد');
        return;
      }

      // Extract image info based on platform
      let imageInfo;
      if (Platform.OS === 'web') {
        imageInfo = {
          uri: result.uri,
          name: result.name || 'profile.jpg',
          type: result.type || 'image/jpeg',
          size: result.size,
          file: result.file, // Keep original file for web upload
        };
      } else {
        const asset = result.assets[0];
        imageInfo = {
          uri: asset.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        };
      }

      console.log('✅ تصویر انتخاب شد:', imageInfo);

      setProfilePhoto(imageInfo);
      // Set the selected photo URL for preview (won't be overwritten by useEffect)
      setSelectedPhotoUrl(imageInfo.uri);

      showAlert('موفق', 'عکس پروفایل انتخاب شد');
    } catch (error) {
      console.log('❌ خطا در انتخاب عکس:', error);
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

  // محاسبه تاریخ امروز به صورت شمسی
  const getTodayDate = () => {
    return getFormatedDate(new Date(), 'jYYYY/jMM/jDD');
  };

  // محاسبه تاریخ 10 سال آینده برای گواهینامه
  const getTenYearsLater = () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    return getFormatedDate(futureDate, 'jYYYY/jMM/jDD');
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

    if (personalData.melicode && personalData.melicode.length !== 10) {
      showAlert('خطا', 'کد ملی باید 10 رقم باشد');
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
          
          // Merge backend response with local changes
          const backenduserData = result.data.technician || {};
          const updateduserData = {
            ...userData,
            ...personalData,
            ...backenduserData
          };

          // Check if server returned photo (profile_photo_path or profile_photo_url)
          const photoPath = result.data?.technician?.profile_photo_path;
          const photoUrl = result.data?.technician?.profile_photo_url;

          if (photoPath && photoPath !== null) {
            console.log('✅ سرور profile_photo_path را برگرداند:', photoPath);
            updateduserData.profile_photo_path = photoPath;

            // Check if it's a full URL or relative path
            const fullPhotoUrl = photoPath.startsWith('http')
              ? photoPath
              : `${BASE_URL}${photoPath}`;

            setProfilePhotoUrl(fullPhotoUrl);
            setSelectedPhotoUrl(null);
          } else if (photoUrl && photoUrl !== null) {
            console.log('✅ سرور profile_photo_url را برگرداند:', photoUrl);
            updateduserData.profile_photo_path = photoUrl;

            const fullPhotoUrl = photoUrl.startsWith('http')
              ? photoUrl
              : `${BASE_URL}${photoUrl}`;

            setProfilePhotoUrl(fullPhotoUrl);
            setSelectedPhotoUrl(null);
          } else if (profilePhoto) {
            // Only show alert if user actually selected a photo but it wasn't uploaded
            console.log('❌ Backend هیچ URL عکسی برنگرداند!');
            console.log('⚠️ عکس محلی نگه داشته می‌شود');
            showAlert(
              'هشدار',
              'اطلاعات ذخیره شد ولی عکس آپلود نشد.\n\nلطفاً با تیم Backend تماس بگیرید',
              [{ text: 'متوجه شدم' }]
            );
            return; // Don't update Redux
          } else {
            console.log('ℹ️ هیچ عکسی برای آپلود انتخاب نشده بود');
            // No photo was selected - this is normal, continue with Redux update
          }

          // Keep the same structure as received from API
          const updatedUserData = {
            ...userData,
            technician: updateduserData
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
      console.log('خطا در ذخیره:', error);
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
          />

          <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={user?.loading} onRefresh={()=>{
            dispatch(fetchUser(userToken))
          }} />}>

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
              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>نام و نام خانوادگی</Text>
                <TextInput
                  style={[styles.boxedInput, styles.disabledInput]}
                  value={personalData.name}
                  placeholder="نام و نام خانوادگی (غیرقابل ویرایش)"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={false}
                />
              </View>

              <TouchableOpacity
                style={styles.boxedRow}
                onPress={() => !saving && setShowBirthDatePicker(true)}
                disabled={saving}
              >
                <Text style={styles.fieldKey}>تاریخ تولد</Text>
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
                <Text style={styles.fieldKey}>کد ملی</Text>
                <TextInput
                  style={[styles.boxedInput, styles.disabledInput]}
                  value={personalData.melicode}
                  placeholder="کد ملی : 10 رقم (غیرقابل ویرایش)"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  keyboardType="number-pad"
                  maxLength={10}
                  editable={false}
                />
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>نام پدر</Text>
                <TextInput
                  style={[styles.boxedInput, styles.disabledInput]}
                  value={personalData.father_name}
                  placeholder="نام پدر (غیرقابل ویرایش)"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={false}
                />
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>صادره از</Text>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.issued_from}
                  onChangeText={(value) => updateField('issued_from', value)}
                  placeholder="محل صدور شناسنامه"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>شماره شناسنامه</Text>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.serial_number}
                  onChangeText={(value) => updateField('serial_number', value)}
                  placeholder="شماره شناسنامه"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>وضعیت تاهل</Text>
                <View style={[styles.boxedInput, { paddingVertical: 0 }]}>
                  <Picker
                    selectedValue={personalData.marital_status || 'متأهل'}
                    onValueChange={(value) => updateField('marital_status', value)}
                    style={{ width: '100%' }}
                    enabled={!saving}
                  >
                    <Picker.Item label="متأهل" value="متأهل" />
                    <Picker.Item label="مجرد" value="مجرد" />
                  </Picker>
                </View>
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>وضعیت تحصیلات</Text>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.education_status}
                  onChangeText={(value) => updateField('education_status', value)}
                  placeholder="دیپلم / لیسانس / فوق لیسانس"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>شهر</Text>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.city}
                  onChangeText={(value) => updateField('city', value)}
                  placeholder="شهر محل سکونت"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>منطقه</Text>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.region}
                  onChangeText={(value) => updateField('region', value)}
                  placeholder="منطقه شهر"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>تلفن</Text>
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
                <Text style={styles.fieldKey}>ایمیل</Text>
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
                <Text style={styles.fieldKey}>شماره گواهینامه</Text>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.certificate_number}
                  onChangeText={(value) => updateField('certificate_number', value)}
                  placeholder="شماره گواهینامه"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={!saving}
                />
              </View>

              <TouchableOpacity
                style={styles.boxedRow}
                onPress={() => !saving && setShowLicenceDatePicker(true)}
                disabled={saving}
              >
                <Text style={styles.fieldKey}>تاریخ اعتبار گواهینامه</Text>
                <View style={styles.boxedInput}>
                  <Text style={[
                    styles.dateText,
                    !personalData.licence_date && styles.placeholderText
                  ]}>
                    {personalData.licence_date || 'مدت اعتبار گواهینامه : 1405/05/15'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.boxedRow}
                onPress={() => !saving && setShowCertificateIssueDatePicker(true)}
                disabled={saving}
              >
                <Text style={styles.fieldKey}>تاریخ صدور گواهینامه</Text>
                <View style={styles.boxedInput}>
                  <Text style={[
                    styles.dateText,
                    !personalData.certificate_issue_date && styles.placeholderText
                  ]}>
                    {personalData.certificate_issue_date || 'تاریخ صدور گواهینامه : 1400/05/15'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>آدرس منزل</Text>
                <TextInput
                  style={[styles.boxedInput, { minHeight: 60 , height:'auto'}]}
                  value={personalData.home_address}
                  onChangeText={(value) => updateField('home_address', value)}
                  placeholder="آدرس منزل :"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  multiline
                  maxLength={191}
                  editable={!saving}
                />
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>کد پستی</Text>
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
                <Text style={styles.fieldKey}>نوع پرسنلی</Text>
                <TextInput
                  style={styles.boxedInput}
                  value={personalData.technician_type}
                  onChangeText={(value) => updateField('technician_type', value)}
                  placeholder="نوع پرسنلی"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={!saving}

                />
              </View>

              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>کد پرسنلی</Text>
                <TextInput
                  style={[styles.boxedInput, styles.disabledInput]}
                  value={personalData.referral_code}
                  placeholder="کد پرسنلی (غیرقابل ویرایش)"
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={false}
                />
              </View>

              {personalData.other_referral_code && (
                <View style={styles.boxedRow}>
                  <Text style={styles.fieldKey}>کد پرسنلی معرف</Text>
                  <TextInput
                    style={[styles.boxedInput, styles.disabledInput]}
                    value={personalData.other_referral_code}
                    placeholder="کد معرف دیگران (غیرقابل ویرایش)"
                    placeholderTextColor={themeColor3.bgColor(1)}
                    editable={false}
                  />
                </View>
              )}

              {/* Save Button */}

              <Button title={'ذخیره تغییرات'} onPress={handleSave}
                loading={saving} />
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
        isCurrentDate={selectedBirthDate || personalData.birth_date}
      />

      {/* DatePicker Modal for Licence Date */}
      <DatePickerModal
        datePickerModal={showLicenceDatePicker}
        setDatePickerModal={setShowLicenceDatePicker}
        birthDate={selectedLicenceDate || personalData.licence_date}
        setBirthDate={setSelectedLicenceDate}
        minimumDate={getTodayDate()}
        maximumDate={getTenYearsLater()}
        isCurrentDate={selectedLicenceDate || personalData.licence_date || getTodayDate()}
      />

      {/* DatePicker Modal for Certificate Issue Date */}
      <DatePickerModal
        datePickerModal={showCertificateIssueDatePicker}
        setDatePickerModal={setShowCertificateIssueDatePicker}
        birthDate={selectedCertificateIssueDate || personalData.certificate_issue_date}
        setBirthDate={setSelectedCertificateIssueDate}
        maximumDate={getTodayDate()}
        isCurrentDate={selectedCertificateIssueDate || personalData.certificate_issue_date || getTodayDate()}
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
    ...NewStyles.border10
  },
  boxedInput: {
    ...NewStyles.text,
    color: themeColor10.bgColor(1),
    textAlign: 'right',
    fontSize:14,
    height:40,
    justifyContent:'center'
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
  fieldKey: {
    ...NewStyles.text3,
    fontSize: 12,
    color: themeColor3.bgColor(1),
    flex:1,
  },
});


