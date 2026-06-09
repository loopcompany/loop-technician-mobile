import React, { useState,useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor3, themeColor4, themeColor8 } from '../theme/Color';
import { changePassword } from '../services/Api';
import { showAlert } from '../helpers/Common';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  // Validate password strength
  const validatePasswordStrength = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push(t('Password must be at least 8 characters'));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('Password must contain at least one uppercase English letter'));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('Password must contain at least one lowercase English letter'));
    }
    if (!/[0-9]/.test(password)) {
      errors.push(t('Password must contain at least one number'));
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(t('Password must contain at least one symbol (!@#$%^&*...)'));
    }
    
    return errors;
  };

  const handleConfirm = async () => {
    // Validation
    if (!currentPassword.trim()) {
      showAlert(t('Error'), t('Please enter your current password.'));
      return;
    }

    if (!newPassword.trim()) {
      showAlert(t('Error'), t('Please enter your new password.'));
      return;
    }

    if (!confirmPassword.trim()) {
      showAlert(t('Error'), t('Please confirm your new password.'));
      return;
    }

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      showAlert(t('Error'), t('Password and repeat password do not match.'));
      return;
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      showAlert(t('Error'), t('New password must not be the same as the current password.'));
      return;
    }

    // Validate password strength
    const strengthErrors = validatePasswordStrength(newPassword);
    if (strengthErrors.length > 0) {
      showAlert(
        t('Weak password'),
        `${t('Password must include the following:')}\n\n${strengthErrors.map(e => `• ${e}`).join('\n')}`,
        [{ text: t('Got it') }]
      );
      return;
    }

    setLoading(true);
    try {
      console.log('📤 ارسال درخواست تغییر رمز عبور به API...');
      
      const result = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });

      console.log('📥 پاسخ API:', result);

      if (result.success) {
        showAlert(
          t('Success'),
          t('Your password has been successfully changed. Please log in with the new information.'),
          [
            {
              text: t('Log in again'),
              onPress: async () => {
                try {
                  // Clear authentication data
                  console.log('🚪 در حال خروج و پاک کردن اطلاعات...');
                  await AsyncStorage.removeItem('userToken');
                  await AsyncStorage.removeItem('userData');
                  
                  // Clear inputs
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  
                  // Navigate to login screen and reset navigation stack
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                  
                  console.log('✅ خروج موفق - هدایت به صفحه ورود');
                } catch (error) {
                  console.log('❌ خطا در پاک کردن اطلاعات:', error);
                  // Even if clearing fails, still navigate to login
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }
              }
            }
          ]
        );
      } else {
        // Handle specific error codes from API
        if (result.error_code === 'INCORRECT_PASSWORD') {
          showAlert(t('Error'), t('Password is incorrect'));
        } else if (result.error_code === 'SAME_PASSWORD') {
          showAlert(t('Error'), t('New password must not be the same as the current password.'));
        } else if (result.errors) {
          // Show validation errors from backend
          const errorMessages = Object.values(result.errors)
            .flat()
            .join('\n\n');
          showAlert(t('Validation error'), errorMessages);
        } else {
          showAlert(t('Error'), result.message || t('Error changing password'));
        }
      }
    } catch (error) {
      console.log('❌ خطا در تغییر رمز:', error);
      showAlert(t('Error'), t('There was an error connecting to the server.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView 
       style={NewStyles.container}
       edges={{top:'off', bottom:'off'}}
    >
      <ScreenHeaders 
        title={t('Change Password')} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.passwordContainer}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('Current password')}</Text>
            <TextInput
              style={styles.passwordInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t('Current password')}
              placeholderTextColor={themeColor10.bgColor(0.5)}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('New password (minimum 8 characters)')}</Text>
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('New password')}
              placeholderTextColor={themeColor10.bgColor(0.5)}
              secureTextEntry
              editable={!loading}
            />
            <Text style={styles.passwordHint}>
              {t('Must include: uppercase/lowercase letters, numbers, and symbols (!@#$%...)')}
            </Text>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('Confirm new password')}</Text>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('Confirm new password')}
              placeholderTextColor={themeColor10.bgColor(0.5)}
              secureTextEntry
              editable={!loading}
            />
          </View>
          
         
          <Button title={t('Confirm Password')} loading={loading} onPress={handleConfirm}/>
        </View>
      </ScrollView>
      

    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: { 
    flex: 1 
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  passwordContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#FFEB3B',
    backgroundColor: 'rgba(255,235,59,0.2)',
  },
  optionContent: {
    alignItems: 'center',
  },
  optionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  optionSubtitle: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordHint: {
    ...NewStyles.text10,
    fontSize: 11,
    marginTop: 4,
    // textAlign: 'right',
  },
  inputRow: {
    marginVertical: 8,
    // alignItems: 'flex-end',
  },
  inputLabel: {
    ...NewStyles.text,
    fontSize: 14,
    marginBottom: 6,
    // textAlign: 'right',
  },
  passwordInput: {
    ...NewStyles.text10,
    width: '100%',
    backgroundColor: themeColor3.bgColor(0.2),
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    // textAlign: 'right',
  },
});
