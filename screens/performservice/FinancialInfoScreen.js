import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10, themeColor2, themeColor8 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useSelector, useDispatch } from 'react-redux';
import { updateBankInfo } from '../../services/Api';
import { setUserData } from '../../slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function FinancialInfoScreen({ navigation }) {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user.data);
  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [financialData, setFinancialData] = useState({
    shabaNumber: '',
    bankName: '',
    cardNumber: ''
  });

  // Load user financial data from AsyncStorage if not in Redux
  useEffect(() => {
    const loadUserData = async () => {
      // If no data in Redux, try to load from AsyncStorage
      if (!userData) {
        console.log('⚠️ userData در Redux خالی است، از AsyncStorage می‌خوانیم...');
        setIsLoadingData(true);
        try {
          const storedData = await AsyncStorage.getItem('userData');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log('✅ داده از AsyncStorage خوانده شد');
            dispatch(setUserData(parsedData));
          }
        } catch (error) {
          console.error('خطا در خواندن از AsyncStorage:', error);
        } finally {
          setIsLoadingData(false);
        }
        return;
      }

      // API returns data in format: { technician: {...}, token_info: {...} }
      const technicianData = userData.technician || userData;
      
      setFinancialData(prevData => ({
        shabaNumber: technicianData.bank_shaba_number || prevData.shabaNumber,
        bankName: technicianData.bank_name || prevData.bankName,
        cardNumber: technicianData.bank_card_number || prevData.cardNumber
      }));
    };
    
    loadUserData();
  }, [userData, dispatch]);

  const updateField = (field, value) => {
    setFinancialData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate IBAN (Shaba) format
  const validateShaba = (shaba) => {
    if (!shaba) return true; // Optional field
    // Format: IR + 24 digits
    const shabaRegex = /^IR\d{24}$/;
    return shabaRegex.test(shaba);
  };

  // Validate card number format
  const validateCardNumber = (card) => {
    if (!card) return true; // Optional field
    // Exactly 16 digits
    const cardRegex = /^\d{16}$/;
    return cardRegex.test(card);
  };

  // Save bank info
  const handleSave = async () => {
    // Validation
    if (financialData.shabaNumber && !validateShaba(financialData.shabaNumber)) {
      Alert.alert('خطا', 'فرمت شماره شبا نامعتبر است.\nفرمت صحیح: IR به همراه 24 رقم\nمثال: IR123456789012345678901234');
      return;
    }

    if (financialData.cardNumber && !validateCardNumber(financialData.cardNumber)) {
      Alert.alert('خطا', 'شماره کارت باید دقیقاً 16 رقم باشد.\nمثال: 6037991234567890');
      return;
    }

    if (financialData.bankName && financialData.bankName.length > 100) {
      Alert.alert('خطا', 'نام بانک نباید بیشتر از 100 کاراکتر باشد');
      return;
    }

    setSaving(true);
    try {
      // Prepare data in format expected by Backend
      const apiData = {
        bank_shaba_number: financialData.shabaNumber || null,
        bank_name: financialData.bankName || null,
        bank_card_number: financialData.cardNumber || null,
      };

      console.log('📤 ارسال داده به API:', apiData);

      const result = await updateBankInfo(apiData);
      
      if (result.success) {
        Alert.alert('موفق', 'اطلاعات بانکی با موفقیت به‌روزرسانی شد');
        
        // Update Redux with new data
        if (result.data && result.data.technician) {
          const updatedUserData = {
            ...userData,
            technician: {
              ...userData.technician,
              ...result.data.technician
            }
          };
          
          // Update Redux
          dispatch(setUserData(updatedUserData));
          
          // ⭐ IMPORTANT: Update AsyncStorage as well!
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
          console.log('✅ AsyncStorage هم به‌روز شد');
        }
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
     <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
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
        
        {/* دکمه اطلاعات مالی */}
        <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
          <Text style={styles.buttonText}>اطلاعات مالی</Text>
        </TouchableOpacity>

        {/* فرم اطلاعات مالی */}
        <View style={styles.formContainer}>
          
          <View style={styles.inputRow}>
            <Text style={styles.label}>شماره شبا (IR + 24 رقم) :</Text>
            <TextInput
              style={styles.input}
              value={financialData.shabaNumber}
              onChangeText={(value) => updateField('shabaNumber', value.toUpperCase())}
              placeholder="IR123456789012345678901234"
              maxLength={26}
              editable={!saving}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>نام بانک :</Text>
            <TextInput
              style={styles.input}
              value={financialData.bankName}
              onChangeText={(value) => updateField('bankName', value)}
              placeholder="بانک ملی ایران"
              maxLength={100}
              editable={!saving}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>شماره کارت (16 رقم) :</Text>
            <TextInput
              style={styles.input}
              value={financialData.cardNumber}
              onChangeText={(value) => updateField('cardNumber', value.replace(/[^0-9]/g, ''))}
              placeholder="6037991234567890"
              keyboardType="numeric"
              maxLength={16}
              editable={!saving}
            />
          </View>

          {/* دکمه ثبت */}
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>ثبت اطلاعات</Text>
            )}
          </TouchableOpacity>

        </View>

      </ScrollView>
    
    </LinearGradient>
  </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 15,
  },
  mainButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    gap: 15,
  },
  inputRow: {
    marginVertical: 5,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'right',
    minHeight: 45,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});