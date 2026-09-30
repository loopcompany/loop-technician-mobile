import React, { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef, memo, } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Image, Modal, BackHandler, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, Animated, Platform, } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { BlurView } from 'expo-blur';

import { setToken } from '../slices/authSlice';
import { emptyUser, fetchUser } from '../slices/userSlice';
import { atWork, logoutTechnician } from '../services/Api';
import * as NavigationService from '../services/NavigationService';
import { navigationRef } from '../services/NavigationService';
import ConfirmationModal from '../components/ConfirmationModal';
import { imageUri } from '../services/URL';
import { callSupport } from '../helpers/support';
import { showAlert } from '../helpers/Common';
import { createStyles } from '../styles/NewStyles';
import {
  colors,
  themeColor0,
  themeColor4,
  themeColor6,
  themeColor7,
} from '../theme/Color';
import { spacing } from '../theme/Spacing';
import { radius } from '../theme/Radius';
import { fontSize, getFontFamily } from '../theme/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguage } from '../slices/languageSlice';

// LOOP menu icons 01–07, in menu order.
const MENU_ICONS = {
  organizations: require('../assets/images/menu/01-organizations.png'),
  wallet: require('../assets/images/menu/02-wallet.png'),
  savedAddresses: require('../assets/images/menu/03-saved-addresses.png'),
  warranty: require('../assets/images/menu/04-warranty.png'),
  faq: require('../assets/images/menu/05-faq.png'),
  rules: require('../assets/images/menu/06-rules.png'),
  about: require('../assets/images/menu/07-about.png'),
};

// The intro screen plays full-screen video; the footer never belongs there.
const HIDDEN_ON_ROUTES = new Set(['Welcome']);

const FooterContext = createContext(null);

export const useFooter = () => {
  const context = useContext(FooterContext);

  if (!context) {
    throw new Error('useFooter must be used within a FooterProvider');
  }

  return context;
};

// The dock and the LOOP menu follow the user app (edits list 1405/07/03,
// items 9, 15 and 20): a blue glass dock whose round, gently animated LOOP
// button opens the menu.
const shadowLg = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
};

const LoopMenuButton = memo(function LoopMenuButton({ onPress, accessibilityLabel }) {
  const idleScale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(idleScale, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(idleScale, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [idleScale, rotate]);

  const handlePress = useCallback(() => {
    pressScale.stopAnimation();
    Animated.sequence([
      Animated.timing(pressScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(pressScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();
    onPress?.();
  }, [onPress, pressScale]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });

  return (
    <TouchableOpacity
      testID="dock-loop-menu"
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.menuButton}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={{ transform: [{ scale: idleScale }, { rotate: spin }] }}>
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
          <Image source={require('../assets/images/start.png')} style={styles.menuLogo} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
});

// Two-segment language switch (EN / فا), same as the user app's dock.
const LANG_SEG_WIDTH = 26;

const LanguageSwitch = memo(function LanguageSwitch({ language, onToggle }) {
  const isFa = language === 'fa';
  const slide = useRef(new Animated.Value(isFa ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: isFa ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 90,
    }).start();
  }, [isFa, slide]);

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [0, LANG_SEG_WIDTH] });

  return (
    <TouchableOpacity
      testID="dock-language"
      activeOpacity={0.8}
      onPress={onToggle}
      style={styles.dockAction}
      accessibilityRole="switch"
      accessibilityState={{ checked: isFa }}
      accessibilityLabel="Language / زبان"
    >
      <View style={styles.langTrack}>
        <Animated.View style={[styles.langThumb, { transform: [{ translateX }] }]} pointerEvents="none" />
        <View style={styles.langSeg}>
          <Text style={[styles.langText, !isFa && styles.langTextActive]}>EN</Text>
        </View>
        <View style={styles.langSeg}>
          <Text style={[styles.langText, { fontFamily: getFontFamily('bold', 'fa') }, isFa && styles.langTextActive]}>
            فا
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

function DockAction({ testID, icon, image, active, onPress, accessibilityLabel }) {
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.dockAction}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: !!active }}
    >
      {image ? (
        <Image source={image} style={styles.dockActionImage} />
      ) : (
        <Ionicons name={icon} size={22} color={colors.white.color} />
      )}
      <View style={[styles.activeDot, !active && styles.activeDotHidden]} />
    </TouchableOpacity>
  );
}

