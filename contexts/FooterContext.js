import React, { createContext, useContext, useEffect, useState } from 'react';
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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { themeColor0, themeColor10, themeColor13, themeColor4, themeColor6, themeColor7 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logoutTechnician } from '../services/Api';
import { useDispatch, useSelector } from 'react-redux';
import { setToken } from '../slices/authSlice';
import { emptyUser } from '../slices/userSlice';
import { Ionicons } from '@expo/vector-icons';
import ConfirmationModal from '../components/ConfirmationModal';
import { fetchContacts } from '../slices/contactSlice';

const FooterContext = createContext();

export const useFooter = () => {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error('useFooter must be used within a FooterProvider');
  }
  return context;
};

export const FooterProvider = ({ children }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showFooter = () => setIsFooterVisible(true);
  const hideFooter = () => setIsFooterVisible(false);
  const toggleFooter = () => setIsFooterVisible(!isFooterVisible);
  useEffect(()=>{
       dispatch(fetchContacts());
  },[])
  const contact = useSelector(state => state.contacts);
  const userToken = useSelector(state => state.auth.token);

  // منوهای داینامیک بر اساس وضعیت لاگین
  const menuItems = userToken
    ? [
      // منوهای کاربر لاگین شده
      { id: 1, title: 'سازمانی / شرکتی', screen: 'OrganizationsListScreen' },
      { id: 2, title: 'صفحه اصلی', screen: 'FolderScreen' },
      { id: 3, title: 'ضمانت نامه/گارانتی', screen: 'WarrantyScreen' },
      { id: 4, title: 'سوالات متداول', screen: 'LearnMoreScreen' },
      { id: 5, title: 'قوانین/درباره لوپ', screen: 'AboutScreen' },
    ]
    : [
      // منوهای کاربر لاگین نشده
      { id: 1, title: 'ورود', screen: 'Login' },
      { id: 2, title: 'ثبت نام', screen: 'SignInScreen' },
      { id: 3, title: 'ضمانت نامه/گارانتی', screen: 'WarrantyScreen' },
      { id: 4, title: 'سوالات متداول', screen: 'LearnMoreScreen' },
      { id: 5, title: 'قوانین/درباره لوپ', screen: 'AboutScreen' },
    ];

  const handleLogoutClick = () => {
    setMenuVisible(false);
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    console.log('⚠️ handleLogout فراخوانی شد - FooterContext');

    try {
      // First clear Redux token and user data to prevent auto-login
      console.log('🗑️ پاک کردن Redux token و user data...');
      dispatch(setToken(null));
      dispatch(emptyUser());

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
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate(item.screen);
        setMenuVisible(false);
      }}
    >
      <Text style={NewStyles.text10}>{item.title}</Text>
    </TouchableOpacity>
  );

  const FooterComponent = () => {
    if (!isFooterVisible) return null;

    return (
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }}>
        <Modal
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => {
            setMenuVisible(false);
          }}
          animationType="fade"
        >
          <TouchableWithoutFeedback
            onPress={() => setMenuVisible(false)}
            
          >
            <View style={styles.coverlist}>
              <View style={styles.coverlist2}>
                <FlatList
                  data={menuItems}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderItem}
                  style={{
                    height: '85%',
                    paddingVertical: 20,
                    paddingHorizontal: 16,
                  }}
                  showsVerticalScrollIndicator={false}
                />

                {/* دکمه‌های پایین */}
                <View style={styles.bottomButtons}>
                  {/* دکمه خروج فقط برای کاربران لاگین شده */}
                  {userToken && (
                    <TouchableOpacity
                      style={styles.exitButton}
                      onPress={handleLogoutClick}
                    >
                      <Ionicons name={'power-outline'} color={themeColor4.bgColor(1)} size={16} />
                      <Text style={NewStyles.text4}>خروج</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Confirmation Modal for Logout */}
        <ConfirmationModal
          title="خروج از حساب کاربری"
          message="آیا مطمئن هستید که می‌خواهید خارج شوید؟"
          action={handleLogout}
          confirmationModal={showLogoutConfirm}
          setConfirmationModal={setShowLogoutConfirm}
        />

        <View style={[styles.footer, NewStyles.rowWrapper]}>
          <TouchableOpacity
            onPress={() => {
              contact?.data?.data?.link && Linking.openURL(`${contact?.data?.data?.link}`)
            }}
          >
            <Text style={NewStyles.text4}>{contact?.data?.data?.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportButton} onPress={()=>{navigation.navigate('MessageScreen')}}>
            <Text style={NewStyles.text4}>پشتیبانی</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setMenuVisible(!menuVisible)
          }}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.footerLogo}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  const value = {
    isFooterVisible,
    showFooter,
    hideFooter,
    toggleFooter,
    menuItems,
    FooterComponent,
  };

  return (
    <FooterContext.Provider value={value}>
      {children}
    </FooterContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
    paddingTop: 60,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 160,
    height: 90,
    resizeMode: 'contain',
  },
  folderList: {
    flex: 1,
  },
  coverlist: {
    flex: 1,
    justifyContent: 'flex-end',
    alignSelf: 'flex-start',
    marginBottom: 60,
    width: '100%'
  },
  coverlist2: {
    height: '50%',
    maxWidth: 250,
    backgroundColor: themeColor0.bgColor(0.9),
  },
  folderItem: {
    width: 80,
    alignItems: 'center',
    margin: 12,
    alignItems: 'center',
    backgroundColor: themeColor10.bgColor(0.9),
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    width: '50%',
  },
  folderIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  folderText: {
    ...NewStyles.title4,
    marginTop: 6,
    fontSize: 15,
    color: themeColor4.bgColor(1),
    textAlign: 'center',
  },
  footer: {
    backgroundColor: themeColor13.bgColor(1),
    width: '100%',
    paddingHorizontal: 15,
  },
  footerLogo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  supportButton: {
    backgroundColor: themeColor0.bgColor(1),
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 5,
  },
  supportText: {
    color: themeColor4.bgColor(1),
    fontWeight: 'bold',
  },
  language: {
    color: themeColor4.bgColor(1),
    fontSize: 16,
  },
  phone: {
    color: themeColor4.bgColor(1),
    fontSize: 16,
  },
  menuBox: {
    backgroundColor: themeColor10.bgColor(0.95),
    borderRadius: 8,
    padding: 10,
    width: '90%',
    maxHeight: '0%',
    marginBottom: 20,
  },
  menuScroll: {
    paddingVertical: 10,
  },
  menuItem: {
    ...NewStyles.row,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    marginRight: 10,
    color: themeColor10.bgColor(1),
  },
  list: {},
  item: {
    backgroundColor: themeColor4.bgColor(1),
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    color: themeColor10.bgColor(1),
    fontSize: 16,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 10,
    marginTop: 10,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: themeColor7.bgColor(1),
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exitButton: {
    ...NewStyles.row,
    backgroundColor: themeColor6.bgColor(1),
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 5,
    ...NewStyles.border5
  },
  exitButtonText: {
    color: themeColor4.bgColor(1),
    fontSize: 14,
  },
});