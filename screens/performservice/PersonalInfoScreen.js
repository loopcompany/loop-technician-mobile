import React, { useState, useEffect, useMemo } from 'react';
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
import { createStyles } from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor3, themeColor4, themeColor7, themeColor8 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import DatePickerModal from '../../components/DatePickerModal';
import { getFormatedDate } from 'react-native-modern-datepicker';
import { updatePersonalInfo } from '../../services/Api';
import { formatDate, showAlert } from '../../helpers/Common';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser, setUserData } from '../../slices/userSlice';
import { uri as BASE_URL } from '../../services/URL';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';

export default function PersonalInfoScreen({ navigation }) {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
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
            showAlert(t('Error'), t('Please select an image file only.'));
            resolve({ canceled: true });
            return;
          }

          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            showAlert(t('Error'), t('Image size must not exceed 5 MB.'));
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
          showAlert(t('Error'), t('Gallery access is required'));
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

      showAlert(t('Success'), t('Profile photo selected.'));
    } catch (error) {
      console.log('❌ خطا در انتخاب عکس:', error);
      showAlert(t('Error'), t('Error selecting image'));
    }
  };

  // محاسبه حداکثر تاریخ (18 سال پیش از امروز به شمسی)
  const getMaxBirthDate = () => {
    const today = new Date();
    // 18 سال پیش
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    // تبدیل به فرمت شمسی
    return getFormatedDate(maxDate, 'YYYY/MM/DD');
  };

  // محاسبه تاریخ امروز به صورت شمسی
  const getTodayDate = () => {
    return getFormatedDate(new Date(), 'YYYY/MM/DD');
  };

  // محاسبه تاریخ 10 سال آینده برای گواهینامه
  const getTenYearsLater = () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    return getFormatedDate(futureDate, 'YYYY/MM/DD');
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
      showAlert(t('Error'), t('Enter a valid email address'));
      return;
    }

    if (personalData.home_postal_code && personalData.home_postal_code.length !== 10) {
      showAlert(t('Error'), t('Postal code must be 10 digits'));
      return;
    }

    if (personalData.melicode && personalData.melicode.length !== 10) {
      showAlert(t('Error'), t('National ID must be 10 digits'));
      return;
    }

    setSaving(true);
    try {
      const result = await updatePersonalInfo(personalData, profilePhoto);

      if (result.success) {
        console.log('✅ نتیجه دریافتی از API:', JSON.stringify(result, null, 2));

        showAlert(t('Success'), t('Personal information updated successfully.'));

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
              t('Warning'),
              t('Information saved but photo was not uploaded.\n\nPlease contact the backend team.'),
              [{ text: t('Got it') }]
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
        showAlert(t('Error'), result.message || t('There was a problem updating.'));
      }
    } catch (error) {
      console.log('خطا در ذخیره:', error);
      showAlert(t('Error'), t('There was an error connecting to the server.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">

        <CustomStatusBar />
        <ScreenHeaders
          title={t('Account / Privacy')}
        />

        <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={user?.loading} onRefresh={() => {
          dispatch(fetchUser(userToken))
        }} />}>

          {/* big blue header similar to screenshot */}
          <View style={styles.bigHeader}>
            <Text style={styles.bigHeaderText}>{t('Personal Information')}</Text>
          </View>

          {/* account/name area with avatar */}
          <View style={styles.accountBox}>
            {/* <View style={styles.accountText}>
                <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
                  <Text style={styles.changePhotoText}>{t('Change profile photo')}</Text>
                </TouchableOpacity>
              </View> */}
            <View>
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
                  <Image source={require('../../assets/technician.png')}
                    style={styles.avatar} />
                </View>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={NewStyles.title}>{personalData.name}</Text>
              <Text style={NewStyles.title}>{userData.phone}</Text>
            </View>

          </View>

          {/* form fields as boxed rows */}
          <View style={styles.formContainer}>
            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('National ID number')}:</Text>
              <TextInput
                style={[styles.boxedInput]}
                value={personalData.melicode}
                placeholder={t('National ID: 10 digits (not editable)')}
                placeholderTextColor={themeColor3.bgColor(1)}
                keyboardType="number-pad"
                maxLength={10}
                verticalAlign={'middle'}
                textAlignVertical={'center'}
                editable={false}
              />
            </View>
            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Birth date (Jalali)')}:</Text>
              <TextInput
                style={[styles.boxedInput]}
                value={personalData.birth_date}
                placeholder={t('Date of birth: day / month / year (e.g., 1370/05/15)')}
                placeholderTextColor={themeColor3.bgColor(1)}
                keyboardType="number-pad"
                maxLength={10}
                verticalAlign={'middle'}
                textAlignVertical={'center'}
                editable={false}
              />

            </View>



            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t("Father's name")}:</Text>
              <TextInput
                style={[styles.boxedInput]}
                value={personalData.father_name}
                placeholder={t("Father's name (not editable)")}
                placeholderTextColor={themeColor3.bgColor(1)}
                editable={false}
              />
            </View>

            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Issued from')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.issued_from}
                onChangeText={(value) => updateField('issued_from', value)}
                placeholder={t('Birth certificate issue place')}
                placeholderTextColor={themeColor3.bgColor(1)}
                editable={false}
              />
            </View>

            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Birth certificate number')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.serial_number}
                onChangeText={(value) => updateField('serial_number', value)}
                placeholder={t('Birth certificate number')}
                placeholderTextColor={themeColor3.bgColor(1)}
                keyboardType="number-pad"
                editable={false}
              />
            </View>

            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Marital status')}:</Text>
              {/* <View style={[styles.boxedInput, { paddingVertical: 0 }]}>
                  <Picker
                    selectedValue={personalData.marital_status || 'متأهل'}
                    onValueChange={(value) => updateField('marital_status', value)}
                    style={{ width: '100%' }}
                    enabled={!saving}
                  >
                    <Picker.Item label={t('Married')} value="متأهل" />
                    <Picker.Item label={t('Single')} value="مجرد" />
                  </Picker>
                </View> */}
              <TextInput
                style={styles.boxedInput}
                value={personalData.marital_status == 'متأهل' ? t('Married') : t('Single')}
                onChangeText={(value) => updateField('serial_number', value)}
                placeholder={t('Birth certificate number')}
                placeholderTextColor={themeColor3.bgColor(1)}
                keyboardType="number-pad"
                editable={false}
              />
            </View>

            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Education level')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.education_status}
                onChangeText={(value) => updateField('education_status', value)}
                placeholder={t("Diploma / Bachelor's / Master's")}
                placeholderTextColor={themeColor3.bgColor(1)}
                editable={false}
              />
            </View>
            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Landline')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.telephone}
                onChangeText={(value) => updateField('telephone', value)}
                placeholder={t('Landline number: 02112345678')}
                placeholderTextColor={themeColor3.bgColor(1)}
                keyboardType="phone-pad"
                editable={false}
              />
            </View>
            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Email')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder={t('Email address:')}
                placeholderTextColor={themeColor3.bgColor(1)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            </View>
            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('License number')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.certificate_number}
                onChangeText={(value) => updateField('certificate_number', value)}
                placeholder={t('License number')}
                placeholderTextColor={themeColor3.bgColor(1)}
                editable={false}
              />
            </View>
            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('License expiry date')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.licence_date}
                onChangeText={(value) => updateField('licence_date', value)}
                placeholder={t('License expiry date')}
                placeholderTextColor={themeColor3.bgColor(1)}
                editable={false}
              />
            </View>
            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('License issue date')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.certificate_issue_date}
                onChangeText={(value) => updateField('certificate_issue_date', value)}
                placeholder={t('License issue date')}
                placeholderTextColor={themeColor3.bgColor(1)}
                editable={false}
              />
            </View>
            <View>
              <View style={[NewStyles.row, { gap: 10 }]}>
                <View style={[styles.boxedRow, { flex: 1 }]}>
                  <Text style={styles.fieldKey}>{t('City')}:</Text>
                  <TextInput
                    style={styles.boxedInput}
                    value={personalData.city}
                    onChangeText={(value) => updateField('city', value)}
                    placeholder={t('City of residence')}
                    placeholderTextColor={themeColor3.bgColor(1)}
                    editable={false}
                  />
                </View>

                <View style={[styles.boxedRow, { flex: 1 }]}>
                  <Text style={styles.fieldKey}>{t('Region')}:</Text>
                  <TextInput
                    style={styles.boxedInput}
                    value={personalData.region}
                    onChangeText={(value) => updateField('region', value)}
                    placeholder={t('City region')}
                    placeholderTextColor={themeColor3.bgColor(1)}
                    keyboardType="number-pad"
                    editable={false}
                  />
                </View>
              </View>
            </View>
            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Postcode')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.home_postal_code}
                onChangeText={(value) => updateField('home_postal_code', value)}
                placeholder={t('Home postal code: 10 digits')}
                placeholderTextColor={themeColor3.bgColor(1)}
                keyboardType="number-pad"
                maxLength={10}
                editable={false}
              />
            </View>


            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Home address')}:</Text>
              <TextInput
                style={[styles.boxedInput, { height: 'auto' }]}
                value={personalData.home_address}
                onChangeText={(value) => updateField('home_address', value)}
                placeholder={t('Home address:')}
                placeholderTextColor={themeColor3.bgColor(1)}
                multiline
                maxLength={191}
                editable={false}
              />
            </View>



            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Personnel type')}:</Text>
              <TextInput
                style={styles.boxedInput}
                value={personalData.technician_type}
                onChangeText={(value) => updateField('technician_type', value)}
                placeholder={t('Personnel type')}
                placeholderTextColor={themeColor3.bgColor(1)}
                editable={false}

              />
            </View>

            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t('Personnel code')}:</Text>
              <TextInput
                style={[styles.boxedInput]}
                value={personalData.referral_code}
                placeholder={t('Personnel code (not editable)')}
                placeholderTextColor={themeColor3.bgColor(1)}
                editable={false}
              />
            </View>
            <View style={styles.boxedRow}>
              <Text style={styles.fieldKey}>{t("Activity start date")}:</Text>
              <TextInput
                style={[styles.boxedInput]}
                value={formatDate(userData.created_at)}
                placeholder={t('"Activity start date"')}
                placeholderTextColor={themeColor3.bgColor(1)}
                editable={false}
              />
            </View>

            {(
              <View style={styles.boxedRow}>
                <Text style={styles.fieldKey}>{t('Referrer personnel code')}:</Text>
                <TextInput
                  style={[styles.boxedInput]}
                  value={personalData.other_referral_code}
                  placeholder={t('Referrer code')}
                  placeholderTextColor={themeColor3.bgColor(1)}
                  editable={false}
                />
              </View>
            )}

            {/* Save Button */}

            <Button title={t('Save changes')} onPress={handleSave}
              loading={saving} />
          </View>

        </ScrollView>
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

const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: {
    flex: 1,
    paddingBottom: 100
  },
  container: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    paddingBottom:120
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
    ...NewStyles.row,
    paddingVertical: 14,
    gap: 10
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
    gap: 10
  },
  boxedRow: {
    borderWidth: 1,
    borderColor: themeColor3.bgColor(1),
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 6,
    paddingHorizontal: 10,
    ...NewStyles.border10,
    ...NewStyles.row,
    gap: 10,

  },
  boxedInput: {
    ...NewStyles.text,
    color: themeColor10.bgColor(1),
    // textAlign: 'right',
    fontSize: 14,
    height: 45,
    justifyContent: 'center',
    flex: 1,
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
    // textAlign: 'right',
  },
  placeholderText: {
    color: themeColor3.bgColor(1),
  },
  fieldKey: {
    ...NewStyles.text10,
    fontSize: 12,
  },
});


