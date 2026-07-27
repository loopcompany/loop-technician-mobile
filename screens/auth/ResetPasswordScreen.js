import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import NewStyles from "../../styles/NewStyles";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { themeColor0, themeColor3, themeColor10, themeColor2, themeColor4, themeColor6 } from "../../theme/Color";
import { setToken } from "../../slices/authSlice";
import { setUserData } from "../../slices/userSlice";
import Button from "../../components/Button";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyResetCode, resetPassword, requestPasswordReset } from "../../services/Api";
import { loginTechnician } from "../../services/Api";
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from "../../helpers/Common";
import { ImageBackground } from "react-native";
import { useTranslation } from "react-i18next";
import {
  restartOtpRetriever,
  startOtpRetriever,
  stopOtpRetriever,
  subscribeOtp,
} from './OtpRetriever';
export default function ResetPasswordScreen({ navigation, route }) {
  const params = route?.params;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const hashApp = useSelector(state => state.hashApp?.hash);

  // Step 1: Verify Code
  const [step, setStep] = useState(1); // 1: verify code, 2: set new password
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // Step 2: New Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Resend code timer
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const ref = useBlurOnFulfill({ value, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    const unsubscribe = subscribeOtp((otp) => {
      setValue(otp);
      setError('');
    });

    startOtpRetriever().catch((error) => {
      console.log('SMS Retriever start error:', error);
    });

    return () => {
      unsubscribe();
      stopOtpRetriever({ clearPending: true });
    };
  }, []);

  // Timer for resend button
  useEffect(() => {
    let interval;
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);

  // Resend code
  const handleResendCode = async () => {
    setLoading(true);
    setValue('');
    setError('');
    console.log('🔄 ارسال مجدد کد بازیابی رمز...');
    console.log('پارامترهای دریافت شده:', params);

    try {
      await restartOtpRetriever();

      const result = await requestPasswordReset({
        referral_code: params?.referralCode || '',
        phone: params?.phone || '',
        melicode: params?.melicode || '',
        email: params?.email || '',
        hashApp: hashApp?.[0] ?? '',
      });

      console.log('📦 نتیجه ارسال مجدد:', result);

      if (result.success) {
        showAlert(t("Success"), t("Verification code resent"), [], t);
        setValue(""); // Clear the code field
        setError("");
        setResendTimer(60); // Reset timer
        setCanResend(false);
      } else {
        stopOtpRetriever({ clearPending: true });
        showAlert(t("Error"), result.message || t("Error resending code"), [], t);
      }
    } catch (error) {
      stopOtpRetriever({ clearPending: true });
      console.log('❌ خطا در ارسال مجدد کد:', error);
      showAlert(t("Error"), t("Error communicating with server"), [], t);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify the code
  const handleVerifyCode = async () => {
    if (value.length !== 6) {
      showAlert(t("Error"), t("Please enter the complete 6-digit code"), [], t);
      return;
    }

    setLoading(true);
    console.log('🔄 تأیید کد بازیابی رمز...');

    try {
      const result = await verifyResetCode({
        phone: params?.phone,
        code: value,
      });

      console.log('📦 نتیجه تأیید کد:', result);

      if (result.success) {
        stopOtpRetriever({ clearPending: true });
        setError("");
        console.log('✅ کد تأیید شد، انتقال به مرحله تنظیم رمز جدید');
        setStep(2); // Move to password setting step
      } else {
        setError(t("The code entered is incorrect"));
        showAlert(t("Error"), result.message || t("The code entered is incorrect"), [], t);
      }
    } catch (error) {
      console.log('❌ خطا در تأیید کد:', error);
      setError(t("Error communicating with server"));
      showAlert(t("Error"), t("Error communicating with server"), [], t);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showAlert(t("Error"), t("Password must be at least 6 characters"), [], t);
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert(t("Error"), t("Password and repeat password do not match."), [], t);
      return;
    }

    setLoading(true);
    console.log('🔄 تنظیم رمز عبور جدید...');

    try {
      const result = await resetPassword({
        phone: params?.phone,
        code: value, // ارسال کد verification نیز
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      console.log('📦 نتیجه تنظیم رمز:', result);

      if (result.success) {
        // Password reset successful - now auto-login with new password
        try {
          const loginResult = await loginTechnician({
            referralCode: params?.referralCode,
            password: newPassword,
          });

          if (loginResult.success && loginResult.data?.token) {
            // Save token to AsyncStorage and Redux
            await AsyncStorage.setItem('userToken', loginResult.data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(loginResult.data));
            dispatch(setToken(loginResult.data.token));
            dispatch(setUserData(loginResult.data));

            showAlert(
              t("Success"),
              t("Your password was changed successfully and you are now logged in."),
              [
                {
                  text: t("Confirm"),
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'FolderScreen' }],
                    });
                  },
                },
              ],
              t
            );
          } else {
            // Login failed, navigate to login screen
            showAlert(
              t("Success"),
              t("Your password has been successfully changed. Please log in with the new information."),
              [
                {
                  text: t("Confirm"),
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  },
                },
              ],
              t
            );
          }
        } catch (loginError) {
          console.log('❌ خطا در ورود خودکار:', loginError);
          // Login failed, navigate to login screen
          showAlert(
            t("Success"),
            t("Your password has been successfully changed. Please log in with the new information."),
            [
              {
                text: t("Confirm"),
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                },
              },
            ],
            t
          );
        }
      } else {
        showAlert(t("Error"), result.message || t("Error changing password"), [], t);
      }
    } catch (error) {
      console.log('❌ خطا در تنظیم رمز:', error);
      showAlert(t("Error"), t("Error communicating with server"), [], t);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ImageBackground
          source={Platform.OS === 'web' ? require("../../assets/loopbackground.webp") : require("../../assets/moon.jpg")}
          style={styles.background}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            {/* لوگو */}
            <Image
              source={require("../../assets/logo.png")}
              style={NewStyles.logo}
              resizeMode="contain"
            />

            {step === 1 ? (
              // Step 1: Enter verification code
              <View style={[NewStyles.center, { backgroundColor: themeColor10.bgColor(0.5), height: 300, width: "100%", borderRadius: 15, maxWidth: 800 }]}>
                <Text style={[NewStyles.title1, { marginBottom: 20, fontSize: 17, textAlign: "center", paddingHorizontal: 20 }]}>
                  {t("Enter the 6-digit code sent to {{phone}}", { phone: params?.phone })}
                </Text>

                <CodeField
                  ref={ref}
                  {...props}
                  value={value}
                  onChangeText={(text) => {
                    const normalizedCode = String(text || '').replace(/\D/g, '').slice(0, 6);
                    setValue(normalizedCode);
                    setError("");
                  }}
                  cellCount={6}
                  maxLength={6}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
                  autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                  importantForAutofill={Platform.OS === 'android' ? 'yes' : undefined}
                  renderCell={({ index, symbol, isFocused }) => (
                    <Text
                      key={index}
                      style={[styles.cell, NewStyles.border10]}
                      onLayout={getCellOnLayoutHandler(index)}
                    >
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  )}
                />

                {error && <Text style={[NewStyles.text6, { marginTop: 10 }]}>{error}</Text>}
                {!canResend && <View style={{ paddingVertical: 15, paddingHorizontal: 20, width: "100%" }}>
                  <Button
                    title={t("Confirm code")}
                    loading={loading}
                    onPress={handleVerifyCode}
                  />
                </View>
                }
                {/* Resend Code Button */}
                <View style={{ paddingHorizontal: 20, width: "100%", marginTop: 10 }}>
                  {canResend ? (
                    <Button
                      title={t("Resend Code")}
                      loading={loading}
                      onPress={handleResendCode}

                    />
                  ) : (
                    <Text style={[NewStyles.text4, { textAlign: "center" }]}>
                      {t("Resend code in {{seconds}} seconds", { seconds: resendTimer })}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              // Step 2: Enter new password
              <View style={[NewStyles.center, { gap: 15, backgroundColor: themeColor10.bgColor(0.5), height: "60%", width: "100%", borderRadius: 15, maxWidth: 800 }]}>
                <Text style={[NewStyles.title1, { marginBottom: 10, fontSize: 16 }]}>
                  {t("Enter your new password.")}
                </Text>
                <View style={{ paddingHorizontal: 1, width: "90%", paddingVertical: 15 }}>
                  <TextInput
                    style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                    placeholder={t("New password (minimum 6 characters)")}
                    placeholderTextColor={themeColor10.bgColor(0.9)}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ paddingVertical: 15, paddingHorizontal: 1, width: "90%" }}>
                  <TextInput
                    style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                    placeholder={t("Confirm new password")}
                    placeholderTextColor={themeColor10.bgColor(0.9)}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ paddingVertical: 15, paddingHorizontal: 1, width: "90%" }}>
                  <Button
                    title={t("Change Password")}
                    loading={loading}
                    onPress={handleResetPassword}
                  />

                </View>
              </View>
            )}
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flexGrow: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 20,
  },
  codeContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 80,
    width: "90%",
  },
  codeBox: {
    width: 40,
    height: 50,
    backgroundColor: themeColor2.bgColor(1),
    borderRadius: 5,
    marginHorizontal: 4,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
  },
  input: {
    backgroundColor: themeColor4.bgColor(1),
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    fontSize: 16,
    marginVertical: 10,
    textAlign: "right",
  },
  successText: {
    marginTop: 30,
    color: themeColor6.bgColor(1),
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  cell: {
    width: 40,
    height: 40,
    backgroundColor: themeColor3.bgColor(0.7),
    fontSize: 20,
    color: themeColor0.bgColor(1),
    fontFamily: "VazirLight",
    textAlign: "center",
    lineHeight: 40,
    marginHorizontal: 5,
  },
});


