import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  I18nManager,
  ScrollView,
  FlatList,
} from "react-native";
import { useFooter } from "../contexts/FooterContext";
import Folder from "../components/Folder";
import NewStyles from "../styles/NewStyles";
import CustomStatusBar from './../components/CustomStatusBar';
import { handleError, showToastOrAlert } from './../helpers/Common';
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FolderScreen({ navigation }) {
  const userToken = useSelector(state=>state.auth.token)
  const { showFooter, hideFooter, isFooterVisible } = useFooter();
  
  // تابع دسترسی به ابجکت های یک استیت
  console.log(userToken);
  const fetchToken = async()=>{
    const userId = await AsyncStorage.getItem("userId");
    // گت کوکی
    console.log(userId);
    
  }
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
      screen:'DeviceModelInfoScreen'
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
      screen:'PerformanceScreen'
    },
    {
      id: 6,
      title: " تغییر رمز",
      screen:'ChangePasswordScreen'
    },
    {
      id: 7,
      title: " درخواست ها",
      screen:'RequestsScreen'
    },
    {
      id: 8,
      title: " پیام ",
      screen:'MessageScreen'
    },
    {
      id: 9,
      title: " حریم خصوصی",
      screen:'PrivacyScreen'
    },
    {
      id: 10,
      title: "نظرات و پیشنهادات ",
      screen:'FeedbackSuggestionScreen'
    },
    {
      id: 11,
      title: " لپ تاپ امانت",
      screen:'LoanerLaptopScreen'
    },
    {
      id: 12,
      title: "تحویل/دریافت ",
      screen:'DeliveryReceiptScreen'
    },
    {
      id: 13,
      title: "طرح های تشویقی ",
      screen:'IncentiveSchemeScreen'
    },
    {
      id: 14,
      title: "آرشیو عکس ",
      screen:'PhotoArchiveScreen'
    },
    {
      id: 15,
      title: " نرخنامه",
      screen:'RateListScreen'
    },
    {
      id: 16,
      title: "فکر و بکر ",
      screen:'ThinkingScreen'
    },
    {
      id: 17,
      title: " یادداشت",
      screen:'NotesScreen'
    },
  ];
  fetchToken() 
  return (
    <ImageBackground
      source={require("../assets/background2.jpg")}
      style={NewStyles.container}
    >
      <CustomStatusBar/>
      <View style={{ flex: 1 }}>
        {/* لوگو بالا */}
        <View style={styles.logoWrapper}>
          <Image source={require("../assets/logo.png")} style={NewStyles.logo} />
        </View>
        <ScrollView contentContainerStyle={styles.folderList}>
          <View style={styles.folderContainer}>
            {folders.map((item, index) => (
              <Folder 
                key={item.id}
                title={item?.title} 
                onPress={()=>{
                  if(item?.screen){
                    navigation.navigate(item?.screen)
                  }else{
                    showToastOrAlert('به زودی')
                  }
                }} 
              />
            ))}
          </View>
        </ScrollView>
        
        {/* Footer is now managed globally through context */}
      </View>
    </ImageBackground>
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
});
