import React, { useState, useEffect,useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10, themeColor2, themeColor8, themeColor4, themeColor7 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useSelector, useDispatch } from 'react-redux';
import { updateBankInfo } from '../../services/Api';
import { showAlert } from '../../helpers/Common';
import { fetchUser, setUserData } from '../../slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../../styles/NewStyles';
export default function FinancialInfoScreen({ navigation }) {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user.data?.data?.technician);
  const userToken = useSelector(state => state.auth.token);
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  const [saving, setSaving] = useState(false);


  const [financialData, setFinancialData] = useState({
    shabaNumber: '',
    bankName: '',
    cardNumber: ''
  });

  // Load user financial data from AsyncStorage if not in Redux
  useEffect(() => {
    const loadUserData = async () => {


      // API returns data in format: { technician: {...}, token_info: {...} }


      setFinancialData(prevData => ({
        shabaNumber: userData.bank_shaba_number || prevData.shabaNumber,
        bankName: userData.bank_name || prevData.bankName,
        cardNumber: userData.bank_card_number || prevData.cardNumber
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
      showAlert(t('Error'), t('Invalid IBAN format.\nCorrect format: IR followed by 24 digits\nExample: IR123456789012345678901234'));
      return;
    }

    if (financialData.cardNumber && !validateCardNumber(financialData.cardNumber)) {
      showAlert(t('Error'), t('Card number must be exactly 16 digits.\nExample: 6037991234567890'));
      return;
    }

    if (financialData.bankName && financialData.bankName.length > 100) {
      showAlert(t('Error'), t('Bank name must not exceed 100 characters'));
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


      const result = await updateBankInfo(apiData);

      if (result.success) {
        showAlert(t('Success'), t('Bank information updated successfully.'));

        dispatch(fetchUser(userToken))
      } else {
        showAlert(t('Error'), result.message || t('There was a problem updating.'));
      }
    } catch (error) { 
      showAlert(t('Error'), t('There was an error connecting to the server.'));
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
            title={t('Account / Privacy')}
          />

          <ScrollView contentContainerStyle={styles.container}>

            {/* دکمه اطلاعات مالی */}
            <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
              <Text style={styles.buttonText}>{t('Financial information')}</Text>
            </TouchableOpacity>

            {/* فرم اطلاعات مالی */}
            <View style={styles.formContainer}>

              <View style={styles.inputRow}>
                <Text style={styles.label}>{t('IBAN (IR + 24 digits) :')}</Text>
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
                <Text style={styles.label}>{t('Bank name :')}</Text>
                <TextInput
                  style={styles.input}
                  value={financialData.bankName}
                  onChangeText={(value) => updateField('bankName', value)}
                  placeholder={t('Bank Melli Iran')}
                  maxLength={100}
                  editable={!saving}
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.label}>{t('Card number (16 digits) :')}</Text>
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


              <Button title={t('Save information')} onPress={handleSave} loading={saving} />

            </View>

          </ScrollView>

        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) =>  StyleSheet.create({
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
    ...NewStyles.title4,
    color: themeColor4.bgColor(1),
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 15,
    gap: 15,
  },
  inputRow: {
    marginVertical: 5,
  },
  label: {
    ...NewStyles.text10,
    fontSize: 14,
    color: themeColor10.bgColor(1),
    marginBottom: 8,
    // textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.3),
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: themeColor4.bgColor(1),
    // textAlign: 'right',
    ...NewStyles.text10,
    minHeight: 45,
  },
  saveButton: {
    backgroundColor: themeColor7.bgColor(1),
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: themeColor4.bgColor(1),
  },
  saveButtonText: {
    color: themeColor4.bgColor(1),
    fontSize: 16,
  },
});

