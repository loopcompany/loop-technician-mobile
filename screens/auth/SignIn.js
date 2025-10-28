import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor4, themeColor10 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  registerTechnician, 
  getExpertises, 
  validateReferralCode,
  testApiConnection,
  testExpertisesEndpoint
} from '../../services/Api';
import { validateTechnicianRegistration } from '../../utils/validation';

export default function SignIn({ navigation }) {
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    melicode: '',
    phone: '', // Main phone for registration and login
    birth_date: '',
    father_name: '',
    issued_from: '',
    serial_number: '',
    marital_status: 'متاهل',
    military_status: 'پایان خدمت',
    education_status: '',
    telephone: '',
    mobile: '',
    email: '',
    id_card_number: '',
    licence_date: '',
    vehicle_type: '',
    home_postal_code: '',
    city: 'تهران',
    region: '5',
    home_address: '',
    other_referral_code: '',
    // Computer skills fields
    idea: '',
    software_skill: '',
    hardware_skill: '',
    software_weakness: '',
    hardware_weakness: '',
    resume: '',
    expertise_ids: []
  });

  // Available expertises from API
  const [expertises, setExpertises] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState('');
  
  // Form states
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState('personal'); // 'personal' or 'computer'
  
  // Test API connection and load expertises
  const testAndLoadExpertises = async () => {
    console.log('🧪 Testing API connection and loading expertises...');
    try {
      // Test connection first
      const testResult = await testApiConnection();
      console.log('Connection test result:', testResult);
      
      if (testResult.success) {
        // If connection test succeeded, use the data it already fetched
        console.log('✅ Using data from connection test');
        setExpertises(testResult.data?.data || []);
      } else {
        // If failed, try direct fetch as fallback
        console.log('⚠️ Connection test failed, trying direct fetch...');
        await loadExpertises();
      }
    } catch (error) {
      console.error('❌ Test and load failed:', error);
      await loadExpertises(); // Fallback to direct load
    }
  };

  // Load expertises when component mounts
  useEffect(() => {
    testAndLoadExpertises();
  }, []);

  // Load available expertises from API
  const loadExpertises = async () => {
    try {
      console.log('📋 Loading expertises...');
      const result = await getExpertises();
      console.log('✅ Expertises result:', result);
      
      if (result.success) {
        setExpertises(result.data);
      } else {
        console.warn('⚠️ Expertises load failed:', result.message);
        Alert.alert('خطا', 'خطا در دریافت لیست تخصص‌ها');
        
        // Set some default expertises for testing
        setExpertises([
          { id: 1, title: 'کاربر سخت افزار' },
          { id: 2, title: 'کاربر نرم افزار' },
          { id: 3, title: 'کاربر شبکه' },
          { id: 4, title: 'کاربر پرینتر / کپی صنعتی' },
          { id: 5, title: 'کاربر جامع' },
          { id: 6, title: 'کاربر هارد دیسک' },
          { id: 7, title: 'کاربر دوربین مداربسته' }
        ]);
      }
    } catch (error) {
      console.error('❌ Error loading expertises:', error);
      Alert.alert('خطا', 'خطا در ارتباط با سرور');
      
      // Set some default expertises for testing
      setExpertises([
        { id: 1, title: 'کاربر سخت افزار' },
        { id: 2, title: 'کاربر نرم افزار' },
        { id: 3, title: 'کاربر شبکه' },
        { id: 4, title: 'کاربر پرینتر / کپی صنعتی' },
        { id: 5, title: 'کاربر جامع' },
        { id: 6, title: 'کاربر هارد دیسک' },
        { id: 7, title: 'کاربر دوربین مداربسته' }
      ]);
    }
  };

  // Validate referral code
  const handleValidateReferralCode = async () => {
    if (!formData.other_referral_code) return;
    
    try {
      const result = await validateReferralCode(formData.other_referral_code);
      if (result.success) {
        Alert.alert('موفقیت', result.data.message);
      } else {
        Alert.alert('خطا', result.message);
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      Alert.alert('خطا', 'خطا در بررسی کد معرف');
    }
  };

  // Form validation
  const validateForm = () => {
    console.log('🔍 Validating form data:', formData);
    const validation = validateTechnicianRegistration(formData);
    
    if (!validation.isValid) {
      console.log('❌ Validation errors:', validation.errors);
      const firstError = Object.values(validation.errors)[0];
      Alert.alert('خطا در اعتبارسنجی', firstError);
      return false;
    }
    
    console.log('✅ Form validation passed');
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      // Create FormData for multipart submission
      const apiFormData = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key === 'expertise_ids' && Array.isArray(formData[key])) {
          // Skip expertise_ids, will be handled separately
          return;
        }
        if (key === 'resume') {
          // Skip resume file, will be handled separately
          return;
        }
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          apiFormData.append(key, formData[key]);
        }
      });
      
      // Use phone as main phone field (API expects 'phone' for login)
      if (formData.mobile) {
        apiFormData.append('phone', formData.mobile);
      }
      
      // Add expertise IDs as array
      if (formData.expertise_ids && formData.expertise_ids.length > 0) {
        formData.expertise_ids.forEach(id => {
          apiFormData.append('expertise_ids[]', id);
        });
      }
      
      console.log('📋 Submitting registration data...');
      
      // Submit registration with resume file
      const result = await registerTechnician(apiFormData, resumeFile);
      
      if (result.success) {
        Alert.alert(
          'موفقیت', 
          result.message,
          [
            {
              text: 'تایید',
              onPress: () => {
                // Navigate to phone verification screen
                navigation.navigate('PhoneVerification', {
                  phone: formData.mobile || formData.phone,
                  technicianId: result.data.technician_id
                });
              }
            }
          ]
        );
      } else {
        if (result.errors) {
          // Show validation errors
          const errorMessages = Object.values(result.errors).join('\n');
          Alert.alert('خطاهای اعتبارسنجی', errorMessages);
        } else {
          Alert.alert('خطا', result.message);
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      Alert.alert('خطا', 'خطا در ثبت نام');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderPersonalInfoPage = () => (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <CustomStatusBar />

      {/* Debug/Test buttons - for development only */}
      <View style={styles.debugContainer}>
        <TouchableOpacity 
          style={[styles.debugButton, { backgroundColor: '#007AFF' }]}
          onPress={testAndLoadExpertises}
        >
          <Text style={styles.debugButtonText}>تست و بارگیری</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.debugButton, { backgroundColor: '#34C759' }]}
          onPress={loadExpertises}
        >
          <Text style={styles.debugButtonText}>بارگیری مستقیم</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <TouchableOpacity style={[styles.headerButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
        <Text style={styles.headerButtonText}>اطلاعات تکمیلی</Text>
      </TouchableOpacity>

      {/* Form Fields */}
      <View style={styles.formContainer}>

        {/* نام و نام خانوادگی */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>نام و نام خانوادگی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder=""
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره تلفن اصلی:</Text>
          <View style={styles.phoneContainer}>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.phoneInput]}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="09XXXXXXXXX"
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
        </View>

        {/* شماره ملی */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره ملی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.melicode}
            onChangeText={(value) => updateField('melicode', value)}
            placeholder=""
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        {/* متولد */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>متولد (تاریخ شمسی) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.birth_date}
            onChangeText={(value) => updateField('birth_date', value)}
            placeholder="1379/08/27"
          />
        </View>

        {/* نام پدر */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>نام پدر :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.father_name}
            onChangeText={(value) => updateField('father_name', value)}
            placeholder=""
          />
        </View>

        {/* صادره از */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>صادره از :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.issued_from}
            onChangeText={(value) => updateField('issued_from', value)}
            placeholder=""
          />
        </View>

        {/* شماره شناسنامه */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره شناسنامه :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.serial_number}
            onChangeText={(value) => updateField('serial_number', value)}
            placeholder=""
          />
        </View>

        {/* وضعیت تأهل */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>وضعیت تأهل :</Text>
          <View style={[NewStyles.textInput, NewStyles.border10, styles.pickerContainer]}>
            <Picker
              selectedValue={formData.marital_status}
              onValueChange={(value) => updateField('marital_status', value)}
              style={styles.picker}
            >
              <Picker.Item label="متاهل" value="متاهل" />
              <Picker.Item label="مجرد" value="مجرد" />
            </Picker>
          </View>
        </View>

        {/* وضعیت سربازی */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>وضعیت سربازی :</Text>
          <View style={[NewStyles.textInput, NewStyles.border10, styles.pickerContainer]}>
            <Picker
              selectedValue={formData.military_status}
              onValueChange={(value) => updateField('military_status', value)}
              style={styles.picker}
            >
              <Picker.Item label="پایان خدمت" value="پایان خدمت" />
              <Picker.Item label="معاف" value="معاف" />
              <Picker.Item label="در حال خدمت" value="در حال خدمت" />
            </Picker>
          </View>
        </View>

        {/* وضعیت تحصیلات */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>وضعیت تحصیلات :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.education_status}
            onChangeText={(value) => updateField('education_status', value)}
            placeholder=""
          />
        </View>

        {/* شماره تلفن ثابت */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره تلفن ثابت ۰۲۱ ۸ رقمی :</Text>
          <View style={styles.phoneContainer}>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.phoneInput]}
              value={formData.telephone}
              onChangeText={(value) => updateField('telephone', value)}
              placeholder=""
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* شماره تلفن همراه */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره تلفن همراه ۱۰ رقمی :</Text>
          <View style={styles.phoneContainer}>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.phoneInput]}
              value={formData.mobile}
              onChangeText={(value) => updateField('mobile', value)}
              placeholder=""
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
        </View>

        {/* آدرس ایمیل */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>آدرس ایمیل :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder=""
            keyboardType="email-address"
          />
        </View>

        {/* شماره کارت شناسایی */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره کارت شناسایی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.id_card_number}
            onChangeText={(value) => updateField('id_card_number', value)}
            placeholder=""
          />
        </View>

        {/* تاریخ اعتبار گواهینامه */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>تاریخ اعتبار گواهینامه (تاریخ شمسی) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.licence_date}
            onChangeText={(value) => updateField('licence_date', value)}
            placeholder="1408/06/20"
          />
        </View>

        {/* نوع وسیله نقلیه */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>نوع وسیله نقلیه : موتور سیکلت / خودرو / دوچرخه / پیاده</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.vehicle_type}
            onChangeText={(value) => updateField('vehicle_type', value)}
            placeholder=""
          />
        </View>

        {/* کد پستی منزل */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>کد پستی منزل :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.home_postal_code}
            onChangeText={(value) => updateField('home_postal_code', value)}
            placeholder=""
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        {/* شهر + منطقه */}
        <View style={styles.cityRow}>
          <View style={styles.cityContainer}>
            <Text style={styles.label}>شهر :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
              value={formData.city}
              onChangeText={(value) => updateField('city', value)}
              placeholder="تهران"
            />
          </View>
          <View style={styles.regionContainer}>
            <Text style={styles.label}>منطقه :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
              value={formData.region}
              onChangeText={(value) => updateField('region', value)}
              placeholder="5"
            />
          </View>
        </View>

        {/* آدرس منزل */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>آدرس منزل :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.addressInput]}
            value={formData.home_address}
            onChangeText={(value) => updateField('home_address', value)}
            placeholder=""
            multiline
            numberOfLines={3}
          />
        </View>

        {/* کد پرسنلی مصرف */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>کد پرسنلی مصرف :</Text>
          <View style={styles.referralContainer}>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]}
              value={formData.other_referral_code}
              onChangeText={(value) => updateField('other_referral_code', value)}
              placeholder=""
            />
            <TouchableOpacity
              style={styles.validateButton}
              onPress={handleValidateReferralCode}
            >
              <Text style={styles.validateButtonText}>بررسی</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* Navigation Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setCurrentPage('computer')}
      >
        <Text style={styles.nextButtonText}>بعدی - دانش کامپیوتر</Text>
      </TouchableOpacity>

    </ScrollView>
  );

  const renderComputerSkillsPage = () => (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <CustomStatusBar />

      {/* Header */}
      <TouchableOpacity style={[styles.headerButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
        <Text style={styles.headerButtonText}>دانش کامپیوتر</Text>
      </TouchableOpacity>

      {/* Computer Skills Form */}
      <View style={styles.formContainer}>

        {/* لیدز / شفافیت */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>ایده / خلاقیت :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.idea}
            onChangeText={(value) => updateField('idea', value)}
            placeholder=""
            multiline
            numberOfLines={3}
          />
        </View>

        {/* تسلط / توانایی ها (نرم افزار) */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>تسلط / توانایی ها (نرم افزار) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.software_skill}
            onChangeText={(value) => updateField('software_skill', value)}
            placeholder=""
            multiline
            numberOfLines={3}
          />
        </View>

        {/* تسلط / توانایی ها (سخت افزار) */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>تسلط / توانایی ها (سخت افزار) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.hardware_skill}
            onChangeText={(value) => updateField('hardware_skill', value)}
            placeholder=""
            multiline
            numberOfLines={3}
          />
        </View>

        {/* تاکاکس / نقطه ضعف (نرم افزار) */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>ناآگاهی / نقطه ضعف (نرم افزار) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.software_weakness}
            onChangeText={(value) => updateField('software_weakness', value)}
            placeholder=""
            multiline
            numberOfLines={3}
          />
        </View>

        {/* تاکاکس / نقطه ضعف (سخت افزار) */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>ناآگاهی / نقاط ضعف (سخت افزار) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.hardware_weakness}
            onChangeText={(value) => updateField('hardware_weakness', value)}
            placeholder=""
            multiline
            numberOfLines={3}
          />
        </View>

      </View>

      {/* گرایش فعالیت Header */}
      <TouchableOpacity style={[styles.headerButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
        <Text style={styles.headerButtonText}>گرایش فعالیت / تخصص</Text>
      </TouchableOpacity>

      {/* Expertise Selection */}
      <View style={styles.activityContainer}>
        {expertises.map((expertise) => (
          <TouchableOpacity 
            key={expertise.id} 
            style={[
              styles.activityButton,
              formData.expertise_ids.includes(expertise.id) && styles.selectedActivityButton
            ]}
            onPress={() => {
              const currentIds = formData.expertise_ids;
              const newIds = currentIds.includes(expertise.id)
                ? currentIds.filter(id => id !== expertise.id)
                : [...currentIds, expertise.id];
              updateField('expertise_ids', newIds);
            }}
          >
            <Text style={[
              styles.activityButtonText,
              formData.expertise_ids.includes(expertise.id) && styles.selectedActivityText
            ]}>
              {expertise.title}
            </Text>
          </TouchableOpacity>
        ))}
        
        {expertises.length === 0 && (
          <Text style={styles.loadingText}>در حال دریافت لیست تخصص‌ها...</Text>
        )}
      </View>

      {/* بارگذاری رزومه */}
      <View style={styles.resumeSection}>
        <Text style={styles.resumeTitle}>بارگذاری رزومه (اختیاری)</Text>
        <Text style={styles.resumeNote}>
          می‌توانید رزومه / اطلاعات تکمیلی خود را امضا شده با موضوع (همکاری / فعالیت در لوپ) بارگزاری نمایید.
        </Text>

        {/* File picker + upload controls */}
        <View style={styles.resumeControls}>
          {resumeFile ? (
            <View style={styles.selectedFileRow}>
              <Text style={styles.selectedFileName}>{resumeFile.name || resumeFile.uri.split('/').pop()}</Text>
              <TouchableOpacity style={styles.removeFileButton} onPress={() => setResumeFile(null)}>
                <Text style={styles.removeFileText}>حذف</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickFileButton} onPress={pickDocument}>
              <Text style={styles.pickFileText}>انتخاب فایل رزومه</Text>
            </TouchableOpacity>
          )}

          {resumeFile && (
            <View style={styles.selectedFileContainer}>
              <Text style={styles.selectedFileName}>{resumeFile.name}</Text>
              <TouchableOpacity
                onPress={() => setResumeFile(null)}
                style={styles.removeFileButton}
              >
                <Text style={styles.removeFileText}>حذف</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Submit Button */}
      <Button
        title={submitting ? "در حال ثبت نام..." : "ثبت نام"}
        onPress={handleSubmit}
        style={styles.submitButton}
        disabled={submitting}
      />

      {submitting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
          <Text style={styles.loadingText}>در حال ارسال اطلاعات...</Text>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentPage('personal')}
      >
        <Text style={styles.backButtonText}>بازگشت به اطلاعات تکمیلی</Text>
      </TouchableOpacity>

    </ScrollView>
  );

  // Open document picker to select resume
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.type === 'success') {
        setResumeFile(result);
      }
    } catch (err) {
      Alert.alert('خطا', 'انتخاب فایل با خطا مواجه شد');
    }
  };

  // Upload resume to backend
  const uploadResume = async () => {
    if (!resumeFile) return;
    setUploading(true);
    try {
      const form = new FormData();
      // In Expo a picked document has uri and mimeType/name
      const fileName = resumeFile.name || resumeFile.uri.split('/').pop();
      const fileType = resumeFile.mimeType || 'application/octet-stream';
      form.append('resume', {
        uri: resumeFile.uri,
        name: fileName,
        type: fileType,
      });

      const res = await fetch(`${BASE_URI}/uploadResume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: form,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      Alert.alert('موفقیت', 'رزومه با موفقیت بارگذاری شد');
      setResumeFile(null);
    } catch (err) {
      console.warn('uploadResume err', err);
      Alert.alert('خطا', 'بارگذاری رزومه ناموفق بود');
    } finally {
      setUploading(false);
    }


  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{top:'off', bottom:'additive'}}>
      <ImageBackground
        source={require('../../assets/background2.jpg')}
        style={styles.background}
      >
        {currentPage === 'personal' ? renderPersonalInfoPage() : renderComputerSkillsPage()}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 15,
  },
  headerButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    marginTop: 15
  },
  headerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(0.95),
    borderRadius: 10,
    padding: 20,
    gap: 12,
  },
  inputRow: {
    marginVertical: 3,
  },
  label: {
    ...NewStyles.text10,
    marginBottom: 5,
  },
  pickerContainer: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  picker: {
    color: themeColor10.bgColor(1),
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phonePrefix: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  cityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cityContainer: {
    flex: 2,
  },
  regionContainer: {
    flex: 1,
  },
  addressInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  nextButton: {
    backgroundColor: themeColor1.bgColor(1),
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activityContainer: {
    width: '100%',
    gap: 8,
  },
  activityButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  activityButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  selectedActivityButton: {
    backgroundColor: themeColor1.bgColor(0.8),
  },
  selectedActivityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  referralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  validateButton: {
    backgroundColor: themeColor1.bgColor(1),
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  validateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  resumeSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resumeNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  resumeControls: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  pickFileButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickFileText: {
    color: '#333',
    fontWeight: '600',
  },
  selectedFileRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  selectedFileName: {
    flex: 1,
    color: '#333',
    fontSize: 13,
    textAlign: 'right',
  },
  removeFileButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
  },
  removeFileText: {
    color: '#333',
    fontSize: 13,
  },
  uploadButton: {
    backgroundColor: '#0074D9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 20,
    width: '100%',
  },
  backButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  debugContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    width: '100%',
  },
  debugButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColor4.bgColor(0.3),
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  phonePrefix: {
    fontSize: 14,
    color: themeColor10.bgColor(0.7),
    marginRight: 8,
    fontWeight: 'bold',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 12,
  },
});
