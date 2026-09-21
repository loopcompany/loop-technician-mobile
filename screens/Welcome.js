import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useDispatch, useSelector } from 'react-redux';
import { fetchContacts } from "../slices/contactSlice";
import { useTranslation } from "react-i18next";
import { fetchPdfDocs } from "../slices/pdfDocumentSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { useFooter } from "../contexts/FooterProvider";
import { getHash } from "react-native-otp-verify";
import { setHashApp } from "../slices/hashAppSlice";

// Intro video is 8s; never keep the user here longer than this if playback
// fails or never reports its end (e.g. autoplay blocked on web).
const MAX_INTRO_MS = 10000;

export default function Welcome({ navigation }) {
  const [isChecking, setIsChecking] = useState(true);
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

  // The session itself is restored in App.js; here we only prefetch public data.
  useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchPdfDocs());
    hideFooter()
  }, []);

  // Read the latest token when the intro ends, without re-subscribing.
  const tokenRef = useRef(userToken);
  tokenRef.current = userToken;
  const finishedRef = useRef(false);

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsChecking(false);
    player.pause();

    if (tokenRef.current) {
      showFooter()
      navigation.replace('FolderScreen');
    } else {
      navigation.replace('SignInLanding');
    }
  }, [navigation, player, showFooter]);

  useEffect(() => {
    const subscription = player.addListener('playToEnd', finishIntro);
    const fallback = setTimeout(finishIntro, MAX_INTRO_MS);

    return () => {
      subscription.remove();
      clearTimeout(fallback);
    };
  }, [player, finishIntro]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    getHash()
      .then(hashes => {
        dispatch(setHashApp(hashes))
      })
      .catch(error => {
        console.log('Hash error:', error);
      });
  }, []);
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    if (Platform.OS === 'web' && !isPlaying && player && !finishedRef.current) {
      player.play();


    }
  }, [player, isPlaying])



  if (isChecking) {
    return (
      <SafeAreaView style={NewStyles.container}>
        <TouchableWithoutFeedback onPress={finishIntro}>
          <LinearGradient colors={['#1c2833', '#0b0d11', '#0b0d11']} style={{ flex: 1 }}>
            <VideoView style={{ flex: 1 }} nativeControls={false} player={player} contentFit='contain' pointerEvents="none" />
          </LinearGradient>
        </TouchableWithoutFeedback>
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
