import React, { useState } from "react";
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
  Alert,
} from "react-native";
import Button from "../../components/Button";
import NewStyles from "../../styles/NewStyles";
import { themeColor10, themeColor4 } from "../../theme/Color";
import { requestPasswordReset } from "../../services/Api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen({ navigation }) {
  const [referralCode, setReferralCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!referralCode.trim()) {
      Alert.alert("خطا", "لطفاً کد پرسنلی خود را وارد کنید");
      return false;
    }
    if (!mobile.trim() || mobile.length < 11) {
      Alert.alert("خطا", "لطفاً شماره موبایل 11 رقمی معتبر وارد کنید");
      return false;
    }
    if (!nationalId.trim() || nationalId.length !== 10) {
      Alert.alert("خطا", "لطفاً کد ملی 10 رقمی معتبر وارد کنید");
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert("خطا", "لطفاً آدرس ایمیل معتبر وارد کنید");
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
        Alert.alert(
          "موفق",
          "کد تأیید به شماره موبایل شما ارسال شد",
          [
            {
              text: "تأیید",
              onPress: () => {
                navigation.navigate("ResetPasswordScreen", {
                  phone: mobile.trim(),
                  referralCode: referralCode.trim(),
                });
              },
            },
          ]
        );
      } else {
        Alert.alert("خطا", result.message || "مشکلی در ارسال کد پیش آمد");
      }
    } catch (error) {
      console.error('❌ خطا در ارسال درخواست:', error);
      Alert.alert("خطا", "مشکلی در ارتباط با سرور پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  return (
     <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
           
    <ImageBackground
      source={require("../../assets/background2.jpg")}
      style={styles.background}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[{flex:1}, NewStyles.center]}>
          <Image
            source={require("../../assets/logo.png")}
            style={NewStyles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={[{flex:1, width:'100%', gap:10}, NewStyles.center]}>
          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder="کد پرسنلی خود را وارد کنید"
            placeholderTextColor={themeColor10.bgColor(0.9)}
            value={referralCode}
            onChangeText={setReferralCode}
          />

          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder="شماره موبایل خود را وارد کنید"
            placeholderTextColor={themeColor10.bgColor(0.9)}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={11}
          />

          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder="کد ملی خود را وارد کنید"
            placeholderTextColor={themeColor10.bgColor(0.9)}
            value={nationalId}
            onChangeText={setNationalId}
            keyboardType="number-pad"
            maxLength={10}
          />

          <TextInput
            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
            placeholder="آدرس ایمیل خود را وارد کنید"
            placeholderTextColor={themeColor10.bgColor(0.9)}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[{flex:1, width:'100%'}, NewStyles.center]}>
          <Button
            title={"ارسال رمز اعتباری"}
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
    paddingVertical: 40,
  },
});
