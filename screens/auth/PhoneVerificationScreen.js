import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import { verifyPhoneNumber, resendVerificationCode } from '../../services/Api';
import { formatTime, showAlert } from '../../helpers/Common';

export default function PhoneVerificationScreen({ navigation, route }) {
  const { phone, technicianId } = route.params;
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);

  // CodeField hooks
  const ref = useBlurOnFulfill({ value: verificationCode, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: verificationCode,
    setValue: setVerificationCode,
  });

  // Timer for resend button
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto-submit when code is complete
  useEffect(() => {
    if (verificationCode.length === 6) {
      handleVerifyCode();
    }
  }, [verificationCode]);

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('لطفاً کد 6 رقمی را کامل وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyPhoneNumber(phone, verificationCode);

      if (result.success) {
        showAlert(
          'موفقیت',
          result.message || 'ثبت نام با موفقیت انجام شد',
          [
            {
              text: 'تایید',
              onPress: () => {
                // Navigate to login screen
                navigation.navigate('Login', {
                  phone,
                  verified: true,
                });
              },
            },
          ]
        );
      } else {
        setError(result.message || 'کد وارد شده صحیح نیست');
        setVerificationCode('');
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      let errorMessage = 'خطا در تأیید شماره تلفن';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors) {
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = validationErrors[0] || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      setError(errorMessage);
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');
    
    try {
      const result = await resendVerificationCode(phone);

      if (result.success) {
        showAlert('موفقیت', result.message || 'کد تأیید مجدداً ارسال شد');
        setTimer(120);
        setCanResend(false);
        setVerificationCode('');
      } else {
        setError(result.message || 'خطا در ارسال مجدد کد');
      }
    } catch (error) {
      console.error('Resend error:', error);
      
      let errorMessage = 'خطا در ارسال مجدد کد';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors) {
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = validationErrors[0] || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMobile = () => {
    showAlert(
      'ویرایش شماره موبایل',
      'آیا می‌خواهید شماره موبایل را ویرایش کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        { text: 'بله', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <ImageBackground
        source={require('../../assets/background2.jpg')}
        style={styles.background}
      >
        <CustomStatusBar />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.card, NewStyles.center]}>
              {/* Instructions */}
              <View style={styles.instructionContainer}>
                <Text style={NewStyles.title4}>
                  کد تأیید ارسال شده را وارد کنید
                </Text>
                <Text style={NewStyles.text4}>
                  کد 6 رقمی به شماره موبایل
                </Text>
                <TouchableOpacity onPress={handleEditMobile}>
                  <Text style={styles.mobileNumber}>
                    {phone}
                  </Text>
                </TouchableOpacity>
                <Text style={NewStyles.text4}>
                  ارسال شده است
                </Text>
              </View>

              {/* Code Input Field */}
              <View style={styles.codeContainer}>
                <CodeField
                  ref={ref}
                  {...props}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  cellCount={6}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete={Platform.select({
                    android: 'sms-otp',
                    default: 'one-time-code',
                  })}
                  renderCell={({ index, symbol, isFocused }) => (
                    <Text
                      key={index}
                      style={[
                        styles.codeCell,
                        isFocused && styles.codeCellFocused,
                        NewStyles.border10
                      ]}
                      onLayout={getCellOnLayoutHandler(index)}
                    >
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  )}
                />
              </View>

              {/* Error Message */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Timer and Resend */}
              <View style={styles.timerContainer}>
                {!canResend ? (
                  <Text style={NewStyles.text4}>
                    ارسال مجدد کد در {formatTime(timer)}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={loading}
                    style={styles.resendButton}
                  >
                    <Text style={styles.resendButtonText}>
                      ارسال مجدد کد
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <Button
                title="تأیید"
                loading={loading}
                onPress={handleVerifyCode}
                style={styles.verifyButton}
              />

              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={NewStyles.text1}>بازگشت به صفحه ثبت نام</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    width: '95%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionContainer: {
    alignItems: 'center',
    gap: 8,
  },
  mobileNumber: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: themeColor1.bgColor(1),
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  codeCell: {
    width: 45,
    height: 50,
    backgroundColor: themeColor3.bgColor(0.7),
    fontSize: 20,
    color: themeColor0.bgColor(1),
    fontFamily: 'VazirBold',
    textAlign: 'center',
    lineHeight: 50,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  codeCellFocused: {
    borderColor: themeColor1.bgColor(1),
    backgroundColor: themeColor3.bgColor(0.9),
  },
  errorText: {
    color: '#ff4444',
    fontFamily: 'VazirLight',
    fontSize: 14,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeColor1.bgColor(1),
    borderRadius: 8,
  },
  resendButtonText: {
    fontSize: 14,
    fontFamily: 'VazirBold',
    color: themeColor1.bgColor(1),
  },
  verifyButton: {
    width: '100%',
    marginTop: 10,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: themeColor10.bgColor(0.7),
  },
});

