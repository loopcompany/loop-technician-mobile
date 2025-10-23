import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import Footer from "./screens/Footer";
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
// import AddressScreen from "./screens/AddressScreen";
// import MapPickerScreen from "./screens/MapPickerScreen";
// import PrivacyScreen from "./screens/PrivacyScreen";
// import TransactionsScreen from "./screens/TransactionsScreen";
// import MessageScreen from "./screens/MessageScreen";
// import OrdersScreen from "./screens/OrdersScreen";
// import CanceledOrdersScreen from "./screens/CanceledOrdersScreen";
// import ViolationReportScreen from "./screens/ViolationReportScreen";
// import FeedbackSurveyScreen from "./screens/FeedbackSurveyScreen";
// import Fekrobekr from "./screens/Fekrobekr";
// import RateListScreen from "./screens/RateListScreen";
// import ProductIssueScreen from "./screens/ProductIssueScreen";حساب
// import TrainingRegistrationScreen from "./screens/TrainingRegistrationScreen";
// import IncentivePlansScreen from "./screens/IncentivePlansScreen";
import SignInScreen from "./screens/auth/SignInScreen";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { I18nManager } from "react-native";
import store from "./store";
I18nManager.forceRTL(false);
const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

const App = () => {
  const [loaded, error] = useFonts({
    VazirBold: require("./assets/fonts/Vazir-Bold-FD.ttf"),
    VazirLight: require("./assets/fonts/Vazir-Light-FD.ttf"),
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
        <Stack.Navigator
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
            component={GuideScreen}
            name="GuideScreen"
            options={{
              headerShown: false,
            }}
          />
          {/* <Stack.Screen
            component={OrderMenuScreen}
            name="OrderMenuScreen"
            options={{
              headerShown: false,
            }}
          /> */}
        <Stack.Screen
            component={HardwareIssueScreen}
            name="HardwareIssueScreen"
            options={{
              headerShown: false,
            }}
          />
          {/* <Stack.Screen
            component={WindowsInstallScreen}
            name="WindowsInstallScreen"
            options={{
              headerShown: false,
            }}
          /> */}
          <Stack.Screen
            component={SoftwareInstallScreen}
            name="SoftwareInstallScreen"
            options={{
              headerShown: false,
            }}
          />
          {/* <Stack.Screen
            component={OrderTrackingScreen}
            name="OrderTrackingScreen"
            options={{
              headerShown: false,
            }}
          /> */}
          {/* <Stack.Screen
            component={OrderSummaryScreen}
            name="OrderSummaryScreen"
            options={{
              headerShown: false,
            }}
          /> */}
          {/* <Stack.Screen
            component={PartsSupplyScreen}
            name="PartsSupplyScreen"
            options={{
              headerShown: false,
            }}
          /> */}
          {/* <Stack.Screen
            component={TechnicianBookingScreen}
            name="TechnicianBookingScreen"
            options={{
              headerShown: false,
            }}
          /> */}
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

          {/* <Stack.Screen
          {/* <Stack.Screen
            component={DeviceOrderSummary}
            name="DeviceOrderSummary"
            options={{
              headerShown: false,
            }}
          /> */}
          <Stack.Screen
            component={Footer}
            name="Footer"
            options={{
              headerShown: false,
            }}
          />
          {/* <Stack.Screen
            component={AddressScreen}
            name="AddressScreen"
            options={{
              headerShown: false,
            }}
          /> */}

          {/* <Stack.Screen
            component={PrivacyScreen}
            name="PrivacyScreen"
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
          /> */}

          {/* <Stack.Screen
            component={TransactionsScreen}
            name="TransactionsScreen"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            component={OrdersScreen}
            name="OrdersScreen"
            options={{
              headerShown: false,
            }}
          /> */}

          {/* <Stack.Screen
            component={CanceledOrdersScreen}
            name="CanceledOrdersScreen"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            component={Fekrobekr}
            name="Fekrobekr"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            component={ViolationReportScreen}
            name="ViolationReportScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            component={FeedbackSurveyScreen}
            name="FeedbackSurveyScreen"
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
            component={ProductIssueScreen}
            name="ProductIssueScreen"
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
            component={TrainingRegistrationScreen}
            name="TrainingRegistrationScreen"
            options={{
              headerShown: false,
            }}
          /> */}

          {/* <Stack.Screen name="MapPickerScreen" component={MapPickerScreen} /> */}
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({});
