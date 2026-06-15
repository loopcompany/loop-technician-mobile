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
import jalaali from 'jalaali-js';
import {
  registerTechnician,
  getExpertises,
  validateReferralCode,
  testApiConnection,
  testExpertisesEndpoint
} from '../../services/Api';
import { validateTechnicianRegistration } from '../../utils/validation';
import { showAlert, showToastOrAlert } from '../../helpers/Common';
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

const normalizeGregorianDate = (dateString) => {
  // if (!dateString) return '';
  // const safeDate = dateString.slice(0, 10);
  // const parts = safeDate.split('/');
  // if (parts.length !== 3) return safeDate;

  // const [yearText, monthText, dayText] = parts;
  // const year = Number(yearText);
  // const month = Number(monthText);
  // const day = Number(dayText);
  // if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
  //   return safeDate;
  // }

  // if (year <= 1700) {
  //   const gregorian = jalaali.toGregorian(year, month, day);
  //   const gYear = gregorian.gy;
  //   const gMonth = String(gregorian.gm).padStart(2, '0');
  //   const gDay = String(gregorian.gd).padStart(2, '0');
  //   return `${gYear}/${gMonth}/${gDay}`;
  // }

  // return safeDate;
  return dateString
};

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
    education_status: 'دیپلم',
    education_field: '',
    telephone: '',
    mobile: '',
    email: '',
    certificate_expiry_date: '',
    certificate_issue_date: '',
    vehicle_type: '',
    home_postal_code: '',
    city: 'تهران',
    region: '',
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
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const displayBirthDate = useMemo(
    () => normalizeGregorianDate(formData.birth_date),
    [formData.birth_date]
  );
  const displayLicenceDate = useMemo(
    () => normalizeGregorianDate(formData.certificate_expiry_date),
    [formData.certificate_expiry_date]
  );
  const displayCertificateIssueDate = useMemo(
    () => normalizeGregorianDate(formData.certificate_issue_date),
    [formData.certificate_issue_date]
  );
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
  const [certificateIssueDateModal, setCertificateIssueDateModal] = useState(false);

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
    // if (!formData.other_referral_code) {
    //   showAlert(t("Error"), t("Please enter the referral code first."));
    //   return;
    // }

    try {
      const result = await validateReferralCode(formData.other_referral_code);

      if (result?.data?.is_valid) {
        return true;
        // showAlert(t("Success"), result.data?.message || result.message || t("Referral code is valid."));
      } else {
        let errorMessage = result?.data?.message || t("Referral code is invalid.");

        // if (result.errors) {
        //   const errorList = Object.values(result.errors).flat();
        //   errorMessage += '\n\n' + errorList.join('\n');
        // }
        showToastOrAlert(errorMessage)
        return false
      }
    } catch (error) {
      // console.log('Error validating referral code:', error);

      let errorMessage = `${t("Error validating referral code")}`;

      // if (error.response) {
      //   errorMessage += `${t("Status")}: ${error.response.status}\n`;
      //   if (error.response.data?.message) {
      //     errorMessage += `${t("Message:")} ${error.response.data.message}`;
      //   }
      // } else if (error.request) {
      //   errorMessage += t("Server did not respond. Please check your internet connection.");
      // } else {
      //   errorMessage += `${t("Error message:")} ${error.message}`;
      // }

      // showAlert(t("Error"), errorMessage);
      showToastOrAlert(errorMessage)
      return false
    }
  };

  // Form validation با نمایش دقیق خطاها
  const validateForm = () => {
    try {

      const validation = validateTechnicianRegistration(formData, currentPage);


      if (!validation.isValid) {
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
      setFieldErrors({}); // پاک کردن خطاها
      return true;

    } catch (error) {

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

    const validationResult = validateForm();

    if (!validationResult) {
      return;
    }

    try {
      setSubmitting(true);
      const apiFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'expertise_ids' && Array.isArray(formData[key])) {
          return;
        }
        if (key === 'resume') {
          return;
        }
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          apiFormData.append(key, formData[key]);
        }
      });
      if (formData.mobile) {
        apiFormData.append('mobile', formData.mobile);
      }
      if (formData.expertise_ids && formData.expertise_ids.length > 0) {
        formData.expertise_ids.forEach(id => {
          apiFormData.append('expertise_ids[]', id);
        });
      }
      const result = await registerTechnician(apiFormData, resumeFile);

      if (result.success) {
        showAlert(
          t("Success"),
          result.message || t("Your information was successfully registered."),
          [
            {
              text: t("Confirm"),
              onPress: () => {
                // Navigate to phone verification screen
                navigation.navigate('PhoneVerification', {
                  phone: formData.phone,
                  technicianId: result.data.technician_id
                });
              }
            }
          ]
        );
      } else {
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
            <Text style={[NewStyles.text10]}>{t("First name and last name")} <Text style={styles.required}>*</Text> :</Text>
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
                {displayBirthDate || t("Select birth date")}
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
             
            <Picker
              selectedValue={formData.education_status}
              onValueChange={(value) => updateField('education_status', value)}
              style={styles.picker}
            >
              <Picker.Item label={t("Diploma")} value="دیپلم" />
              <Picker.Item label={t("Post graduate")} value="فوق دیپلم" />
              <Picker.Item label={t("Bachelor's degree")} value="لیسانس" />
              <Picker.Item label={t("Master's degree")} value="فوق لیسانس" />
              <Picker.Item label={t("Ph.D")} value="دکتری" />
            </Picker>
            <FieldError field="education_status" />
          </View>
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Education field")} <Text style={styles.required}>*</Text> :</Text>
            <TextInput
              style={[
                NewStyles.textInput,
                NewStyles.text10,
                NewStyles.border10,
                fieldErrors.education_field && styles.inputError
              ]}
              value={formData.education_field}
              onChangeText={(value) => updateField('education_field', value)}
              placeholder=""
              placeholderTextColor={PLACEHOLDER_COLOR}
            />
            <FieldError field="education_field" />
          </View>

          {/* شماره تلفن ثابت */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Landline number (021, 8 digits)")} <Text style={styles.required}>*</Text> :</Text>
            <View style={[styles.phoneContainer, { backgroundColor: themeColor4.bgColor(1) }, NewStyles.border10]}>

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
                maxLength={8}
              />
              <Text style={[NewStyles.text10, { paddingHorizontal: 10 }]}>021</Text>

            </View>
            <FieldError field="telephone" />
          </View>
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Mobile number (11 digits)")} <Text style={styles.required}>*</Text> :</Text>
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
          {/* شماره تلفن همراه */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Second mobile number (optional)")} :</Text>
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
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("License number")} :</Text>
            <TextInput
              style={[
                NewStyles.textInput,
                NewStyles.text10,
                NewStyles.border10,
                fieldErrors.certificate_number && styles.inputError
              ]}
              value={formData.certificate_number}
              onChangeText={(value) => updateField('certificate_number', value)}
              placeholder="123456789"
              placeholderTextColor={PLACEHOLDER_COLOR}
              keyboardType="number-pad"
            />
            <FieldError field="certificate_number" />
          </View>



          {/* تاریخ اعتبار گواهینامه */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("License expiry date (Jalali)")} :</Text>
            <TouchableOpacity
              style={[
                NewStyles.textInput,
                NewStyles.text10,
                NewStyles.border10,
                styles.datePickerTouchable,
                fieldErrors.certificate_expiry_date && styles.inputError
              ]}
              onPress={() => setLicenceDateModal(true)}
            >
              <Text style={[NewStyles.text10, formData.certificate_expiry_date ? styles.dateTextFull : styles.dateTextHalf]}>
                {displayLicenceDate || t("Select expiry date")}
              </Text>
            </TouchableOpacity>
            <FieldError field="certificate_expiry_date" />
          </View>
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("License issue date")} :</Text>
            <TouchableOpacity
              style={[
                NewStyles.textInput,
                NewStyles.text10,
                NewStyles.border10,
                styles.datePickerTouchable,
                fieldErrors.certificate_issue_date && styles.inputError
              ]}
              onPress={() => setCertificateIssueDateModal(true)}
            >
              <Text style={[NewStyles.text10, formData.certificate_issue_date ? styles.dateTextFull : styles.dateTextHalf]}>
                {displayCertificateIssueDate || t('License issue date: 1400/05/15')}
              </Text>
            </TouchableOpacity>
            <FieldError field="certificate_issue_date" />
          </View>

          {/* نوع وسیله نقلیه */}
          <View style={styles.inputRow}>
            <Text style={[NewStyles.text10]}>{t("Vehicle type")} :</Text>
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

            <View style={styles.regionContainer}>
              <Text style={[NewStyles.text10]}>{t("Region")} <Text style={styles.required}>*</Text> :</Text>
              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, fieldErrors.region && styles.inputError]}
                value={formData.region}
                keyboardType='number-pad'
                onChangeText={(value) => updateField('region', value)}
                placeholderTextColor={PLACEHOLDER_COLOR}
              />
              <FieldError field="region" />
            </View>

            <View style={styles.cityContainer}>
              <Text style={[NewStyles.text10]}>{t("City")} <Text style={styles.required}>*</Text> :</Text>
              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, fieldErrors.city && styles.inputError]}
                value={t(formData.city)}
                onChangeText={(value) => updateField('city', value)}
                placeholder={t("Tehran")}
                editable={false}
                placeholderTextColor={PLACEHOLDER_COLOR}
              />
              <FieldError field="city" />
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

            </View>
          </View>

        </View>

        {/* Navigation Button */}
        <TouchableOpacity
          style={[styles.nextButton, NewStyles.center]}
          onPress={async () => {
            if (formData?.other_referral_code) {
              const code_check = await handleValidateReferralCode()
              console.log(code_check, 'sss');

              if (!code_check) {
                return;
              }
            }

            const { isValid, errors } = validateTechnicianRegistration(formData, currentPage);

            if (!isValid) {

              setFieldErrors(errors);
              return;
            } else {
              setFieldErrors({});
              setCurrentPage('computer');
            }
          }}
        >
          <Text style={[NewStyles.text10, { textAlign: 'center', width: '100%' }]}>{t("Next - Computer skills")}</Text>
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
        <Text style={[NewStyles.title10]}>{t("Upload resume")} <Text style={NewStyles.title6}>*</Text></Text>
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

        <FieldError field="resume" />
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
        updateField('resume', result.uri);
      } else {
        // Expo DocumentPicker returns different structure based on version
        const file = result.assets ? result.assets[0] : result;
        fileInfo = {
          uri: file.uri,
          name: file.name || file.uri.split('/').pop(),
          type: file.mimeType || file.type || 'application/octet-stream',
          size: file.size
        };
        updateField('resume', file?.uri); // Store file info in form data for validation
      }

      // Validate file size (max 5MB)
      if (fileInfo.size > 5 * 1024 * 1024) {
        showAlert(
          t("File is too large"),
          t("File size must not exceed 5 MB.")
        );
        return;
      }

      console.log("fileInfo:", fileInfo);
      
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
    <SafeAreaView style={NewStyles.container} edges={{ top: 'additive', bottom: 'additive' }}>
      <ImageBackground
        source={Platform.OS === 'web' ? require('../../assets/loopbackground.webp') : require('../../assets/moon.jpg')}
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
        setBirthDate={(date) => updateField('birth_date', normalizeGregorianDate(date))}
        maximumDate={'1386/12/29'}
        isCurrentDate={'1386/12/29'}
        minimumDate={'1364/01/01'}
      />

      {/* تاریخ اعتبار گواهینامه: حداقل امروز، حداکثر 10 سال بعد */}
      <DatePickerModal
        datePickerModal={licenceDateModal}
        setDatePickerModal={setLicenceDateModal}
        birthDate={formData.certificate_expiry_date}
        setBirthDate={(date) => updateField('certificate_expiry_date', normalizeGregorianDate(date))}
        minimumDate={todayDate}
        maximumDate={tenYearsLater}
        isCurrentDate={todayDate}
      />
      <DatePickerModal
        datePickerModal={certificateIssueDateModal}
        setDatePickerModal={setCertificateIssueDateModal}
        birthDate={formData.certificate_issue_date}
        setBirthDate={(date) => updateField('certificate_issue_date', normalizeGregorianDate(date))}
        maximumDate={todayDate}
        isCurrentDate={todayDate}
      />
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: {
    flex: 1,
    width:'100%'
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 15,
    width: '90%',
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
    ...NewStyles.row,
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
    borderRadius: 10,
    marginTop: 20,
    width: '100%'
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
  },
  phoneContainerAlt: {
    ...NewStyles.row,
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
  },
  phoneInputAlt: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 12,
  },
});

