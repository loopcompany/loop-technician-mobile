import { StyleSheet, Text, View, ActivityIndicator, I18nManager } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider, useDispatch } from "react-redux";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import store from "./store";
import { FooterProvider, useFooter } from "./contexts/FooterContext";
import { AuthProvider } from "./contexts/AuthContext";
import { setToken } from "./slices/authSlice";
import { setUserData } from "./slices/userSlice";
import { validateToken } from "./services/Api";
import FolderScreen from "./screens/FolderScreen";
import SignInLanding from "./screens/auth/SignInLanding";

import SignIn from "./screens/auth/SignIn";
import LoginScreen from "./screens/auth/LoginScreen";
import Login from "./screens/auth/Login";
import Welcome from "./screens/Welcome";
import ResetPasswordScreen from "./screens/auth/ResetPasswordScreen";
import GuideScreen from "./screens/performservice/GuideScreen";
// import OrderMenuScreen from "./screens/OrderMenuScreen";
import HardwareIssueScreen from "./screens/performservice/HardwareIssueScreen";
// import WindowsInstallScreen from "./screens/WindowsInstallScreen";
import SoftwareInstallScreen from "./screens/performservice/SoftwareInstallScreen";
// import OrderTrackingScreen from "./screens/OrderTrackingScreen";
// import OrderSummaryScreen from "./screens/OrderSummaryScreen";
// import PartsSupplyScreen from "./screens/PartsSupplyScreen";
// import TechnicianBookingScreen from "./screens/TechnicianBookingScreen";
import DeviceModelInfoScreen from "./screens/performservice/DeviceModelInfoScreen";
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
import PerformanceScreen from "./screens/PerformanceScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import PhotoArchiveScreen from "./screens/PhotoArchiveScreen";
import DeliveryReceiptScreen from "./screens/DeliveryReceiptScreen";
import NotesScreen from "./screens/NotesScreen";
import ThinkingScreen from "./screens/ThinkingScreen";
import RateListScreen from "./screens/RateListScreen";
import IncentivePlansScreen from "./screens/IncentivePlansScreen";
// import DeviceOrderSummary from "./screens/DeviceOrderSummary";
// New screens
import LoopReportScreen from "./screens/performservice/LoopReportScreen";
import FinancialReportScreen from "./screens/performservice/FinancialReportScreen";
import MessageScreen from "./screens/performservice/MessageScreen";
import IncentiveSchemeScreen from "./screens/performservice/IncentiveSchemeScreen";
import FeedbackSuggestionScreen from "./screens/performservice/FeedbackSuggestionScreen";
import IndexScreen from "./screens/performservice/IndexScreen";
// Privacy screens
import PrivacyScreen from "./screens/performservice/PrivacyScreen";
import PersonalInfoScreen from "./screens/performservice/PersonalInfoScreen";
import VehicleInfoScreen from "./screens/performservice/VehicleInfoScreen";
import FinancialInfoScreen from "./screens/performservice/FinancialInfoScreen";
import SignInScreen from "./screens/auth/SignInScreen";
import PhoneVerificationScreen from "./screens/auth/PhoneVerificationScreen";

I18nManager.forceRTL(false);

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

