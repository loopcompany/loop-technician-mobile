import { StyleSheet, View, ActivityIndicator, I18nManager, Platform } from "react-native";
import React, { useEffect, useState } from "react";

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
import { FooterProvider, useFooter } from "./contexts/FooterProvider";
import { navigationRef } from "./services/NavigationService";
import { removeToken, setToken } from "./slices/authSlice";
import { fetchUser } from "./slices/userSlice";
import { validateToken } from "./services/Api";

// ✅ locales
import en from './assets/locales/en.json';
import fa from './assets/locales/fa.json';

// screens...
import FolderScreen from "./screens/FolderScreen";
import SignInLanding from "./screens/auth/SignInLanding";
import SignIn from "./screens/auth/SignIn";
import Login from "./screens/auth/Login";
import Welcome from "./screens/Welcome";
import ResetPasswordScreen from "./screens/auth/ResetPasswordScreen";
import GuideScreen from "./screens/performservice/GuideScreen";
import HardwareIssueScreen from "./screens/performservice/HardwareIssueScreen";
import SoftwareInstallScreen from "./screens/performservice/SoftwareInstallScreen";
import DeviceModelInfoScreen from "./screens/performservice/DeviceModelInfoScreen";
import OrderListScreen from "./screens/performservice/OrderListScreen";
import OrderDetailScreen from "./screens/performservice/OrderDetailScreen";
import ExtraServices from "./screens/performservice/ExtraServices";
import DeviceStatusScreen from "./screens/performservice/DeviceStatusScreen";
import UserInfoScreen from "./screens/performservice/UserInfoScreen";
import CompletionInfoScreen from "./screens/performservice/CompletionInfoScreen";
import AttendanceScreen from "./screens/performservice/AttendanceScreen";
import UserHistoryScreen from "./screens/performservice/UserHistoryScreen";
import LaptopDeliveryScreen from "./screens/performservice/LaptopDeliveryScreen";
import LaptopDispatchScreen from "./screens/performservice/LaptopDispatchScreen";
import PartsExpensesScreen from "./screens/performservice/PartsExpensesScreen";
import TechnicalIssuesScreen from "./screens/performservice/TechnicalIssuesScreen";
import ServiceCompletionScreen from "./screens/performservice/ServiceCompletionScreen";
import NewServiceScreen from "./screens/performservice/NewServiceScreen";
import RequestsScreen from "./screens/RequestsScreen";
import RequestsListScreen from "./screens/RequestsListScreen";
import LeaveRequestsListScreen from "./screens/LeaveRequestsListScreen";
import DebtRequestsListScreen from "./screens/DebtRequestsListScreen";
import ManpowerRequestsListScreen from "./screens/ManpowerRequestsListScreen";
import TransferRequestsListScreen from "./screens/TransferRequestsListScreen";
import TerminationRequestsListScreen from "./screens/TerminationRequestsListScreen";
import PerformanceScreen from "./screens/PerformanceScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import PhotoArchiveScreen from "./screens/PhotoArchiveScreen";
import DeliveryReceiptScreen from "./screens/DeliveryReceiptScreen";
import NotesScreen from "./screens/NotesScreen";
import ThinkingScreen from "./screens/ThinkingScreen";
import RateListScreen from "./screens/RateListScreen";
import IncentivePlansScreen from "./screens/IncentivePlansScreen";
import LoopReportScreen from "./screens/performservice/LoopReportScreen";
import FinancialReportScreen from "./screens/performservice/FinancialReportScreen";
import MessageScreen from "./screens/performservice/MessageScreen";
import ChatListScreen from "./screens/chat/ChatListScreen";
import ChatRoom from "./screens/chat/ChatRoom";
import FeedbackSuggestionScreen from "./screens/performservice/FeedbackSuggestionScreen";
import IndexScreen from "./screens/performservice/IndexScreen";
import PersonalInfoScreen from "./screens/performservice/PersonalInfoScreen";
import VehicleInfoScreen from "./screens/performservice/VehicleInfoScreen";
import FinancialInfoScreen from "./screens/performservice/FinancialInfoScreen";
import SignInScreen from "./screens/auth/SignInScreen";
import PhoneVerificationScreen from "./screens/auth/PhoneVerificationScreen";
import GameMenuScreen from "./screens/game/GameMenuScreen";
import GamePlayScreen from "./screens/game/GamePlayScreen";
import GameResultScreen from "./screens/game/GameResultScreen";
import AddEditNoteScreen from "./screens/notes/AddEditNoteScreen";
import LearnMoreScreen from "./screens/resources/LearnMoreScreen";
import AboutScreen from "./screens/resources/AboutScreen";
import WarrantyScreen from "./screens/resources/WarrantyScreen";
import PrivacyScreen from './screens/performservice/PrivacyScreen';
import TrainingRegistrationScreen from './screens/TrainingRegistrationScreen';
import OrganizationsListScreen from './screens/OrganizationsListScreen';
import OrganizationOrdersScreen from './screens/OrganizationOrdersScreen';
import RateCategory from './screens/RateCategory';

