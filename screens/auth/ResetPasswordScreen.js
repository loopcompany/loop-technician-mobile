import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Platform,
  ImageBackground,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import NewStyles from "../../styles/NewStyles";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { themeColor0, themeColor3, themeColor10 } from "../../theme/Color";
import { setToken } from "../../slices/authSlice";
import Button from "../../components/Button";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyResetCode, resetPassword } from "../../services/Api";
import { loginTechnician } from "../../services/Api";

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
  
  const ref = useBlurOnFulfill({ value, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Step 1: Verify the code
  const handleVerifyCode = async () => {
    if (value.length !== 6) {
      Alert.alert("خطا", "لطفاً کد 6 رقمی را وارد کنید");
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
        Alert.alert("خطا", result.message || "کد وارد شده صحیح نمی‌باشد");
      }
    } catch (error) {
      console.error('❌ خطا در تأیید کد:', error);
      setError("خطا در ارتباط با سرور");
      Alert.alert("خطا", "مشکلی در ارتباط با سرور پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("خطا", "رمز عبور باید حداقل 6 کاراکتر باشد");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("خطا", "رمز عبور و تکرار آن یکسان نیستند");
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
        Alert.alert(
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
      } else {
        Alert.alert("خطا", result.message || "مشکلی در تغییر رمز عبور پیش آمد");
      }
    } catch (error) {
      console.error('❌ خطا در تنظیم رمز:', error);
      Alert.alert("خطا", "مشکلی در ارتباط با سرور پیش آمد");
    } finally {
      setLoading(false);
    }
  };
  return (
    <ImageBackground
      source={require("../../assets/background2.jpg")}
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
          <View style={[NewStyles.center, { width: '100%' }]}>
            <Text style={[NewStyles.text10, { marginBottom: 20, fontSize: 16 }]}>
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
            
            <Button
              title={"تأیید کد"}
              loading={loading}
              onPress={handleVerifyCode}
            />
          </View>
        ) : (
          // Step 2: Enter new password
          <View style={[NewStyles.center, { width: '100%', gap: 15 }]}>
            <Text style={[NewStyles.text10, { marginBottom: 10, fontSize: 16 }]}>
              رمز عبور جدید خود را وارد کنید
            </Text>

            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
              placeholder="رمز عبور جدید (حداقل 6 کاراکتر)"
              placeholderTextColor={themeColor10.bgColor(0.9)}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />

            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
              placeholder="تکرار رمز عبور جدید"
              placeholderTextColor={themeColor10.bgColor(0.9)}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />

            <Button
              title={"تغییر رمز عبور"}
              loading={loading}
              onPress={handleResetPassword}
            />
          </View>
        )}
      </ScrollView>
    </ImageBackground>
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
    backgroundColor: "#1f4ed8",
    borderRadius: 5,
    marginHorizontal: 4,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#fff",
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
    color: "#e60000",
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
