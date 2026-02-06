import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Text as SvgText, Line, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor10, themeColor7, themeColor2, themeColor6, themeColor9 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginTechnician, validateToken } from '../../services/Api';
import { setToken } from '../../slices/authSlice';
import { fetchUser, setUserData } from '../../slices/userSlice';
import { showToastOrAlert, showAlert } from '../../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function Login() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaMeta, setCaptchaMeta] = useState([]);
  const [noiseMeta, setNoiseMeta] = useState([]);
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('✅ کامپوننت Login بارگذاری شد');
    createNewCaptcha();
    loadSavedCredentials();
  }, []);

  async function loadSavedCredentials() {
    console.log('📂 بارگذاری اطلاعات ذخیره شده...');
    try {
      const savedReferralCode = await AsyncStorage.getItem('savedReferralCode');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      console.log('کد پرسنلی ذخیره شده:', savedReferralCode || 'ندارد');
      if (savedReferralCode && savedPassword) {
        setReferralCode(savedReferralCode);
        setPassword(savedPassword);
        setRememberPassword(true);
        console.log('✅ اطلاعات بارگذاری شد');
      }
    } catch (error) {
      console.log('❌ خطا در بارگذاری اطلاعات:', error);
    }
  }


  function normalizeDigits(s) {
    const persian = {
      '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
      '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
      '۰': '۰', '۱': '۱', '۲': '۲', '۳': '۳', '۴': '۴',
      '۵': '۵', '۶': '۶', '۷': '۷', '۸': '۸', '۹': '۹'
    };
    return s.split('').map(ch => (persian[ch] !== undefined ? persian[ch] : ch)).join('');
  }



  function generateCaptchaCode() {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let s = '';
    for (let i = 0; i < 4; i++) s += persianDigits[Math.floor(Math.random() * 10)];
    return s;
  }

  function createNewCaptcha() {
    console.log('🎨 ساخت کپچای جدید...');
    const code = generateCaptchaCode();
    console.log('کد کپچای جدید:', code);
    const colors = [themeColor2.bgColor(1), themeColor6.bgColor(1), themeColor7.bgColor(1), themeColor9.bgColor(1), themeColor6.bgColor(1)];
    const meta = [];
    for (let i = 0; i < code.length; i++) {
      meta.push({
        rotate: (Math.random() - 0.5) * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        y: 30 + Math.floor((Math.random() - 0.5) * 6),
      });
    }
    const noises = [];
    for (let i = 0; i < 3; i++) {
      noises.push({
        top: Math.floor(Math.random() * 30) + 6,
        left: Math.floor(Math.random() * 60) + 6,
        width: Math.floor(Math.random() * 80) + 30,
        rotate: (Math.random() - 0.5) * 60,
      });
    }
    setCaptcha(code);
    setCaptchaMeta(meta);
    setNoiseMeta(noises);
    setCaptchaInput('');
  }

  function validateInputs() {

    if (!referralCode.trim()) {
      showAlert('خطا', 'لطفاً کد پرسنلی را وارد کنید');
      return false;
    }
    if (referralCode.trim().length < 6) {
      showAlert('خطا', 'کد پرسنلی باید حداقل 6 کاراکتر باشد');
      return false;
    }
    if (!password.trim()) {
      showAlert('خطا', 'لطفاً رمز عبور را وارد کنید');
      return false;
    }
    if (!captchaInput.trim()) {
      showAlert('خطا', 'لطفاً کد امنیتی را وارد کنید');
      return false;
    }
    const normalizedInput = normalizeDigits(captchaInput);
    const normalizedCaptcha = normalizeDigits(captcha);

    if (normalizedInput !== normalizedCaptcha) {
      showAlert(
        'کد امنیتی اشتباه',
        `کد وارد شده: ${captchaInput}\n\nلطفاً کد امنیتی جدید را وارد کنید.`,
        [{ text: 'متوجه شدم', style: 'cancel' }]
      );
      createNewCaptcha();
      return false;
    }
    console.log('✅ اعتبارسنجی موفق');
    return true;
  }

  async function handleLogin() {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const result = await loginTechnician(referralCode.trim(), password.trim());

      if (result.success && result.data?.token) {

        // Save token first
        await AsyncStorage.setItem('userToken', result.data.token);
        dispatch(setToken(result.data.token));
        dispatch(fetchUser(result.data.token));

        // Save credentials if remember me is checked
        if (rememberPassword) {
          await AsyncStorage.setItem('savedReferralCode', referralCode.trim());
          await AsyncStorage.setItem('savedPassword', password.trim());
        } else {
          await AsyncStorage.removeItem('savedReferralCode');
          await AsyncStorage.removeItem('savedPassword');
        }

        showToastOrAlert('موفق', result.message || 'ورود با موفقیت انجام شد');

        navigation.reset({
          index: 0,
          routes: [{ name: 'FolderScreen' }],
        });
      } else {

        // Build detailed error message
        let errorMessage = '';

        if (result.errors && typeof result.errors === 'object') {
          // Format validation errors
          const errorList = Object.entries(result.errors).map(([field, messages]) => {
            const messageList = Array.isArray(messages) ? messages : [messages];
            return `• ${field}: ${messageList.join(', ')}`;
          });
          errorMessage = errorList.join('\n\n');
        } else if (result.message) {
          errorMessage = result.message;
        } else {
          errorMessage = 'خطا در ورود به سیستم';
        }

        showAlert(
          'خطا در ورود',
          errorMessage,
          [{ text: 'متوجه شدم', style: 'cancel' }],
          { cancelable: true }
        );
        createNewCaptcha();
      }
    } catch (error) {

      // Build detailed error message
      let errorMessage = 'خطا در ورود به سیستم\n\n';

      if (error.response) {
        // Server responded with error
        errorMessage += `وضعیت: ${error.response.status}\n`;

        if (error.response.data) {
          if (error.response.data.message) {
            errorMessage += `پیام: ${error.response.data.message}\n`;
          }

          if (error.response.data.errors) {
            errorMessage += '\nجزئیات خطاها:\n';
            const errorList = Object.entries(error.response.data.errors).map(([field, messages]) => {
              const messageList = Array.isArray(messages) ? messages : [messages];
              return `• ${field}: ${messageList.join(', ')}`;
            });
            errorMessage += errorList.join('\n');
          }
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage += 'سرور پاسخی نداد. لطفاً اتصال اینترنت خود را بررسی کنید.';
      } else {
        // Something else happened
        errorMessage += `پیام خطا: ${error.message}`;
      }

      showAlert(
        'خطا',
        errorMessage,
        [{ text: 'متوجه شدم', style: 'cancel' }],
        { cancelable: true }
      );
      createNewCaptcha();
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <ImageBackground source={Platform.OS === 'web' ? require('../../assets/webbackground.jpg') : require('../../assets/background2.jpg')} style={styles.background} resizeMode='cover' >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">

          <ScrollView>
            <CustomStatusBar />
            <View style={styles.spaceContainer}>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
              </View>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                    value={referralCode}
                    onChangeText={setReferralCode}
                    placeholder="کد پرسنلی"
                    placeholderTextColor={themeColor10.bgColor(0.9)}
                    textAlign="center"
                    editable={!isLoading}
                    autoCapitalize="characters"
                    maxLength={20}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.passwordContainer}>
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={themeColor10.bgColor(0.9)} />
                    </TouchableOpacity>
                    <TextInput
                      style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.passwordInputStyle]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="رمز عبور"
                      placeholderTextColor={themeColor10.bgColor(0.9)}
                      secureTextEntry={!showPassword}
                      textAlign="center"
                      editable={!isLoading}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setRememberPassword(!rememberPassword)}
                    disabled={isLoading}
                  >
                    <Text style={styles.checkboxText}>ذخیره رمز عبور</Text>
                    <View style={[styles.checkbox, rememberPassword && styles.checkboxChecked]}>
                      {rememberPassword && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.captchaContainer}>
                  <View style={styles.captchaBox}>
                    <Svg width="140" height="50" viewBox="0 0 140 50">
                      <Rect x="0" y="0" width="140" height="50" rx="6" ry="6" fill={themeColor4.bgColor(1)} />
                      {captchaMeta.map((m, i) => (
                        <SvgText
                          key={`s${i}`}
                          x={15 + i * 30}
                          y={m.y}
                          fontSize="22"
                          fill={m.color}
                          transform={`rotate(${m.rotate} ${15 + i * 30} ${m.y})`}
                        >
                          {captcha[i]}
                        </SvgText>
                      ))}
                      {noiseMeta.map((n, idx) => (
                        <Line
                          key={`n${idx}`}
                          x1={Math.max(2, n.left % 120)}
                          y1={n.top}
                          x2={Math.max(10, (n.left + n.width) % 120)}
                          y2={n.top + 2}
                          stroke={themeColor3.bgColor(1)}
                          strokeWidth="1"
                          opacity="0.4"
                        />
                      ))}
                    </Svg>
                  </View>
                  <TouchableOpacity
                    onPress={createNewCaptcha}
                    style={styles.captchaRefresh}
                    disabled={isLoading}
                  >
                    <Ionicons name="refresh" size={18} color={themeColor10.bgColor(1)} />
                  </TouchableOpacity>

                  <TextInput
                    style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.captchaInput]}
                    value={captchaInput}
                    onChangeText={setCaptchaInput}
                    placeholder="کد امنیتی"
                    placeholderTextColor={themeColor10.bgColor(0.9)}
                    textAlign="center"
                    editable={!isLoading}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <View style={styles.buttonContainer}>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={themeColor7.bgColor(1)} />
                      <Text style={styles.loadingText}>در حال ورود...</Text>
                    </View>
                  ) : (
                    <Button
                      title="ورود"
                      onPress={() => {
                        console.log('🔘 دکمه ورود کلیک شد');
                        handleLogin();
                      }}
                      style={styles.loginButtonCustom}
                    />
                  )}
                </View>

              </View>

              <View style={styles.bottomSection}>
                <TouchableOpacity
                  onPress={() => { navigation.navigate("SignInScreen") }}
                  disabled={isLoading}
                >
                  <Text style={styles.bottomSubtitle}>رمز عبور خود را فراموش کرده اید؟</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { navigation.navigate("SignIn") }}
                  disabled={isLoading}
                >
                  <Text style={styles.bottomFooter}>ثبت نام پرسنل جدید</Text>
                </TouchableOpacity>
              </View>

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
    backgroundColor: themeColor0.bgColor(1),
  },
  spaceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 120,
    height: 80,
  },
  formContainer: {
    width: '100%',
    backgroundColor: themeColor10.bgColor(0),
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginVertical: 20,
    maxWidth: 600
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInputStyle: {
    paddingHorizontal: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
    zIndex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: themeColor4.bgColor(1),
    borderRadius: 3,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: themeColor7.bgColor(1),
    borderColor: themeColor7.bgColor(1),
  },
  checkboxText: {
    ...NewStyles.text4,
    fontSize: 14,
    color: themeColor4.bgColor(1),
  },
  buttonContainer: {
    ...NewStyles.row,
    width: '100%',
    marginTop: 10,
    gap: 10,
    justifyContent: 'center'
  },
  backButton: {
    width: 50,
    height: 50,
    backgroundColor: themeColor4.bgColor(0.7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonCustom: {
    flex: 1,
  },
  securityButton: {
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: themeColor4.bgColor(0.7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captchaBox: {
    width: 145,
    height: 50,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: themeColor3.bgColor(1),
  },
  captchaCanvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  captchaChar: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '600',
  },
  noiseLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: themeColor10.bgColor(1),
  },
  captchaText: {
    fontSize: 25,
    color: themeColor10.bgColor(1),
    fontWeight: '700',
  },
  captchaRefresh: {
    padding: 1,

  },
  captchaInput: {
    width: 100,
    height: 50,
    textAlign: 'center',
    paddingVertical: 6,
  },
  captchaImage: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  bottomTitle: {
    fontSize: 24,
    fontFamily: 'VazirBold',
    color: themeColor1.bgColor(1),
    marginBottom: 10,
  },
  bottomSubtitle: {
    ...NewStyles.title10,
    fontSize: 14,
    marginBottom: 5,
  },
  bottomFooter: {
    ...NewStyles.title10,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    ...NewStyles.text10,
    marginTop: 10,
    fontSize: 14,
  },
});
