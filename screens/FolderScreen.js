import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, ImageBackground, ScrollView, Platform, } from "react-native";
import { useFooter } from "../contexts/FooterProvider";
import Folder from "../components/Folder";
import Badge from '../components/Badge';
import NewStyles from "../styles/NewStyles";
import CustomStatusBar from './../components/CustomStatusBar';
import { handleError, showToastOrAlert } from './../helpers/Common';
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { getTechnicianOrders } from '../services/Api';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function FolderScreen({ navigation }) {
  const { t } = useTranslation();
  const [unseenCount, setUnseenCount] = useState(0);
  const userData = useSelector(state => state.user?.data?.data?.technician);

  const computeUnseenFromOrders = (orders = []) => {
    if (!Array.isArray(orders)) return 0;
    const activeOrders = orders.filter(o => {
      if (o == null) return false;
      const status = typeof o.status === 'string' ? parseInt(o.status) : o.status;
      const isActive = status === 0 || status === 1;
      return isActive;
    });
    return activeOrders.length;
  }

  const fetchUnseenCount = async () => {
    try {
      const result = await getTechnicianOrders(null, 1, 100);
      if (result?.success) {
        const orders = result.data.orders || result.data || [];
        const count = computeUnseenFromOrders(orders);
        setUnseenCount(count);
      } else {
      }
    } catch (err) {
    }
  }

  useEffect(() => {
    fetchUnseenCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnseenCount();
    }, [])
  );

  const folders = [
    {
      id: 1,
      title: t("Perform service"),
      screen: 'OrderListScreen'
    },
    {
      id: 2,
      title: t("Index"),
      screen: 'IndexScreen',
       apple_check: userData?.apple_check
    },
    {
      id: 3,
      title: t("Search violations"),
      screen: 'LoopReportScreen'
    },
    {
      id: 4,
      title: t("Financial report"),
      screen: 'FinancialReportScreen',
      apple_check: userData?.apple_check
    },
    {
      id: 5,
      title: t("My performance"),
      screen: 'PerformanceScreen',
      apple_check: userData?.apple_check
    },
    {
      id: 6,
      title: t("Change Password"),
      screen: 'ChangePasswordScreen'
    },
    {
      id: 7,
      title: t("Requests"),
      screen: 'RequestsScreen'
    },
    {
      id: 8,
      title: t("Messages"),
      screen: 'MessageScreen'
    },
    // {
    //   id: 9,
    //   title: "چت با کاربران",
    //   screen:'ChatListScreen'
    // },
    {
      id: 9,
      title: t("Privacy"),
      screen: 'PrivacyScreen',
       apple_check: userData?.apple_check
    },
    {
      id: 10,
      title: t("Feedback / Suggestions"),
      screen: 'FeedbackSuggestionScreen'
    },
    // {
    //   id: 11,
    //   title: " لپ تاپ امانت",
    //   screen: 'LoanerLaptopScreen'
    // },
    // {
    //   id: 12,
    //   title: "تحویل/دریافت ",
    //   screen: 'DeliveryReceiptScreen'
    // },
    {
      id: 13,
      title: t("Promotional Plans"),
      screen: 'IncentivePlansScreen'
    },
    {
      id: 14,
      title: t("Photo Archive"),
      screen: 'PhotoArchiveScreen'
    },
    {
      id: 15,
      title: t("Rate List"),
      screen: 'RateCategory',
       apple_check: userData?.apple_check
    },
    {
      id: 16,
      title: t("Mastermind"),
      screen: 'GameMenu'
    },
    {
      id: 17,
      title: t("My Notes"),
      screen: 'NotesScreen'
    },
  ];
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ImageBackground
        source={Platform.OS === 'web' ? require("../assets/loopbackground.webp") : require("../assets/moon.jpg")}
        style={NewStyles.container}

      >
        <CustomStatusBar />
        <View style={{ flex: 1 }}>
          {/* لوگو بالا */}
          <View style={styles.logoWrapper}>
            <Image source={require("../assets/logo.png")} style={NewStyles.logo} />
          </View>
          <ScrollView contentContainerStyle={styles.folderList}>
            <View style={styles.folderContainer}>
              {folders?.filter(item => !item.apple_check || item.apple_check != 1).map((item, index) => (
                <View key={item.id} style={styles.folderWrapper}>
                  <Folder
                    title={item?.title}
                    onPress={() => {
                      if (item?.screen) {
                        navigation.navigate(item?.screen)
                      } else {
                        showToastOrAlert(t("Coming soon"))
                      }
                    }}
                  />
                  {(item.screen === 'OrderListScreen' || item.id === 1) && (
                    <Badge count={unseenCount} style={styles.badgePosition} />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer is now managed globally through context */}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    paddingTop: 60,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 5,
  },
  logo: {
    width: 140,
    height: 90,
    resizeMode: "contain",
  },
  folderList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 10,
    flexGrow: 1,
  },
  folderContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    height: 500, // ارتفاع مشخص برای wrap شدن
  },
  folderWrapper: {
    position: 'relative',
  },
  folderItem: {
    width: 80,
    alignItems: "center",
    margin: 12,
    // flexDirection: 'row-reverse',
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    width: "50%",
  },
  folderIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  folderText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  footer: {
    // position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 15,
  },
  footerLogo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  supportButton: {
    backgroundColor: "#005b9f",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 5,
  },
  supportText: {
    color: "#fff",
    fontWeight: "bold",
  },
  language: {
    color: "#fff",
    fontSize: 16,
  },
  phone: {
    color: "#fff",
    fontSize: 16,
  },
  menuBox: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    padding: 10,
    width: "90%",
    maxHeight: "70%",
    marginBottom: 20,
  },
  menuScroll: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    marginRight: 10,
    color: "#000",
  },
  badgePosition: {
    top: 2,
    right: 2,
  },
});
