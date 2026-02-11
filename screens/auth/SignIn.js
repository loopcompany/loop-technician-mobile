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
import { createStyles } from '../../styles/NewStyles';
import {
  registerTechnician,
  getExpertises,
  validateReferralCode,
  testApiConnection,
  testExpertisesEndpoint
} from '../../services/Api';
import { validateTechnicianRegistration } from '../../utils/validation';
import { showAlert } from '../../helpers/Common';
import { useTranslation } from "react-i18next";

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
const PLACEHOLDER_COLOR = themeColor10.bgColor(0.7);

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
    marital_status: 'متأهل',
    military_status: 'پایان خدمت',
    education_status: '',
    telephone: '',
    mobile: '',
    email: '',
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
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
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

  // محاسبه حداکثر تاریخ تولد (18 سال پیش) برای حداقل سن 18 سال
  const maxBirthDate = useMemo(() => {
    const date18YearsAgo = new Date();
    date18YearsAgo.setFullYear(date18YearsAgo.getFullYear() - 18);
    return getFormatedDate(date18YearsAgo, 'jYYYY/jMM/jDD');
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

          let errorMessage = `${t("Error fetching expertises list")}\n\n`;
          if (result.message) {
            errorMessage += result.message;
          }

          showAlert(t("Error"), errorMessage);

          // Set some default expertises for testing
          setExpertises([
            { id: 1, title: t("Hardware user") },
            { id: 2, title: t("Software user") },
            { id: 3, title: t("Network user") },
            { id: 4, title: t("Industrial printer / copier user") },
            { id: 5, title: t("General user") },
            { id: 6, title: t("Hard disk user") },
            { id: 7, title: t("CCTV camera user") }
          ]);
        }
      } catch (error) {
        console.log('❌ Error loading expertises:', error);

        let errorMessage = `${t("Error communicating with server")}\n\n`;

        if (error.response) {
          errorMessage += `${t("Status")}: ${error.response.status}\n`;
          if (error.response.data?.message) {
            errorMessage += `${t("Message:")} ${error.response.data.message}`;
          }
        } else if (error.request) {
          errorMessage += t("Server did not respond. Please check your internet connection.");
        } else {
          errorMessage += `${t("Error message:")} ${error.message}`;
        }

        showAlert(t("Error"), errorMessage);

        // Set some default expertises for testing
        setExpertises([
          { id: 1, title: t("Hardware user") },
          { id: 2, title: t("Software user") },
          { id: 3, title: t("Network user") },
          { id: 4, title: t("Industrial printer / copier user") },
          { id: 5, title: t("General user") },
          { id: 6, title: t("Hard disk user") },
          { id: 7, title: t("CCTV camera user") }
        ]);
      }
    };

    // Call loadExpertises
    loadExpertises();
  }, []); // Empty dependency array - only run once on mount

  // Validate referral code
  const handleValidateReferralCode = async () => {
    if (!formData.other_referral_code) {
      showAlert(t("Error"), t("Please enter the referral code first."));
      return;
    }

    try {
      const result = await validateReferralCode(formData.other_referral_code);
      if (result.success) {
        showAlert(t("Success"), result.data?.message || result.message || t("Referral code is valid."));
      } else {
        let errorMessage = result.message || t("Referral code is invalid.");

        if (result.errors) {
          const errorList = Object.values(result.errors).flat();
          errorMessage += '\n\n' + errorList.join('\n');
        }

        showAlert(t("Error"), errorMessage);
      }
    } catch (error) {
      console.log('Error validating referral code:', error);

      let errorMessage = `${t("Error validating referral code")}\n\n`;

      if (error.response) {
        errorMessage += `${t("Status")}: ${error.response.status}\n`;
        if (error.response.data?.message) {
          errorMessage += `${t("Message:")} ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage += t("Server did not respond. Please check your internet connection.");
      } else {
        errorMessage += `${t("Error message:")} ${error.message}`;
      }

      showAlert(t("Error"), errorMessage);
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
        
        // نمایش پیام کلی بدون جزئیات (چون خطاها زیر فیلدها نمایش داده می‌شوند)
        showAlert(
          t("Form validation error"),
          t("Please complete the highlighted fields."),
          [{ text: t("Ok"), style: 'cancel' }]
        );
        return false;
      }

      console.log('✅ Form validation passed');
      setFieldErrors({}); // پاک کردن خطاها
      return true;
    
    } catch (error) {
      console.log('💥 EXCEPTION in validateForm:', error);
      console.log('💥 Error message:', error.message);
      console.log('💥 Error stack:', error.stack);
      
      showAlert(
        t("System error"),
        `${t("Unexpected validation error:")}\n${error.message}`,
        [{ text: t("Ok"), style: 'cancel' }]
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
          t("Success"),
          result.message || t("Your information was successfully registered."),
          [
            {
              text: t("Confirm"),
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
          errorMessage = t("Unknown error during registration.");
        }

        showAlert(
          t("Registration error"),
          errorMessage,
          [{ text: t("Ok"), style: 'cancel' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.log('❌ Registration exception caught:', error);
      console.log('❌ Error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        stack: error.stack
      });

      // Build detailed error message
      let errorMessage = `${t("Error communicating with server")}\n\n`;

      if (error.response) {
        // Server responded with error
        errorMessage += `${t("Status")}: ${error.response.status}\n`;

        if (error.response.data) {
          if (error.response.data.message) {
            errorMessage += `${t("Message:")} ${error.response.data.message}\n`;
          }

          if (error.response.data.errors) {
            errorMessage += `\n${t("Error details:")}\n`;
            const errorList = Object.entries(error.response.data.errors).map(([field, messages]) => {
              const messageList = Array.isArray(messages) ? messages : [messages];
              return `• ${field}: ${messageList.join(', ')}`;
            });
            errorMessage += errorList.join('\n');
          }
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage += t("Server did not respond. Please check your internet connection.");
      } else {
        // Something else happened
        errorMessage += `${t("Error message:")} ${error.message}`;
      }

      showAlert(
        t("Error"),
        errorMessage,
        [{ text: t("Ok"), style: 'cancel' }],
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
          <Text style={[NewStyles.title4]}>{t("Additional information")}</Text>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formContainer}>

          {/* نام و نام خانوادگی */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Full Name")} <Text style={styles.required}>*</Text> :</Text>
            <TextInput
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10,
                fieldErrors.name && styles.inputError
              ]}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder={t("Example: Ali Ahmadi")}
              placeholderTextColor={PLACEHOLDER_COLOR}
            />
            <FieldError field="name" />
          </View>
          
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Primary phone number")} <Text style={styles.required}>*</Text> :</Text>
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
                placeholderTextColor={PLACEHOLDER_COLOR}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            <FieldError field="phone" />
          </View>

          {/* شماره ملی */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("National ID number")} <Text style={styles.required}>*</Text> :</Text>
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
              placeholderTextColor={PLACEHOLDER_COLOR}
              keyboardType="number-pad"
              maxLength={10}
            />
            <FieldError field="melicode" />
          </View>

          {/* متولد */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Birth date (Jalali)")} <Text style={styles.required}>*</Text> :</Text>
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
                {formData.birth_date || t("Select birth date")}
              </Text>
            </TouchableOpacity>
            <FieldError field="birth_date" />
          </View>

          {/* نام پدر */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Father's name")} <Text style={styles.required}>*</Text> :</Text>
            <TextInput
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10,
                fieldErrors.father_name && styles.inputError
              ]}
              value={formData.father_name}
              onChangeText={(value) => updateField('father_name', value)}
              placeholder=""
              placeholderTextColor={PLACEHOLDER_COLOR}
            />
            <FieldError field="father_name" />
          </View>

          {/* صادره از */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Place of issue")} <Text style={styles.required}>*</Text> :</Text>
            <TextInput
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10,
                fieldErrors.issued_from && styles.inputError
              ]}
              value={formData.issued_from}
              onChangeText={(value) => updateField('issued_from', value)}
              placeholder=""
              placeholderTextColor={PLACEHOLDER_COLOR}
            />
            <FieldError field="issued_from" />
          </View>

          {/* شماره شناسنامه */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Birth certificate number")} <Text style={styles.required}>*</Text> :</Text>
            <TextInput
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10,
                fieldErrors.serial_number && styles.inputError
              ]}
              value={formData.serial_number}
              onChangeText={(value) => updateField('serial_number', value)}
              placeholder=""
              placeholderTextColor={PLACEHOLDER_COLOR}
            />
            <FieldError field="serial_number" />
          </View>

          {/* وضعیت تأهل */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Marital status")} <Text style={styles.required}>*</Text> :</Text>
            <View style={[
              NewStyles.textInput, 
              NewStyles.border10, 
              styles.pickerContainer,
              fieldErrors.marital_status && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.marital_status}
                onValueChange={(value) => updateField('marital_status', value)}
                style={styles.picker}
              >
                <Picker.Item label={t("Married")} value="متأهل" />
                <Picker.Item label={t("Single")} value="مجرد" />
              </Picker>
            </View>
            <FieldError field="marital_status" />
          </View>

          {/* وضعیت سربازی */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Military status")} <Text style={styles.required}>*</Text> :</Text>
            <View style={[
              NewStyles.textInput, 
              NewStyles.border10, 
              styles.pickerContainer,
              fieldErrors.military_status && styles.inputError
            ]}>
              <Picker
                selectedValue={formData.military_status}
                onValueChange={(value) => updateField('military_status', value)}
                style={styles.picker}
              >
                <Picker.Item label={t("Completed service")} value="پایان خدمت" />
                <Picker.Item label={t("Exempt")} value="معاف" />
                <Picker.Item label={t("In service")} value="در حال خدمت" />
              </Picker>
            </View>
            <FieldError field="military_status" />
          </View>

          {/* وضعیت تحصیلات */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Education status")} <Text style={styles.required}>*</Text> :</Text>
            <TextInput
              style={[
                NewStyles.textInput, 
                NewStyles.text10, 
                NewStyles.border10,
                fieldErrors.education_status && styles.inputError
              ]}
              value={formData.education_status}
              onChangeText={(value) => updateField('education_status', value)}
              placeholder=""
              placeholderTextColor={PLACEHOLDER_COLOR}
            />
            <FieldError field="education_status" />
          </View>

          {/* شماره تلفن ثابت */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Landline number (021, 8 digits)")} <Text style={styles.required}>*</Text> :</Text>
            <View style={styles.phoneContainer}>
              <TextInput
                style={[
                  NewStyles.textInput, 
                  NewStyles.text10, 
                  NewStyles.border10, 
                  styles.phoneInput,
                  fieldErrors.telephone && styles.inputError
                ]}
                value={formData.telephone}
                onChangeText={(value) => updateField('telephone', value)}
                placeholder=""
                placeholderTextColor={PLACEHOLDER_COLOR}
                keyboardType="phone-pad"
              />
            </View>
            <FieldError field="telephone" />
          </View>

          {/* شماره تلفن همراه */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Mobile number (11 digits)")} <Text style={styles.required}>*</Text> :</Text>
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
                placeholderTextColor={PLACEHOLDER_COLOR}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            <FieldError field="mobile" />
          </View>

          {/* آدرس ایمیل */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Email Address")} <Text style={styles.required}>*</Text> :</Text>
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
              placeholderTextColor={PLACEHOLDER_COLOR}
              keyboardType="email-address"
            />
            <FieldError field="email" />
          </View>

          

          {/* تاریخ اعتبار گواهینامه */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("License expiry date (Jalali)")} <Text style={styles.required}>*</Text> :</Text>
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
                {formData.licence_date || t("Select expiry date")}
              </Text>
            </TouchableOpacity>
            <FieldError field="licence_date" />
          </View>

          {/* نوع وسیله نقلیه */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Vehicle type")} <Text style={styles.required}>*</Text> :</Text>
            <View style={[NewStyles.textInput, NewStyles.border10, styles.pickerContainer, fieldErrors.vehicle_type && styles.inputError]}>
              <Picker
                selectedValue={formData.vehicle_type}
                onValueChange={(value) => updateField('vehicle_type', value)}
                style={styles.picker}
              >
                <Picker.Item label={t("Select...")} value="" />
                <Picker.Item label={t("Motorcycle")} value="موتور سیکلت" />
                <Picker.Item label={t("Car")} value="خودرو" />
                <Picker.Item label={t("Bicycle")} value="دوچرخه" />
                <Picker.Item label={t("On foot")} value="پیاده" />
              </Picker>
            </View>
            <FieldError field="vehicle_type" />
          </View>

          {/* کد پستی منزل */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Home postal code")} <Text style={styles.required}>*</Text> :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, fieldErrors.home_postal_code && styles.inputError]}
              value={formData.home_postal_code}
              onChangeText={(value) => updateField('home_postal_code', value)}
              placeholder=""
              placeholderTextColor={PLACEHOLDER_COLOR}
              keyboardType="number-pad"
              maxLength={10}
            />
            <FieldError field="home_postal_code" />
          </View>

          {/* شهر + منطقه */}
          <View style={styles.cityRow}>
            <View style={styles.cityContainer}>
              <Text style={[NewStyles.text10]}>{t("City")} <Text style={styles.required}>*</Text> :</Text>
              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, fieldErrors.city && styles.inputError]}
                value={formData.city}
                onChangeText={(value) => updateField('city', value)}
                placeholder={t("Tehran")}
                placeholderTextColor={PLACEHOLDER_COLOR}
              />
              <FieldError field="city" />
            </View>
            <View style={styles.regionContainer}>
              <Text style={[NewStyles.text10]}>{t("Region")} <Text style={styles.required}>*</Text> :</Text>
              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, fieldErrors.region && styles.inputError]}
                value={formData.region}
                keyboardType='number-pad'
                onChangeText={(value) => updateField('region', value)}
                placeholder="5"
                placeholderTextColor={PLACEHOLDER_COLOR}
              />
              <FieldError field="region" />
            </View>
          </View>

          {/* آدرس منزل */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Home address")} <Text style={styles.required}>*</Text> :</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.addressInput, fieldErrors.home_address && styles.inputError]}
              value={formData.home_address}
              onChangeText={(value) => updateField('home_address', value)}
              placeholder=""
              placeholderTextColor={PLACEHOLDER_COLOR}
              multiline
              numberOfLines={3}
            />
            <FieldError field="home_address" />
          </View>

          {/* کد پرسنلی مصرف */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Referrer personnel code")} :</Text>
            <View style={styles.referralContainer}>
              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]}
                value={formData.other_referral_code}
                onChangeText={(value) => updateField('other_referral_code', value)}
                placeholder=""
                placeholderTextColor={PLACEHOLDER_COLOR}
              />
              <TouchableOpacity
                style={styles.validateButton}
                onPress={handleValidateReferralCode}
              >
                <Text style={[NewStyles.text10]}>{t("Verify")}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Navigation Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            // بررسی فیلدهای صفحه اول با اعتبارسنجی کامل
            const errors = {};
            
            // نام و نام خانوادگی - الزامی
            if (!formData.name || formData.name.trim().length === 0) {
              errors.name = t("Full name is required.");
            } else if (formData.name.trim().length < 1) {
              errors.name = t("Full name must be at least 2 characters.");
            }
            
            // شماره ملی - الزامی و باید معتبر باشد
            if (!formData.melicode || formData.melicode.trim().length === 0) {
              errors.melicode = t("National ID number is required.");
            } else if (formData.melicode.length !== 10) {
              errors.melicode = t("National ID must be 10 digits.");
            } else {
              // بررسی معتبر بودن کد ملی
              const allSame = formData.melicode.split('').every(digit => digit === formData.melicode[0]);
              if (allSame) {
                errors.melicode = t("National ID is invalid.");
              } else {
                // بررسی رقم کنترل
                const checkDigit = parseInt(formData.melicode.charAt(9));
                let sum = 0;
                for (let i = 0; i < 9; i++) {
                  sum += parseInt(formData.melicode.charAt(i)) * (10 - i);
                }
                const remainder = sum % 11;
                const expectedCheckDigit = remainder < 2 ? remainder : 11 - remainder;
                if (checkDigit !== expectedCheckDigit) {
                  errors.melicode = t("National ID is invalid.");
                }
              }
            }
            
            // شماره تلفن اصلی - الزامی
            if (!formData.phone || formData.phone.trim().length === 0) {
              errors.phone = t("Primary phone number is required.");
            } else {
              const phoneRegex = /^09[0-9]{9}$/;
              if (!phoneRegex.test(formData.phone)) {
                errors.phone = t("Phone number format is invalid (09xxxxxxxxx).");
              }
            }
            
            // شماره تلفن همراه - الزامی
            if (!formData.mobile || formData.mobile.trim().length === 0) {
              errors.mobile = t("Mobile number is required.");
            } else {
              const mobileRegex = /^09[0-9]{9}$/;
              if (!mobileRegex.test(formData.mobile)) {
                errors.mobile = t("Mobile number format is invalid (09xxxxxxxxx).");
              }
            }
            
            // تاریخ تولد - الزامی
            if (!formData.birth_date || formData.birth_date.trim().length === 0) {
              errors.birth_date = t("Please select your birth date.");
            }
            
            // آدرس ایمیل - الزامی
            if (!formData.email || formData.email.trim().length === 0) {
              errors.email = t("Email address is required.");
            } else {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(formData.email)) {
                errors.email = t("Email format is invalid.");
              }
            }
            
            // تاریخ اعتبار گواهینامه - الزامی
            if (!formData.licence_date || formData.licence_date.trim().length === 0) {
              errors.licence_date = t("Please select the license expiry date.");
            }
            
            // اگر خطا وجود دارد، نمایش بده و از رفتن به مرحله بعدی جلوگیری کن
            if (Object.keys(errors).length > 0) {
              // ذخیره خطاها برای نمایش در فیلدها
              setFieldErrors(errors);
              
              // نمایش پیام کلی (خطاها زیر فیلدها نمایش داده می‌شوند)
              showAlert(
                t("Form information error"),
                t("Please complete the fields marked in red."),
                [{ text: t("Ok"), style: 'cancel' }]
              );
              return;
            }
            
            // پاک کردن خطاها و رفتن به مرحله بعدی
            setFieldErrors({});
            setCurrentPage('computer');
          }}
        >
          <Text style={[NewStyles.text10]}>{t("Next - Computer skills")}</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderComputerSkillsPage = () => (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <CustomStatusBar />

      {/* Header */}
      <TouchableOpacity style={[styles.headerButton, styles.headerButtonBg]}>
        <Text style={[NewStyles.title4]}>{t("Computer skills")}</Text>
      </TouchableOpacity>

      {/* Computer Skills Form */}
      <View style={styles.formContainer}>

        {/* لیدز / شفافیت */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>{t("Idea / Creativity")} : <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              NewStyles.textInput, 
              NewStyles.text10, 
              NewStyles.border10,
              fieldErrors.idea && styles.inputError
            ]}
            value={formData.idea}
            onChangeText={(value) => updateField('idea', value)}
            placeholder=""
            placeholderTextColor={PLACEHOLDER_COLOR}
            multiline
            numberOfLines={3}
          />
          <FieldError field="idea" />
        </View>

        {/* تسلط / توانایی ها (نرم افزار) */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>{t("Proficiency / Skills (Software)")} : <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              NewStyles.textInput, 
              NewStyles.text10, 
              NewStyles.border10,
              fieldErrors.software_skill && styles.inputError
            ]}
            value={formData.software_skill}
            onChangeText={(value) => updateField('software_skill', value)}
            placeholder=""
            placeholderTextColor={PLACEHOLDER_COLOR}
            multiline
            numberOfLines={3}
          />
          <FieldError field="software_skill" />
        </View>

        {/* تسلط / توانایی ها (سخت افزار) */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>{t("Proficiency / Skills (Hardware)")} : <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              NewStyles.textInput, 
              NewStyles.text10, 
              NewStyles.border10,
              fieldErrors.hardware_skill && styles.inputError
            ]}
            value={formData.hardware_skill}
            onChangeText={(value) => updateField('hardware_skill', value)}
            placeholder=""
            placeholderTextColor={PLACEHOLDER_COLOR}
            multiline
            numberOfLines={3}
          />
          <FieldError field="hardware_skill" />
        </View>

        {/* تاکاکس / نقطه ضعف (نرم افزار) */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>{t("Weakness / Blind spot (Software)")} : <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              NewStyles.textInput, 
              NewStyles.text10, 
              NewStyles.border10,
              fieldErrors.software_weakness && styles.inputError
            ]}
            value={formData.software_weakness}
            onChangeText={(value) => updateField('software_weakness', value)}
            placeholder=""
            placeholderTextColor={PLACEHOLDER_COLOR}
            multiline
            numberOfLines={3}
          />
          <FieldError field="software_weakness" />
        </View>

        {/* تاکاکس / نقطه ضعف (سخت افزار) */}
        <View style={styles.inputRow}>
          <Text style={[NewStyles.text10]}>{t("Weakness / Blind spots (Hardware)")} : <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              NewStyles.textInput, 
              NewStyles.text10, 
              NewStyles.border10,
              fieldErrors.hardware_weakness && styles.inputError
            ]}
            value={formData.hardware_weakness}
            onChangeText={(value) => updateField('hardware_weakness', value)}
            placeholder=""
            placeholderTextColor={PLACEHOLDER_COLOR}
            multiline
            numberOfLines={3}
          />
          <FieldError field="hardware_weakness" />
        </View>

      </View>

      {/* گرایش فعالیت Header */}
      <TouchableOpacity style={[styles.headerButton, styles.headerButtonBg]}>
        <Text style={[NewStyles.title4]}>{t("Activity focus / Expertise")}</Text>
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
          <Text style={[NewStyles.text10]}>{t("Fetching expertises list...")}</Text>
        )}
        
        <FieldError field="expertise_ids" />
      </View>

      {/* بارگذاری رزومه */}
      <View style={styles.resumeSection}>
        <Text style={[NewStyles.title10]}>{t("Upload resume (optional)")}</Text>
        <Text style={[NewStyles.text10]}>
          {t("You can upload your resume / additional information, signed with the subject (Cooperation / Activity in Loop).")}
        </Text>

        {/* File picker + upload controls */}
        <View style={styles.resumeControls}>
          {resumeFile ? (
            <View style={styles.selectedFileRow}>
              <Text style={[NewStyles.text10]}>
                {resumeFile.name || (resumeFile.uri ? resumeFile.uri.split('/').pop() : t("Selected file"))}
              </Text>
              <TouchableOpacity style={styles.removeFileButton} onPress={() => setResumeFile(null)}>
                <Text style={[NewStyles.text4]}>{t("Remove")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickFileButton} onPress={pickDocument}>
              <Text style={[NewStyles.text10]}>{t("Select resume file")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Submit Button */}
      <Button
        title={submitting ? t("Registering...") : t("Sign Up")}
        onPress={handleSubmit}
        style={styles.submitButton}
        disabled={submitting}
      />

      {submitting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
          <Text style={styles.loadingText}>{t("Submitting information...")}</Text>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentPage('personal')}
      >
        <Text style={styles.backButtonText}>{t("Back to additional information")}</Text>
      </TouchableOpacity>

    </ScrollView>
  );

  // 🌐 Web-specific file picker function
  const pickFileWeb = () => {
    return new Promise((resolve, reject) => {
      try {
        // Create hidden input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        input.style.display = 'none';
        
        input.onchange = (e) => {
          const file = e.target.files[0];
          
          if (!file) {
            resolve({ canceled: true });
            return;
          }
          
          // Read file as base64 for upload
          const reader = new FileReader();
          
          reader.onload = (event) => {
            resolve({
              canceled: false,
              uri: event.target.result, // base64 data URL
              name: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
            });
          };
          
          reader.onerror = (error) => {
            reject(new Error(t("Error reading file")));
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

  // Open document picker to select resume
  const pickDocument = async () => {
    try {
      let result;
      
      // 🌐 Platform-specific file picker
      if (Platform.OS === 'web') {
        console.log('🌐 استفاده از انتخابگر فایل Web');
        result = await pickFileWeb();
      } else {
        console.log('📱 استفاده از DocumentPicker Native');
        result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true
        });
      }

      console.log('📄 نتیجه انتخاب فایل:', JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log('❌ انتخاب فایل لغو شد');
        return;
      }

      // Extract file info based on platform
      let fileInfo;
      if (Platform.OS === 'web') {
        fileInfo = {
          uri: result.uri,
          name: result.name,
          type: result.type || 'application/octet-stream',
          size: result.size,
        };
      } else {
        // Expo DocumentPicker returns different structure based on version
        const file = result.assets ? result.assets[0] : result;
        fileInfo = {
          uri: file.uri,
          name: file.name || file.uri.split('/').pop(),
          type: file.mimeType || file.type || 'application/octet-stream',
          size: file.size
        };
      }

      console.log('✅ فایل انتخاب شد:', fileInfo);

      // Validate file size (max 5MB)
      if (fileInfo.size > 5 * 1024 * 1024) {
        showAlert(
          t("File is too large"),
          t("File size must not exceed 5 MB.")
        );
        return;
      }

      setResumeFile(fileInfo);
      showAlert(t("Success"), t("File \"{{name}}\" selected", { name: fileInfo.name }));

    } catch (err) {
      console.log('❌ خطا در انتخاب فایل:', err);

      let errorMessage = `${t("File selection failed")}\n\n`;
      if (err.message) {
        errorMessage += `${t("Error message:")} ${err.message}`;
      }

      showAlert(t("Error"), errorMessage);
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
      {/* تاریخ تولد: حداکثر 18 سال پیش (حداقل سن 18 سال) */}
      <DatePickerModal
        datePickerModal={birthDateModal}
        setDatePickerModal={setBirthDateModal}
        birthDate={formData.birth_date}
        setBirthDate={(date) => updateField('birth_date', date)}
        maximumDate={maxBirthDate}
        isCurrentDate={maxBirthDate}
      />

      {/* تاریخ اعتبار گواهینامه: حداقل امروز، حداکثر 10 سال بعد */}
      <DatePickerModal
        datePickerModal={licenceDateModal}
        setDatePickerModal={setLicenceDateModal}
        birthDate={formData.licence_date}
        setBirthDate={(date) => updateField('licence_date', date)}
        minimumDate={todayDate}
        maximumDate={tenYearsLater}
        isCurrentDate={todayDate}
      />
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
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
  required: {
    color: '#ff0000',
    fontSize: 14,
    fontWeight: 'bold',
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