// Initial Route Handler - Validates token and determines starting screen
const InitialRouteHandler = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        
        if (savedToken) {
          // Token exists, validate it
          const result = await validateToken();
          
          if (result.success) {
            // Token is valid
            dispatch(setToken(savedToken));
            
            // validateToken already returns complete user data
            if (result.data) {
              console.log('✅ اطلاعات کامل از validateToken دریافت شد در App.js');
              console.log('🔍 داده‌های کامل:', JSON.stringify(result.data, null, 2));
              
              // Save complete user data
              console.log('💾 ذخیره اطلاعات کامل در Redux و AsyncStorage');
              await AsyncStorage.setItem('userData', JSON.stringify(result.data));
              dispatch(setUserData(result.data));
            } else {
              console.log('⚠️ validateToken اطلاعات برنگرداند، تلاش برای بارگذاری از AsyncStorage...');
              // Fallback: Try to load from AsyncStorage
              const storedUserData = await AsyncStorage.getItem('userData');
              if (storedUserData) {
                const parsedData = JSON.parse(storedUserData);
                console.log('✅ اطلاعات کاربر از AsyncStorage بارگذاری شد');
                dispatch(setUserData(parsedData));
              } else {
                console.log('❌ هیچ اطلاعاتی در AsyncStorage نیست');
              }
            }
            
            setInitialRoute('FolderScreen');
          } else {
            // Token is invalid, clear it
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            dispatch(setToken(null));
            setInitialRoute('Welcome');
          }
        } else {
          // No token, start at Welcome
          setInitialRoute('Welcome');
        }
      } catch (error) {
        console.error('Error checking token:', error);
        // On error, start at Welcome
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
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              component={Welcome}
              name="Welcome"
              options={{
                headerShown: false,
              }}
            />
        <Stack.Screen
          component={SignInLanding}
          name="SignInLanding"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={FolderScreen}
          name="FolderScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={LoginScreen}
          name="LoginScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={Login}
          name="Login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={SignInScreen}
          name="SignInScreen"
          options={{
            headerShown: false,
          }}
        />
        
        <Stack.Screen
          component={SignIn}
          name="SignIn"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={ResetPasswordScreen}
          name="ResetPasswordScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={PhoneVerificationScreen}
          name="PhoneVerification"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={GuideScreen}
          name="GuideScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={HardwareIssueScreen}
          name="HardwareIssueScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={SoftwareInstallScreen}
          name="SoftwareInstallScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={DeviceModelInfoScreen}
          name="DeviceModelInfoScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={DeviceStatusScreen}
          name="DeviceStatusScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={UserInfoScreen}
          name="UserInfoScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={CompletionInfoScreen}
          name="CompletionInfoScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={AttendanceScreen}
          name="AttendanceScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={UserHistoryScreen}
          name="UserHistoryScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={LaptopDeliveryScreen}
          name="LaptopDeliveryScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={LaptopDispatchScreen}
          name="LaptopDispatchScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={PartsExpensesScreen}
          name="PartsExpensesScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={TechnicalIssuesScreen}
          name="TechnicalIssuesScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={ServiceCompletionScreen}
          name="ServiceCompletionScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={NewServiceScreen}
          name="NewServiceScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={RequestsScreen}
          name="RequestsScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={PerformanceScreen}
          name="PerformanceScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={ChangePasswordScreen}
          name="ChangePasswordScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={PhotoArchiveScreen}
          name="PhotoArchiveScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={DeliveryReceiptScreen}
          name="DeliveryReceiptScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={NotesScreen}
          name="NotesScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={ThinkingScreen}
          name="ThinkingScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={RateListScreen}
          name="RateListScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={IncentivePlansScreen}
          name="IncentivePlansScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={LoopReportScreen}
          name="LoopReportScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={FinancialReportScreen}
          name="FinancialReportScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={MessageScreen}
          name="MessageScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={IncentiveSchemeScreen}
          name="IncentiveSchemeScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={FeedbackSuggestionScreen}
          name="FeedbackSuggestionScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={IndexScreen}
          name="IndexScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={PrivacyScreen}
          name="PrivacyScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={PersonalInfoScreen}
          name="PersonalInfoScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={VehicleInfoScreen}
          name="VehicleInfoScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={FinancialInfoScreen}
          name="FinancialInfoScreen"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
      
      {/* Footer globally available through context */}
      <FooterComponent />
    </View>
      )}
    </InitialRouteHandler>
  );
};

const App = () => {
  const [loaded, error] = useFonts({
    'VazirBold': require("./assets/fonts/Vazir-Bold-FD.ttf"),
    'VazirLight': require("./assets/fonts/Vazir-Light-FD.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <NavigationContainer>
      <Provider store={store}>
        <AuthProvider>
          <FooterProvider>
            <AppNavigator />
          </FooterProvider>
        </AuthProvider>
      </Provider>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({});
