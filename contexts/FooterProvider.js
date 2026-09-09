import React, { createContext, useCallback, useContext, useMemo, useState, useEffect, memo, } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Image, Linking, Modal, BackHandler, ActivityIndicator, TouchableWithoutFeedback, } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { setToken } from '../slices/authSlice';
import { emptyUser, fetchUser } from '../slices/userSlice';
import { atWork, logoutTechnician } from '../services/Api';
import * as NavigationService from '../services/NavigationService';
import { navigationRef } from '../services/NavigationService';
import ConfirmationModal from '../components/ConfirmationModal';
import { mainUri } from '../services/URL';
import {
  colors,
  themeColor7,
  themeColor8,
  themeColor12,
  themeColor14,
} from '../theme/Color';
import { spacing } from '../theme/Spacing';
import { radius } from '../theme/Radius';
import { fontSize, getFontFamily } from '../theme/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguage } from '../slices/languageSlice';

const FooterContext = createContext(null);

export const useFooter = () => {
  const context = useContext(FooterContext);

  if (!context) {
    throw new Error('useFooter must be used within a FooterProvider');
  }

  return context;
};

// Compact glass button that lives inside the dock. Windows 7 Aero is only the
// visual mood here: a soft illumination on hover/press, and a brighter glass
// fill + blue glow + underline when the item is active.
function DockButton({ icon, image, label, active, onPress, lang }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.dockBtn,
        (hovered || pressed) && styles.dockBtnHover,
        active && styles.dockBtnActive,
      ]}
    >
      {active ? <View style={styles.activeGlow} pointerEvents="none" /> : null}
      {image ? (
        <Image source={image} style={styles.dockBtnImage} />
      ) : (
        <Ionicons
          name={icon}
          size={19}
          color={active ? themeColor14.color : colors.white.bgColor(0.82)}
        />
      )}
      {active ? (
        <Text
          style={[styles.dockBtnLabel, { fontFamily: getFontFamily('bold', lang) }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
      {active ? <View style={styles.activeUnderline} pointerEvents="none" /> : null}
    </Pressable>
  );
}

const FooterMenuItem = memo(function FooterMenuItem({ item, lang, onPress }) {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.menuItem,
        (pressed || hovered) && styles.menuItemHover,
      ]}
      onPress={handlePress}
    >
      <Text
        style={[styles.menuItemText, { fontFamily: getFontFamily('bold', lang) }]}
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Ionicons name="chevron-back" size={14} color={colors.white.bgColor(0.35)} />
    </Pressable>
  );
});

