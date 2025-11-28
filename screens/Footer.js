import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Linking,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { themeColor0, themeColor10, themeColor13, themeColor4, themeColor6 } from "../theme/Color";
import NewStyles from "../styles/NewStyles";
import { logoutTechnician } from "../services/Api";
import { showAlert } from '../helpers/Common';
import { useDispatch, useSelector } from 'react-redux';
import { setToken } from '../slices/authSlice';

export default function Footer() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userToken = useSelector(state => state.auth.token);
  const [menuItems, setMenuItems] = useState([
    { id: 1, title: " سازمانی / شرکتی", screen: "DeviceOrderSummary" },
    { id: 2, title: " ثبت نام دوره های آموزشی ", screen: "CorporateScreen" },
    { id: 3, title: "ضمانت نامه/گارانتی", screen: "OrdersScreen" },
    { id: 4, title: "سوالات متداول", screen: "TransactionsScreen" },
    { id: 5, title: " قوانین/درباره لوپ", screen: "CanceledOrdersScreen" },
  ]);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = async () => {
    console.log('⚠️ handleLogout فراخوانی شد - نسخه جدید');
    showAlert(
      'خروج از حساب کاربری',
      'آیا مطمئن به خروج هستید؟',
      [
        {
          text: 'انصراف',
          style: 'cancel',
        },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            console.log('🚪 کاربر دکمه خروج را زد');
            setMenuVisible(false);
            
            try {
              // First clear Redux token to prevent auto-login
              console.log('🗑️ پاک کردن Redux token...');
              dispatch(setToken(null));
              
              // Call logout API (this will clear AsyncStorage)
              const result = await logoutTechnician();
              console.log('نتیجه logout:', result);
              
              // Navigate to Welcome screen AFTER clearing everything
              console.log('➡️ انتقال به صفحه Welcome...');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
              
              console.log('✅ خروج موفقیت‌آمیز');
            } catch (error) {
              console.error('❌ خطا در خروج:', error);
              // Even on error, logout locally
              dispatch(setToken(null));
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate(item.screen);
        setMenuVisible(false)
      }}
    >
      <Text style={NewStyles.text10}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => {
          setMenuVisible(false);
        }}
        animationType="fade"

      >
        <TouchableWithoutFeedback onPress={() => {
          setMenuVisible(false);
        }}>

          <View style={styles.coverlist}>
            <View style={styles.coverlist2}>
            {/* <View> */}
            <FlatList
              data={menuItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              style={{
                height: '85%',
                paddingVertical: 20,
                paddingHorizontal: 16,
              }}
              // contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
            
            {/* دکمه‌های پایین */}
            <View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>روشن / خاموش</Text>
              </TouchableOpacity>
              
              {/* دکمه خروج فقط برای کاربران لاگین شده */}
              {userToken && (
                <TouchableOpacity 
                  style={styles.exitButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.exitButtonText}>خروج</Text>
                </TouchableOpacity>
              )}
            </View>
            </View>
            {/* </View> */}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={[styles.footer, NewStyles.rowWrapper]}>




        <TouchableOpacity onPress={() => { Linking.openURL(`tel:02121164552`) }}>
          <Text style={NewStyles.text4}>21164552</Text>
        </TouchableOpacity>
        <Text style={NewStyles.text4}>فا</Text>
        <TouchableOpacity style={styles.supportButton}>
          <Text style={NewStyles.text4}>پشتیبانی</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.footerLogo}
          />
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 5,
  },
  logo: {
    width: 160,
    height: 90,
    resizeMode: "contain",
  },
  folderList: {
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "flex-start",
    // paddingHorizontal: 20,
    flex: 1,

  },
  coverlist: {
    flex: 1,
    // backgroundColor:'red',
    justifyContent: "flex-end",
    alignSelf: "flex-start",
    marginBottom:60,
  },
  coverlist2: {
    // width: '100%',
    height: '50%',
    backgroundColor: themeColor0.bgColor(0.9),
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
    backgroundColor: themeColor13.bgColor(1),
    width: "100%",
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
    maxHeight: "0%",
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
  list: {
    // paddingVertical: 20,
    // paddingHorizontal: 16,
    // backgroundColor: themeColor4.bgColor(1),

  },
  item: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    // borderRadius: 10,
    // marginBottom: 10,
    // borderWidth: 1,
    // borderColor: '#ddd',
    width: "100%",
  },
  title: {
    color: "#333",
    fontSize: 16,
    textAlign: "right",
    fontWeight: "bold",
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingBottom: 10,
    marginTop:10,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  exitButton: {
    // flex: 1,
    backgroundColor: themeColor6.bgColor(1),
    borderRadius: 8,
    alignItems: "center",
  },
  exitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});


