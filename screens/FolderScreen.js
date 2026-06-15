import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, Image, ImageBackground, ScrollView, Platform, Text, TouchableOpacity, } from "react-native";
import { useFooter } from "../contexts/FooterProvider";
import Folder from "../components/Folder";
import Badge from '../components/Badge';
import CustomStatusBar from './../components/CustomStatusBar';
import { formatPrice, handleError, showToastOrAlert } from './../helpers/Common';
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { getTechnicianOrders, getUnreadTicketsCount } from '../services/Api';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { themeColor0, themeColor11, themeColor4 } from "../theme/Color";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Loader from "../components/Loader";
import { createStyles } from "../styles/NewStyles";
import { imageUri } from "../services/URL";
import { fetchUser } from "../slices/userSlice";

export default function FolderScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const [unseenCount, setUnseenCount] = useState(0);
  const userData = useSelector(state => state.user?.data?.data?.technician);
  const userToken = useSelector((state) => state.auth.token);
  const [unreadTicketCounts, setUnreadTicketCounts] = useState(0)
  const [loading, setLoading] = useState(true)
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
  const dispatch = useDispatch()

  useFocusEffect(
    useCallback(() => {
      fetchUnseenCount();
      if (userToken) {

        dispatch(fetchUser(userToken))
      }
    }, [])
  );

  const folders = [
    {
      id: 1,
      title: t("Perform service"),
      screen: 'OrderListScreen',
      image: `${imageUri}/folder/OrderListScreen.png`
    },
    {
      id: 2,
      title: t("Index"),
      screen: 'IndexScreen',
      apple_check: userData?.apple_check,
      image: `${imageUri}/folder/IndexScreen.png`
    },
    {
      id: 3,
      title: t("Search violations"),
      screen: 'LoopReportScreen',
      image: `${imageUri}/folder/LoopReportScreen.png`

    },
    {
      id: 4,
      title: t("Financial report"),
      screen: 'FinancialReportScreen',
      apple_check: userData?.apple_check,
      image: `${imageUri}/folder/FinancialReportScreen.png`

    },
    {
      id: 5,
      title: t("My performance"),
      screen: 'PerformanceScreen',
      apple_check: userData?.apple_check,
      image: `${imageUri}/folder/PerformanceScreen.png`
    },
    {
      id: 6,
      title: t("Change Password"),
      screen: 'ChangePasswordScreen',
      image: `${imageUri}/folder/ChangePasswordScreen.png`
    },
    {
      id: 7,
      title: t("Requests"),
      screen: 'RequestsScreen',
      image: `${imageUri}/folder/RequestsScreen.png`
    },
    {
      id: 8,
      title: t("Messages"),
      screen: 'MessageScreen',
      image: `${imageUri}/folder/MessageScreen.png`
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
      apple_check: userData?.apple_check,
      image: `${imageUri}/folder/PrivacyScreen.png`
    },
    {
      id: 10,
      title: t("Feedback / Suggestions"),
      screen: 'FeedbackSuggestionScreen',
      image: `${imageUri}/folder/FeedbackSuggestionScreen.png`
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
      screen: 'IncentivePlansScreen',
      image: `${imageUri}/folder/IncentivePlansScreen.png`
    },
    {
      id: 14,
      title: t("Photo Archive"),
      screen: 'PhotoArchiveScreen',
      image: `${imageUri}/folder/PhotoArchiveScreen.png`
    },
    {
      id: 15,
      title: t("Rate List"),
      screen: 'RateCategory',
      apple_check: userData?.apple_check,
      image: `${imageUri}/folder/RateCategory.png`
    },
    {
      id: 16,
      title: t("Mastermind"),
      screen: 'GameMenu',
      image: `${imageUri}/folder/GameMenu.png`
    },
    {
      id: 17,
      title: t("My Notes"),
      screen: 'NotesScreen',
      image: `${imageUri}/folder/NotesScreen.png`
    },
  ];
  const inssets = useSafeAreaInsets()
  const fetchUnreadTicketCounts = async () => {
    try {
      const res = await getUnreadTicketsCount(userToken)
      setUnreadTicketCounts(res?.data?.unread_count)

    } catch (err) {

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchUnreadTicketCounts()
    fetchUnseenCount();
  }, []);
  if (loading) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ImageBackground
        source={Platform.OS === 'web' ? require("../assets/loopbackground.webp") : require("../assets/moon.jpg")}
        style={NewStyles.container}
      >
        <CustomStatusBar />
        <View style={{ flex: 1 }}>
          <View style={[styles.headerBackground, { marginTop: inssets?.top + 20 }]}>
            <View style={NewStyles.rowWrapper}>
              <View style={[NewStyles.row, { gap: 10 }]}>
                <Image
                  source={userData?.profile_photo_path ? { uri: userData?.profile_photo_path } : require('../assets/technician.png')}
                  style={[{ height: 70, width: 70, }, NewStyles.border100]}
                />
                <Text style={NewStyles.title10}>{userData?.name}</Text>
              </View>
              <View style={NewStyles.row}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Ionicons
                    key={index}
                    name={index < Number(userData?.average_rating) ? 'star' : 'star-outline'}
                    size={20}
                    color={themeColor11.bgColor(1)}
                  />
                ))}
              </View>
            </View>
            <View style={NewStyles.rowWrapper}>
              <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                navigation.navigate("MessageScreen")
              }}>
                {(unreadTicketCounts > 0) && (
                  <Badge count={unreadTicketCounts} style={styles.badgePosition} />
                )}
                <FontAwesome name="envelope-o" size={24} color={themeColor0.bgColor(1)} />
              </TouchableOpacity>
              <View style={[NewStyles.row, { gap: 10 }]}>
                <Text style={[NewStyles.text10]}>{t("Your credit")}:</Text>
                <Text style={NewStyles.text10}>{formatPrice(Number(userData?.wallet))} {t("T")}</Text>
              </View>
            </View>
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
                    image={item?.image}
                  />
                  {(item.screen === 'OrderListScreen' || item.id === 1) && (
                    <Badge count={unseenCount} style={styles.badgePosition} />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: "cover",
    paddingTop: 60,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 5,
    alignSelf: 'flex-end'
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
  headerBackground: {
    width: '90%',
    backgroundColor: themeColor4.bgColor(1),
    padding: 10,
    alignSelf: 'center',
    ...NewStyles.border10
  },
  folderContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    height: 600, // ارتفاع مشخص برای wrap شدن
  },
  folderWrapper: {
    position: 'relative',
    // width:100
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
