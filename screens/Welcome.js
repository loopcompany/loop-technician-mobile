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
import { useDispatch, useSelector } from 'react-redux';
import { setToken } from '../slices/authSlice';
import { validateToken } from '../services/Api';
import { fetchContacts } from "../slices/contactSlice";
import { fetchUser } from "../slices/userSlice";
import { useTranslation } from "react-i18next";
import { fetchPdfDocs } from "../slices/pdfDocumentSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { useFooter } from "../contexts/FooterProvider";
import { getHash } from "react-native-otp-verify";
import { setHashApp } from "../slices/hashAppSlice";

export default function Welcome({ navigation }) {
  const [isChecking, setIsChecking] = useState(true);
  const userData = useSelector(state => state.user);



  const userToken = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const player = useVideoPlayer(require('../assets/video/InShot_20260626_171217014.mp4'), player => {
    if (Platform.OS === 'web') {

      player.muted = true;
    }
    player.play();
  });
  const { showFooter, hideFooter } = useFooter()
  useEffect(() => {
    checkAutoLogin();
    dispatch(fetchContacts());
    dispatch(fetchPdfDocs());
    hideFooter()
  }, []);

  async function checkAutoLogin() {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        const result = await validateToken();
        const isValid = result.success === true;
        console.log("is valid", isValid);

        if (isValid) {
          dispatch(setToken(userToken));
          dispatch(fetchUser(userToken))
          // setTimeout(() => {
          //   navigation.replace('FolderScreen');
          // }, 1500);
        } else {
          await AsyncStorage.removeItem('userToken');

        }
      } else {
      }
    } catch (error) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('savedReferralCode');
      await AsyncStorage.removeItem('savedPassword');
    }
  }
  const navigateToMainApp = () => {
    setTimeout(() => {
      navigation.replace('SignInLanding');
    }, 4000);
  };


  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      setIsChecking(false);

      if (userData?.data && userToken) {
        console.log("ssss");
        showFooter()

        navigation.replace('FolderScreen');
      } else {
        navigateToMainApp()
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, userData, userToken]);
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    getHash()
      .then(hashes => {
        dispatch(setHashApp(hashes))
        console.log('SMS hashes:', hashes);
      })
      .catch(error => {
        console.log('Hash error:', error);
      });
  }, []);
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    if (Platform.OS === 'web' && !isPlaying && player) {
      player.play();


    }
  }, [player, isPlaying])



  if (isChecking) {
    return (
      <SafeAreaView style={NewStyles.container}>
        <LinearGradient colors={['#1c2833', '#0b0d11', '#0b0d11']} style={{ flex: 1 }}>

          <VideoView style={{ flex: 1 }} nativeControls={false} player={player} contentFit='contain' allowsFullscreen allowsPictureInPicture />
        </LinearGradient>
      </SafeAreaView>
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
