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

export default function FolderScreen({ navigation }) {
  const userToken = useSelector(state => state.auth.token)
  const { showFooter, hideFooter, isFooterVisible } = useFooter();
  const [unseenCount, setUnseenCount] = useState(0);

  // تابع دسترسی به ابجکت های یک استیت
  console.log(userToken);
  const fetchToken = async () => {
    const userId = await AsyncStorage.getItem("userId");
    // گت کوکی
    console.log(userId);

  }

  const computeUnseenFromOrders = (orders = []) => {
    if (!Array.isArray(orders)) return 0;
    // شمارش سفارشاتی که در حال پردازش هستن (نه انجام شده، نه لغو شده)
    // Status 0 = در انتظار
    // Status 1 = در حال پردازش
    // Status 2 = انجام شده (نباید شمارش بشه)
    // Status 3,4,5 = لغو شده (نباید شمارش بشه)
    const activeOrders = orders.filter(o => {
      if (o == null) return false;
      
      console.log(`🔍 سفارش #${o.id}: status = ${o.status} (type: ${typeof o.status})`);
      
      // چک کردن به صورت number و string
      const status = typeof o.status === 'string' ? parseInt(o.status) : o.status;
      const isActive = status === 0 || status === 1;
      
      console.log(`   -> ${isActive ? '✅ فعال' : '❌ غیرفعال'}`);
      
      return isActive;
    });
    
    console.log(`📊 مجموع سفارشات فعال: ${activeOrders.length} از ${orders.length}`);
    return activeOrders.length;
  }

  const fetchUnseenCount = async () => {
    try {
      // دریافت همه سفارشات (بدون فیلتر status)
      const result = await getTechnicianOrders(null, 1, 100);
      console.log('🔍 FolderScreen: کل response از API:', JSON.stringify(result, null, 2));
      
      if (result?.success) {
        const orders = result.data.orders || result.data || [];
        console.log('🔍 FolderScreen: تعداد کل سفارشات دریافتی:', orders.length);
        console.log('🔍 FolderScreen: اولین سفارش:', JSON.stringify(orders[0], null, 2));
        
        const count = computeUnseenFromOrders(orders);
        console.log('📊 FolderScreen: تعداد سفارشات فعال (در انتظار + در حال پردازش) ->', count);
        setUnseenCount(count);
      } else {
        console.warn('⚠️ FolderScreen: خطا در دریافت سفارشات', result?.message);
      }
    } catch (err) {
      console.error('❌ FolderScreen fetchUnseenCount error', err);
    }
  }

  useEffect(() => {
    fetchUnseenCount();
  }, []);

  // refresh when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchUnseenCount();
    }, [])
  );
  // const [menuVisible, setMenuVisible] = useState(false);
  // const [selectedItems, setSelectedItems] = useState({});

  // const menuItems = [
  //   'سفارش‌های جاری / رزرو',
  //   'سازمانی / شرکتی',
  //   'سفارش‌ها',
  //   'تراکنش‌ها',
  //   'لوپ‌نامه‌ها',
  //   'پیش‌رسید',
  //   'رسید',
  //   'ادرس‌های منتخب',
  //   'کیف پول',
  //   'ثبت نام دوره‌های آموزشی',
  //   'طرح‌های تشویقی',
  //   'عضویت سرویس / محصول',
  //   'درخواست',
  //   'ثبت / پیگیری تلفن',
  //   'نظرات و پیشنهادات',
  //   'مهلت تست / گارانتی',
  //   'یادداشت',
  //   'بیشتر بدانید',
  //   'قوانین / درباره لوپ',
  // ];

  // const toggleItem = (item) => {
  //   setSelectedItems((prev) => ({
  //     ...prev,
  //     [item]: !prev[item],
  //   }));
  // }
  const folders = [
    {
      id: 1,
      title: " انجام سرویس",
      screen: 'OrderListScreen'
    },
    {
      id: 2,
      title: "شاخص",
      screen: 'IndexScreen'
    },
    {
      id: 3,
      title: "جستجوی تخلفات",
      screen: 'LoopReportScreen'
    },
    {
      id: 4,
      title: "گزراش مالی  ",
      screen: 'FinancialReportScreen'
    },
    {
      id: 5,
      title: "عملکرد من",
      screen: 'PerformanceScreen'
    },
    {
      id: 6,
      title: " تغییر رمز",
      screen: 'ChangePasswordScreen'
    },
    {
      id: 7,
      title: " درخواست ها",
      screen: 'RequestsScreen'
    },
    {
      id: 8,
      title: " پیام ",
      screen: 'MessageScreen'
    },
    // {
    //   id: 9,
    //   title: "چت با کاربران",
    //   screen:'ChatListScreen'
    // },
    {
      id: 9,
      title: " حریم خصوصی",
      screen: 'PrivacyScreen'
    },
    {
      id: 10,
      title: "نظرات و پیشنهادات ",
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
      title: "طرح های تشویقی ",
      screen: 'IncentivePlansScreen'
    },
    {
      id: 14,
      title: "آرشیو عکس ",
      screen: 'PhotoArchiveScreen'
    },
    {
      id: 15,
      title: " نرخنامه",
      screen: 'RateListScreen'
    },
    {
      id: 16,
      title: "فکر و بکر ",
      screen: 'GameMenu'
    },
    {
      id: 17,
      title: " یادداشت",
      screen: 'NotesScreen'
    },
  ];
  fetchToken()
  return (
    <SafeAreaView edges={{top:'off', bottom:'off'}} style={NewStyles.container}>
      <ImageBackground
        source={Platform.OS === 'web' ? require("../assets/webbackground.jpg") : require("../assets/background2.jpg")}
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
              {folders.map((item, index) => (
                <View key={item.id} style={styles.folderWrapper}>
                  <Folder
                    title={item?.title}
                    onPress={() => {
                      if (item?.screen) {
                        navigation.navigate(item?.screen)
                      } else {
                        showToastOrAlert('به زودی')
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
