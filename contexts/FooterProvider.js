import React, { createContext, useCallback, useContext, useMemo, useState, useEffect, memo, useRef, } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Linking, Modal, Pressable, BackHandler, Animated, Touchable, ActivityIndicator, TouchableWithoutFeedback, } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { setToken } from '../slices/authSlice';
import { emptyUser, fetchUser } from '../slices/userSlice';
import { atWork, logoutTechnician } from '../services/Api';
import * as NavigationService from '../services/NavigationService';
import ConfirmationModal from '../components/ConfirmationModal';
import NewStyles, { createStyles } from '../styles/NewStyles';
import { mainUri } from '../services/URL';
import { themeColor0, themeColor4, themeColor6, themeColor13, themeColor7 } from '../theme/Color';
import { showToastOrAlert } from '../helpers/Common';
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

const FooterMenuItem = memo(function FooterMenuItem({
  item,
  styles,
  newStyles,
  onPress,
}) {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity style={styles.item} onPress={handlePress}>
      <Text style={[newStyles.text10, styles.title]}>{item.title}</Text>
    </TouchableOpacity>
  );
});

const FooterMenuModal = memo(function FooterMenuModal({ visible, menuItems, userToken, styles, newStyles, t, onClose, onMenuItemPress, onLogoutClick, atWork, handleWorkat, workAtLoading }) {
  const insets = useSafeAreaInsets();

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
      <FooterMenuItem
        item={item}
        styles={styles}
        newStyles={newStyles}
        onPress={onMenuItemPress}
      />
    ),
    [styles, newStyles, onMenuItemPress]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}
    >

      <View style={styles.modalRoot}  >


        <View style={styles.modalBottomLayer}  >
          <View
            style={[
              styles.coverlist,
              {
                bottom: 60 + insets.bottom,
              },
            ]}
          >
            <View style={styles.coverlist2}>
              <TouchableOpacity style={{ paddingVertical: 10, alignSelf: 'flex-end' }} onPress={() => {
                onClose()
              }}>
                <Ionicons
                  name={'close'}
                  size={20}
                  color={themeColor4.bgColor(1)}
                />

              </TouchableOpacity>
              <View style={styles.menuContainer}>
                <FlatList
                  data={menuItems}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  keyboardShouldPersistTaps="handled"
                />
              </View>

              {userToken && (
                <View style={styles.bottomButtons}>
                  <TouchableOpacity
                    style={styles.exitButton}
                    onPress={onLogoutClick}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={16}
                      color={themeColor4.bgColor(1)}
                    />
                    <Text style={[newStyles.text4, styles.exitButtonText]}>
                      {t('Logout')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleWorkat} disabled={workAtLoading} style={[styles.exitButton, atWork == 1 && { backgroundColor: themeColor7.bgColor(1) }]}>
                    {
                      workAtLoading ?
                        <ActivityIndicator
                          size={'small'}
                          color={themeColor4.bgColor(1)}
                        />
                        :
                        <Ionicons
                          name={'power-outline'}
                          size={16}
                          color={themeColor4.bgColor(1)}
                        />}
                    <Text style={[newStyles.text4, styles.exitButtonText]}>{atWork == 1 ? t('On') : t('Off')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const FooterRoot = memo(function FooterRoot({ isVisible }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const userToken = useSelector((state) => state.auth.token); 
  const user = useSelector((state) => state.user?.data?.data?.technician);
  const [loading, setLoading] = useState(false)

  const userData = useSelector(
    (state) => state.user?.data?.data?.technician,
    shallowEqual
  );

  const contact = useSelector(
    (state) => state.contacts?.data?.data,
    shallowEqual
  );

  const newStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);

  const styles = useMemo(() => createLocalStyles(newStyles), [newStyles]);

  useEffect(() => {
    if (!userToken) {
      setMenuVisible(false);
    }
  }, [userToken]);

  const openMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

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
      setLoading(true)

      await atWork(userToken);
      
    } catch (error) {

      console.log('Error during at work change:', error);
    } finally {
      setLoading(false)
      dispatch(fetchUser(userToken))
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

  const handleSupportPress = useCallback(() => {
    NavigationService.navigate('MessageScreen');
  }, []);

  const handleContactPress = useCallback(() => {
    if (contact?.link) {
      Linking.openURL(contact.link);
    }
  }, [contact?.link]);

  const instets = useSafeAreaInsets()
  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('language', lng);
    dispatch(setLanguage(lng))
  };

  if (!isVisible) return null;

  return (
    <>
      {userToken && (
        <SafeAreaView
          edges={{ top: 'off', bottom: 'off' }}
          style={[styles.footer, { bottom: instets?.bottom }]}
        >
          <View style={styles.footerBar}>

            <AnimatedFooterLogoButton
              onPress={menuVisible ? closeMenu : openMenu}
              logoStyle={styles.footerLogo}
            />

            <TouchableOpacity
              style={styles.supportButton}
              onPress={handleSupportPress}
            >
              <Image
              source={require('../assets/images/support.png')}
              style={{height:40, width:60, resizeMode:'contain',}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => {
                if (i18n.language == 'en') {
                  changeLanguage('fa');
                } else {
                  changeLanguage('en');
                }
              }}
            >
              <Text style={NewStyles.text4}>{t(i18n.language)}</Text>
            </TouchableOpacity>

            <TouchableOpacity  >
              <Text style={[newStyles.text4, styles.phone]}>
                {user?.referral_code}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )} 
      <FooterMenuModal
        visible={menuVisible}
        menuItems={menuItems}
        userToken={userToken}
        styles={styles}
        newStyles={newStyles}
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



// Logo Animation
const AnimatedFooterLogoButton = React.memo(({ onPress, logoStyle }) => {
  const idleScaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pressScaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const motionLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(idleScaleAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(idleScaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const colorLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    );

    motionLoop.start();
    colorLoop.start();

    return () => {
      motionLoop.stop();
      colorLoop.stop();
    };
  }, [idleScaleAnim, rotateAnim, colorAnim]);

  const handlePress = useCallback(() => {
    pressScaleAnim.stopAnimation();

    Animated.sequence([
      Animated.timing(pressScaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(pressScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  }, [onPress, pressScaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      themeColor4.bgColor(1),
      themeColor4.bgColor(0.5),
    ],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={{
        marginVertical: 5, 
      }}
    >
      {/* این View فقط برای رنگ است و JS-driven می‌ماند */}
      <Animated.View
        style={{ 
          borderRadius: 100,
          overflow: 'hidden',
        }}
      >
        {/* این View فقط transform دارد و native-driven است */}
        <Animated.View
          style={{
            transform: [
              { scale: idleScaleAnim },
              { rotate },
            ],
          }}
        >
          {/* این View فقط برای press animation است و native-driven است */}
          <Animated.View
            style={{
              transform: [
                { scale: pressScaleAnim },
              ],
            }}
          >
            <Image
              source={require("../assets/images/start.png")}
              style={logoStyle}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
});



export const FooterProvider = ({ children }) => {
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const { i18n } = useTranslation()
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
  const dispatch = useDispatch()
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
    loadLanguage()
    console.log("Loading lang")
  }, [])
  return (
    <FooterContext.Provider value={value}>
      {children}
      <FooterRoot isVisible={isFooterVisible} />
    </FooterContext.Provider>
  );
};

const createLocalStyles = (newStyles) =>
  StyleSheet.create({
    modalRoot: {
      flex: 1,
    },

    modalBottomLayer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
    },

    overlayTouchable: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
      zIndex: 998,
    },

    coverlist: {
      position: 'absolute',
      left: 0,
      width: '60%',
      zIndex: 999,
    },

    coverlist2: {
      backgroundColor: themeColor0.bgColor(1),
      marginBottom: 10,
      width: '100%',
      paddingHorizontal: 15,
    },

    menuContainer: {
      backgroundColor: themeColor4.bgColor(1),
      marginBottom: 15,
      overflow: 'hidden',
    },

    list: {},

    listContent: {
      paddingVertical: 15,
      gap: 10,
    },

    item: {
      backgroundColor: 'transparent',
      paddingHorizontal: 20,
      width: '100%',
    },

    title: {
      ...newStyles.text10,
      fontSize: 16,
      fontWeight: '600',
    },

    bottomButtons: {
      paddingHorizontal: 15,
      paddingBottom: 15,
      marginTop: 10,
      gap: 10,
      ...NewStyles.rowWrapper,
    },

    exitButton: {
      ...newStyles.row,
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
      backgroundColor: themeColor0.bgColor(0.2),
      width: '100%',
      paddingHorizontal: 15,
      position: 'absolute'
    },

    footerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },

    footerLogo: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
    },

    supportButton: {  
      paddingVertical:5,
    },

    phone: {
      color: themeColor4.bgColor(1),
      fontSize: 14,
      fontWeight: '600',
    },
  });
