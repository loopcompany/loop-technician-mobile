import { View, ActivityIndicator, I18nManager, Platform } from "react-native";
import React, { useCallback, useEffect, useState } from "react";

import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import { NavigationContainer, getStateFromPath } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from "react-redux";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

import store from "./store";
import { FooterProvider } from "./contexts/FooterProvider";
import NotificationsGate from "./components/NotificationsGate";
import DeviceSessionGate from "./components/DeviceSessionGate";
import { navigationRef, getCurrentRouteName, reset } from "./services/NavigationService";
import { removeToken, setToken } from "./slices/authSlice";
import { emptyUser, fetchUser } from "./slices/userSlice";
import { getToken, setAccessDeniedHandler, setUnauthorizedHandler } from "./services/session";
import { logoutTechnician } from "./services/Api";

// ✅ locales
import en from './assets/locales/en.json';
import fa from './assets/locales/fa.json';

I18nManager.forceRTL(false);

const Stack = createNativeStackNavigator();

const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

// Screens reachable without a session. Everything else requires a token.
const PUBLIC_ROUTES = new Set([
  'Welcome',
  'SignInLanding',
  'Login',
  'SignIn',
  'SignInScreen',
  'PhoneVerification',
  'ResetPasswordScreen',
  'LimitAccessScreen',
  'WarrantyScreen',
  'LearnMoreScreen',
  'AboutScreen',
  'HandbookScreen',
  'PrivacyScreen',
  'PrivacyPolicyScreen',
]);

const redirectToLoginIfProtected = () => {
  const current = getCurrentRouteName();
  if (current && !PUBLIC_ROUTES.has(current)) {
    reset({ index: 0, routes: [{ name: 'Login' }] });
  }
};

// A 401 from any request means the session is gone: sync redux and send the
// user to the login screen (session storage is already cleared by then).
setUnauthorizedHandler(() => {
  store.dispatch(removeToken());
  store.dispatch(emptyUser());
  redirectToLoginIfProtected();
});

// A navigation reset requested before the navigator is ready (e.g. the
// profile check on app start) is applied from onReady instead of being lost.
let pendingReset = null;
const resetWhenReady = (state) => {
  if (navigationRef.isReady()) {
    reset(state);
  } else {
    pendingReset = state;
  }
};

// Suspended from the admin panel while signed in: sign out (also unregisters
// this device's push token) and show why (edits list 1405/07/03, item 5).
setAccessDeniedHandler((message) => {
  store.dispatch(removeToken());
  store.dispatch(emptyUser());
  resetWhenReady({ index: 0, routes: [{ name: 'LimitAccessScreen', params: { message } }] });
  logoutTechnician().catch(() => {});
});

const enforceAuthGuard = () => {
  if (!store.getState().auth.token) {
    redirectToLoginIfProtected();
  }
};

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

// ✅ init i18n — فقط یکبار، قبل از App
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
    },
    lng: 'fa',
    fallbackLng: 'fa',
    interpolation: {
      escapeValue: false,
    },
  });

if (Platform.OS === 'web') {
  // Older web builds persisted the whole redux state (token included) here.
  try {
    window.localStorage?.removeItem('reduxState');
  } catch {}
}

