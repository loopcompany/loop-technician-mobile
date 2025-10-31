import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
 KeyboardAvoidingView,
   ScrollView,
} from 'react-native';
import Svg, { Text as SvgText, Line, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor10, themeColor7 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginTechnician, validateToken } from '../../services/Api';
import { setToken } from '../../slices/authSlice';
import { setUserData } from '../../slices/userSlice';
import { showToastOrAlert } from '../../helpers/Common';
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
      console.error('❌ خطا در بارگذاری اطلاعات:', error);
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
    const colors = ['#0D6EFD', '#FF5722', '#00897B', '#7B1FA2', '#E91E63'];
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
    console.log('🔍 شروع اعتبارسنجی...');
    console.log('کد پرسنلی وارد شده:', referralCode);
    console.log('طول کد پرسنلی:', referralCode.length);
    console.log('رمز عبور:', password ? 'وارد شده' : 'خالی');
    console.log('کپچا وارد شده:', captchaInput);
    console.log('کپچا صحیح:', captcha);
    
    if (!referralCode.trim()) {
      console.log('❌ کد پرسنلی خالی است');
      showToastOrAlert('خطا', 'لطفاً کد پرسنلی را وارد کنید');
      return false;
    }
    if (referralCode.trim().length < 6) {
      console.log('❌ کد پرسنلی کمتر از 6 کاراکتر است');
      showToastOrAlert('خطا', 'کد پرسنلی باید حداقل 6 کاراکتر باشد');
      return false;
    }
    if (!password.trim()) {
      console.log('❌ رمز عبور خالی است');
      showToastOrAlert('خطا', 'لطفاً رمز عبور را وارد کنید');
      return false;
    }
    if (!captchaInput.trim()) {
      console.log('❌ کپچا خالی است');
      showToastOrAlert('خطا', 'لطفاً کد امنیتی را وارد کنید');
      return false;
    }
    const normalizedInput = normalizeDigits(captchaInput);
    const normalizedCaptcha = normalizeDigits(captcha);
    console.log('کپچا نرمال شده (ورودی):', normalizedInput);
    console.log('کپچا نرمال شده (صحیح):', normalizedCaptcha);
    
    if (normalizedInput !== normalizedCaptcha) {
      console.log('❌ کپچا اشتباه است');
      showToastOrAlert('خطا', 'کد امنیتی اشتباه است');
      createNewCaptcha();
      return false;
    }
    console.log('✅ اعتبارسنجی موفق');
    return true;
  }

  async function handleLogin() {
    if (!validateInputs()) return;
    
    console.log('=== شروع فرآیند لاگین ===');
    console.log('کد پرسنلی:', referralCode);
    console.log('رمز عبور وارد شده:', password ? '***' : 'خالی');
    console.log('کپچا:', captchaInput);
    
    setIsLoading(true);
    try {
      console.log('در حال ارسال درخواست به سرور...');
      const result = await loginTechnician(referralCode.trim(), password.trim());
      console.log('پاسخ سرور:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data?.token) {
        console.log('✅ ورود موفق - توکن دریافت شد');
        
        // Save token first
        await AsyncStorage.setItem('userToken', result.data.token);
        dispatch(setToken(result.data.token));
        
        // Fetch complete profile data using validateToken
        console.log('🔄 در حال دریافت اطلاعات کامل از validateToken...');
        const profileResult = await validateToken();
        
        if (profileResult.success && profileResult.data) {
          console.log('✅ اطلاعات کامل از validateToken دریافت شد');
          console.log('🔍 داده‌های کامل:', JSON.stringify(profileResult.data, null, 2));
          
          // Save complete user data
          console.log('💾 ذخیره اطلاعات کامل در Redux و AsyncStorage');
          await AsyncStorage.setItem('userData', JSON.stringify(profileResult.data));
          dispatch(setUserData(profileResult.data));
        } else {
          console.log('⚠️ خطا در دریافت اطلاعات از validateToken، استفاده از داده‌های محدود');
          // Fallback to basic data from login
          await AsyncStorage.setItem('userData', JSON.stringify(result.data));
          dispatch(setUserData(result.data));
        }
        
        // Save credentials if remember me is checked
        if (rememberPassword) {
          console.log('ذخیره اطلاعات ورود برای دفعات بعد...');
          await AsyncStorage.setItem('savedReferralCode', referralCode.trim());
          await AsyncStorage.setItem('savedPassword', password.trim());
        } else {
          await AsyncStorage.removeItem('savedReferralCode');
          await AsyncStorage.removeItem('savedPassword');
        }
        
        showToastOrAlert('موفق', result.message || 'ورود با موفقیت انجام شد');
        
        // Navigate to FolderScreen
        console.log('هدایت به FolderScreen...');
        navigation.reset({
          index: 0,
          routes: [{ name: 'FolderScreen' }],
        });
      } else {
        console.log('❌ ورود ناموفق:', result.message);
        showToastOrAlert('خطا', result.message || 'خطا در ورود به سیستم');
        createNewCaptcha();
      }
    } catch (error) {
      console.error('❌❌❌ خطای لاگین:', error);
      console.error('نوع خطا:', error.name);
      console.error('پیام خطا:', error.message);
      if (error.response) {
        console.error('وضعیت HTTP:', error.response.status);
        console.error('داده خطا:', error.response.data);
      }
      if (error.request) {
        console.error('درخواست ارسال شده:', error.request);
      }
      showToastOrAlert('خطا', 'خطای غیرمنتظره در ورود');
      createNewCaptcha();
    } finally {
      setIsLoading(false);
      console.log('=== پایان فرآیند لاگین ===');
    }
  }


  return (
     <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
           
    <ImageBackground source={require('../../assets/background2.jpg')} style={styles.background} >
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
                <Rect x="0" y="0" width="140" height="50" rx="6" ry="6" fill="#F8FAFF" />
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
                    stroke="#999"
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
            onPress={() => navigation.navigate("SignInScreen")}
            disabled={isLoading}
          >
            <Text style={styles.bottomSubtitle}>رمز عبور خود را فراموش کرده اید؟</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate("SignIn")}
            disabled={isLoading}
          >
            <Text style={styles.bottomFooter}>ثبت نام پرسنل جدید</Text>
          </TouchableOpacity>
        </View>

      </View>
        </ScrollView>
    </ImageBackground>

    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#001122',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    gap: 10,
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
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
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
    backgroundColor: '#000',
  },
  captchaText: {
    fontSize: 25,
    color: '#000',
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
    color: '#FFD700',
    marginBottom: 10,
  },
  bottomSubtitle: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#000000ff',
    marginBottom: 5,
  },
  bottomFooter: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#000000ff',
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