import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, KeyboardAvoidingView, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor4, themeColor10, themeColor3, themeColor2 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import DatePickerModal from '../../components/DatePickerModal';
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
  
  // Date picker modals
  const [birthDateModal, setBirthDateModal] = useState(false);
  const [licenceDateModal, setLicenceDateModal] = useState(false);

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
        
        let errorMessage = 'خطا در دریافت لیست تخصص‌ها\n\n';
        if (result.message) {
          errorMessage += result.message;
        }
        
        Alert.alert('خطا', errorMessage);

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
      
      let errorMessage = 'خطا در ارتباط با سرور\n\n';
      
      if (error.response) {
        errorMessage += `وضعیت: ${error.response.status}\n`;
        if (error.response.data?.message) {
          errorMessage += `پیام: ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage += 'سرور پاسخی نداد. لطفاً اتصال اینترنت خود را بررسی کنید.';
      } else {
        errorMessage += `پیام خطا: ${error.message}`;
      }
      
      Alert.alert('خطا', errorMessage);

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
    if (!formData.other_referral_code) {
      Alert.alert('خطا', 'لطفاً ابتدا کد معرف را وارد کنید');
      return;
    }

    try {
      const result = await validateReferralCode(formData.other_referral_code);
      if (result.success) {
        Alert.alert('موفقیت', result.data?.message || result.message || 'کد معرف معتبر است');
      } else {
        let errorMessage = result.message || 'کد معرف نامعتبر است';
        
        if (result.errors) {
          const errorList = Object.values(result.errors).flat();
          errorMessage += '\n\n' + errorList.join('\n');
        }
        
        Alert.alert('خطا', errorMessage);
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      
      let errorMessage = 'خطا در بررسی کد معرف\n\n';
      
      if (error.response) {
        errorMessage += `وضعیت: ${error.response.status}\n`;
        if (error.response.data?.message) {
          errorMessage += `پیام: ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage += 'سرور پاسخی نداد. لطفاً اتصال اینترنت خود را بررسی کنید.';
      } else {
        errorMessage += `پیام خطا: ${error.message}`;
      }
      
      Alert.alert('خطا', errorMessage);
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
      
      if (resumeFile) {
        console.log('📎 فایل رزومه برای ارسال:', {
          name: resumeFile.name,
          uri: resumeFile.uri,
          type: resumeFile.mimeType || resumeFile.type,
          size: resumeFile.size
        });
      } else {
        console.log('⚠️ بدون فایل رزومه');
      }

      // Submit registration with resume file
      const result = await registerTechnician(apiFormData, resumeFile);

      if (result.success) {
        Alert.alert(
          'موفقیت',
          result.message || 'ثبت نام با موفقیت انجام شد',
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
        console.log('❌ Registration failed:', result);
        
        // Build detailed error message
        let errorMessage = '';
        
        if (result.errors && typeof result.errors === 'object') {
          // Format validation errors
          const errorList = Object.entries(result.errors).map(([field, messages]) => {
            const fieldName = field;
            const messageList = Array.isArray(messages) ? messages : [messages];
            return `• ${fieldName}: ${messageList.join(', ')}`;
          });
          errorMessage = errorList.join('\n\n');
        } else if (result.message) {
          errorMessage = result.message;
        } else {
          errorMessage = 'خطای نامشخص در ثبت نام';
        }
        
        Alert.alert(
          'خطا در ثبت نام',
          errorMessage,
          [{ text: 'متوجه شدم', style: 'cancel' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Build detailed error message
      let errorMessage = 'خطا در ارتباط با سرور\n\n';
      
      if (error.response) {
        // Server responded with error
        errorMessage += `وضعیت: ${error.response.status}\n`;
        
        if (error.response.data) {
          if (error.response.data.message) {
            errorMessage += `پیام: ${error.response.data.message}\n`;
          }
          
          if (error.response.data.errors) {
            errorMessage += '\nجزئیات خطاها:\n';
            const errorList = Object.entries(error.response.data.errors).map(([field, messages]) => {
              const messageList = Array.isArray(messages) ? messages : [messages];
              return `• ${field}: ${messageList.join(', ')}`;
            });
            errorMessage += errorList.join('\n');
          }
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage += 'سرور پاسخی نداد. لطفاً اتصال اینترنت خود را بررسی کنید.';
      } else {
        // Something else happened
        errorMessage += `پیام خطا: ${error.message}`;
      }
      
      Alert.alert(
        'خطا',
        errorMessage,
        [{ text: 'متوجه شدم', style: 'cancel' }],
        { cancelable: true }
      );
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
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}> 
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <CustomStatusBar />




      {/* Header */}
      <TouchableOpacity style={[styles.headerButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
        <Text style={[NewStyles.title4]}>اطلاعات تکمیلی</Text>
      </TouchableOpacity>

      {/* Form Fields */}
      <View style={styles.formContainer}>

        {/* نام و نام خانوادگی */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>نام و نام خانوادگی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder=""
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>شماره تلفن اصلی:</Text>
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
          <Text style={[NewStyles.text10]}>شماره ملی :</Text>
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
          <Text style={[NewStyles.text10]}>متولد (تاریخ شمسی) :</Text>
          <TouchableOpacity
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { justifyContent: 'center' }]}
            onPress={() => setBirthDateModal(true)}
          >
            <Text style={[NewStyles.text10, { color: formData.birth_date ? themeColor10.bgColor(1) : themeColor10.bgColor(0.5) }]}>
              {formData.birth_date || '1379/08/27'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* نام پدر */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>نام پدر :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.father_name}
            onChangeText={(value) => updateField('father_name', value)}
            placeholder=""
          />
        </View>

        {/* صادره از */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>صادره از :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.issued_from}
            onChangeText={(value) => updateField('issued_from', value)}
            placeholder=""
          />
        </View>

        {/* شماره شناسنامه */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>شماره شناسنامه :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.serial_number}
            onChangeText={(value) => updateField('serial_number', value)}
            placeholder=""
          />
        </View>

        {/* وضعیت تأهل */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>وضعیت تأهل :</Text>
          <View style={[NewStyles.textInput, NewStyles.border10, styles.pickerContainer]}>
            <Picker
              selectedValue={formData.marital_status}
              onValueChange={(value) => updateField('marital_status', value)}
              style={styles.picker}
            >
              <Picker.Item label="متأهل" value="متأهل" />
              <Picker.Item label="مجرد" value="مجرد" />
            </Picker>
          </View>
        </View>

        {/* وضعیت سربازی */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>وضعیت سربازی :</Text>
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
          <Text style={[NewStyles.text10]}>وضعیت تحصیلات :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.education_status}
            onChangeText={(value) => updateField('education_status', value)}
            placeholder=""
          />
        </View>

        {/* شماره تلفن ثابت */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>شماره تلفن ثابت ۰۲۱ ۸ رقمی :</Text>
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
          <Text style={[NewStyles.text10]}>شماره تلفن همراه ۱۰ رقمی :</Text>
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
          <Text style={[NewStyles.text10]}>آدرس ایمیل :</Text>
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
          <Text style={[NewStyles.text10]}>شماره کارت شناسایی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.id_card_number}
            onChangeText={(value) => updateField('id_card_number', value)}
            placeholder=""
          />
        </View>

        {/* تاریخ اعتبار گواهینامه */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>تاریخ اعتبار گواهینامه (تاریخ شمسی) :</Text>
          <TouchableOpacity
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { justifyContent: 'center' }]}
            onPress={() => setLicenceDateModal(true)}
          >
            <Text style={[NewStyles.text10, { color: formData.licence_date ? themeColor10.bgColor(1) : themeColor10.bgColor(0.5) }]}>
              {formData.licence_date || '1408/06/20'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* نوع وسیله نقلیه */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>نوع وسیله نقلیه : موتور سیکلت / خودرو / دوچرخه / پیاده</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.vehicle_type}
            onChangeText={(value) => updateField('vehicle_type', value)}
            placeholder=""
          />
        </View>

        {/* کد پستی منزل */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>کد پستی منزل :</Text>
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
            <Text style={[NewStyles.text10]}>شهر :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
              value={formData.city}
              onChangeText={(value) => updateField('city', value)}
              placeholder="تهران"
            />
          </View>
          <View style={styles.regionContainer}>
            <Text style={[NewStyles.text10]}>منطقه :</Text>
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
          <Text style={[NewStyles.text10]}>آدرس منزل :</Text>
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
          <Text style={[NewStyles.text10]}>کد پرسنلی معرف :</Text>
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
              <Text style={[NewStyles.text10]}>بررسی</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* Navigation Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setCurrentPage('computer')}
      >
        <Text style={[NewStyles.text10]}>بعدی - دانش کامپیوتر</Text>
      </TouchableOpacity>

    </ScrollView>
        </KeyboardAvoidingView>
  );

  const renderComputerSkillsPage = () => (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <CustomStatusBar />

      {/* Header */}
      <TouchableOpacity style={[styles.headerButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
        <Text style={[NewStyles.title4]}>دانش کامپیوتر</Text>
      </TouchableOpacity>

      {/* Computer Skills Form */}
      <View style={styles.formContainer}>

        {/* لیدز / شفافیت */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>ایده / خلاقیت :</Text>
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
          <Text style={[NewStyles.text10]}>تسلط / توانایی ها (نرم افزار) :</Text>
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
          <Text style={[NewStyles.text10]}>تسلط / توانایی ها (سخت افزار) :</Text>
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
          <Text style={[NewStyles.text10]}>ناآگاهی / نقطه ضعف (نرم افزار) :</Text>
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
          <Text style={[NewStyles.text10]}>ناآگاهی / نقاط ضعف (سخت افزار) :</Text>
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
        <Text style={[NewStyles.title4]}>گرایش فعالیت / تخصص</Text>
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
          <Text style={[NewStyles.text10]}>در حال دریافت لیست تخصص‌ها...</Text>
        )}
      </View>

      {/* بارگذاری رزومه */}
      <View style={styles.resumeSection}>
        <Text style={[NewStyles.title10]}>بارگذاری رزومه (اختیاری)</Text>
        <Text style={[NewStyles.text10]}>
          می‌توانید رزومه / اطلاعات تکمیلی خود را امضا شده با موضوع (همکاری / فعالیت در لوپ) بارگذاری نمایید.
        </Text>

        {/* File picker + upload controls */}
        <View style={styles.resumeControls}>
          {resumeFile ? (
            <View style={styles.selectedFileRow}>
              <Text style={[NewStyles.text10]}>
                {resumeFile.name || (resumeFile.uri ? resumeFile.uri.split('/').pop() : 'فایل انتخاب شده')}
              </Text>
              <TouchableOpacity style={styles.removeFileButton} onPress={() => setResumeFile(null)}>
                <Text style={[NewStyles.text10]}>حذف</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickFileButton} onPress={pickDocument}>
              <Text style={[NewStyles.text10]}>انتخاب فایل رزومه</Text>
            </TouchableOpacity>
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
      const result = await DocumentPicker.getDocumentAsync({ 
        type: '*/*',
        copyToCacheDirectory: true 
      });
      
      console.log('📄 نتیجه انتخاب فایل:', JSON.stringify(result, null, 2));
      
      // Expo DocumentPicker returns different structure based on version
      // Check for both old (type: 'success') and new (!canceled) formats
      if (result.type === 'success' || (result.assets && result.assets.length > 0) || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;
        
        console.log('✅ فایل انتخاب شد:', {
          name: file.name,
          uri: file.uri,
          size: file.size,
          mimeType: file.mimeType
        });
        
        // Ensure we have all required fields
        const resumeData = {
          uri: file.uri,
          name: file.name || file.uri.split('/').pop(),
          type: file.mimeType || file.type || 'application/octet-stream',
          size: file.size
        };
        
        setResumeFile(resumeData);
        Alert.alert('موفق', `فایل "${resumeData.name}" انتخاب شد`);
      } else {
        console.log('❌ انتخاب فایل لغو شد');
      }
    } catch (err) {
      console.error('❌ خطا در انتخاب فایل:', err);
      
      let errorMessage = 'انتخاب فایل با خطا مواجه شد\n\n';
      if (err.message) {
        errorMessage += `پیام خطا: ${err.message}`;
      }
      
      Alert.alert('خطا', errorMessage);
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error ${res.status}`);
      }

      const data = await res.json();
      Alert.alert('موفقیت', data.message || 'رزومه با موفقیت بارگذاری شد');
      setResumeFile(null);
    } catch (err) {
      console.error('❌ uploadResume error:', err);
      
      let errorMessage = 'بارگذاری رزومه ناموفق بود\n\n';
      
      if (err.response) {
        errorMessage += `وضعیت: ${err.response.status}\n`;
        if (err.response.data?.message) {
          errorMessage += `پیام: ${err.response.data.message}`;
        }
      } else if (err.message) {
        errorMessage += `پیام خطا: ${err.message}`;
      } else {
        errorMessage += 'خطای نامشخص';
      }
      
      Alert.alert('خطا', errorMessage);
    } finally {
      setUploading(false);
    }


  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <ImageBackground
        source={require('../../assets/background2.jpg')}
        style={styles.background}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          {currentPage === 'personal' ? renderPersonalInfoPage() : renderComputerSkillsPage()}
        </KeyboardAvoidingView>
      </ImageBackground>
      
      {/* Date Picker Modals */}
      <DatePickerModal
        datePickerModal={birthDateModal}
        setDatePickerModal={setBirthDateModal}
        birthDate={formData.birth_date}
        setBirthDate={(date) => updateField('birth_date', date)}
      />
      
      <DatePickerModal
        datePickerModal={licenceDateModal}
        setDatePickerModal={setLicenceDateModal}
        birthDate={formData.licence_date}
        setBirthDate={(date) => updateField('licence_date', date)}
      />
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
    color: themeColor4.bgColor(1),
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
    color: themeColor10.bgColor(0.7),
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
    color: themeColor4.bgColor(1),
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activityContainer: {
    width: '100%',
    gap: 8,
  },
  activityButton: {
    backgroundColor: themeColor4.bgColor(0.8),
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  activityButtonText: {
    ...NewStyles.text10,
 
  },
  selectedActivityButton: {
    backgroundColor: themeColor1.bgColor(0.8),
  },
  selectedActivityText: {
 ...NewStyles.text4,
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
    color: themeColor0.bgColor(1),
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    ...NewStyles.text10,
  },
  resumeSection: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(0.95),
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColor10.bgColor(0.7),
    marginBottom: 10,
  },
  resumeNote: {
    fontSize: 12,
    color: themeColor10.bgColor(0.5),
    textAlign: 'center',
    lineHeight: 18,
  },
  resumeControls: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  pickFileButton: {
    backgroundColor: themeColor4.bgColor(0.8),
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.3),
  },
  pickFileText: {
    color: themeColor10.bgColor(0.7),
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
    color: themeColor10.bgColor(0.7),
    fontSize: 13,
    textAlign: 'right',
  },
  removeFileButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: themeColor4.bgColor(0.8),
    borderRadius: 6,
  },
  removeFileText: {
    color: themeColor10.bgColor(0.7),
    fontSize: 13,
  },
  uploadButton: {
    backgroundColor: themeColor2.bgColor(1),
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: themeColor4.bgColor(1),
    fontWeight: '700',
  },
  submitButton: {
    ...NewStyles.title1,
  },
  backButton: {
    backgroundColor: themeColor10.bgColor(0.5),
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
...NewStyles.text4,
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
    color: themeColor4.bgColor(1),
    fontSize: 12,
    fontWeight: 'bold',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColor4.bgColor(0.3),
    borderRadius: 8,
    backgroundColor: themeColor4.bgColor(1),
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
