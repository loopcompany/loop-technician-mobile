import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor4, themeColor10, themeColor3, themeColor2, themeColor6 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import DatePickerModal from '../../components/DatePickerModal';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFormatedDate } from 'react-native-modern-datepicker';
import {
  registerTechnician,
  getExpertises,
  validateReferralCode,
  testApiConnection,
  testExpertisesEndpoint
} from '../../services/Api';
import { validateTechnicianRegistration } from '../../utils/validation';
import { showAlert } from '../../helpers/Common';

// Pre-calculate colors outside component to prevent re-renders
const HEADER_BG_COLOR = themeColor0.bgColor(0.8);
const TEXT_COLOR_FULL = themeColor10.bgColor(1);
const TEXT_COLOR_HALF = themeColor10.bgColor(0.5);
const TEXT_COLOR_07 = themeColor10.bgColor(0.7);
const TEXT_COLOR_03 = themeColor10.bgColor(0.3);
const SELECTED_ACTIVITY_BG = themeColor1.bgColor(0.8);
const BUTTON_BG_COLOR = themeColor1.bgColor(1);
const BUTTON_TEXT_COLOR = themeColor4.bgColor(1);
const VALIDATE_BUTTON_BG = themeColor1.bgColor(1);
const VALIDATE_BUTTON_TEXT = themeColor0.bgColor(1);
const BACK_BUTTON_BG = themeColor10.bgColor(0.5);
const LOADING_COLOR = themeColor1.bgColor(1);
const FORM_BG_095 = themeColor4.bgColor(0.95);
const FORM_BG_08 = themeColor4.bgColor(0.8);
const FORM_BG_FULL = themeColor4.bgColor(1);
const FORM_BORDER_03 = themeColor4.bgColor(0.3);
const UPLOAD_BUTTON_BG = themeColor2.bgColor(1);

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
  const [fieldErrors, setFieldErrors] = useState({}); // نگهداری خطاهای هر فیلد

  // Date picker modals
  const [birthDateModal, setBirthDateModal] = useState(false);
  const [licenceDateModal, setLicenceDateModal] = useState(false);

  // محاسبه تاریخ امروز به صورت شمسی (یک بار)
  const todayDate = useMemo(() => {
    return getFormatedDate(new Date(), 'jYYYY/jMM/jDD');
  }, []);

  // محاسبه تاریخ 10 سال آینده برای گواهینامه (یک بار)
  const tenYearsLater = useMemo(() => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    return getFormatedDate(futureDate, 'jYYYY/jMM/jDD');
  }, []);

  // Load expertises when component mounts
  useEffect(() => {
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

          showAlert('خطا', errorMessage);

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

        showAlert('خطا', errorMessage);

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

    // Call loadExpertises
    loadExpertises();
  }, []); // Empty dependency array - only run once on mount

  // Validate referral code
  const handleValidateReferralCode = async () => {
    if (!formData.other_referral_code) {
      showAlert('خطا', 'لطفاً ابتدا کد معرف را وارد کنید');
      return;
    }

    try {
      const result = await validateReferralCode(formData.other_referral_code);
      if (result.success) {
        showAlert('موفقیت', result.data?.message || result.message || 'کد معرف معتبر است');
      } else {
        let errorMessage = result.message || 'کد معرف نامعتبر است';

        if (result.errors) {
          const errorList = Object.values(result.errors).flat();
          errorMessage += '\n\n' + errorList.join('\n');
        }

        showAlert('خطا', errorMessage);
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

      showAlert('خطا', errorMessage);
    }
  };

  // Form validation با نمایش دقیق خطاها
  const validateForm = () => {
    try {
      console.log('🔍 Validating form data:', formData);
      console.log('🔍 Calling validateTechnicianRegistration...');
      
      const validation = validateTechnicianRegistration(formData);
      
      console.log('📊 Validation completed successfully!');
      console.log('📊 Validation result object:', validation);
      console.log('📊 validation.isValid:', validation.isValid);
      console.log('📊 validation type:', typeof validation);

      if (!validation.isValid) {
        console.log('❌ Validation errors:', validation.errors);
      
      // ذخیره خطاها برای نمایش در فیلدها
      setFieldErrors(validation.errors);
      
      // ساخت پیام خطای کامل با نام فیلدها
      const errorMessages = Object.entries(validation.errors).map(([field, message]) => {
        // ترجمه نام فیلدها به فارسی
        const fieldNames = {
          name: 'نام و نام خانوادگی',
          melicode: 'شماره ملی',
          phone: 'شماره تلفن اصلی',
          mobile: 'شماره تلفن همراه',
          telephone: 'شماره تلفن ثابت',
          birth_date: 'تاریخ تولد',
          father_name: 'نام پدر',
          issued_from: 'صادره از',
          serial_number: 'شماره شناسنامه',
          marital_status: 'وضعیت تأهل',
          military_status: 'وضعیت نظام وظیفه',
          education_status: 'وضعیت تحصیلات',
          email: 'آدرس ایمیل',
          id_card_number: 'شماره کارت شناسایی',
          licence_date: 'تاریخ اعتبار گواهینامه',
          vehicle_type: 'نوع وسیله نقلیه',
          home_postal_code: 'کد پستی منزل',
          city: 'شهر',
          region: 'منطقه',
          home_address: 'آدرس منزل',
          expertise_ids: 'تخصص‌ها'
        };
        
        const persianFieldName = fieldNames[field] || field;
        return `❌ ${persianFieldName}:\n   ${message}`;
      });
      
      showAlert(
        'خطا در اعتبارسنجی فرم',
        errorMessages.join('\n\n'),
        [{ text: 'متوجه شدم', style: 'cancel' }]
      );
      return false;
    }

    console.log('✅ Form validation passed');
    setFieldErrors({}); // پاک کردن خطاها
    return true;
    
    } catch (error) {
      console.error('💥 EXCEPTION in validateForm:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      showAlert(
        'خطای سیستمی',
        `خطای غیرمنتظره در اعتبارسنجی:\n${error.message}`,
        [{ text: 'متوجه شدم', style: 'cancel' }]
      );
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called');
    
    const validationResult = validateForm();
    console.log('✅ validateForm returned:', validationResult);
    
    if (!validationResult) {
      console.log('❌ Validation failed, stopping submission');
      return;
    }
    
    console.log('✅ Validation passed, proceeding with submission');

    try {
      console.log('📤 Setting submitting state to true');
      setSubmitting(true);

      // Create FormData for multipart submission
      console.log('📋 Creating FormData object');
      const apiFormData = new FormData();

      // Add all text fields
      console.log('📝 Adding form fields to FormData');
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
          console.log(`  ✓ Added ${key}: ${key === 'password' ? '[HIDDEN]' : formData[key]}`);
        }
      });

      // Use phone as main phone field (API expects 'phone' for login)
      if (formData.mobile) {
        apiFormData.append('phone', formData.mobile);
        console.log('  ✓ Added phone from mobile:', formData.mobile);
      }

      // Add expertise IDs as array
      if (formData.expertise_ids && formData.expertise_ids.length > 0) {
        console.log('  ✓ Adding expertise_ids:', formData.expertise_ids);
        formData.expertise_ids.forEach(id => {
          apiFormData.append('expertise_ids[]', id);
        });
      }

      console.log('📋 FormData preparation complete, submitting registration data...');

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
      console.log('🌐 Calling registerTechnician API...');
      const result = await registerTechnician(apiFormData, resumeFile);
      console.log('📦 API response received:', result);

      if (result.success) {
        console.log('✅ Registration successful!');
        showAlert(
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

        showAlert(
          'خطا در ثبت نام',
          errorMessage,
          [{ text: 'متوجه شدم', style: 'cancel' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('❌ Registration exception caught:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        stack: error.stack
      });

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

      showAlert(
        'خطا',
        errorMessage,
        [{ text: 'متوجه شدم', style: 'cancel' }],
        { cancelable: true }
      );
    } finally {
      console.log('🔚 handleSubmit finally block - resetting submitting state');
      setSubmitting(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // پاک کردن خطای فیلد هنگام تغییر
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // کامپوننت نمایش خطا برای هر فیلد
  const FieldError = ({ field }) => {
    if (!fieldErrors[field]) return null;
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {fieldErrors[field]}</Text>
      </View>
    );
  };

  const renderPersonalInfoPage = () => (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <CustomStatusBar />
        <TouchableOpacity style={[styles.headerButton, styles.headerButtonBg]}>
          <Text style={[NewStyles.title4]}>اطلاعات تکمیلی</Text>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formContainer}>

          {/* نام و نام خانوادگی */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>نام و نام خانوادگی :</Text>
            <TextInput
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10,
                fieldErrors.name && styles.inputError
              ]}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="مثال: علی احمدی"
            />
            <FieldError field="name" />
          </View>
          
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>شماره تلفن اصلی:</Text>
            <View style={styles.phoneContainer}>
              <TextInput
                style={[
                  NewStyles.textInput, 
                  NewStyles.text10, 
                  NewStyles.border10, 
                  styles.phoneInput,
                  fieldErrors.phone && styles.inputError
                ]}
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="09123456789"
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            <FieldError field="phone" />
          </View>

          {/* شماره ملی */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>شماره ملی :</Text>
            <TextInput
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10,
                fieldErrors.melicode && styles.inputError
              ]}
              value={formData.melicode}
              onChangeText={(value) => updateField('melicode', value)}
              placeholder="0123456789"
              keyboardType="number-pad"
              maxLength={10}
            />
            <FieldError field="melicode" />
          </View>

          {/* متولد */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>متولد (تاریخ شمسی) :</Text>
            <TouchableOpacity
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10, 
                styles.datePickerTouchable,
                fieldErrors.birth_date && styles.inputError
              ]}
              onPress={() => setBirthDateModal(true)}
            >
              <Text style={[NewStyles.text10, formData.birth_date ? styles.dateTextFull : styles.dateTextHalf]}>
                {formData.birth_date || '1379/08/27'}
              </Text>
            </TouchableOpacity>
            <FieldError field="birth_date" />
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
            <Text style={[NewStyles.text10]}>شماره تلفن همراه ۱۱ رقمی :</Text>
            <View style={styles.phoneContainer}>
              <TextInput
                style={[
                  NewStyles.textInput, 
                  NewStyles.text10, 
                  NewStyles.border10, 
                  styles.phoneInput,
                  fieldErrors.mobile && styles.inputError
                ]}
                value={formData.mobile}
                onChangeText={(value) => updateField('mobile', value)}
                placeholder="09123456789"
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            <FieldError field="mobile" />
          </View>

          {/* آدرس ایمیل */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>آدرس ایمیل :</Text>
            <TextInput
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10,
                fieldErrors.email && styles.inputError
              ]}
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="example@email.com"
              keyboardType="email-address"
            />
            <FieldError field="email" />
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
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10, 
                styles.datePickerTouchable,
                fieldErrors.licence_date && styles.inputError
              ]}
              onPress={() => setLicenceDateModal(true)}
            >
              <Text style={[NewStyles.text10, formData.licence_date ? styles.dateTextFull : styles.dateTextHalf]}>
                {formData.licence_date || '1408/06/20'}
              </Text>
            </TouchableOpacity>
            <FieldError field="licence_date" />
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
                keyboardType='number-pad'
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
          onPress={() => {
            // بررسی فیلدهای صفحه اول
            const personalFields = {
              name: formData.name,
              melicode: formData.melicode,
              phone: formData.phone,
              mobile: formData.mobile,
              birth_date: formData.birth_date,
              email: formData.email,
            };
            
            // اگر فیلدهای ضروری پر نشده، هشدار بده
            const emptyFields = [];
            if (!personalFields.name) emptyFields.push('نام و نام خانوادگی');
            if (!personalFields.melicode) emptyFields.push('شماره ملی');
            if (!personalFields.phone) emptyFields.push('شماره تلفن اصلی');
            if (!personalFields.mobile) emptyFields.push('شماره تلفن همراه');
            if (!personalFields.birth_date) emptyFields.push('تاریخ تولد');
            
            if (emptyFields.length > 0) {
              showAlert(
                'فیلدهای ضروری',
                `لطفاً فیلدهای زیر را تکمیل کنید:\n\n${emptyFields.map(f => `• ${f}`).join('\n')}`,
                [{ text: 'متوجه شدم' }]
              );
              return;
            }
            
            setCurrentPage('computer');
          }}
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
      <TouchableOpacity style={[styles.headerButton, styles.headerButtonBg]}>
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
      <TouchableOpacity style={[styles.headerButton, styles.headerButtonBg]}>
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
        
        <FieldError field="expertise_ids" />
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
                <Text style={[NewStyles.text4]}>حذف</Text>
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
        showAlert('موفق', `فایل "${resumeData.name}" انتخاب شد`);
      } else {
        console.log('❌ انتخاب فایل لغو شد');
      }
    } catch (err) {
      console.error('❌ خطا در انتخاب فایل:', err);

      let errorMessage = 'انتخاب فایل با خطا مواجه شد\n\n';
      if (err.message) {
        errorMessage += `پیام خطا: ${err.message}`;
      }

      showAlert('خطا', errorMessage);
    }
  };



  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <ImageBackground
        source={Platform.OS === 'web' ? require('../../assets/webbackground.jpg') : require('../../assets/background2.jpg')}
        style={styles.background}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          {currentPage === 'personal' ? renderPersonalInfoPage() : renderComputerSkillsPage()}
        </KeyboardAvoidingView>
      </ImageBackground>
 
      {/* Date Picker Modals */}
      {/* تاریخ تولد: حداکثر امروز */}
      <DatePickerModal
        datePickerModal={birthDateModal}
        setDatePickerModal={setBirthDateModal}
        birthDate={formData.birth_date}
        setBirthDate={(date) => updateField('birth_date', date)}
        maximumDate={todayDate}
      />

      {/* تاریخ اعتبار گواهینامه: حداقل امروز، حداکثر 10 سال بعد */}
      <DatePickerModal
        datePickerModal={licenceDateModal}
        setDatePickerModal={setLicenceDateModal}
        birthDate={formData.licence_date}
        setBirthDate={(date) => updateField('licence_date', date)}
        minimumDate={todayDate}
        maximumDate={tenYearsLater}
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
    width:'90%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  headerButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    marginTop: 15
  },
  headerButtonBg: {
    backgroundColor: HEADER_BG_COLOR,
  },
  headerButtonText: {
    color: BUTTON_TEXT_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    backgroundColor: FORM_BG_095,
    borderRadius: 10,
    padding: 20,
    gap: 12,
  },
  inputRow: {
    marginVertical: 3,
  },
  errorContainer: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    fontFamily: 'VazirLight',
    textAlign: 'right',
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#ff0000',
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
    color: TEXT_COLOR_FULL,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phonePrefix: {
    fontSize: 12,
    color: TEXT_COLOR_07,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  datePickerTouchable: {
    justifyContent: 'center',
  },
  dateTextFull: {
    color: TEXT_COLOR_FULL,
  },
  dateTextHalf: {
    color: TEXT_COLOR_HALF,
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
    backgroundColor: BUTTON_BG_COLOR,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  nextButtonText: {
    color: BUTTON_TEXT_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activityContainer: {
    width: '100%',
    gap: 8,
  },
  activityButton: {
    backgroundColor: FORM_BG_08,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  activityButtonText: {
    ...NewStyles.text10,
  },
  selectedActivityButton: {
    backgroundColor: SELECTED_ACTIVITY_BG,
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
    backgroundColor: VALIDATE_BUTTON_BG,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  validateButtonText: {
    color: VALIDATE_BUTTON_TEXT,
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
    backgroundColor: FORM_BG_095,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR_07,
    marginBottom: 10,
  },
  resumeNote: {
    fontSize: 12,
    color: TEXT_COLOR_HALF,
    textAlign: 'center',
    lineHeight: 18,
  },
  resumeControls: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  pickFileButton: {
    backgroundColor: FORM_BG_08,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TEXT_COLOR_03,
  },
  pickFileText: {
    color: TEXT_COLOR_07,
    fontWeight: '600',
  },
  selectedFileRow: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  selectedFileName: {
    flex: 1,
    color: TEXT_COLOR_07,
    fontSize: 13,
    textAlign: 'right',
  },
  removeFileButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: themeColor6.bgColor(1),
    borderRadius: 6,
  },
  removeFileText: {
    color: TEXT_COLOR_07,
    fontSize: 13,
  },
  uploadButton: {
    backgroundColor: UPLOAD_BUTTON_BG,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: BUTTON_TEXT_COLOR,
    fontWeight: '700',
  },
  submitButton: {
    ...NewStyles.title1,
  },
  backButton: {
    backgroundColor: BACK_BUTTON_BG,
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
    color: BUTTON_TEXT_COLOR,
    fontSize: 12,
    fontWeight: 'bold',
  },
  phoneContainerAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FORM_BORDER_03,
    borderRadius: 8,
    backgroundColor: FORM_BG_FULL,
    paddingHorizontal: 10,
  },
  phonePrefixAlt: {
    fontSize: 14,
    color: TEXT_COLOR_07,
    marginRight: 8,
    fontWeight: 'bold',
  },
  phoneInputAlt: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 12,
  },
});

