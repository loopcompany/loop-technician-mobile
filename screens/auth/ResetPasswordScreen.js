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
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyResetCode, resetPassword, requestPasswordReset } from "../../services/Api";
import { loginTechnician } from "../../services/Api";
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from "../../helpers/Common";
import { ImageBackground } from "react-native";
export default function ResetPasswordScreen({ navigation, route }) {
  const params = route?.params;
  const dispatch = useDispatch();

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
    console.log('🔄 ارسال مجدد کد بازیابی رمز...');
    console.log('پارامترهای دریافت شده:', params);

    try {
      const result = await requestPasswordReset({
        referral_code: params?.referralCode || '',
        phone: params?.phone || '',
        melicode: params?.melicode || '',
        email: params?.email || '',
      });

      console.log('📦 نتیجه ارسال مجدد:', result);

      if (result.success) {
        showAlert("موفق", "کد بازیابی مجدداً ارسال شد");
        setValue(""); // Clear the code field
        setError("");
        setResendTimer(60); // Reset timer
        setCanResend(false);
      } else {
        showAlert("خطا", result.message || "مشکلی در ارسال مجدد کد پیش آمد");
      }
    } catch (error) {
      console.error('❌ خطا در ارسال مجدد کد:', error);
      showAlert("خطا", "مشکلی در ارتباط با سرور پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify the code
  const handleVerifyCode = async () => {
    if (value.length !== 6) {
      showAlert("خطا", "لطفاً کد 6 رقمی را وارد کنید");
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
        setError("");
        console.log('✅ کد تأیید شد، انتقال به مرحله تنظیم رمز جدید');
        setStep(2); // Move to password setting step
      } else {
        setError("کد وارد شده صحیح نیست");
        showAlert("خطا", result.message || "کد وارد شده صحیح نمی‌باشد");
      }
    } catch (error) {
      console.error('❌ خطا در تأیید کد:', error);
      setError("خطا در ارتباط با سرور");
      showAlert("خطا", "مشکلی در ارتباط با سرور پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showAlert("خطا", "رمز عبور باید حداقل 6 کاراکتر باشد");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("خطا", "رمز عبور و تکرار آن یکسان نیستند");
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
              "موفق",
              "رمز عبور شما با موفقیت تغییر یافت و وارد شدید.",
              [
                {
                  text: "تأیید",
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'FolderScreen' }],
                    });
                  },
                },
              ]
            );
          } else {
            // Login failed, navigate to login screen
            showAlert(
              "موفق",
              "رمز عبور شما با موفقیت تغییر یافت. لطفاً دوباره وارد شوید.",
              [
                {
                  text: "تأیید",
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  },
                },
              ]
            );
          }
        } catch (loginError) {
          console.error('❌ خطا در ورود خودکار:', loginError);
          // Login failed, navigate to login screen
          showAlert(
            "موفق",
            "رمز عبور شما با موفقیت تغییر یافت. لطفاً دوباره وارد شوید.",
            [
              {
                text: "تأیید",
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                },
              },
            ]
          );
        }
      } else {
        showAlert("خطا", result.message || "مشکلی در تغییر رمز عبور پیش آمد");
      }
    } catch (error) {
      console.error('❌ خطا در تنظیم رمز:', error);
      showAlert("خطا", "مشکلی در ارتباط با سرور پیش آمد");
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ImageBackground
          source={Platform.OS === 'web' ? require("../../assets/webbackground.jpg") : require("../../assets/background2.jpg")}
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
                  کد 6 رقمی ارسال شده به شماره {params?.phone} را وارد کنید
                </Text>

                <CodeField
                  ref={ref}
                  {...props}
                  value={value}
                  onChangeText={(text) => {
                    setValue(text);
                    setError("");
                  }}
                  cellCount={6}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete={Platform.select({
                    android: "sms-otp",
                    default: "one-time-code",
                  })}
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
                    title={"تأیید کد"}
                    loading={loading}
                    onPress={handleVerifyCode}
                  />
                </View>
                }
                {/* Resend Code Button */}
                <View style={{ paddingHorizontal: 20, width: "100%", marginTop: 10 }}>
                  {canResend ? (
                    <Button
                      title={"ارسال مجدد کد"}
                      loading={loading}
                      onPress={handleResendCode}

                    />
                  ) : (
                    <Text style={[NewStyles.text4, { textAlign: "center" }]}>
                      ارسال مجدد کد در {resendTimer} ثانیه
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              // Step 2: Enter new password
              <View style={[NewStyles.center, { gap: 15, backgroundColor: themeColor10.bgColor(0.5), height: "60%", width: "100%", borderRadius: 15, maxWidth: 800 }]}>
                <Text style={[NewStyles.title1, { marginBottom: 10, fontSize: 16 }]}>
                  رمز عبور جدید خود را وارد کنید
                </Text>
                <View style={{ paddingHorizontal: 1, width: "90%", paddingVertical: 15 }}>
                  <TextInput
                    style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                    placeholder="رمز عبور جدید (حداقل 6 کاراکتر)"
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
                    placeholder="تکرار رمز عبور جدید"
                    placeholderTextColor={themeColor10.bgColor(0.9)}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ paddingVertical: 15, paddingHorizontal: 1, width: "90%" }}>
                  <Button
                    title={"تغییر رمز عبور"}
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


