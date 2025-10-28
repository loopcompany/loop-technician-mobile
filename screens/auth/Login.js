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
} from 'react-native';
import Svg, { Text as SvgText, Line, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor10, themeColor7 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';

export default function Login() {
  const navigation = useNavigation();
  const [staffCode, setStaffCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaMeta, setCaptchaMeta] = useState([]); // per-char meta: {rotate,color,y}
  const [noiseMeta, setNoiseMeta] = useState([]);
  const [captchaInput, setCaptchaInput] = useState('');

  // initialize captcha on mount
  useEffect(() => {
    createNewCaptcha();
  }, []);

  // Render captcha characters using stored metadata



  function normalizeDigits(s) {
    // convert Persian digits to a canonical form (use Persian as stored)
    const persian = { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '۰': '۰', '۱': '۱', '۲': '۲', '۳': '۳', '۴': '۴', '۵': '۵', '۶': '۶', '۷': '۷', '۸': '۸', '۹': '۹' };
    return s.split('').map(ch => (persian[ch] !== undefined ? persian[ch] : ch)).join('');
  }


  function generateCaptchaCode() {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let s = '';
    for (let i = 0; i < 4; i++) s += persianDigits[Math.floor(Math.random() * 10)];
    return s;
  }

  function createNewCaptcha() {
    const code = generateCaptchaCode();
    const colors = ['#0D6EFD', '#FF5722', '#00897B', '#7B1FA2', '#E91E63'];
    const meta = [];
    for (let i = 0; i < code.length; i++) {
      meta.push({
        rotate: (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        y: 28 + Math.floor((Math.random() - 0.5) * 8),
      });
    }
    const noises = [];
    for (let i = 0; i < 3; i++) {
      noises.push({
        top: Math.floor(Math.random() * 30) + 6,
        left: Math.floor(Math.random() * 40) + 6,
        width: Math.floor(Math.random() * 80) + 30,
        rotate: (Math.random() - 0.5) * 60,
      });
    }
    setCaptcha(code);
    setCaptchaMeta(meta);
    setNoiseMeta(noises);
    setCaptchaInput('');
  }


  return (
    <ImageBackground source={require('../../assets/background2.jpg')} style={styles.background} >
      <CustomStatusBar />
      <View style={styles.spaceContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} value={staffCode} onChangeText={setStaffCode} placeholder="کد پرسنلی" placeholderTextColor={themeColor10.bgColor(0.9)} textAlign="center" />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={themeColor10.bgColor(0.9)} />
              </TouchableOpacity>
              <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.passwordInputStyle]} value={password} onChangeText={setPassword} placeholder="رمز عبور" placeholderTextColor={themeColor10.bgColor(0.9)} secureTextEntry={!showPassword} textAlign="center" />
            </View>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberPassword(!rememberPassword)}>
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
              <Svg width="100" height="50" viewBox="0 0 100 50">
                <Rect x="0" y="0" width="140" height="50" rx="6" ry="6" fill="#F8FAFF" />
                {captchaMeta.map((m, i) => (
                  <SvgText
                    key={`s${i}`}
                    x={12 + i * 30}
                    y={m.y}
                    fontSize="22"
                    fill={m.color}
                    transform={`rotate(${m.rotate} ${12 + i * 30} ${m.y})`}
                  >
                    {captcha[i]}
                  </SvgText>
                ))}
                {noiseMeta.map((n, idx) => (
                  <Line
                    key={`n${idx}`}
                    x1={Math.max(2, n.left % 90)}
                    y1={n.top}
                    x2={Math.max(10, (n.left + n.width) % 90)}
                    y2={n.top + 2}
                    stroke="#999"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                ))}
              </Svg>
            </View>
            <TouchableOpacity onPress={() => { createNewCaptcha(); }} style={styles.captchaRefresh}>
              <Ionicons name="refresh" size={18} color={themeColor10.bgColor(1)} />
            </TouchableOpacity>

            <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.captchaInput]} value={captchaInput} onChangeText={setCaptchaInput} placeholder="کد امنیتی" placeholderTextColor={themeColor10.bgColor(0.9)} textAlign="center" />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="ورود" onPress={() => { navigation.navigate("LoginScreen") }} style={styles.loginButtonCustom} />
          </View>

        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity onPress={() => { navigation.navigate("SignInScreen") }}>
            <Text style={styles.bottomSubtitle}>رمز عبور خود را فراموش کرده اید؟</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { }}>
            <Text style={styles.bottomFooter}>ثبت نام پرسنل جدید</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
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
    width: 120,
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
});