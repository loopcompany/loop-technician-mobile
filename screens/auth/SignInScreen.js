import React, { useState,useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Button from "../../components/Button";
import NewStyles from "../../styles/NewStyles";
import { themeColor10, themeColor4 } from "../../theme/Color";
import { requestPasswordReset } from "../../services/Api";
import { SafeAreaView } from "react-native-safe-area-context";
import { showAlert } from "../../helpers/Common";
import { createStyles } from '../../styles/NewStyles';
import { useTranslation } from "react-i18next";
export default function SignInScreen({ navigation }) {
  // از اینجا
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  // تا اینجا
  


  // این خط پایین
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  const [referralCode, setReferralCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!referralCode.trim()) {
      showAlert(t("Error"), t("Please enter personnel code."));
      return false;
    }
    if (!mobile.trim() || mobile.length < 11) {
      showAlert(t("Error"), t("Please enter a valid 11-digit mobile number."));
      return false;
    }
    if (!nationalId.trim() || nationalId.length !== 10) {
      showAlert(t("Error"), t("National ID must be 10 digits."));
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      showAlert(t("Error"), t("The email address you entered is not valid."));
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    console.log('🔄 ارسال درخواست بازیابی رمز...');

    try {
      const result = await requestPasswordReset({
        referral_code: referralCode.trim(),
        phone: mobile.trim(),
        melicode: nationalId.trim(),
        email: email.trim(),
      });

      console.log('📦 نتیجه درخواست:', result);

      if (result.success) {
        showAlert(
          t("Success"),
          t("Verification code sent to your mobile number"),
          [
            {
              text: t("Confirm"),
              onPress: () => {
                navigation.navigate("ResetPasswordScreen", {
                  phone: mobile.trim(),
                  referralCode: referralCode.trim(),
                  melicode: nationalId.trim(),
                  email: email.trim(),
                });
              },
            },
          ]
        );
      } else {
        showAlert(t("Error"), result.message || t("There was a problem sending the code."));
      }
    } catch (error) {
      console.log('❌ خطا در ارسال درخواست:', error);
      showAlert(t("Error"), t("There was an error connecting to the server."));
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
            <View style={[{ flex: 1 }, NewStyles.center]}>
              <Image
                source={require("../../assets/logo.png")}
                style={NewStyles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={[{ flex: 1, width: '100%', gap: 10 , maxWidth:800}, NewStyles.center]}>
              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                placeholder={t("Please enter personnel code.")}
                placeholderTextColor={themeColor10.bgColor(0.9)}
                value={referralCode}
                onChangeText={setReferralCode}
              />

              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                placeholder={t("Enter your mobile number.")}
                placeholderTextColor={themeColor10.bgColor(0.9)}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="number-pad"
                maxLength={11}
              />

              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                placeholder={t("Enter your national ID")}
                placeholderTextColor={themeColor10.bgColor(0.9)}
                value={nationalId}
                onChangeText={setNationalId}
                keyboardType="number-pad"
                maxLength={10}
              />

              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                placeholder={t("Enter your email address")}
                placeholderTextColor={themeColor10.bgColor(0.9)}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            <View style={[{ flex: 1, width: '100%' }, NewStyles.center]}>
              <Button
                title={t("Send code")}
                onPress={handleSendCode}
                loading={loading}
              />
            </View>
          </ScrollView>
        </ImageBackground>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: {
    flex: 1,
    paddingBottom:50
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
});
