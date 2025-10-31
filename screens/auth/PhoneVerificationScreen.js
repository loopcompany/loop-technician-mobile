import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
   KeyboardAvoidingView,
   ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor4 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import { verifyPhoneNumber, resendVerificationCode } from '../../services/Api';
import { validateVerificationCode } from '../../utils/validation';


export default function PhoneVerificationScreen({ navigation, route }) {
  const { phone, technicianId } = route.params;
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerifyCode = async () => {
    // Validate input
    const validation = validateVerificationCode(verificationCode);
    if (!validation.isValid) {
      Alert.alert('خطا', validation.message);
      return;
    }

    try {
      setLoading(true);
      const result = await verifyPhoneNumber(phone, verificationCode);

      if (result.success) {
        Alert.alert(
          'موفقیت',
          result.message,
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
        Alert.alert('خطا', result.message);
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('خطا', 'خطا در تأیید شماره تلفن');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      const result = await resendVerificationCode(phone);

      if (result.success) {
        Alert.alert('موفقیت', result.message);
        setCountdown(60);
        setCanResend(false);
        setVerificationCode('');
      } else {
        Alert.alert('خطا', result.message);
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('خطا', 'خطا در ارسال مجدد کد');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
       <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView>
      <CustomStatusBar />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[NewStyles.title10]}>تأیید شماره تلفن</Text>
          <Text style={[NewStyles.text10]}>
            کد تأیید به شماره {phone} ارسال شد
          </Text>
        </View>

        {/* Verification Code Input */}
        <View style={styles.formContainer}>
          <Text style={[NewStyles.text10]}>کد تأیید :</Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.codeInput]}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <Text style={[NewStyles.text10]}>
            کد تأیید 4 تا 6 رقمی که به شماره شما پیامک شده را وارد کنید
          </Text>
        </View>

        {/* Verify Button */}
        <Button
          title={loading ? 'در حال تأیید...' : 'تأیید شماره تلفن'}
          onPress={handleVerifyCode}
          style={styles.verifyButton}
          disabled={loading || verificationCode.length < 4}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
            <Text style={[NewStyles.text10]}>در حال تأیید کد...</Text>
          </View>
        )}

        {/* Resend Section */}
        <View style={styles.resendSection}>
          {!canResend ? (
            <Text style={[NewStyles.text10]}>
              ارسال مجدد کد در {countdown} ثانیه
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color={themeColor1.bgColor(1)} />
              ) : (
                <Text style={[NewStyles.text1]}>ارسال مجدد کد</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[NewStyles.text10]}>بازگشت به صفحه ثبت نام</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themeColor10.bgColor(1),
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: themeColor10.bgColor(1),
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColor10.bgColor(1),
    marginBottom: 10,
    textAlign: 'center',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 5,
    marginBottom: 15,
  },
  hint: {
    fontSize: 14,
    color: themeColor10.bgColor(1),
    textAlign: 'center',
    lineHeight: 20,
  },
  verifyButton: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: themeColor10.bgColor(1),
    marginTop: 10,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  countdownText: {
    fontSize: 14,
    color: themeColor10.bgColor(1),
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resendButtonText: {
    fontSize: 16,
    color: themeColor1.bgColor(1),
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButtonText: {
    fontSize: 14,
    color: themeColor10.bgColor(1),
  },
});