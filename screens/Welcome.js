import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import NewStyles from "../styles/NewStyles";
import { themeColor0, themeColor10 } from "../theme/Color";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setToken } from '../slices/authSlice';
import { validateToken } from '../services/Api';

export default function Welcome({ navigation }) {
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    checkAutoLogin();
  }, []);

  async function checkAutoLogin() {
    try {
      console.log('🔍 بررسی auto-login...');
      
      // Check if user wants to be remembered
      const savedReferralCode = await AsyncStorage.getItem('savedReferralCode');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      const userToken = await AsyncStorage.getItem('userToken');
      
      console.log('کد معرف ذخیره شده:', savedReferralCode ? 'دارد' : 'ندارد');
      console.log('توکن ذخیره شده:', userToken ? 'دارد' : 'ندارد');
      
      // If user has saved credentials and token, validate token
      if (savedReferralCode && savedPassword && userToken) {
        console.log('🔐 اعتبارسنجی توکن...');
        
        const result = await validateToken();
        console.log('📦 نتیجه validateToken:', JSON.stringify(result, null, 2));
        
        // If API returns success, token is valid
        const isValid = result.success === true;
        console.log('آیا توکن معتبر است؟', isValid);
        
        if (isValid) {
          console.log('✅ توکن معتبر است، auto-login انجام می‌شود...');
          dispatch(setToken(userToken));
          
          // Wait a moment for better UX
          setTimeout(() => {
            navigation.replace('FolderScreen');
          }, 1500);
        } else {
          console.log('❌ توکن نامعتبر یا منقضی شده، پاک‌سازی اطلاعات...');
          // Clear invalid token and credentials
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('savedReferralCode');
          await AsyncStorage.removeItem('savedPassword');
          setIsChecking(false);
        }
      } else {
        console.log('❌ Auto-login: اطلاعات کامل نیست، نمایش صفحه خوش‌آمد...');
        setIsChecking(false);
      }
    } catch (error) {
      console.error('خطا در بررسی auto-login:', error);
      // Clear data on error
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('savedReferralCode');
      await AsyncStorage.removeItem('savedPassword');
      setIsChecking(false);
    }
  }

  if (isChecking) {
    return (
      <ImageBackground
        source={require("../assets/background2.jpg")}
        style={NewStyles.container}
      >
        <View style={{ flex: 1, backgroundColor: themeColor0.bgColor(0.25), justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require("../assets/logo.png")}
            style={NewStyles.logo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={themeColor10.bgColor(1)} style={{ marginTop: 20 }} />
          <Text style={[NewStyles.text10, { marginTop: 10 }]}>در حال بررسی...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/background2.jpg")}
      style={NewStyles.container}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.navigate("SignInLanding");
        }}
      >
        <View style={{ flex: 1, backgroundColor: themeColor0.bgColor(0.25) }}>
          <View style={[{ flex: 1 }, NewStyles.center]}>
            <Image
              source={require("../assets/logo.png")}
              style={NewStyles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={[{ flex: 2, gap: 15 }]}>
            <Text
              style={[NewStyles.title4, { textAlign: "center", fontSize: 40 }]}
            >
              سلام
            </Text>
            <Text
              style={[NewStyles.title1, { textAlign: "center", fontSize: 45 }]}
            >
              به جوهر آینده
            </Text>
            <Text
              style={[NewStyles.title4, { textAlign: "center", fontSize: 40 }]}
            >
              خوش آمدید
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 100,
  },
});