const FooterMenuModal = memo(function FooterMenuModal({ visible, menuItems, userToken, lang, t, onClose, onMenuItemPress, onLogoutClick, atWork, handleWorkat, workAtLoading }) {
  useEffect(() => {
    if (!visible) return undefined;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      }
    );

    return () => subscription.remove();
  }, [visible, onClose]);

  const renderItem = useCallback(
    ({ item }) => (
      <FooterMenuItem item={item} lang={lang} onPress={onMenuItemPress} />
    ),
    [lang, onMenuItemPress]
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.menuOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuPanel}>
              <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={[colors.white.bgColor(0.12), themeColor12.bgColor(0.22), colors.black.bgColor(0.34)]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={[colors.white.bgColor(0.3), colors.white.bgColor(0)]}
                style={styles.topSheen}
                pointerEvents="none"
              />
              <View style={styles.menuHandle} />
              <FlatList
                data={menuItems}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />

              {userToken ? (
                <View style={styles.bottomButtons}>
                  <Pressable
                    style={({ pressed, hovered }) => [
                      styles.sheetBtn,
                      (pressed || hovered) && styles.sheetBtnHover,
                    ]}
                    onPress={onLogoutClick}
                  >
                    <Ionicons name="log-out-outline" size={16} color={themeColor14.color} />
                    <Text
                      style={[styles.sheetBtnText, { fontFamily: getFontFamily('bold', lang) }]}
                    >
                      {t('Logout')}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleWorkat}
                    disabled={workAtLoading}
                    style={({ pressed, hovered }) => [
                      styles.sheetBtn,
                      (pressed || hovered) && styles.sheetBtnHover,
                      atWork == 1 && styles.sheetBtnOn,
                    ]}
                  >
                    {workAtLoading ? (
                      <ActivityIndicator size="small" color={themeColor14.color} />
                    ) : (
                      <Ionicons name="power-outline" size={16} color={themeColor14.color} />
                    )}
                    <Text
                      style={[styles.sheetBtnText, { fontFamily: getFontFamily('bold', lang) }]}
                    >
                      {atWork == 1 ? t('On') : t('Off')}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const FooterRoot = memo(function FooterRoot({ isVisible }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const dispatch = useDispatch();

  const userToken = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.user?.data?.data?.technician);
  const [loading, setLoading] = useState(false);

  const userData = useSelector(
    (state) => state.user?.data?.data?.technician,
    shallowEqual
  );

  const contact = useSelector(
    (state) => state.contacts?.data?.data,
    shallowEqual
  );

  const insets = useSafeAreaInsets();

  // System-tray clock — inspired by the Windows 7 taskbar corner clock.
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const timeLabel = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Active-route tracking. FooterRoot renders outside NavigationContainer, so
  // the navigation hooks are not available — read the current route off the
  // shared navigation ref instead.
  const [currentRoute, setCurrentRoute] = useState(() =>
    NavigationService.getCurrentRouteName()
  );
  useEffect(() => {
    const sync = () => setCurrentRoute(NavigationService.getCurrentRouteName());
    let unsubscribe;
    const attach = () => {
      if (navigationRef.isReady()) {
        sync();
        unsubscribe = navigationRef.addListener('state', sync);
        return true;
      }
      return false;
    };
    if (!attach()) {
      const poll = setInterval(() => {
        if (attach()) clearInterval(poll);
      }, 250);
      return () => {
        clearInterval(poll);
        unsubscribe?.();
      };
    }
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!userToken) {
      setMenuVisible(false);
    }
  }, [userToken]);

  const openMenu = useCallback(() => setMenuVisible(true), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirmChange = useCallback((value) => {
    setShowLogoutConfirm(value);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setShowLogoutConfirm(false);
      setMenuVisible(false);

      dispatch(setToken(null));
      dispatch(emptyUser());

      await logoutTechnician();

      NavigationService.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.log('Error during logout:', error);
    }
  }, [dispatch]);

  const handleWorkat = useCallback(async () => {
    try {
      setLoading(true);

      await atWork(userToken);
    } catch (error) {
      console.log('Error during at work change:', error);
    } finally {
      setLoading(false);
      dispatch(fetchUser(userToken));
    }
  }, [dispatch, userToken]);

  const handleDeleteAccount = useCallback(() => {
    Linking.openURL(`${mainUri}/delete-account-request`);
  }, []);

  const menuItemsLoggedIn = useMemo(
    () => [
      {
        id: '1',
        title: t('Organizations'),
        screen: 'OrganizationsListScreen',
        apple_check: userData?.apple_check,
      },
      {
        id: '2',
        title: t('Home'),
        screen: 'FolderScreen',
      },
      {
        id: '3',
        title: t('Delete Account'),
        action: handleDeleteAccount,
      },
      {
        id: '4',
        title: t('Warranty / Guarantee'),
        screen: 'WarrantyScreen',
        apple_check: userData?.apple_check,
      },
      {
        id: '5',
        title: t('Learn More'),
        screen: 'LearnMoreScreen',
        apple_check: userData?.apple_check,
      },
      {
        id: '6',
        title: t('About Us'),
        screen: 'AboutScreen',
        apple_check: userData?.apple_check,
      },
    ],
    [t, userData?.apple_check, handleDeleteAccount]
  );

  const menuItemsLoggedOut = useMemo(
    () => [
      {
        id: '1',
        title: t('Login'),
        screen: 'Login',
      },
      {
        id: '2',
        title: t('Sign Up'),
        screen: 'SignIn',
      },
      {
        id: '3',
        title: t('Warranty / Guarantee'),
        screen: 'WarrantyScreen',
      },
      {
        id: '4',
        title: t('Learn More'),
        screen: 'LearnMoreScreen',
      },
      {
        id: '5',
        title: t('About Us'),
        screen: 'AboutScreen',
      },
    ],
    [t]
  );

  const menuItems = useMemo(() => {
    if (!userToken) return menuItemsLoggedOut;

    return menuItemsLoggedIn.filter(
      (item) => !item.apple_check || item.apple_check !== 1
    );
  }, [userToken, menuItemsLoggedIn, menuItemsLoggedOut]);

  const handleMenuItemPress = useCallback(
    (item) => {
      closeMenu();

      if (item?.screen) {
        try {
          NavigationService.navigate(item.screen);
        } catch (error) {
          NavigationService.reset({
            index: 0,
            routes: [{ name: item.screen }],
          });
        }

        return;
      }

      if (item?.action) {
        item.action();
      }
    },
    [closeMenu]
  );

  const changeLanguage = useCallback(
    async (lng) => {
      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem('language', lng);
      dispatch(setLanguage(lng));
    },
    [dispatch, i18n]
  );

  const toggleLanguage = useCallback(() => {
    changeLanguage(i18n.language === 'en' ? 'fa' : 'en');
  }, [changeLanguage, i18n.language]);

  const navItems = useMemo(
    () => [
      { key: 'menu', icon: 'grid-outline', label: 'منو', action: 'menu' },
      { key: 'orders', icon: 'receipt-outline', label: 'سفارش‌ها', screen: 'OrderListScreen' },
      { key: 'call', icon: 'call-outline', label: 'تماس', action: 'call' },
      {
        key: 'support',
        image: require('../assets/images/support.webp'),
        label: 'پشتیبانی',
        action: 'support',
      },
      { key: 'account', icon: 'person-outline', label: 'حساب', screen: 'PersonalInfoScreen' },
    ],
    []
  );

  const isActive = useCallback(
    (item) => {
      if (item.action === 'menu') return menuVisible;
      if (item.screen) return item.screen === currentRoute;
      return false;
    },
    [menuVisible, currentRoute]
  );

  const handleDockPress = useCallback(
    (item) => {
      if (item.action === 'menu') {
        setMenuVisible((v) => !v);
        return;
      }
      if (item.action === 'call') {
        Linking.openURL('tel:02121164552');
        return;
      }
      if (item.action === 'support') {
        NavigationService.navigate('MessageScreen');
        setMenuVisible(false);
        return;
      }
      if (item.screen) {
        NavigationService.navigate(item.screen);
        setMenuVisible(false);
      }
    },
    []
  );

  if (!isVisible) return null;

  return (
    <>
      {userToken ? (
        <SafeAreaView
          edges={{ top: 'off', bottom: 'off' }}
          style={[styles.footerRoot, { bottom: insets?.bottom }]}
          pointerEvents="box-none"
        >
          {/* Floating bottom dock with a glassy (Aero) mood — not a pixel
              rebuild: a dark glass dock with compact icon buttons. */}
          <View style={styles.dockShadow}>
            <View style={styles.dock}>
              <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={[colors.white.bgColor(0.14), themeColor12.bgColor(0.16), colors.black.bgColor(0.24)]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={[colors.white.bgColor(0.35), colors.white.bgColor(0)]}
                style={styles.topSheen}
                pointerEvents="none"
              />
              <View style={styles.topEdge} pointerEvents="none" />
              <LinearGradient
                colors={[colors.black.bgColor(0), colors.black.bgColor(0.22)]}
                style={styles.bottomShade}
                pointerEvents="none"
              />

              <View style={styles.dockRow}>
                <View style={styles.navGroup}>
                  {navItems.map((item) => (
                    <DockButton
                      key={item.key}
                      icon={item.icon}
                      image={item.image}
                      label={item.label}
                      lang={lang}
                      active={isActive(item)}
                      onPress={() => handleDockPress(item)}
                    />
                  ))}
                </View>

                <View style={styles.trayDivider} />

                <Pressable style={styles.tray} onPress={toggleLanguage}>
                  <Ionicons
                    name="globe-outline"
                    size={13}
                    color={colors.white.bgColor(0.7)}
                  />
                  <Text
                    style={[styles.trayText, { fontFamily: getFontFamily('bold', lang) }]}
                  >
                    {t(i18n.language)}
                  </Text>
                  <Text
                    style={[styles.trayClock, { fontFamily: getFontFamily('bold', lang) }]}
                  >
                    {timeLabel}
                  </Text>
                  {user?.referral_code ? (
                    <Text
                      style={[styles.trayCode, { fontFamily: getFontFamily('bold', lang) }]}
                      numberOfLines={1}
                    >
                      {user.referral_code}
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      ) : null}

      <FooterMenuModal
        visible={menuVisible}
        menuItems={menuItems}
        userToken={userToken}
        lang={lang}
        t={t}
        onClose={closeMenu}
        onMenuItemPress={handleMenuItemPress}
        onLogoutClick={handleLogoutClick}
        atWork={user?.at_work}
        handleWorkat={handleWorkat}
        workAtLoading={loading}
      />

      <ConfirmationModal
        confirmationModal={showLogoutConfirm}
        setConfirmationModal={handleLogoutConfirmChange}
        action={handleLogout}
        title={t('Log out of account')}
        message={t('Are you sure you want to log out?')}
      />
    </>
  );
});

export const FooterProvider = ({ children }) => {
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const { i18n } = useTranslation();
  const showFooter = useCallback(() => {
    setIsFooterVisible(true);
  }, []);

  const hideFooter = useCallback(() => {
    setIsFooterVisible(false);
  }, []);

  const toggleFooter = useCallback(() => {
    setIsFooterVisible((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isFooterVisible,
      showFooter,
      hideFooter,
      toggleFooter,
    }),
    [isFooterVisible, showFooter, hideFooter, toggleFooter]
  );
  const dispatch = useDispatch();
  const loadLanguage = async () => {
    try {
      const language = await AsyncStorage.getItem('language');
      if (language) {
        dispatch(setLanguage(language));
        i18n.changeLanguage(language);
      } else {
        i18n.changeLanguage('fa');
      }
    } catch (error) {
      console.error('Error loading language', error);
    }
  };
  useEffect(() => {
    loadLanguage();
    console.log('Loading lang');
  }, []);
  return (
    <FooterContext.Provider value={value}>
      {children}
      <FooterRoot isVisible={isFooterVisible} />
    </FooterContext.Provider>
  );
};

const styles = StyleSheet.create({
  // Anchors the dock to the bottom of the screen without blocking touches
  // outside its own bounds.
  footerRoot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Outer view carries the soft floating shadow; inner view clips the glass.
  dockShadow: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.black.bgColor(0.04),
    shadowColor: colors.black.color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 12,
  },
  dock: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.white.bgColor(0.3),
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 1,
    backgroundColor: colors.white.bgColor(0.6),
  },
  bottomShade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 22,
  },
  dockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 58,
  },
  navGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minWidth: 40,
    height: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.white.bgColor(0),
    overflow: 'hidden',
  },
  dockBtnHover: {
    backgroundColor: colors.white.bgColor(0.09),
    borderColor: colors.white.bgColor(0.16),
  },
  dockBtnActive: {
    backgroundColor: themeColor8.bgColor(0.2),
    borderColor: themeColor8.bgColor(0.55),
    shadowColor: themeColor8.color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 6,
  },
  dockBtnImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  activeGlow: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: themeColor8.bgColor(0.28),
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 3,
    alignSelf: 'center',
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: themeColor14.color,
  },
  dockBtnLabel: {
    color: themeColor14.color,
    fontSize: fontSize.xs,
  },
  trayDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.white.bgColor(0.16),
    marginHorizontal: spacing.sm,
  },
  tray: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  trayText: {
    color: colors.white.bgColor(0.75),
    fontSize: fontSize.xs,
  },
  trayClock: {
    color: colors.white.bgColor(1),
    fontSize: fontSize.sm,
    letterSpacing: 0.5,
  },
  trayCode: {
    color: colors.white.bgColor(0.6),
    fontSize: fontSize.xs,
    maxWidth: 64,
  },

  // Bottom-sheet style menu, same dark glass language as the dock.
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.black.bgColor(0.3),
  },
  menuPanel: {
    maxHeight: '72%',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.white.bgColor(0.28),
    paddingBottom: spacing.lg,
  },
  menuHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white.bgColor(0.25),
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  list: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.white.bgColor(0.06),
  },
  menuItemHover: {
    backgroundColor: colors.white.bgColor(0.08),
  },
  menuItemText: {
    flex: 1,
    color: colors.white.bgColor(0.9),
    fontSize: fontSize.sm,
    textAlign: 'right',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sheetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.white.bgColor(0.16),
    backgroundColor: colors.white.bgColor(0.06),
  },
  sheetBtnHover: {
    backgroundColor: colors.white.bgColor(0.12),
  },
  sheetBtnOn: {
    backgroundColor: themeColor7.bgColor(0.35),
    borderColor: themeColor7.bgColor(0.6),
  },
  sheetBtnText: {
    color: themeColor14.color,
    fontSize: fontSize.xs,
  },
});