// Linking configuration برای پشتیبانی از Deep Linking و Browser History
const linking = {
  prefixes: ['https://tech-panel.khayyamtech.com', 'http://localhost:8082', 'http://localhost:8081'],
  getStateFromPath: (path, options) => {
    if (!path || path === '/' || path === '') {
      return { routes: [{ name: 'Welcome' }] };
    }
    const normalizedPath = path.replace(/\/+$/, '');
    return getStateFromPath(normalizedPath, options);
  },
  config: {
    screens: {
      Welcome: '',
      SignInLanding: 'signin-landing',
      FolderScreen: 'folder',
      Login: 'login',
      SignIn: 'signup',
      SignInScreen: 'register',
      PhoneVerification: 'verify-phone',
      ResetPasswordScreen: 'reset-password',
      GuideScreen: 'guide',
      OrderListScreen: 'orders',
      OrderDetailScreen: 'order/:orderId',
      FieldServiceReportScreen: 'order/:orderId/field-service',
      NewServiceScreen: 'new-service',
      RequestsScreen: 'requests',
      RequestsListScreen: 'requests/list',
      LeaveRequestsListScreen: 'requests/leave',
      DebtRequestsListScreen: 'requests/debt',
      ManpowerRequestsListScreen: 'requests/manpower',
      TransferRequestsListScreen: 'requests/transfer',
      TerminationRequestsListScreen: 'requests/termination',
      PerformanceScreen: 'performance',
      ChangePasswordScreen: 'change-password',
      PhotoArchiveScreen: 'photos',
      NotesScreen: 'notes',
      AddEditNote: 'notes/edit',
      RateListScreen: 'rates',
      IncentivePlansScreen: 'incentive-plans',
      LoopReportScreen: 'loop-report',
      FinancialReportScreen: 'financial-report',
      MessageScreen: 'messages',
      ChatListScreen: 'chats',
      ChatRoom: 'chat/:userId',
      IndexScreen: 'index',
      PersonalInfoScreen: 'profile/personal',
      VehicleInfoScreen: 'profile/vehicle',
      FinancialInfoScreen: 'profile/financial',
      AccountSecurityScreen: 'profile/security',
      ActiveDevicesScreen: 'profile/security/devices',
      LogoutOtherDevicesScreen: 'profile/security/logout-others',
      SessionsScreen: 'profile/security/sessions',
      GameMenu: 'game',
      GamePlay: 'game/play',
      GameResult: 'game/result',
      LearnMoreScreen: 'learn-more',
      AboutScreen: 'about',
      HandbookScreen: 'rules',
      SavedAddressesScreen: 'saved-addresses',
      AddNewAddress: 'add-address',
      Map: 'map',
      RateCategory: 'category-rates',
      WarrantyScreen: 'warranty',
      PrivacyScreen: 'privacy',
      PrivacyPolicyScreen: 'privacy-policy',
      LimitAccessScreen: 'limit-access',
      TrainingRegistrationScreen: 'training-registration',
      OrganizationsListScreen: 'organizations',
      OrganizationOrdersScreen: 'organizations/:organizationId/orders',
    },
  },
};

/**
 * Restores the persisted session before the navigator mounts. Only local
 * storage is awaited; the token is validated in the background by fetchUser,
 * and a 401 there is handled by the global unauthorized handler.
 */
const handleNavigationReady = () => {
  if (pendingReset) {
    reset(pendingReset);
    pendingReset = null;
  }
  enforceAuthGuard();
};

