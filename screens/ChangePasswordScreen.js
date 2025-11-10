import React, { useState } from 'react';
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

import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor2, themeColor3, themeColor8 } from '../theme/Color';
import { changePassword } from '../services/Api';
import { showAlert } from '../helpers/Common';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate password strength
  const validatePasswordStrength = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('رمز عبور باید حداقل 8 کاراکتر باشد');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('رمز عبور باید حداقل یک عدد داشته باشد');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('رمز عبور باید حداقل یک نماد (!@#$%^&*...) داشته باشد');
    }
    
    return errors;
  };

  const handleConfirm = async () => {
    // Validation
    if (!currentPassword.trim()) {
      showAlert('خطا', 'لطفاً رمز عبور فعلی را وارد کنید');
      return;
    }

    if (!newPassword.trim()) {
      showAlert('خطا', 'لطفاً رمز عبور جدید را وارد کنید');
      return;
    }

    if (!confirmPassword.trim()) {
      showAlert('خطا', 'لطفاً تکرار رمز عبور جدید را وارد کنید');
      return;
    }

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      showAlert('خطا', 'رمز عبور جدید و تکرار آن مطابقت ندارند');
      return;
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      showAlert('خطا', 'رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد');
      return;
    }

    // Validate password strength
    const strengthErrors = validatePasswordStrength(newPassword);
    if (strengthErrors.length > 0) {
      showAlert(
        'رمز عبور ضعیف است',
        'رمز عبور باید شامل موارد زیر باشد:\n\n' + strengthErrors.map(e => `• ${e}`).join('\n'),
        [{ text: 'متوجه شدم' }]
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
          'موفقیت',
          'رمز عبور با موفقیت تغییر یافت.\n\nلطفاً با رمز جدید وارد شوید.',
          [
            {
              text: 'ورود مجدد',
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
                  console.error('❌ خطا در پاک کردن اطلاعات:', error);
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
          showAlert('خطا', 'رمز عبور فعلی نادرست است');
        } else if (result.error_code === 'SAME_PASSWORD') {
          showAlert('خطا', 'رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد');
        } else if (result.errors) {
          // Show validation errors from backend
          const errorMessages = Object.values(result.errors)
            .flat()
            .join('\n\n');
          showAlert('خطای اعتبارسنجی', errorMessages);
        } else {
          showAlert('خطا', result.message || 'مشکلی در تغییر رمز عبور پیش آمد');
        }
      }
    } catch (error) {
      console.error('❌ خطا در تغییر رمز:', error);
      showAlert('خطا', 'مشکلی در ارتباط با سرور پیش آمد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient 
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'تغییر رمز'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.passwordContainer}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>رمز عبور فعلی</Text>
            <TextInput
              style={styles.passwordInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="رمز عبور فعلی"
              placeholderTextColor={themeColor3.bgColor(1)}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>رمز عبور جدید (حداقل 8 کاراکتر)</Text>
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="رمز عبور جدید"
              placeholderTextColor={themeColor3.bgColor(1)}
              secureTextEntry
              editable={!loading}
            />
            <Text style={styles.passwordHint}>
              باید شامل: حروف بزرگ/کوچک، اعداد و نمادها (!@#$%...)
            </Text>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>تکرار رمز عبور جدید</Text>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="تکرار رمز عبور جدید"
              placeholderTextColor={themeColor3.bgColor(1)}
              secureTextEntry
              editable={!loading}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[NewStyles.text4, styles.confirmButtonText]}>
                تایید رمز
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
    color: '#FFD700',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  inputRow: {
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'right',
  },
  passwordInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlign: 'right',
  },
});
