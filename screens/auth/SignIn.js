import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor4, themeColor10 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, ActivityIndicator } from 'react-native';
import { uri as BASE_URI } from '../../services/URL';

export default function SignIn({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    birthDate: '',
    fatherName: '',
    birthCertificate: '',
    idNumber: '',
    maritalStatus: 'متاهل',
    militaryService: 'پایان خدمت',
    educationStatus: '',
    phoneFixed: '',
    phoneMobile: '',
    email: '',
    idCardNumber: '',
    birthCertificateDate: '',
    birthCertificatePlace: '',
    postalCode: '',
    city: 'تهران',
    region: '5',
    address: '',
    consumptionCode: ''
  });

  // resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [currentPage, setCurrentPage] = useState('personal'); // 'personal' or 'computer'

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderPersonalInfoPage = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomStatusBar />
      
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
            value={formData.fullName}
            onChangeText={(value) => updateField('fullName', value)}
            placeholder=""
          />
        </View>

        {/* شماره ملی */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره ملی :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.nationalId}
            onChangeText={(value) => updateField('nationalId', value)}
            placeholder=""
            keyboardType="number-pad"
          />
        </View>

        {/* متولد */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>متولد : روز / ماه / سال</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.birthDate}
            onChangeText={(value) => updateField('birthDate', value)}
            placeholder=""
          />
        </View>

        {/* نام پدر */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>نام پدر :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.fatherName}
            onChangeText={(value) => updateField('fatherName', value)}
            placeholder=""
          />
        </View>

        {/* صادره از */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>صادره از :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.birthCertificate}
            onChangeText={(value) => updateField('birthCertificate', value)}
            placeholder=""
          />
        </View>

        {/* شماره شناسنامه */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره شناسنامه :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.idNumber}
            onChangeText={(value) => updateField('idNumber', value)}
            placeholder=""
          />
        </View>

        {/* وضعیت تأهل */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>وضعیت تأهل :</Text>
          <View style={[NewStyles.textInput, NewStyles.border10, styles.pickerContainer]}>
            <Picker
              selectedValue={formData.maritalStatus}
              onValueChange={(value) => updateField('maritalStatus', value)}
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
              selectedValue={formData.militaryService}
              onValueChange={(value) => updateField('militaryService', value)}
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
            value={formData.educationStatus}
            onChangeText={(value) => updateField('educationStatus', value)}
            placeholder=""
          />
        </View>

        {/* شماره تلفن ثابت */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره تلفن ثابت ۰۲۱ ۸ رقمی :</Text>
          <View style={styles.phoneContainer}>
            <Text style={styles.phonePrefix}>+۹۸ ۰۲۱</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.phoneInput]}
              value={formData.phoneFixed}
              onChangeText={(value) => updateField('phoneFixed', value)}
              placeholder=""
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* شماره تلفن همراه */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>شماره تلفن همراه ۱۰ رقمی :</Text>
          <View style={styles.phoneContainer}>
            <Text style={styles.phonePrefix}>+۹۸ ۰</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.phoneInput]}
              value={formData.phoneMobile}
              onChangeText={(value) => updateField('phoneMobile', value)}
              placeholder=""
              keyboardType="phone-pad"
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
            value={formData.idCardNumber}
            onChangeText={(value) => updateField('idCardNumber', value)}
            placeholder=""
          />
        </View>

        {/* تاریخ اعتبار گواهینامه */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>تاریخ اعتبار گواهینامه :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.birthCertificateDate}
            onChangeText={(value) => updateField('birthCertificateDate', value)}
            placeholder=""
          />
        </View>

        {/* تاریخ صدور گواهینامه */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>تاریخ صدور گواهینامه : روز / ماه / سال</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.birthCertificatePlace}
            onChangeText={(value) => updateField('birthCertificatePlace', value)}
            placeholder=""
          />
        </View>

        {/* نوع وسیله نقلیه */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>نوع وسیله نقلیه : موتور سیکلت / خودرو / دوچرخه / پیاده وسیله</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder=""
          />
        </View>

        {/* کد پستی منزل */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>کد پستی منزل :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.postalCode}
            onChangeText={(value) => updateField('postalCode', value)}
            placeholder=""
            keyboardType="number-pad"
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
            value={formData.address}
            onChangeText={(value) => updateField('address', value)}
            placeholder=""
            multiline
            numberOfLines={3}
          />
        </View>

        {/* کد پرسنلی مصرف */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>کد پرسنلی مصرف :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            value={formData.consumptionCode}
            onChangeText={(value) => updateField('consumptionCode', value)}
            placeholder=""
          />
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
    <ScrollView contentContainerStyle={styles.container}>
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
            placeholder=""
          />
        </View>

        {/* تسلط / توانایی ها (نرم افزار) */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>تسلط / توانایی ها (نرم افزار) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder=""
          />
        </View>

        {/* تسلط / توانایی ها (سخت افزار) */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>تسلط / توانایی ها (سخت افزار) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder=""
          />
        </View>

        {/* تاکاکس / نقطه ضعف (نرم افزار) */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>ناآگاهی / نقطه ضعف (نرم افزار) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder=""
          />
        </View>

        {/* تاکاکس / نقطه ضعف (سخت افزار) */}
        <View style={styles.inputRow}>
          <Text style={styles.label}>ناآگاهی / نقاط ضعف (سخت افزار) :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder=""
          />
        </View>

      </View>

      {/* گرایش فعالیت Header */}
      <TouchableOpacity style={[styles.headerButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
        <Text style={styles.headerButtonText}>گرایش فعالیت</Text>
      </TouchableOpacity>

      {/* Activity Options */}
      <View style={styles.activityContainer}>
        {[
          'کاربر سخت افزار',
          'کاربر نرم افزار', 
          'کاربر شبکه / امنیت شبکه',
          'کاربر پرینتر / کپی صنعتی',
          'کاربر جامع',
          'کاربر هارد دیسک',
          'کاربر دوربین مداربسته'
        ].map((activity, index) => (
          <TouchableOpacity key={index} style={styles.activityButton}>
            <Text style={styles.activityButtonText}>{activity}</Text>
          </TouchableOpacity>
        ))}
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

          <View style={{ marginTop: 10, width: '100%' }}>
            
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <Button
        title="ثبت نام"
        onPress={() => {
          // Handle form submission
          navigation.navigate('LoginScreen');
        }}
        style={styles.submitButton}
      />

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
    <ImageBackground
      source={require('../../assets/background2.jpg')}
      style={styles.background}
    >
      {currentPage === 'personal' ? renderPersonalInfoPage() : renderComputerSkillsPage()}
    </ImageBackground>
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
    marginTop:15
  },
  headerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 20,
    gap: 12,
  },
  inputRow: {
    marginVertical: 3,
  },
  label: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'right',
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
});