const SessionGate = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await getToken();
        if (savedToken) {
          dispatch(setToken(savedToken));
          dispatch(fetchUser());
        }
      } catch (error) {
        console.log('Error restoring session:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return children;
};

// Screens are loaded lazily (getComponent) so startup only evaluates the
// modules of the first screen instead of all ~60.
const AppNavigator = () => (
  <View style={{ flex: 1 }}>
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" getComponent={() => require("./screens/Welcome").default} />
            <Stack.Screen name="SignInLanding" getComponent={() => require("./screens/auth/SignInLanding").default} />
            <Stack.Screen name="FolderScreen" getComponent={() => require("./screens/FolderScreen").default} />
            <Stack.Screen name="Login" getComponent={() => require("./screens/auth/Login").default} />
            <Stack.Screen name="SignInScreen" getComponent={() => require("./screens/auth/SignInScreen").default} />
            <Stack.Screen name="SignIn" getComponent={() => require("./screens/auth/SignIn").default} options={{ presentation: 'card', gestureEnabled: true }} />
            <Stack.Screen name="ResetPasswordScreen" getComponent={() => require("./screens/auth/ResetPasswordScreen").default} />
            <Stack.Screen name="PhoneVerification" getComponent={() => require("./screens/auth/PhoneVerificationScreen").default} />
            <Stack.Screen name="GuideScreen" getComponent={() => require("./screens/performservice/GuideScreen").default} />
            <Stack.Screen name="HardwareIssueScreen" getComponent={() => require("./screens/performservice/HardwareIssueScreen").default} />
            <Stack.Screen name="SoftwareInstallScreen" getComponent={() => require("./screens/performservice/SoftwareInstallScreen").default} />
            <Stack.Screen name="DeviceModelInfoScreen" getComponent={() => require("./screens/performservice/DeviceModelInfoScreen").default} />
            <Stack.Screen name="OrderListScreen" getComponent={() => require("./screens/performservice/OrderListScreen").default} />
            <Stack.Screen name="OrderDetailScreen" getComponent={() => require("./screens/performservice/OrderDetailScreen").default} />
            <Stack.Screen name="FieldServiceReportScreen" getComponent={() => require("./screens/fieldservice/FieldServiceReportScreen").default} />
            <Stack.Screen name="ChatListScreen" getComponent={() => require("./screens/chat/ChatListScreen").default} />
            <Stack.Screen name="ChatRoom" getComponent={() => require("./screens/chat/ChatRoom").default} />
            <Stack.Screen name="ExtraServices" getComponent={() => require("./screens/performservice/ExtraServices").default} />
            <Stack.Screen name="DeviceStatusScreen" getComponent={() => require("./screens/performservice/DeviceStatusScreen").default} />
            <Stack.Screen name="UserInfoScreen" getComponent={() => require("./screens/performservice/UserInfoScreen").default} />
            <Stack.Screen name="CompletionInfoScreen" getComponent={() => require("./screens/performservice/CompletionInfoScreen").default} />
            <Stack.Screen name="AttendanceScreen" getComponent={() => require("./screens/performservice/AttendanceScreen").default} />
            <Stack.Screen name="UserHistoryScreen" getComponent={() => require("./screens/performservice/UserHistoryScreen").default} />
            <Stack.Screen name="LaptopDeliveryScreen" getComponent={() => require("./screens/performservice/LaptopDeliveryScreen").default} />
            <Stack.Screen name="LaptopDispatchScreen" getComponent={() => require("./screens/performservice/LaptopDispatchScreen").default} />
            <Stack.Screen name="PartsExpensesScreen" getComponent={() => require("./screens/performservice/PartsExpensesScreen").default} />
            <Stack.Screen name="TechnicalIssuesScreen" getComponent={() => require("./screens/performservice/TechnicalIssuesScreen").default} />
            <Stack.Screen name="ServiceCompletionScreen" getComponent={() => require("./screens/performservice/ServiceCompletionScreen").default} />
            <Stack.Screen name="NewServiceScreen" getComponent={() => require("./screens/performservice/NewServiceScreen").default} />
            <Stack.Screen name="RequestsScreen" getComponent={() => require("./screens/RequestsScreen").default} />
            <Stack.Screen name="RequestsListScreen" getComponent={() => require("./screens/RequestsListScreen").default} />
            <Stack.Screen name="LeaveRequestsListScreen" getComponent={() => require("./screens/LeaveRequestsListScreen").default} />
            <Stack.Screen name="DebtRequestsListScreen" getComponent={() => require("./screens/DebtRequestsListScreen").default} />
            <Stack.Screen name="GameMenu" getComponent={() => require("./screens/game/GameMenuScreen").default} />
            <Stack.Screen name="GamePlay" getComponent={() => require("./screens/game/GamePlayScreen").default} />
            <Stack.Screen name="GameResult" getComponent={() => require("./screens/game/GameResultScreen").default} />
            <Stack.Screen name="ManpowerRequestsListScreen" getComponent={() => require("./screens/ManpowerRequestsListScreen").default} />
            <Stack.Screen name="TransferRequestsListScreen" getComponent={() => require("./screens/TransferRequestsListScreen").default} />
            <Stack.Screen name="TerminationRequestsListScreen" getComponent={() => require("./screens/TerminationRequestsListScreen").default} />
            <Stack.Screen name="PerformanceScreen" getComponent={() => require("./screens/PerformanceScreen").default} />
            <Stack.Screen name="ChangePasswordScreen" getComponent={() => require("./screens/ChangePasswordScreen").default} />
            <Stack.Screen name="PhotoArchiveScreen" getComponent={() => require("./screens/PhotoArchiveScreen").default} />
            <Stack.Screen name="DeliveryReceiptScreen" getComponent={() => require("./screens/DeliveryReceiptScreen").default} />
            <Stack.Screen name="NotesScreen" getComponent={() => require("./screens/NotesScreen").default} />
            <Stack.Screen name="AddEditNote" getComponent={() => require("./screens/notes/AddEditNoteScreen").default} />
            <Stack.Screen name="ThinkingScreen" getComponent={() => require("./screens/ThinkingScreen").default} />
            <Stack.Screen name="RateListScreen" getComponent={() => require("./screens/RateListScreen").default} />
            <Stack.Screen name="IncentivePlansScreen" getComponent={() => require("./screens/IncentivePlansScreen").default} />
            <Stack.Screen name="LoopReportScreen" getComponent={() => require("./screens/performservice/LoopReportScreen").default} />
            <Stack.Screen name="FinancialReportScreen" getComponent={() => require("./screens/performservice/FinancialReportScreen").default} />
            <Stack.Screen name="MessageScreen" getComponent={() => require("./screens/performservice/MessageScreen").default} />
            <Stack.Screen name="FeedbackSuggestionScreen" getComponent={() => require("./screens/performservice/FeedbackSuggestionScreen").default} />
            <Stack.Screen name="IndexScreen" getComponent={() => require("./screens/performservice/IndexScreen").default} />
            <Stack.Screen name="PrivacyScreen" getComponent={() => require("./screens/performservice/PrivacyScreen").default} />
            <Stack.Screen name="PrivacyPolicyScreen" getComponent={() => require("./screens/resources/PrivacyPolicyScreen").default} />
            <Stack.Screen name="AboutScreen" getComponent={() => require("./screens/resources/AboutScreen").default} />
            <Stack.Screen name="RateCategory" getComponent={() => require("./screens/RateCategory").default} />
            <Stack.Screen name="LearnMoreScreen" getComponent={() => require("./screens/resources/LearnMoreScreen").default} />
            <Stack.Screen name="WarrantyScreen" getComponent={() => require("./screens/resources/WarrantyScreen").default} />
            <Stack.Screen name="HandbookScreen" getComponent={() => require("./screens/resources/HandbookScreen").default} />
            <Stack.Screen name="SavedAddressesScreen" getComponent={() => require("./screens/SavedAddressesScreen").default} />
            <Stack.Screen name="AddNewAddress" getComponent={() => require("./screens/address/AddNewAddress").default} />
            <Stack.Screen name="Map" getComponent={() => require("./screens/address/Map").default} />
            <Stack.Screen name="PersonalInfoScreen" getComponent={() => require("./screens/performservice/PersonalInfoScreen").default} />
            <Stack.Screen name="VehicleInfoScreen" getComponent={() => require("./screens/performservice/VehicleInfoScreen").default} />
            <Stack.Screen name="FinancialInfoScreen" getComponent={() => require("./screens/performservice/FinancialInfoScreen").default} />
            <Stack.Screen name="AccountSecurityScreen" getComponent={() => require("./screens/security/AccountSecurityScreen").default} />
            <Stack.Screen name="ActiveDevicesScreen" getComponent={() => require("./screens/security/ActiveDevicesScreen").default} />
            <Stack.Screen name="LogoutOtherDevicesScreen" getComponent={() => require("./screens/security/LogoutOtherDevicesScreen").default} />
            <Stack.Screen name="SessionsScreen" getComponent={() => require("./screens/security/SessionsScreen").default} />
            <Stack.Screen name="TrainingRegistrationScreen" getComponent={() => require("./screens/TrainingRegistrationScreen").default} />
            <Stack.Screen name="OrganizationsListScreen" getComponent={() => require("./screens/OrganizationsListScreen").default} />
            <Stack.Screen name="OrganizationOrdersScreen" getComponent={() => require("./screens/OrganizationOrdersScreen").default} />
            <Stack.Screen name="LimitAccessScreen" getComponent={() => require("./screens/auth/LimitAccessScreen").default} />
    </Stack.Navigator>
  </View>
);

const App = () => {
  const [loaded, error] = useFonts({
    'VazirBold': require("./assets/fonts/Vazirmatn-Bold.ttf"),
    'VazirLight': require("./assets/fonts/Vazirmatn-Light.ttf"),
    'VazirBoldFD': require("./assets/fonts/Vazir-Bold-FD.ttf"),
    'VazirLightFD': require("./assets/fonts/Vazir-Light-FD.ttf"),
  });

  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        if (Platform.OS === 'web') {
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;
          const userToken = await getToken();
          if (state !== undefined && userToken) {
            setInitialState(state);
          }
        }
      } catch (e) {
        console.log('Error restoring navigation state:', e);
      } finally {
        setIsReady(true);
      }
    };

    restoreState();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  const handleStateChange = useCallback((state) => {
    enforceAuthGuard();
    if (state && Platform.OS === 'web') {
      AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, []);

  if (!loaded && !error) return null;
  if (!isReady) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <Provider store={store}>
          <NotificationsGate />
          <DeviceSessionGate />
          <SessionGate>
            <FooterProvider>
              <NavigationContainer
                ref={navigationRef}
                linking={linking}
                initialState={initialState}
                onReady={handleNavigationReady}
                onStateChange={handleStateChange}
              >
                <AppNavigator />
              </NavigationContainer>
            </FooterProvider>
          </SessionGate>
        </Provider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
};

export default App;
