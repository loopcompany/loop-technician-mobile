import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  BackHandler,
  Platform,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { setToken } from '../slices/authSlice';
import { emptyUser } from '../slices/userSlice';
import { logoutTechnician } from '../services/Api';
import * as NavigationService from '../services/NavigationService';
import ConfirmationModal from '../components/ConfirmationModal';
import { themeColor0, themeColor4, themeColor6, themeColor7, themeColor10, themeColor13 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

const FooterContext = createContext();

export const useFooter = () => {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error('useFooter must be used within a FooterProvider');
  }
  return context;
};

export const FooterProvider = ({ children }) => {
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  const dispatch = useDispatch();
  const userToken = useSelector((state) => state.auth.token);

  const showFooter = () => setIsFooterVisible(true);
  const hideFooter = () => setIsFooterVisible(false);
  const toggleFooter = () => setIsFooterVisible((prev) => !prev);

  // Menu items based on authentication state
  const menuItemsLoggedIn = [
    { id: '1', title: 'سازمان ها', screen: 'OrganizationsListScreen' },
    { id: '2', title: 'صفحه اصلی', screen: 'FolderScreen' },
    { id: '3', title: 'گارانتی', screen: 'WarrantyScreen' },
    { id: '4', title: 'بیشتر بدانید', screen: 'LearnMoreScreen' },
    { id: '5', title: 'درباره ما', screen: 'AboutScreen' },
  ];

  const menuItemsLoggedOut = [
    { id: '1', title: 'ورود', screen: 'Login' },
    { id: '2', title: 'ثبت نام', screen: 'SignIn' },
    { id: '3', title: 'گارانتی', screen: 'WarrantyScreen' },
    { id: '4', title: 'بیشتر بدانید', screen: 'LearnMoreScreen' },
    { id: '5', title: 'درباره ما', screen: 'AboutScreen' },
  ];

  const menuItems = userToken ? menuItemsLoggedIn : menuItemsLoggedOut;

  // Handle logout
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    try {
      // فقط مودال تأیید را می‌بندیم
      setShowLogoutConfirm(false);
      
      dispatch(setToken(null));
      dispatch(emptyUser());
      await logoutTechnician();
      
      // منو به صورت خودکار با navigation.reset بسته می‌شود
      NavigationService.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Open menu with animation
  const openMenu = () => {
    setMenuVisible(true);
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(menuAnimation, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 0);
  };

  // Close menu with animation
  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  // Android back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuVisible) {
        closeMenu();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [menuVisible]);

  // بستن منو وقتی logout می‌شود
  useEffect(() => {
    if (!userToken && menuVisible) {
      setMenuVisible(false);
      menuAnimation.setValue(0);
      overlayOpacity.setValue(0);
    }
  }, [userToken]);

  // Menu item press handler
  const handleMenuItemPress = (screen) => {
    closeMenu();
    setTimeout(() => {
      if (screen) {
        try {
          NavigationService.navigate(screen);
        } catch (error) {
          NavigationService.reset({
            index: 0,
            routes: [{ name: screen }],
          });
        }
      }
    }, 200);
  };

  // Render menu item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleMenuItemPress(item.screen)}
    >
      <Text style={[NewStyles.text10,styles.title]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  // Footer Component
  const FooterComponent = () => {
    return (
      <SafeAreaView edges={{top:'off', bottom:'additive'}} style={styles.footer}>
        {/* Animated Overlay */}
        {menuVisible && (
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.overlayTouchable}
              activeOpacity={1}
              onPress={closeMenu}
            />
          </Animated.View>
        )}

        {/* Animated Menu */}
        {menuVisible && (
          <Animated.View
            style={[
              styles.coverlist,
              {
                transform: [
                  {
                    translateY: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [500, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.coverlist2}>
              <View style={styles.menuContainer}>
                <FlatList
                  data={menuItems}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                />
              </View>
              {userToken && (
                <View style={styles.bottomButtons}>
                  <TouchableOpacity
                    style={styles.exitButton}
                    onPress={handleLogoutClick}
                  >
                    <Ionicons
                      name="power-outline"
                      size={16}
                      color={themeColor4.bgColor(1)}
                    />
                    <Text style={[NewStyles.text4,styles.exitButtonText]}>خروج</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Logout Confirmation Modal */}
        <ConfirmationModal
          confirmationModal={showLogoutConfirm}
          setConfirmationModal={setShowLogoutConfirm}
          action={handleLogout}
          title="خروج از حساب کاربری"
          message="آیا مطمئن به خروج هستید؟"
        />

        {/* Footer Bar */}
        <View style={styles.footerBar}>
          <TouchableOpacity onPress={menuVisible ? closeMenu : openMenu}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.footerLogo}
            />
          </TouchableOpacity>
          
          {userToken && (
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => NavigationService.navigate('MessageScreen')}
            >
              <Text style={NewStyles.text4}>پشتیبانی</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => {
            const phoneNumber = '02122656819';
            if (Platform.OS === 'android') {
              Linking.openURL(`tel:${phoneNumber}`);
            } else if (Platform.OS === 'ios') {
              Linking.openURL(`telprompt:${phoneNumber}`);
            } else {
              Linking.openURL(`tel:${phoneNumber}`);
            }
          }}>
            <Text style={[NewStyles.text4,styles.phone]}>۰۲۱۲۲۶۵۶۸۱۹</Text>
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  overlayTouchable: {
    width: '100%',
    height: '100%',
  },
  coverlist: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    width: '60%',
    zIndex: 999,
  },
  coverlist2: {
    backgroundColor: themeColor0.bgColor(1),
    // borderTopRightRadius: 20,
    // borderTopLeftRadius: 20,
    paddingTop: 15,
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 15,
  },
  menuContainer: {
    backgroundColor: themeColor4.bgColor(1),
    // borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 70,
    resizeMode: 'contain',
  },
  list: {},
  listContent: {
    paddingVertical: 15,
    gap: 10,
  },
  item: {
    backgroundColor: 'transparent',
    // paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    // borderBottomWidth: 1,
    // borderBottomColor: themeColor4.bgColor(0.2),
  },
  title: {
    fontSize: 16,
    textAlign: 'right',
    fontWeight: '600',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginTop: 10,
    gap: 10,
    justifyContent:"center"
  },
  exitButton: {
    ...NewStyles.row,
    backgroundColor: themeColor6.bgColor(1),
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
  },
  exitButtonText: {
    color: themeColor4.bgColor(1),
    fontSize: 14,
    fontWeight: '600',

  },
  footer: {
    backgroundColor: themeColor13.bgColor(1),
    width: '100%',
    paddingHorizontal: 15,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
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
  phone: {
    color: themeColor4.bgColor(1),
    fontSize: 14,
    fontWeight: '600',
  },
});