// Menu icons ship with the app (MENU_ICONS); the rest come from the server
// like the user app's, and until one is uploaded (or if it fails to load) a
// vector icon stands in so no row is blank.
const MenuIcon = memo(function MenuIcon({ image, icon }) {
  const [failed, setFailed] = useState(false);
  if (image && !failed) {
    const source = typeof image === 'string' ? { uri: image } : image;
    return <Image source={source} style={styles.menuItemImage} onError={() => setFailed(true)} />;
  }
  return (
    <View style={[styles.menuItemImage, styles.menuItemIconFallback]}>
      <Ionicons name={icon || 'ellipse-outline'} size={26} color={themeColor0.bgColor(1)} />
    </View>
  );
});

// The LOOP menu is a copy of the user app's (contexts/MenuContext.js in
// loop-customer-mobile — edits list 1405/07/03, item 15): a full-height panel
// on the brand blue, the account header (name, badge, and in the spot of the
// user's points box the technician's activity on/off, item 17), one white row
// per item with a 50×50 icon, and close + logout at the bottom.
const FooterMenuModal = memo(function FooterMenuModal({ visible, menuItems, userToken, user, lang, t, onClose, onMenuItemPress, onLogoutClick, atWork, handleWorkat, workAtLoading }) {
  const insets = useSafeAreaInsets();
  const NewStyles = useMemo(() => createStyles(lang), [lang]);
  const writing = useMemo(() => ({ writingDirection: lang === 'fa' ? 'rtl' : 'ltr' }), [lang]);

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
      <TouchableOpacity
        testID={`menu-item-${item.id}`}
        style={[styles.menuItem, NewStyles.row]}
        onPress={() => onMenuItemPress(item)}
      >
        <MenuIcon image={item.image} icon={item.icon} />
        <Text style={[NewStyles.text10, writing]}>{item.title}</Text>
      </TouchableOpacity>
    ),
    [NewStyles, writing, onMenuItemPress]
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const isOn = atWork == 1;

  const renderHeader = () => (userToken ? (
    <View style={[styles.menuHeader, NewStyles.center]}>
      {!!user?.name && (
        <Text style={[NewStyles.title, writing, styles.menuHeaderName]}>{user.name}</Text>
      )}
      <Text style={styles.menuHeaderBadge}>{t('Technician')}</Text>

      {/* Activity on/off — always green when on, red when off (item 17). */}
      <Pressable
        testID="menu-at-work"
        onPress={handleWorkat}
        disabled={workAtLoading}
        accessibilityRole="switch"
        accessibilityState={{ checked: isOn, busy: workAtLoading }}
        style={({ pressed }) => [
          styles.atWorkButton,
          NewStyles.row,
          NewStyles.center,
          NewStyles.border10,
          { backgroundColor: isOn ? themeColor7.bgColor(1) : themeColor6.bgColor(1) },
          pressed && styles.pressed,
        ]}
      >
        {workAtLoading ? (
          <ActivityIndicator size="small" color={colors.white.color} />
        ) : (
          <Ionicons name="power" size={18} color={colors.white.color} />
        )}
        <Text style={[NewStyles.title, writing, styles.atWorkText]}>
          {isOn ? t('Activity status: On') : t('Activity status: Off')}
        </Text>
      </Pressable>
    </View>
  ) : null);

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      // Edge-to-edge Android: without these the modal ends under the system
      // navigation bar and close/logout can't be tapped on some phones. The
      // modal covers the whole screen and pads itself by the insets.
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.menuOverlay}>
        <View
          testID="loop-menu"
          style={[
            styles.menuPanel,
            { paddingTop: insets?.top || 0, paddingBottom: insets?.bottom || 0 },
          ]}
        >
          <FlatList
            ListHeaderComponent={renderHeader}
            data={menuItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.menuList}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.menuBottom, NewStyles.rowWrapper]}>
            <TouchableOpacity
              testID="menu-close"
              style={styles.menuClose}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('Close')}
            >
              <Ionicons name="close" size={20} color={themeColor4.bgColor(1)} />
            </TouchableOpacity>
            {userToken ? (
              <TouchableOpacity
                testID="menu-logout"
                style={[styles.logoutButton, NewStyles.row, NewStyles.center]}
                onPress={onLogoutClick}
              >
                <Ionicons name="power" size={20} color="#fff" />
                <Text style={styles.logoutText}>{t('Log out of account')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* The rest of the screen stays visible (as in the user app); tapping
            it closes the menu. */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.menuBackdrop} />
        </TouchableWithoutFeedback>
      </View>
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
  const [loading, setLoading] = useState(false);

  const userData = useSelector(
    (state) => state.user?.data?.data?.technician,
    shallowEqual
  );

  const insets = useSafeAreaInsets();

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
    // Close the menu before opening the confirmation: stacking two native
    // modals and then dismissing both at once can leave a blank overlay.
    setMenuVisible(false);
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirmChange = useCallback((value) => {
    setShowLogoutConfirm(value);
  }, []);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    setMenuVisible(false);

    // Leave the protected screens right away instead of waiting on the network
    // (and skip the intro video on Welcome).
    NavigationService.reset({
      index: 0,
      routes: [{ name: 'SignInLanding' }],
    });

    dispatch(setToken(null));
    dispatch(emptyUser());

    // Server-side logout runs in the background; local session is cleared
    // regardless of its outcome.
    logoutTechnician().catch((error) => {
      console.log('Error during logout:', error);
    });
  }, [dispatch]);

  const handleWorkat = useCallback(async () => {
    try {
      setLoading(true);

      const result = await atWork(userToken);
      if (!result?.success) {
        showAlert(t('Error'), result?.message || t('Could not change the activity status.'), [], t);
      }
    } catch (error) {
      showAlert(t('Error'), t('Could not change the activity status.'), [], t);
    } finally {
      // Re-read the profile either way so the button shows the server's state.
      await dispatch(fetchUser(userToken));
      setLoading(false);
    }
  }, [dispatch, userToken, t]);

  // Items per the edits list 1405/07/03: "Home" (15) and "Delete Account" (10)
  // removed — accounts are deleted from the admin panel only. Items 01–07 and
  // their icons (assets/images/menu) follow the design's order; Privacy (15)
  // stays last.
  const menuItemsLoggedIn = useMemo(
    () => [
      {
        id: 'organizations',
        title: t('Organizational / Corporate'),
        screen: 'OrganizationsListScreen',
        image: MENU_ICONS.organizations,
        apple_check: userData?.apple_check,
      },
      {
        id: 'wallet',
        title: t('Wallet'),
        screen: 'FinancialReportScreen',
        image: MENU_ICONS.wallet,
      },
      {
        id: 'saved-addresses',
        title: t('Saved addresses'),
        screen: 'SavedAddressesScreen',
        image: MENU_ICONS.savedAddresses,
      },
      {
        id: 'warranty',
        title: t('Warranty test deadline'),
        screen: 'WarrantyScreen',
        image: MENU_ICONS.warranty,
        apple_check: userData?.apple_check,
      },
      {
        id: 'faq',
        title: t('FAQ'),
        screen: 'LearnMoreScreen',
        image: MENU_ICONS.faq,
        apple_check: userData?.apple_check,
      },
      {
        id: 'rules',
        title: t('Rules'),
        screen: 'HandbookScreen',
        image: MENU_ICONS.rules,
      },
      {
        id: 'about',
        title: t('About us'),
        screen: 'AboutScreen',
        image: MENU_ICONS.about,
        apple_check: userData?.apple_check,
      },
      {
        id: 'privacy',
        title: t('Privacy'),
        screen: 'PrivacyPolicyScreen',
        image: `${imageUri}/userfolder/PrivacyScreen.png`,
        icon: 'lock-closed-outline',
        apple_check: userData?.apple_check,
      },
    ],
    [t, userData?.apple_check]
  );

  const menuItemsLoggedOut = useMemo(
    () => [
      { id: 'login', title: t('Login'), screen: 'Login', icon: 'log-in-outline' },
      { id: 'signup', title: t('Sign Up'), screen: 'SignIn', icon: 'person-add-outline' },
      { id: 'warranty', title: t('Warranty test deadline'), screen: 'WarrantyScreen', image: MENU_ICONS.warranty },
      { id: 'faq', title: t('FAQ'), screen: 'LearnMoreScreen', image: MENU_ICONS.faq },
      { id: 'rules', title: t('Rules'), screen: 'HandbookScreen', image: MENU_ICONS.rules },
      { id: 'about', title: t('About us'), screen: 'AboutScreen', image: MENU_ICONS.about },
      { id: 'privacy', title: t('Privacy'), screen: 'PrivacyPolicyScreen', image: `${imageUri}/userfolder/PrivacyScreen.png`, icon: 'lock-closed-outline' },
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

  const goTo = useCallback((screen) => {
    setMenuVisible(false);
    NavigationService.navigate(screen);
  }, []);

  // Derived from the route rather than toggled by screens, so a login that
  // doesn't pass back through Welcome can't leave the footer stuck hidden.
  if (!isVisible || !currentRoute || HIDDEN_ON_ROUTES.has(currentRoute)) return null;

  return (
    <>
      {userToken ? (
        <SafeAreaView
          edges={{ top: 'off', bottom: 'off' }}
          style={[styles.footerRoot, { bottom: (insets?.bottom || 0) + spacing.sm }]}
          pointerEvents="box-none"
        >
          <View style={styles.dockShadow}>
            {/* Blurred page + translucent brand-blue scrim: the dock's content is
                white, the scrim keeps it readable on light and dark screens. */}
            <View style={styles.dock}>
              <BlurView intensity={35} tint="default" style={StyleSheet.absoluteFill} pointerEvents="none" />
              <View style={styles.dockScrim} pointerEvents="none" />
              <View style={styles.dockTopEdge} pointerEvents="none" />

              <LoopMenuButton onPress={openMenu} accessibilityLabel={t('Menu')} />

              <LanguageSwitch language={i18n.language} onToggle={toggleLanguage} />

              <DockAction
                testID="dock-orders"
                icon="receipt-outline"
                accessibilityLabel={t('Orders')}
                active={currentRoute === 'OrderListScreen'}
                onPress={() => goTo('OrderListScreen')}
              />
              <DockAction
                testID="dock-call"
                icon="call-outline"
                accessibilityLabel={t('Call Support')}
                onPress={() => callSupport(t)}
              />
              <DockAction
                testID="dock-support"
                image={require('../assets/images/support-nobg.png')}
                accessibilityLabel={t('Support')}
                active={currentRoute === 'MessageScreen'}
                onPress={() => goTo('MessageScreen')}
              />
              <DockAction
                testID="dock-account"
                icon="person-outline"
                accessibilityLabel={t('Account')}
                active={currentRoute === 'PersonalInfoScreen'}
                onPress={() => goTo('PersonalInfoScreen')}
              />
            </View>
          </View>
        </SafeAreaView>
      ) : null}

      <FooterMenuModal
        visible={menuVisible}
        menuItems={menuItems}
        userToken={userToken}
        user={userData}
        lang={lang}
        t={t}
        onClose={closeMenu}
        onMenuItemPress={handleMenuItemPress}
        onLogoutClick={handleLogoutClick}
        atWork={userData?.at_work}
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
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  dockShadow: {
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
    ...shadowLg,
  },
  // Layout does not depend on the language: the LOOP button stays on the left.
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.white.bgColor(0.6),
  },
  dockScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary.bgColor(0.58),
  },
  dockTopEdge: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 1,
    backgroundColor: colors.white.bgColor(0.85),
  },
  menuButton: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLogo: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  dockAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  dockActionImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  activeDot: {
    width: 14,
    height: 2,
    borderRadius: 1,
    marginTop: 3,
    backgroundColor: colors.white.color,
  },
  activeDotHidden: {
    backgroundColor: 'transparent',
  },
  langTrack: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    backgroundColor: colors.primary.bgColor(0.16),
    borderWidth: 1,
    borderColor: colors.white.bgColor(0.6),
    padding: 2,
    overflow: 'hidden',
  },
  langThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: LANG_SEG_WIDTH,
    bottom: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.white.bgColor(0.95),
  },
  langSeg: {
    width: LANG_SEG_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  langText: {
    fontSize: fontSize.xs,
    fontFamily: getFontFamily('bold', 'en'),
    color: colors.white.color,
  },
  langTextActive: {
    color: colors.primary.color,
  },

  // LOOP menu — values copied from the user app's MenuContext styles.
  menuOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  menuPanel: {
    // No width: like the user app the panel is as wide as its content.
    backgroundColor: themeColor0.bgColor(1),
  },
  menuBackdrop: {
    flex: 1,
  },
  menuHeader: {
    backgroundColor: themeColor4.bgColor(1),
    padding: 15,
  },
  menuHeaderName: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  menuHeaderBadge: {
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.bgColor(0.12),
    color: colors.primary.color,
    fontSize: fontSize.xs,
    fontFamily: getFontFamily('bold', 'fa'),
    textAlign: 'center',
    overflow: 'hidden',
  },
  // Same box as the user app's "Your points" (90% wide, 10 vertical padding).
  atWorkButton: {
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    width: '90%',
    gap: spacing.sm,
  },
  atWorkText: {
    color: colors.white.color,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  menuList: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: themeColor0.bgColor(1),
  },
  menuItem: {
    backgroundColor: themeColor4.bgColor(1),
    paddingVertical: 2,
    paddingHorizontal: 20,
    width: '100%',
    gap: 5,
  },
  menuItemImage: {
    width: 50,
    height: 50,
  },
  menuItemIconFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBottom: {
    padding: 10,
    backgroundColor: themeColor0.bgColor(1),
  },
  menuClose: {
    padding: 10,
  },
  logoutButton: {
    backgroundColor: themeColor6.bgColor(1),
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'VazirBold',
  },
});