I18nManager.forceRTL(false);

const Stack = createNativeStackNavigator();

const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

// ✅ init i18n (مثل فایل اول) — فقط یکبار، قبل از App
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    
  });

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
      PhoneVerificationScreen: 'verify-phone',
      ResetPasswordScreen: 'reset-password',
      GuideScreen: 'guide',
      OrderListScreen: 'orders',
      OrderDetailScreen: 'order/:orderId',
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
      AddEditNoteScreen: 'notes/:noteId',
      RateListScreen: 'rates',
      IncentivePlansScreen: 'incentive-plans',
      IncentiveSchemeScreen: 'incentive-scheme',
      LoopReportScreen: 'loop-report',
      FinancialReportScreen: 'financial-report',
      MessageScreen: 'messages',
      ChatListScreen: 'chats',
      ChatRoom: 'chat/:chatId',
      IndexScreen: 'index',
      PersonalInfoScreen: 'profile/personal',
      VehicleInfoScreen: 'profile/vehicle',
      FinancialInfoScreen: 'profile/financial',
      GameMenuScreen: 'game',
      GamePlayScreen: 'game/play',
      GameResultScreen: 'game/result',
      LearnMoreScreen: 'learn-more',
      AboutScreen: 'about',
      RateCategory: 'category-rates',
      WarrantyScreen: 'warranty',
      PrivacyScreen: 'privacy',
      TrainingRegistrationScreen: 'training-registration',
      OrganizationsListScreen: 'organizations',
      OrganizationOrdersScreen: 'organizations/:organizationId/orders',
    },
  },
};

const InitialRouteHandler = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');

        if (savedToken) {
          const result = await validateToken();
          if (result.success) {
            dispatch(setToken(savedToken));
            dispatch(fetchUser(savedToken));
            setInitialRoute('FolderScreen');
          } else {
            dispatch(removeToken());
            setInitialRoute('Welcome');
          }
        } else {
          setInitialRoute('Welcome');
        }
      } catch (error) {
        console.log('Error checking token:', error);
        setInitialRoute('Welcome');
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return children(initialRoute);
};

