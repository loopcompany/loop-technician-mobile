import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  ImageBackground,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import TransparentButton from "../../components/TransparentButton";
import Button from "../../components/Button";
import CustomStatusBar from "../../components/CustomStatusBar";
import NewStyles from "../../styles/NewStyles";
import { themeColor0, themeColor1, themeColor10 } from "../../theme/Color";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { validateLoginForm } from "../../utils/validation";
import { showAlert } from "../../helpers/Common";

export default function LoginScreen({ navigation, route }) {
  const [phone, setPhone] = useState(route?.params?.phone || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { t } = useTranslation();
  const { login, isLoggedIn } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigation.replace('FolderScreen');
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    // Validate form
    const validation = validateLoginForm(phone, password);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showAlert('خطا', firstError);
      return;
    }

    try {
      setLoading(true);
      const result = await login(phone, password);

      if (result.success) {
        showAlert(
          'موفقیت',
          'ورود با موفقیت انجام شد',
          [
            {
              text: 'تایید',
              onPress: () => navigation.replace('FolderScreen'),
            },
          ]
        );
      } else {
        showAlert('خطا', result.message);
      }
    } catch (error) {
      console.log('Login error:', error);
      showAlert('خطا', 'خطا در ورود به سیستم');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!phone) {
      showAlert('توجه', 'لطفاً ابتدا شماره تلفن خود را وارد کنید');
      return;
    }
    
    navigation.navigate("ResetPasswordScreen", { phone });
  };
  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <CustomStatusBar />
      <ImageBackground
        source={require("../../assets/moon.jpg")}
        style={NewStyles.container}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../../assets/logo.png")}
            style={NewStyles.logo}
            resizeMode={"contain"}
          />

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>شماره تلفن همراه:</Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
              placeholder="09123456789"
              placeholderTextColor={themeColor10.bgColor(0.9)}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>رمز عبور:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]}
                placeholder="رمز عبور خود را وارد کنید"
                placeholderTextColor={themeColor10.bgColor(0.9)}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <Button
            style={styles.loginButton}
            title={loading ? "در حال ورود..." : "ورود"}
            loading={loading}
            onPress={handleLogin}
            disabled={loading || !phone || !password}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
              <Text style={styles.loadingText}>در حال ورود به سیستم...</Text>
            </View>
          )}

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>
              فراموشی رمز عبور
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TransparentButton
            customTextStyle={{ color: themeColor1.bgColor(1) }}
            title={"ثبت نام کاربر جدید"}
            onPress={() => {
              navigation.navigate("SignInScreen");
            }}
            disabled={loading}
          />

          {/* Verification Message */}
          {route?.params?.verified && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>
                ✅ شماره تلفن شما تأیید شد. رمز عبور به شماره شما ارسال شده است.
              </Text>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: themeColor0.bgColor(0.22),
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  eyeText: {
    fontSize: 18,
  },
  loginButton: {
    width: "80%",
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  forgotPasswordButton: {
    paddingVertical: 15,
    marginBottom: 10,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: themeColor1.bgColor(1),
    textDecorationLine: 'underline',
  },
  successMessage: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    lineHeight: 20,
  },
});


