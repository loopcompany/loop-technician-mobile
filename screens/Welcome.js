import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
} from "react-native";
import NewStyles from "../styles/NewStyles";
import { themeColor0, themeColor10 } from "../theme/Color";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setToken } from '../slices/authSlice';
import { validateToken } from '../services/Api';
import { fetchContacts } from "../slices/contactSlice";
import { fetchUser } from "../slices/userSlice";
import { useTranslation } from "react-i18next";

export default function Welcome({ navigation }) {
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    checkAutoLogin();
    dispatch(fetchContacts());

  }, []);

  async function checkAutoLogin() {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        const result = await validateToken();
        const isValid = result.success === true;
        if (isValid) {
          dispatch(setToken(userToken));
          dispatch(fetchUser(userToken))
          setTimeout(() => {
            navigation.replace('FolderScreen');
          }, 1500);
        } else {
          await AsyncStorage.removeItem('userToken');
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('savedReferralCode');
      await AsyncStorage.removeItem('savedPassword');
      setIsChecking(false);
    }
  }
  const navigateToMainApp = () => {
    setTimeout(() => {
      navigation.replace('SignInLanding');
    }, 4000);
  };
  useEffect(() => {
    navigateToMainApp()
  }, [])

  if (isChecking) {
    return (
      <ImageBackground
        source={Platform.OS === 'web' ? require("../assets/loopbackground.webp") : require("../assets/moon.jpg")}
        style={NewStyles.container}
      >
        <View style={{ flex: 1, backgroundColor: themeColor0.bgColor(0.25), justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require("../assets/logo.png")}
            style={NewStyles.logo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={themeColor10.bgColor(1)} style={{ marginTop: 20 }} />
          <Text style={[NewStyles.text10, { marginTop: 10 }]}>{t("Checking...")}</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={Platform.OS === 'web' ? require("../assets/loopbackground.webp") : require("../assets/moon.jpg")}
      style={NewStyles.container}
    >
      <TouchableWithoutFeedback

      >
        <View style={[{ flex: 1, backgroundColor: themeColor0.bgColor(0.25) }, NewStyles.center]}>


          <Text style={[NewStyles.title4, { textAlign: "center", fontSize: 40 }]}>{t("Hello")}</Text>
          <Text
            style={[NewStyles.title1, { textAlign: "center", fontSize: 45 }]}
          >
            {t("To the essence of the future")}
          </Text>
          <View style={[{}, NewStyles.center]}>

            <Image
              source={require("../assets/logo.png")}
              style={NewStyles.logo}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[NewStyles.title4, { textAlign: "center", fontSize: 40 }]}
          >
            {t("Welcome")}
          </Text>
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