// Wrapper component to access Footer context
const AppNavigator = () => {
  const { FooterComponent } = useFooter();

  return (
    <InitialRouteHandler>
      {(initialRoute) => (
        <View style={{ flex: 1 }}>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen component={Welcome} name="Welcome" options={{ headerShown: false }} />
            <Stack.Screen component={SignInLanding} name="SignInLanding" options={{ headerShown: false }} />
            <Stack.Screen component={FolderScreen} name="FolderScreen" options={{ headerShown: false }} />
            <Stack.Screen component={Login} name="Login" options={{ headerShown: false }} />
            <Stack.Screen component={SignInScreen} name="SignInScreen" options={{ headerShown: false }} />
            <Stack.Screen component={SignIn} name="SignIn" options={{ headerShown: false, presentation: 'card', gestureEnabled: true }} />
            <Stack.Screen component={ResetPasswordScreen} name="ResetPasswordScreen" options={{ headerShown: false }} />
            <Stack.Screen component={PhoneVerificationScreen} name="PhoneVerification" options={{ headerShown: false }} />
            <Stack.Screen component={GuideScreen} name="GuideScreen" options={{ headerShown: false }} />
            <Stack.Screen component={HardwareIssueScreen} name="HardwareIssueScreen" options={{ headerShown: false }} />
            <Stack.Screen component={SoftwareInstallScreen} name="SoftwareInstallScreen" options={{ headerShown: false }} />
            <Stack.Screen component={DeviceModelInfoScreen} name="DeviceModelInfoScreen" options={{ headerShown: false }} />
            <Stack.Screen component={OrderListScreen} name="OrderListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={OrderDetailScreen} name="OrderDetailScreen" options={{ headerShown: false }} />
            <Stack.Screen component={ChatListScreen} name="ChatListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={ChatRoom} name="ChatRoom" options={{ headerShown: false }} />
            <Stack.Screen component={ExtraServices} name="ExtraServices" options={{ headerShown: false }} />
            <Stack.Screen component={DeviceStatusScreen} name="DeviceStatusScreen" options={{ headerShown: false }} />
            <Stack.Screen component={UserInfoScreen} name="UserInfoScreen" options={{ headerShown: false }} />
            <Stack.Screen component={CompletionInfoScreen} name="CompletionInfoScreen" options={{ headerShown: false }} />
            <Stack.Screen component={AttendanceScreen} name="AttendanceScreen" options={{ headerShown: false }} />
            <Stack.Screen component={UserHistoryScreen} name="UserHistoryScreen" options={{ headerShown: false }} />
            <Stack.Screen component={LaptopDeliveryScreen} name="LaptopDeliveryScreen" options={{ headerShown: false }} />
            <Stack.Screen component={LaptopDispatchScreen} name="LaptopDispatchScreen" options={{ headerShown: false }} />
            <Stack.Screen component={PartsExpensesScreen} name="PartsExpensesScreen" options={{ headerShown: false }} />
            <Stack.Screen component={TechnicalIssuesScreen} name="TechnicalIssuesScreen" options={{ headerShown: false }} />
            <Stack.Screen component={ServiceCompletionScreen} name="ServiceCompletionScreen" options={{ headerShown: false }} />
            <Stack.Screen component={NewServiceScreen} name="NewServiceScreen" options={{ headerShown: false }} />
            <Stack.Screen component={RequestsScreen} name="RequestsScreen" options={{ headerShown: false }} />
            <Stack.Screen component={RequestsListScreen} name="RequestsListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={LeaveRequestsListScreen} name="LeaveRequestsListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={DebtRequestsListScreen} name="DebtRequestsListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={GameMenuScreen} name="GameMenu" options={{ headerShown: false }} />
            <Stack.Screen component={GamePlayScreen} name="GamePlay" options={{ headerShown: false }} />
            <Stack.Screen component={GameResultScreen} name="GameResult" options={{ headerShown: false }} />
            <Stack.Screen component={ManpowerRequestsListScreen} name="ManpowerRequestsListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={TransferRequestsListScreen} name="TransferRequestsListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={TerminationRequestsListScreen} name="TerminationRequestsListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={PerformanceScreen} name="PerformanceScreen" options={{ headerShown: false }} />
            <Stack.Screen component={ChangePasswordScreen} name="ChangePasswordScreen" options={{ headerShown: false }} />
            <Stack.Screen component={PhotoArchiveScreen} name="PhotoArchiveScreen" options={{ headerShown: false }} />
            <Stack.Screen component={DeliveryReceiptScreen} name="DeliveryReceiptScreen" options={{ headerShown: false }} />
            <Stack.Screen component={NotesScreen} name="NotesScreen" options={{ headerShown: false }} />
            <Stack.Screen component={AddEditNoteScreen} name="AddEditNote" options={{ headerShown: false }} />
            <Stack.Screen component={ThinkingScreen} name="ThinkingScreen" options={{ headerShown: false }} />
            <Stack.Screen component={RateListScreen} name="RateListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={IncentivePlansScreen} name="IncentivePlansScreen" options={{ headerShown: false }} />
            <Stack.Screen component={LoopReportScreen} name="LoopReportScreen" options={{ headerShown: false }} />
            <Stack.Screen component={FinancialReportScreen} name="FinancialReportScreen" options={{ headerShown: false }} />
            <Stack.Screen component={MessageScreen} name="MessageScreen" options={{ headerShown: false }} />
            <Stack.Screen component={FeedbackSuggestionScreen} name="FeedbackSuggestionScreen" options={{ headerShown: false }} />
            <Stack.Screen component={IndexScreen} name="IndexScreen" options={{ headerShown: false }} />
            <Stack.Screen component={PrivacyScreen} name="PrivacyScreen" options={{ headerShown: false }} />
            <Stack.Screen component={AboutScreen} name="AboutScreen" options={{ headerShown: false }} />
            <Stack.Screen component={RateCategory} name="RateCategory" />
            <Stack.Screen component={LearnMoreScreen} name="LearnMoreScreen" options={{ headerShown: false }} />
            <Stack.Screen component={WarrantyScreen} name="WarrantyScreen" options={{ headerShown: false }} />
            <Stack.Screen component={PersonalInfoScreen} name="PersonalInfoScreen" options={{ headerShown: false }} />
            <Stack.Screen component={VehicleInfoScreen} name="VehicleInfoScreen" options={{ headerShown: false }} />
            <Stack.Screen component={FinancialInfoScreen} name="FinancialInfoScreen" options={{ headerShown: false }} />
            <Stack.Screen component={TrainingRegistrationScreen} name="TrainingRegistrationScreen" options={{ headerShown: false }} />
            <Stack.Screen component={OrganizationsListScreen} name="OrganizationsListScreen" options={{ headerShown: false }} />
            <Stack.Screen component={OrganizationOrdersScreen} name="OrganizationOrdersScreen" options={{ headerShown: false }} />
          </Stack.Navigator>

          <FooterComponent />
        </View>
      )}
    </InitialRouteHandler>
  );
};

const App = () => {
  const [loaded, error] = useFonts({
    'VazirBold': require("./assets/fonts/Vazirmatn-Bold.ttf"),
    'VazirLight': require("./assets/fonts/Vazirmatn-Light.ttf"),
  });

  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        if (Platform.OS === 'web') {
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;
          const userToken = await AsyncStorage.getItem('userToken');
          if (state !== undefined && userToken) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) restoreState();
  }, [isReady]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;
  if (!isReady) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <Provider store={store}>
          <FooterProvider>
            <NavigationContainer
              ref={navigationRef}
              linking={linking}
              initialState={initialState}
              onStateChange={(state) => {
                if (state && Platform.OS === 'web') {
                  AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
                }
              }}
            >
              <AppNavigator />
            </NavigationContainer>
          </FooterProvider>
        </Provider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
