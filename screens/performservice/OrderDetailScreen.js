import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SectionList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color';
import { getTechnicianOrderById, submitTechnicianDescription, setOffToOrder, arriveToOrder, createOrderReport, updateOrderReport, getOrderReport, getOrderReportByOrderId, sendOrderToLoop, updateLoopInfo, startRepair, createDeliveryReport, updateDeliveryReport, getDeliveryReportByOrderId, verifyDeliveryReportWithCode, resendDeliveryReportCode, endOrder, getTechnicianChatMessages, cancelOrderByTechnician, submitEmergencyHelp, submitTechnicianOpinion } from '../../services/Api';
import { showToastOrAlert, formatDate, formatDateTime, formatPrice, showAlert } from '../../helpers/Common';
import AccordionHeader from '../../components/AccordionHeader';
import DetailConponent from './DetailConponent';
import DatePickerModal from '../../components/DatePickerModal';
import Button from '../../components/Button';
import jalaali from 'jalaali-js';
import { getFormatedDate } from 'react-native-modern-datepicker';
import { createStyles } from '../../styles/NewStyles';
export default function OrderDetailScreen({ route, navigation }) {
  const user = useSelector((state) => state?.user?.data?.technician);
  const { orderId } = route?.params || {};
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const dispatch = useDispatch();
  const orderExtras = useSelector(state => state.orderExtras.data);
  const loadingExtras = useSelector(state => state.orderExtras.loading);


  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPresence, setShowPresence] = useState(false);
  const [showProductStatus, setShowProductStatus] = useState(false);
  const [showSendloop, setShowSendloop] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const oneYearLaterJalali = useMemo(() => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return getFormatedDate(oneYearLater, 'jYYYY/jMM/jDD');
  }, []);
  // State برای مرحله بررسی/جایگزینی زمانی
  const [datePickerModal, setDatePickerModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [reviewDescription, setReviewDescription] = useState('');
  const [technicianPrice, setTechnicianPrice] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  // State برای مرحله اعلام حضور
  const [settingOff, setSettingOff] = useState(false);
  const [arriving, setArriving] = useState(false);

  // State برای مرحله وضعیت محصول
  const [productReport, setProductReport] = useState({
    name: '',
    melicode: '',
    product_name: '',
    product_brand: '',
    product_model: '',
    product_color: '',
    product_serial_number: '',
    asset_label_code: '',
    accessories: '',
    user_reported_issues: '',
    technician_reported_issues: '',
    technician_observed_issues: '',
    user_requested_services: '',
    max_price: '',
    min_price: '',
    product_password: ''
  });
  const [reportId, setReportId] = useState(null);
  const [savingReport, setSavingReport] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportConfirmed, setReportConfirmed] = useState(false);

  // State برای مرحله اعزام به لوپ
  const [sendingToLoop, setSendingToLoop] = useState(false);
  const [loopInfo, setLoopInfo] = useState({
    duration: '',
    loop_cost_estimate: '',
    loop_description: ''
  });
  const [savingLoopInfo, setSavingLoopInfo] = useState(false);

  // State برای شروع تعمیر
  const [startingRepair, setStartingRepair] = useState(false);

  // State برای چت
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // State برای لغو سفارش
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [cancelingOrder, setCancelingOrder] = useState(false);

  // State برای کمک اضطراری
  const [emergencyHelpText, setEmergencyHelpText] = useState('');
  const [submittingEmergencyHelp, setSubmittingEmergencyHelp] = useState(false);

  // State برای مرحله تحویل به کاربر
  const [deliveryReport, setDeliveryReport] = useState({
    name: '',
    melicode: '',
    product_info: '',
    accessories: '',
    label_code: '',
    appearance_defect: '',
    user_description: '',
    technical_description: ''
  });
  const [deliveryReportId, setDeliveryReportId] = useState(null);
  const [savingDeliveryReport, setSavingDeliveryReport] = useState(false);
  const [loadingDeliveryReport, setLoadingDeliveryReport] = useState(false);
  const [deliveryReportConfirmed, setDeliveryReportConfirmed] = useState(false);
  const [endingOrder, setEndingOrder] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // State برای نظر تکنسین
  const [technicianOpinion, setTechnicianOpinion] = useState('');
  const [submittingOpinion, setSubmittingOpinion] = useState(false);

  const cancelReasonLabels = {
    'اعلام حضور / لغو از سوی کاربر': t("Check-in / canceled by user"),
    'اعلام حضور / لغو از سوی تکنسین': t("Check-in / canceled by technician"),
    'اعلام حضور / نادرست بودن آدرس': t("Check-in / incorrect address"),
    'اعلام حضور / موکول به زمان دیگر از سوی کاربر': t("Check-in / postponed by user"),
    'اعلام حضور / عدم پاسخ تماس و پیام از سوی کاربر': t("Check-in / no answer to calls or messages from user"),
    'اعلام حضور/عدم حضورکاربر - حضور خانواده یا آشنایان': t("Check-in / user absent - family or acquaintances present"),
    'اعلام حضور / نادرست بودن مشخصات کاربر': t("Check-in / incorrect user information"),
  };

  const getCancelReasonLabel = (reason) => cancelReasonLabels[reason] || reason;

  const fetchOrderDetails = async () => {
    if (!orderId) {
      showToastOrAlert(t("Order ID not found"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📋 Fetching order details for orderId:', orderId);
      const result = await getTechnicianOrderById(orderId);

      if (result.success) {
        setData(result.data);
        // تنظیم مقادیر اولیه از دیتا
        if (result.data?.date) {
          setSelectedDate(result.data.date);
        }
        if (result.data?.time) {
          setTimeRange(result.data.time);
        }
        if (result.data?.technician_price) {
          setTechnicianPrice(String(result.data.technician_price));
        }
        setReviewDescription(result?.data?.technician_des)
        // تنظیم اطلاعات لوپ
        if (result.data?.duration || result.data?.loop_cost_estimate || result.data?.loop_description) {
          setLoopInfo({
            duration: result.data.duration ? String(result.data.duration) : '',
            loop_cost_estimate: result.data.loop_cost_estimate ? String(result.data.loop_cost_estimate) : '',
            loop_description: result.data.loop_description || ''
          });
        }
        // تنظیم متن کمک اضطراری
        if (result.data?.emergency_help) {
          setEmergencyHelpText(result.data.emergency_help);
        }
        // تنظیم نظر تکنسین
        if (result.data?.technician_opinion) {
          setTechnicianOpinion(result.data.technician_opinion);
        }
      } else {
        showToastOrAlert(result.message || t("Error fetching order details"));
      }
    } catch (error) {
      console.log('Error fetching order details:', error);
      showToastOrAlert(t("Error fetching order details"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // تابع بارگذاری تعداد پیام‌های خوانده نشده
  const loadUnreadMessages = async () => {
    if (!data?.user_id) return;

    try {
      const result = await getTechnicianChatMessages(data.user_id);
      if (result.success && result?.data?.messages) {
        // شمارش پیام‌های خوانده نشده از کاربر (is_user=1 و is_read=0)
        const unreadCount = result?.data?.messages.filter(
          msg => msg.is_user === 1 && msg.is_read === 0
        ).length;
        setUnreadMessagesCount(unreadCount);
      }
    } catch (error) {
      console.log('خطا در بارگذاری پیام‌های خوانده نشده:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        fetchOrderDetails();
      }
    }, [orderId])
  );

  // بارگذاری پیام‌های خوانده نشده
  React.useEffect(() => {
    if (data?.user_id) {
      loadUnreadMessages();
      // رفرش هر 10 ثانیه
      const interval = setInterval(loadUnreadMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [data?.user_id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };





  const renderRow = (label, value, labelStyle, valueStyle) => (
    <View style={NewStyles.rowWrapper}>
      <Text style={[NewStyles.text, labelStyle]}>{label}</Text>
      <Text style={[NewStyles.text10, valueStyle]}>{value}</Text>
    </View>
  );

  // تابع برای تبدیل تاریخ شمسی به میلادی
  const convertShamsiToMiladi = (shamsiDate) => {
    try {
      // بررسی خالی بودن
      if (!shamsiDate || shamsiDate === '') {
        return shamsiDate;
      }

      // ✅ اگر تاریخ قبلاً میلادی است (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(shamsiDate)) {
        console.log('✅ تاریخ از قبل میلادی است:', shamsiDate);
        return shamsiDate;
      }

      // ✅ اگر تاریخ شمسی است (YYYY/MM/DD یا YYYY/M/D)
      if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(shamsiDate)) {
        const parts = shamsiDate.split('/');

        if (parts.length !== 3) {
          console.log('❌ فرمت تاریخ نامعتبر:', shamsiDate);
          return shamsiDate;
        }

        const jy = parseInt(parts[0]);
        const jm = parseInt(parts[1]);
        const jd = parseInt(parts[2]);

        // بررسی معتبر بودن اجزای تاریخ
        if (isNaN(jy) || isNaN(jm) || isNaN(jd)) {
          console.log('❌ اجزای تاریخ نامعتبر:', { jy, jm, jd });
          return shamsiDate;
        }

        const gregorian = jalaali.toGregorian(jy, jm, jd);

        // فرمت خروجی: Y-m-d (2025-11-10)
        const year = gregorian.gy;
        const month = String(gregorian.gm).padStart(2, '0');
        const day = String(gregorian.gd).padStart(2, '0');

        const miladiDate = `${year}-${month}-${day}`;
        console.log('✅ تبدیل موفق:', shamsiDate, '→', miladiDate);
        return miladiDate;
      }

      // ❌ فرمت ناشناخته
      console.log('❌ فرمت تاریخ ناشناخته:', shamsiDate);
      return shamsiDate;

    } catch (error) {
      console.log('❌ خطا در تبدیل تاریخ:', error, 'تاریخ ورودی:', shamsiDate);
      return shamsiDate;
    }
  };

  // تابع ذخیره تغییرات مرحله بررسی
  const handleSaveReview = async () => {
    // برای سفارشات سازمانی، تاریخ و ساعت اجباری نیست
    if (!data?.service_schedule_type && (!selectedDate || !timeRange)) {
      showToastOrAlert(t("Please enter the date and time"));
      return;
    }

    if (!technicianPrice) {
      showToastOrAlert(t("Please enter the technician base amount"));
      return;
    }
    if (technicianPrice && isNaN(Number(technicianPrice))) {
      showToastOrAlert(t("Please enter the technician base amount correctly"));
      return;
    }

    if (!reviewDescription) {
      showToastOrAlert(t("Please enter the review description"));
      return;
    }
    try {
      setSavingReview(true);

      const requestData = {
        technician_des: reviewDescription || '',
      };

      // برای سفارشات سازمانی: از تاریخ و ساعت اصلی سفارش استفاده کن
      if (data?.service_schedule_type) {
        console.log('🏢 سفارش سازمانی: استفاده از تاریخ و ساعت اصلی سفارش');
        requestData.date = data.date;
        requestData.time = data.time;
      }
      // برای سفارشات غیر سازمانی: از تاریخ و ساعت انتخابی استفاده کن
      else if (selectedDate && timeRange) {
        console.log('📅 OrderDetailScreen - selectedDate قبل از تبدیل:', selectedDate);
        const miladiDate = convertShamsiToMiladi(selectedDate);
        console.log('📅 OrderDetailScreen - miladiDate بعد از تبدیل:', miladiDate);
        requestData.date = miladiDate;
        requestData.time = timeRange;
      }

      // اضافه کردن مبلغ پایه تکنسین اگر وارد شده باشد
      if (technicianPrice) {
        requestData.technician_price = technicianPrice;
      }

      console.log('📝 ارسال داده‌ها:', requestData);

      const result = await submitTechnicianDescription(orderId, requestData);

      if (result.success) {
        showToastOrAlert(t("Your changes have been applied."), 'success');
        // بعد از ذخیره، دیتا را دوباره بارگذاری کن
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || t("Error saving changes"));
      }
    } catch (error) {
      console.log('Error saving review:', error);
      showToastOrAlert(t("Error saving changes"));
    } finally {
      setSavingReview(false);
    }
  };

  // تابع ثبت زمان حرکت
  const handleSetOff = async () => {
    try {
      setSettingOff(true);
      const result = await setOffToOrder(orderId);

      if (result.success) {
        showToastOrAlert(t("Departure time saved successfully"), 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || t("Error saving departure time"));
      }
    } catch (error) {
      console.log('Error setting off:', error);
      showToastOrAlert(t("Error saving departure time"));
    } finally {
      setSettingOff(false);
    }
  };

  // تابع ثبت زمان رسیدن
  const handleArrive = async () => {
    try {
      setArriving(true);
      const result = await arriveToOrder(orderId);

      if (result.success) {
        showToastOrAlert(t("Arrival time saved successfully"), 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || t("Error saving arrival time"));
      }
    } catch (error) {
      console.log('Error arriving:', error);
      showToastOrAlert(t("Error saving arrival time"));
    } finally {
      setArriving(false);
    }
  };

  // تابع لغو سفارش توسط تکنسین
  const handleCancelOrder = async () => {
    if (!selectedCancelReason) {
      showToastOrAlert(t("Please select a cancellation reason"));
      return;
    }

    showAlert(
      t("Confirm order cancellation"),
      t("Are you sure you want to cancel this order for the reason \"{{reason}}\"?", { reason: getCancelReasonLabel(selectedCancelReason) }),
      [
        {
          text: t("Cancel"),
          style: 'cancel'
        },
        {
          text: t("Confirm"),
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelingOrder(true);
              await cancelOrderByTechnician(orderId, selectedCancelReason);

              showToastOrAlert(t("Your order has been canceled successfully!"), 'success');

              // بازگشت به صفحه قبل
              setTimeout(() => {
                if (Platform.OS == 'web') {
                  window.history.back()
                } else {
                  navigation.goBack()
                }
              }, 1500);
            } catch (error) {
              showToastOrAlert(error.message || t("Error canceling order"));
            } finally {
              setCancelingOrder(false);
            }
          }
        }
      ]
    );
  };

  // تابع ثبت درخواست کمک اضطراری
  const handleSubmitEmergencyHelp = async () => {
    if (!emergencyHelpText.trim()) {
      showToastOrAlert(t("Please enter the request details"));
      return;
    }

    try {
      setSubmittingEmergencyHelp(true);
      await submitEmergencyHelp(orderId, emergencyHelpText);

      showToastOrAlert(t("Emergency help request submitted successfully"), 'success');

      // به‌روزرسانی اطلاعات سفارش
      await fetchOrderDetails();

    } catch (error) {
      showToastOrAlert(error.message || t("Error submitting request"));
    } finally {
      setSubmittingEmergencyHelp(false);
    }
  };

  // تابع بارگذاری گزارش محصول
  const loadProductReport = async () => {
    try {
      setLoadingReport(true);
      const result = await getOrderReportByOrderId(orderId);

      if (result.success && result.data?.report) {
        const report = result.data.report;
        setReportId(report.id);
        setReportConfirmed(!!report.user_confirmed_at);
        setProductReport({
          name: report.name || '',
          melicode: report.melicode || '',
          product_name: report.product_name || '',
          product_brand: report.product_brand || '',
          product_model: report.product_model || '',
          product_color: report.product_color || '',
          product_serial_number: report.product_serial_number || '',
          asset_label_code: report.asset_label_code || '',
          accessories: report.accessories || '',
          user_reported_issues: report.user_reported_issues || '',
          technician_reported_issues: report.technician_reported_issues || '',
          technician_observed_issues: report.technician_observed_issues || '',
          user_requested_services: report.user_requested_services || '',
          max_price: report.max_price || '',
          min_price: report.min_price || '',
          product_password: report.product_password || ''
        });
      } else {
        // گزارش وجود ندارد - این طبیعی است
        console.log('ℹ️ هنوز گزارش محصولی ثبت نشده است');
      }
    } catch (error) {
      // 404 به معنای گزارش وجود ندارد - طبیعی است
      if (error.response?.status === 404) {
        console.log('ℹ️ هنوز گزارش محصولی ثبت نشده است (404)');
      } else {
        console.log('❌ خطا در بارگذاری گزارش محصول:', error);
      }
    } finally {
      setLoadingReport(false);
    }
  };

  // تابع ذخیره گزارش محصول
  const handleSaveProductReport = async () => {
    // اعتبارسنجی فیلدهای الزامی
    if (!productReport.name || !productReport.melicode) {
      showToastOrAlert(t("Please enter the name and national ID"));
      return;
    }
    if (!productReport.product_name || !productReport.product_brand || !productReport.product_model || !productReport.product_color) {
      showToastOrAlert(t("Please enter the required product information"));
      return;
    }
    // اعتبارسنجی کد ملی (10 رقم)
    if (productReport.melicode.length !== 10 || !/^\d+$/.test(productReport.melicode)) {
      showToastOrAlert(t("National ID must be 10 digits"));
      return;
    }

    try {
      setSavingReport(true);
      const requestData = {
        order_id: orderId,
        ...productReport
      };

      let result;
      if (reportId) {
        // ویرایش گزارش موجود
        result = await updateOrderReport(reportId, requestData);
      } else {
        // ثبت گزارش جدید
        result = await createOrderReport(requestData);
      }

      if (result.success) {
        showToastOrAlert(reportId ? t("Report updated successfully") : t("Report submitted successfully"), 'success');
        if (result.data?.report?.id) {
          setReportId(result.data.report.id);
        }
        await fetchOrderDetails();
        await loadProductReport();
      } else {
        showToastOrAlert(result.message || t("Error saving report"));
      }
    } catch (error) {
      console.log('Error saving report:', error);
      showToastOrAlert(t("Error saving report"));
    } finally {
      setSavingReport(false);
    }
  };

  // تابع ارسال سفارش به لوپ
  const handleSendToLoop = async () => {
    try {
      setSendingToLoop(true);
      const result = await sendOrderToLoop(orderId);

      if (result.success) {
        showToastOrAlert(t("Order sent to Loop successfully"), 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || t("Error sending order to Loop"));
      }
    } catch (error) {
      console.log('Error sending to loop:', error);
      showToastOrAlert(t("Error sending order to Loop"));
    } finally {
      setSendingToLoop(false);
    }
  };

  // تابع ذخیره اطلاعات لوپ
  const handleSaveLoopInfo = async () => {
    // حداقل یکی از فیلدها باید پر شده باشد
    if (!loopInfo.duration && !loopInfo.loop_cost_estimate && !loopInfo.loop_description) {
      showToastOrAlert(t("Please fill in at least one field"));
      return;
    }

    try {
      setSavingLoopInfo(true);
      const requestData = {};

      if (loopInfo.duration) {
        requestData.duration = parseInt(loopInfo.duration);
      }
      if (loopInfo.loop_cost_estimate) {
        requestData.loop_cost_estimate = parseInt(loopInfo.loop_cost_estimate);
      }
      if (loopInfo.loop_description) {
        requestData.loop_description = loopInfo.loop_description;
      }

      const result = await updateLoopInfo(orderId, requestData);

      if (result.success) {
        showToastOrAlert(t("Loop information saved successfully"), 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || t("Error saving Loop information"));
      }
    } catch (error) {
      console.log('Error saving loop info:', error);
      showToastOrAlert(t("Error saving Loop information"));
    } finally {
      setSavingLoopInfo(false);
    }
  };

  // تابع شروع تعمیر
  const handleStartRepair = async () => {
    try {
      setStartingRepair(true);
      const result = await startRepair(orderId);

      if (result.success) {
        showToastOrAlert(t("Work start saved successfully"), 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || t("Error saving repair start"));
      }
    } catch (error) {
      console.log('Error starting repair:', error);
      showToastOrAlert(t("Error saving repair start"));
    } finally {
      setStartingRepair(false);
    }
  };

  // تابع بارگذاری گزارش تحویل
  const loadDeliveryReport = async () => {
    try {
      setLoadingDeliveryReport(true);
      const result = await getDeliveryReportByOrderId(orderId);

      if (result.success && result.data?.report) {
        const report = result.data.report;
        setDeliveryReportId(report.id);
        setDeliveryReportConfirmed(!!report.user_verified_at);
        setDeliveryReport({
          name: report.name || '',
          melicode: report.melicode || '',
          product_info: report.product_info || '',
          accessories: report.accessories || '',
          label_code: report.label_code || '',
          appearance_defect: report.appearance_defect || '',
          user_description: report.user_description || '',
          technical_description: report.technical_description || ''
        });
      } else {
        // گزارش وجود ندارد - این طبیعی است
        console.log('ℹ️ هنوز گزارش تحویلی ثبت نشده است');
      }
    } catch (error) {
      // 404 به معنای گزارش وجود ندارد - طبیعی است
      if (error.response?.status === 404) {
        console.log('ℹ️ هنوز گزارش تحویلی ثبت نشده است (404)');
      } else {
        console.log('❌ خطا در بارگذاری گزارش تحویل:', error);
      }
    } finally {
      setLoadingDeliveryReport(false);
    }
  };

  // تابع ذخیره گزارش تحویل
  const handleSaveDeliveryReport = async () => {
    // اعتبارسنجی فیلدهای الزامی
    if (!deliveryReport.name || !deliveryReport.melicode || !deliveryReport.product_info) {
      showToastOrAlert(t("Please enter name, national ID, and product information"));
      return;
    }

    // اعتبارسنجی کد ملی (10 رقم)
    if (deliveryReport.melicode.length !== 10 || !/^\d+$/.test(deliveryReport.melicode)) {
      showToastOrAlert(t("National ID must be 10 digits"));
      return;
    }

    try {
      setSavingDeliveryReport(true);
      const requestData = {
        order_id: orderId,
        ...deliveryReport
      };

      let result;
      if (deliveryReportId) {
        // ویرایش گزارش موجود
        result = await updateDeliveryReport(deliveryReportId, requestData);
      } else {
        // ثبت گزارش جدید
        result = await createDeliveryReport(requestData);
      }

      if (result.success) {
        const message = deliveryReportId
          ? t("Delivery report updated successfully")
          : t("Delivery report submitted and verification code sent to user");
        showToastOrAlert(message, 'success');
        if (result.data?.report?.id) {
          setDeliveryReportId(result.data.report.id);
        }
        await fetchOrderDetails();
        await loadDeliveryReport();
      } else {
        showToastOrAlert(result.message || t("Error saving delivery report"));
      }
    } catch (error) {
      console.log('Error saving delivery report:', error);
      showToastOrAlert(t("Error saving delivery report"));
    } finally {
      setSavingDeliveryReport(false);
    }
  };

  // تابع تایید گزارش با کد 6 رقمی
  const handleVerifyWithCode = async () => {
    // اعتبارسنجی کد
    if (!verificationCode || verificationCode.length !== 6) {
      showToastOrAlert(t("Please enter the complete 6-digit code"));
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      showToastOrAlert(t("Verification code must be 6 digits"));
      return;
    }

    try {
      setVerifyingCode(true);
      const result = await verifyDeliveryReportWithCode(orderId, verificationCode);

      if (result.success) {
        showToastOrAlert(t("Delivery report confirmed successfully"), 'success');
        setVerificationCode(''); // پاک کردن کد
        await fetchOrderDetails();
        await loadDeliveryReport();
      } else {
        if (result.error_code === 'INVALID_VERIFICATION_CODE') {
          showToastOrAlert(t("The verification code is incorrect. Please try again."));
        } else {
          showToastOrAlert(result.message || t("Error verifying report"));
        }
      }
    } catch (error) {
      console.log('Error verifying code:', error);
      showToastOrAlert(t("Error verifying report"));
    } finally {
      setVerifyingCode(false);
    }
  };

  // تابع ارسال مجدد کد تایید
  const handleResendCode = async () => {

    try {
      setResendingCode(true);
      const result = await resendDeliveryReportCode(orderId);

      if (result.success) {
        showToastOrAlert(t("Verification code resent"), 'success');
        setVerificationCode('');
        // شروع تایمر 60 ثانیه
        setResendTimer(60);
        setCanResend(false);
      } else {

        showToastOrAlert(result.message || t("Error resending code"));
      }
    } catch (error) {
      console.log('Error resending code:', error);
      showToastOrAlert(t("Error resending code"));
    } finally {
      setResendingCode(false);
    }
  };

  // تابع اتمام سرویس جاری
  const handleEndOrder = async () => {
    try {
      setEndingOrder(true);
      const result = await endOrder(orderId);

      if (result.success) {
        showToastOrAlert(t("Work completion saved successfully"), 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || t("Error saving work completion"));
      }
    } catch (error) {
      console.log('Error ending order:', error);
      showToastOrAlert(t("Error saving work completion"));
    } finally {
      setEndingOrder(false);
    }
  };

  // تابع ثبت نظر تکنسین
  const handleSubmitTechnicianOpinion = async () => {
    if (!technicianOpinion.trim()) {
      showToastOrAlert(t("Please enter your opinion"));
      return;
    }

    try {
      setSubmittingOpinion(true);
      await submitTechnicianOpinion(orderId, technicianOpinion);

      showToastOrAlert(t("Your opinion has been submitted successfully"), 'success');

      // به‌روزرسانی اطلاعات سفارش
      await fetchOrderDetails();

    } catch (error) {
      showToastOrAlert(error.message || t("Error submitting opinion"));
    } finally {
      setSubmittingOpinion(false);
    }
  };

  // شرایط فعال‌سازی مراحل - باید قبل از useEffect ها تعریف شوند
  const isReviewActive = data?.status == 0 || data?.status == 1 || data?.status == 2;

  const isPresenceActive = data?.user_initial_accept && (data?.status == 0 || data?.status == 1 || data?.status == 2);

  const isProductStatusActive = data?.arrived_at && data?.is_technician_verified == 1;

  const isSendLoopActive = reportConfirmed; // فعال می‌شود وقتی کاربر گزارش را تأیید کند

  const isPricesActive = data?.send_to_loop && data?.user_accept_date;

  const isDeliveryActive = data?.started_at && (data?.status == 0 || data?.status == 1 || data?.status == 2);

  // بارگذاری گزارش محصول در صورت وجود
  React.useEffect(() => {
    if (data && isProductStatusActive && orderId) {
      loadProductReport();
    }
  }, [data, isProductStatusActive, orderId]);

  // بارگذاری گزارش تحویل در صورت وجود
  React.useEffect(() => {
    if (data && isDeliveryActive && orderId) {
      loadDeliveryReport();
    }
  }, [data, isDeliveryActive, orderId]);

  // تایمر برای ارسال مجدد کد
  React.useEffect(() => {
    let interval;
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);


  if (loading && !data) {
    return (
      <LinearGradient
        colors={['#7FDBFF', '#0074D9', '#001f3f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={t("Order details")}
        />
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>{t("Loading...")}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!data) {
    return (
      <LinearGradient
        colors={['#7FDBFF', '#0074D9', '#001f3f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={t("Order details")}
        />
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>{t("Order not found")}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }



  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <LinearGradient
        colors={['#7FDBFF', '#0074D9', '#001f3f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>


          <ScreenHeaders
            title={t("Order details")}
          />

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >

            <AccordionHeader
              title={t("Order details")}
              isActive={true}
              isOpen={showDetails}
              onPress={() => setShowDetails(!showDetails)}
            />

            {
              showDetails &&
              <DetailConponent data={data} renderRow={renderRow} />
            }

            <AccordionHeader
              title={t("User information")}
              isActive={true}
              isOpen={showUserInfo}
              onPress={() => setShowUserInfo(!showUserInfo)}
              badgeCount={unreadMessagesCount}
            />

            {showUserInfo && (
              <View style={styles.contentSection}>
                {/* اطلاعات کاربر */}
                <View style={{ gap: 10 }}>
                  {data?.user?.name && renderRow(`${t("Full Name")}:`, data.user.name + ' ' + data.user.last_name)}
                  {data?.user?.phone && renderRow(`${t("Phone Number")}:`, data.user.phone)}
                  {data?.user?.email && renderRow(`${t("Email")}:`, data.user.email)}
                  {data?.user_type_info && renderRow(t("User type:"), data.user_type_info?.account_type_label || data.user_type_info?.account_type || t("Unknown"))}
                  {data?.address && renderRow(`${t("Address")}:`, data.address)}
                </View>

                {/* دکمه چت - فقط برای سفارشات فعال */}
                {data?.user_id && (data?.status == 0 || data?.status == 1 || data?.status == 2) && (
                  <View style={{ marginTop: 15 }}>
                    <TouchableOpacity
                      style={[
                        NewStyles.rowWrapper,
                        {
                          backgroundColor: themeColor0.bgColor(1),
                          paddingVertical: 12,
                          paddingHorizontal: 15,
                          borderRadius: 8,
                          alignItems: 'center',
                          gap: 10,
                        },
                      ]}
                      onPress={() => {
                        navigation.navigate('ChatRoom', {
                          userId: data.user_id,
                          userName: data.user?.name || t("User")
                        });
                      }}
                    >
                      <View style={{ position: 'relative' }}>
                        <Ionicons name="chatbubble-ellipses-outline" size={22} color={themeColor5.bgColor(1)} />
                        {unreadMessagesCount > 0 && (
                          <View style={{
                            position: 'absolute',
                            top: -6,
                            right: -10,
                            backgroundColor: themeColor6.bgColor(1),
                            borderRadius: 10,
                            minWidth: 20,
                            height: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 5,
                            borderWidth: 2,
                            borderColor: themeColor0.bgColor(1),
                          }}>
                            <Text style={[NewStyles.title4, { fontSize: 11 }]}>
                              {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[NewStyles.text4, { color: themeColor5.bgColor(1), flex: 1 }]}>
                        {t("Chat with user")}
                      </Text>
                      <Ionicons name="chevron-back-outline" size={20} color={themeColor5.bgColor(1)} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <AccordionHeader
              title={t("Review / Reschedule / Pre-arrival")}
              isActive={isReviewActive}
              isOpen={showReview}
              onPress={() => {
                if (isReviewActive) {
                  setShowReview(!showReview);
                } else {
                  showToastOrAlert(t("This step is not available for canceled orders."));
                }
              }}
            />

            {showReview && isReviewActive && (
              <View style={styles.contentSection}>
                {/* راهنمای تکنسین */}
                {!data?.user_initial_accept && (
                  <View style={[styles.infoCard, { backgroundColor: themeColor0.bgColor(0.1), borderWidth: 1, borderColor: themeColor0.bgColor(0.3) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center', marginBottom: 10 }]}>
                      <Ionicons name="information-circle" size={24} color={themeColor0.bgColor(1)} />
                      <Text style={[NewStyles.title, { color: themeColor0.bgColor(1) }]}>{t("Technician guide")}</Text>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: 'right', lineHeight: 24 }]}>
                      {data?.service_schedule_type
                        ? t("Please enter the technician base amount and the required details. After saving, the information will be sent to the user and you must wait for the user's approval.")
                        : t("Please specify the visit date, time range, technician base amount, and details. After saving the information, your request will be sent to the user and you must wait for the user's approval.")
                      }
                    </Text>
                  </View>
                )}

                {/* نمایش تاریخ و ساعت فعلی - فقط برای سفارشات معمولی */}
                {!data?.service_schedule_type && !data?.user_initial_accept && (
                  <View style={styles.infoCard}>
                    <Text style={NewStyles.text2}>{t("Current visit date and time:")}</Text>
                    <Text style={[NewStyles.title, { marginTop: 5 }]}>
                      {t("{{date}} at {{time}}", { date: formatDate(data?.date), time: data?.time?.split(':')?.slice(0, 2)?.join(':') })}
                    </Text>
                  </View>
                )}

                {/* نمایش اطلاعات سفارش سازمانی */}
                {data?.service_schedule_type && !data?.user_initial_accept && (
                  <View style={[styles.infoCard, { backgroundColor: themeColor0.bgColor(0.1) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center', marginBottom: 10 }]}>
                      <Ionicons name="business-outline" size={24} color={themeColor0.bgColor(1)} />
                      <Text style={NewStyles.title}>{t("Corporate order")}</Text>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: 'center', lineHeight: 22 }]}>
                      {t("This order is corporate and its date and time cannot be changed.\nYou can only add descriptions.")}
                    </Text>
                  </View>
                )}

                {/* پیام انتظار برای تایید کاربر */}
                {!data?.user_initial_accept && (
                  <View style={[styles.infoCard, { backgroundColor: themeColor3.bgColor(0.15), borderWidth: 1, borderColor: themeColor3.bgColor(0.5) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center', marginBottom: 8 }]}>
                      <Ionicons name="hourglass-outline" size={24} color={themeColor3.bgColor(1)} />
                      <Text style={[NewStyles.title, { color: themeColor3.bgColor(1) }]}>{t("Awaiting user approval")}</Text>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: 'center', lineHeight: 22, color: themeColor3.bgColor(1) }]}>
                      {t("After saving the information, your request will be sent to the user.\nUntil the user approves, you cannot proceed to the next steps.\nPlease wait for the user's approval.")}
                    </Text>
                  </View>
                )}

                {data?.user_initial_accept ? (
                  // نمایش پیام تایید کاربر
                  <View style={[styles.infoCard,]}>

                    {data?.technician_des && (
                      <View style={{ marginTop: 10, padding: 10, backgroundColor: themeColor5.bgColor(1), borderRadius: 8 }}>
                        <Text style={NewStyles.text2}>{t("Saved description:")}</Text>
                        <Text style={[NewStyles.text10, { marginTop: 5 }]}>{data.technician_des}</Text>
                      </View>
                    )}
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                      <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                      <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                        {t("User has approved")}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    {/* فیلدهای تاریخ، ساعت و مبلغ - فقط برای سفارشات معمولی */}
                    {!data?.service_schedule_type && (
                      <>
                        {/* انتخاب تاریخ جدید */}
                        <View style={styles.inputGroup}>
                          <Text style={NewStyles.text}>{t("Visit date:")} <Text style={NewStyles.text6}>*</Text></Text>
                          <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setDatePickerModal(true)}
                          >
                            <Text style={NewStyles.text10}>
                              {selectedDate ? formatDate(selectedDate) : t("Select Date")}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color={themeColor0.bgColor(1)} />
                          </TouchableOpacity>
                        </View>

                        {/* ورود بازه ساعت */}
                        <View style={styles.inputGroup}>
                          <Text style={NewStyles.text}>{t("Visit time range:")} <Text style={NewStyles.text6}>*</Text></Text>
                          <TextInput
                            style={styles.textInput}
                            value={timeRange}
                            onChangeText={setTimeRange}
                            placeholder={t("Example: 09:00-12:00")}
                            placeholderTextColor={themeColor3.bgColor(0.5)}
                          />
                        </View>

                      </>
                    )}

                    {/* ورود مبلغ پایه تکنسین - برای هر دو نوع سفارش */}
                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>{t("Technician base amount (Toman):")} <Text style={NewStyles.text6}>*</Text></Text>
                      <TextInput
                        style={styles.textInput}
                        value={technicianPrice?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChangeText={(p) => { setTechnicianPrice(p?.replace(/,/g, "")) }}
                        placeholder={t("Example: 500000")}
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        keyboardType="number-pad"
                      />
                    </View>

                    {/* توضیحات - برای هر دو نوع سفارش */}
                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>{t("Description")}: {!data?.service_schedule_type && <Text style={NewStyles.text6}>*</Text>}</Text>
                      <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        value={reviewDescription}
                        onChangeText={setReviewDescription}
                        placeholder={data?.service_schedule_type ? t("Enter your description (optional)...") : t("Enter your description...")}
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* دکمه ذخیره */}
                    <Button
                      title={t("Save changes")}
                      onPress={handleSaveReview}
                      loading={savingReview}
                      disabled={savingReview}
                    />
                  </>
                )}
              </View>
            )}

            <AccordionHeader
              title={t("Presence report")}
              isActive={isPresenceActive}
              isOpen={showPresence}
              onPress={() => {
                if (isPresenceActive) {
                  setShowPresence(!showPresence);
                } else if ((data?.status != 0 || data?.status != 1 || data?.status != 2)) {
                  showToastOrAlert(t("Order has been canceled"))
                }
                else {
                  showToastOrAlert(t("Please complete the review/reschedule step first."));
                }
              }}
            />

            {showPresence && isPresenceActive && (
              <View style={styles.contentSection}>
                {/* نمایش وضعیت حرکت و رسیدن */}
                <View style={styles.presenceStatusContainer}>
                  {/* وضعیت حرکت */}
                  {data?.set_off_at ? (
                    <View style={[styles.statusCard, { backgroundColor: themeColor7.bgColor(0.2) }]}>
                      <View style={[NewStyles.row, { gap: 10, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                        <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                          {t("You have departed")}
                        </Text>
                      </View>
                      <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                        {t("Departure time:")} {formatDateTime(data.set_off_at)}
                      </Text>
                    </View>
                  ) : (
                    <Button
                      title={t("Report departure")}
                      onPress={handleSetOff}
                      loading={settingOff}
                      disabled={settingOff}
                    />
                  )}

                  {/* وضعیت رسیدن - فقط در صورتی که حرکت کرده باشد */}
                  {data?.set_off_at && (
                    <>
                      {data?.arrived_at ? (
                        <View style={[styles.statusCard, { backgroundColor: themeColor7.bgColor(0.2) }]}>
                          <View style={[NewStyles.row, { gap: 10, alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="location" size={24} color={themeColor7.bgColor(1)} />
                            <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                              {t("You have arrived")}
                            </Text>
                          </View>
                          <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                            {t("Arrival time:")} {formatDateTime(data.arrived_at)}
                          </Text>
                        </View>
                      ) : (
                        <Button
                          title={t("Report arrival")}
                          onPress={handleArrive}
                          loading={arriving}
                          disabled={arriving}
                        />
                      )}
                    </>
                  )}
                </View>

                {/* نمایش مدت زمان سفر */}
                {data?.set_off_at && data?.arrived_at && (
                  <View style={styles.infoCard}>
                    <Text style={NewStyles.text2}>{t("Travel time:")}</Text>
                    <Text style={[NewStyles.title, { marginTop: 5 }]}>
                      {(() => {
                        const setOff = new Date(data.set_off_at);
                        const arrived = new Date(data.arrived_at);
                        const diffMinutes = Math.round((arrived - setOff) / 60000);
                        return t("{{count}} minutes", { count: diffMinutes });
                      })()}
                    </Text>
                  </View>
                )}

                {/* بخش لغو سفارش - فقط بعد از رسیدن */}
                {data?.arrived_at && !data?.started_at && (
                  <View style={[styles.cancelSection, { marginTop: 20, padding: 15, backgroundColor: themeColor5.bgColor(1), borderRadius: 10, borderWidth: 1, borderColor: themeColor6.bgColor(1) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center', marginBottom: 15 }]}>
                      <Ionicons name="warning-outline" size={24} color={themeColor6.bgColor(1)} />
                      <Text style={[NewStyles.title4, { color: themeColor6.bgColor(1) }]}>
                        {t("If a problem occurs")}
                      </Text>
                    </View>

                    <Text style={[NewStyles.text10, { marginBottom: 10 }]}>
                      {t("If the user is absent or a problem occurred, select a cancellation reason:")}
                    </Text>

                    {/* گزینه‌های لغو */}
                    {[
                      'اعلام حضور / لغو از سوی کاربر',
                      'اعلام حضور / لغو از سوی تکنسین',
                      'اعلام حضور / نادرست بودن آدرس',
                      'اعلام حضور / موکول به زمان دیگر از سوی کاربر',
                      'اعلام حضور / عدم پاسخ تماس و پیام از سوی کاربر',
                      'اعلام حضور/عدم حضورکاربر - حضور خانواده یا آشنایان',
                      'اعلام حضور / نادرست بودن مشخصات کاربر',
                    ].map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.cancelOptionRow,
                          selectedCancelReason === option && styles.cancelOptionRowSelected
                        ]}
                        onPress={() => setSelectedCancelReason(option)}
                      >
                        <Text style={[
                          NewStyles.text10,
                          styles.cancelOptionText,
                          selectedCancelReason === option && NewStyles.text6
                        ]}>
                          {getCancelReasonLabel(option)}
                        </Text>
                      </TouchableOpacity>
                    ))}

                    {/* دکمه لغو سفارش */}
                    {selectedCancelReason && (
                      <TouchableOpacity
                        style={[
                          styles.cancelButton,
                          cancelingOrder && styles.cancelButtonDisabled
                        ]}
                        onPress={handleCancelOrder}
                        disabled={cancelingOrder}
                      >
                        {cancelingOrder ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="close-circle-outline" size={22} color="#fff" />
                            <Text style={NewStyles.text4}>{t("Cancel Order")}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* بخش کمک اضطراری - بعد از رسیدن */}
                {data?.arrived_at && (
                  <View style={[styles.emergencySection, { marginTop: 20, padding: 15, backgroundColor: themeColor7.bgColor(0.1), borderRadius: 10, borderWidth: 1, borderColor: themeColor7.bgColor(1) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center', marginBottom: 10 }]}>
                      <Text style={[NewStyles.title7]}>
                        {t("Urgent dispatch / replacement technician / parts")}
                      </Text>
                    </View>

                    {/* نمایش درخواست ثبت شده */}
                    {data?.emergency_help && data?.emergency_help_at && (
                      <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2), marginBottom: 15 }]}>
                        <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                          <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                          <Text style={[NewStyles.title7]}>
                            {t("Request submitted")}
                          </Text>
                        </View>
                        <Text style={[NewStyles.text10, { marginTop: 10, textAlign: 'right' }]}>
                          {data.emergency_help}
                        </Text>
                        <Text style={[NewStyles.text10, { marginTop: 5, textAlign: 'center', color: themeColor3.bgColor(1) }]}>
                          {t("Submitted at:")} {formatDateTime(data.emergency_help_at)}
                        </Text>
                      </View>
                    )}

                    <Text style={[NewStyles.text10, { marginBottom: 10 }]}>
                      {t("If you need an assistant, a part, or a special tool, submit your request:")}
                    </Text>

                    {/* فیلد توضیحات */}
                    <TextInput
                      style={[styles.textInput, styles.multilineInput]}
                      value={emergencyHelpText}
                      onChangeText={setEmergencyHelpText}
                      placeholder={t("Example: Need an assistant technician to help replace a heavy part...")}
                      placeholderTextColor={themeColor3.bgColor(0.5)}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                      maxLength={191}
                    />

                    {/* شمارنده کاراکتر */}
                    <Text style={[NewStyles.text10, { textAlign: 'left', marginTop: 5, color: themeColor3.bgColor(1) }]}>
                      {emergencyHelpText.length}/191
                    </Text>

                    {/* دکمه ثبت درخواست */}
                    <Button
                      title={data?.emergency_help ? t("Update request") : t("Submit help request")}
                      onPress={handleSubmitEmergencyHelp}
                      loading={submittingEmergencyHelp}
                      disabled={submittingEmergencyHelp || !emergencyHelpText.trim()}
                    />
                  </View>
                )}
              </View>
            )}

            <AccordionHeader title={t("Product status")} isActive={isProductStatusActive} isOpen={showProductStatus} onPress={() => { if (isProductStatusActive) { setShowProductStatus(!showProductStatus); } else { showToastOrAlert(t("Your presence must be confirmed by the user first.")); } }} />

            {showProductStatus && isProductStatusActive && (
              <View style={styles.contentSection}>
                {/* نمایش وضعیت تأیید کاربر */}
                {reportConfirmed && (
                  <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                      <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                      <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                        {t("User has confirmed the report")}
                      </Text>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                      {t("Editing the report is not available")}
                    </Text>
                  </View>
                )}

                {/* بخش اطلاعات کاربر */}
                <Text style={[NewStyles.title, styles.sectionTitle]}>{t("Deliverer information")}</Text>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Full Name")} <Text style={NewStyles.text6}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.name}
                    onChangeText={(text) => setProductReport({ ...productReport, name: text })}
                    placeholder={t("Enter full name")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("National ID")} <Text style={NewStyles.text6}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.melicode}
                    onChangeText={(text) => setProductReport({ ...productReport, melicode: text })}
                    placeholder={t("10 digits")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    keyboardType="number-pad"
                    maxLength={10}
                    editable={!reportConfirmed}
                  />
                </View>

                {/* بخش اطلاعات محصول */}
                <Text style={[NewStyles.title, styles.sectionTitle]}>{t("Product information")} <Text style={NewStyles.text6}>*</Text></Text>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Product name")} <Text style={NewStyles.text6}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_name}
                    onChangeText={(text) => setProductReport({ ...productReport, product_name: text })}
                    placeholder={t("Example: Laptop")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Product brand")} <Text style={NewStyles.text6}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_brand}
                    onChangeText={(text) => setProductReport({ ...productReport, product_brand: text })}
                    placeholder={t("Example: Asus")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Product model")} <Text style={NewStyles.text6}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_model}
                    onChangeText={(text) => setProductReport({ ...productReport, product_model: text })}
                    placeholder={t("Example: VivoBook 15")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Product color")} <Text style={NewStyles.text6}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_color}
                    onChangeText={(text) => setProductReport({ ...productReport, product_color: text })}
                    placeholder={t("Example: Black")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Product serial number")}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_serial_number}
                    onChangeText={(text) => setProductReport({ ...productReport, product_serial_number: text })}
                    placeholder={t("Serial number")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Asset label code")}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.asset_label_code}
                    onChangeText={(text) => setProductReport({ ...productReport, asset_label_code: text })}
                    placeholder={t("Asset code")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Accessories")}</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.accessories}
                    onChangeText={(text) => setProductReport({ ...productReport, accessories: text })}
                    placeholder={t("Example: charger, laptop bag")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                {/* بخش ایرادات و درخواست‌ها */}
                <Text style={[NewStyles.title4, styles.sectionTitle]}>{t("Issues and requests")}</Text>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Issues reported by user")}</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.user_reported_issues}
                    onChangeText={(text) => setProductReport({ ...productReport, user_reported_issues: text })}
                    placeholder={t("Issues reported by user")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Issues reported by technician")}</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.technician_reported_issues}
                    onChangeText={(text) => setProductReport({ ...productReport, technician_reported_issues: text })}
                    placeholder={t("Identified issues")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Issues observed by technician")}</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.technician_observed_issues}
                    onChangeText={(text) => setProductReport({ ...productReport, technician_observed_issues: text })}
                    placeholder={t("Example: scratches on the case")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("User requested services")}</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.user_requested_services}
                    onChangeText={(text) => setProductReport({ ...productReport, user_requested_services: text })}
                    placeholder={t("Example: repair and Windows installation")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                {/* بخش قیمت و رمز */}
                <Text style={[NewStyles.title, styles.sectionTitle]}>{t("Additional information")}</Text>

                {user?.apple_check == 1
                  ? null
                  : <View style={styles.inputGroup}>
                    <Text style={NewStyles.text}>{t("Maximum price (Toman)")}</Text>
                    <TextInput
                      style={styles.textInput}
                      value={productReport.max_price?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      onChangeText={(text) => setProductReport({ ...productReport, max_price: text?.replace(/,/g, "") })}
                      placeholder={t("Example: 5000000")}
                      placeholderTextColor={themeColor3.bgColor(0.5)}
                      keyboardType="number-pad"
                      editable={!reportConfirmed}
                    />
                  </View>}
  {user?.apple_check == 1 
  ? null 
  :
                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Minimum price (Toman)")}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.min_price?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    onChangeText={(text) => setProductReport({ ...productReport, min_price: text?.replace(/,/g, "") })}
                    placeholder={t("Example: 3000000")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    keyboardType="number-pad"
                    editable={!reportConfirmed}
                  />
                </View>}

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Product password")}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_password}
                    onChangeText={(text) => setProductReport({ ...productReport, product_password: text })}
                    placeholder={t("Device password (if any)")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                {/* دکمه ذخیره - فقط اگر تأیید نشده باشد */}
                {!reportConfirmed && (
                  <Button
                    title={reportId ? t("Update report") : t("Submit report")}
                    onPress={handleSaveProductReport}
                    loading={savingReport}
                    disabled={savingReport || loadingReport}
                  />
                )}
              </View>
            )}

            <AccordionHeader
              title={t("Send to Loop")}
              isActive={isSendLoopActive}
              isOpen={showSendloop}
              onPress={() => {
                if (isSendLoopActive) {
                  setShowSendloop(!showSendloop);
                } else {
                  showToastOrAlert(t("This step becomes active after the user confirms the report."));
                }
              }}
            />

            {showSendloop && isSendLoopActive && (
              <View style={styles.contentSection}>
                {/* نمایش وضعیت ارسال به لوپ */}
                {data?.send_to_loop ? (
                  <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                      <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                      <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                        {t("Order has been sent to Loop")}
                      </Text>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                      {t("Sent at:")} {formatDateTime(data.send_to_loop)}
                    </Text>
                  </View>
                ) : (
                  <Button
                    title={t("Send to Loop")}
                    onPress={handleSendToLoop}
                    loading={sendingToLoop}
                    disabled={sendingToLoop}
                  />
                )}

                {/* فرم اطلاعات لوپ - فقط بعد از ارسال به لوپ */}
                {data?.send_to_loop && (
                  <>
                    {/* نمایش وضعیت تأیید کاربر برای اطلاعات لوپ */}
                    {data?.user_accept_date && (
                      <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2) }]}>
                        <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                          <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                          <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                            {t("User has confirmed Loop information")}
                          </Text>
                        </View>
                        <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                          {t("Confirmed at:")} {formatDateTime(data.user_accept_date)}
                        </Text>
                      </View>
                    )}

                    <Text style={[NewStyles.title, styles.sectionTitle]}>{t("Loop information")}</Text>

                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>{t("Work duration (days)")}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={loopInfo.duration}
                        onChangeText={(text) => setLoopInfo({ ...loopInfo, duration: text })}
                        placeholder={t("Example: 5")}
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        keyboardType="number-pad"
                        editable={!data?.user_accept_date}
                      />
                    </View>

                 {user?.apple_check == 1 
  ? null 
  :     <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>{t("Estimated cost (Toman)")}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={loopInfo.loop_cost_estimate?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChangeText={(text) => setLoopInfo({ ...loopInfo, loop_cost_estimate: text?.replace(/,/g, "") })}
                        placeholder={t("Example: 2500000")}
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        keyboardType="number-pad"
                        editable={!data?.user_accept_date}
                      />
                    </View>}

                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>{t("Loop description")}</Text>
                      <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        value={loopInfo.loop_description}
                        onChangeText={(text) => setLoopInfo({ ...loopInfo, loop_description: text })}
                        placeholder={t("Additional details...")}
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        editable={!data?.user_accept_date}
                      />
                    </View>

                    {/* دکمه ذخیره - فقط اگر کاربر تأیید نکرده باشد */}
                    {(!data?.user_accept_date && !data?.user_cancellation_date) && (
                      <Button
                        title={t("Save Loop information")}
                        onPress={handleSaveLoopInfo}
                        loading={savingLoopInfo}
                        disabled={savingLoopInfo}
                      />
                    )}
                  </>
                )}
              </View>
            )}

       {user?.apple_check == 1 
  ? null 
  :       <AccordionHeader
              title={t("Parts / Costs / Start")}
              isActive={isPricesActive}
              isOpen={showPrices}
              onPress={async () => {
                if (!isPricesActive) {
                  showToastOrAlert(t("First, the device must be sent to Loop and the user must confirm."));
                  return;
                }

                setShowPrices(!showPrices);
              }}
            />}

            {showPrices && isPricesActive && (
              <View style={[styles.contentSection, { gap: 15, paddingVertical: 15 }]}>
                {user?.apple_check == 1 
  ? null 
  :  <View style={[NewStyles.row, { gap: 10, paddingHorizontal: 15 }]}>
                  <Ionicons name="pricetag-outline" size={24} color={themeColor0.bgColor(1)} />
                  <Text style={[NewStyles.text, { flex: 1 }]}>
                    {t("In this section, you can specify the required costs and parts.")}
                  </Text>
                </View>}

                {/* دکمه شروع تعمیر */}
                {data?.started_at ? (
                  <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2), marginHorizontal: 15 }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                      <Ionicons name="construct" size={24} color={themeColor7.bgColor(1)} />
                      <Text style={[NewStyles.title, { color: themeColor7.bgColor(1) }]}>
                        {t("Repair has started")}
                      </Text>
                    </View>
                    <Text style={[NewStyles.text, { textAlign: 'center', marginTop: 5 }]}>
                      {t("Start time:")} {formatDateTime(data.started_at)}
                    </Text>
                  </View>
                ) : (
                  <View style={{ paddingHorizontal: 15 }}>
                    <Button
                      title={t("Start repair")}
                      onPress={handleStartRepair}
                      loading={startingRepair}
                      disabled={startingRepair}
                    />
                  </View>
                )}

                {data?.payment_status == 0 && <View style={{ paddingHorizontal: 15 }}>
                  <TouchableOpacity
                    style={[
                      NewStyles.row,
                      NewStyles.center,
                      NewStyles.border10,
                      {
                        backgroundColor: themeColor0.bgColor(1),
                        paddingVertical: 15,
                        gap: 10,
                      },
                    ]}
                    onPress={() => {
                      if (data?.category_id) {
                        navigation.navigate('ExtraServices', {
                          categoryId: data.category_id,
                          orderId: orderId
                        });
                      } else {
                        showToastOrAlert(t("Category information not found"));
                      }
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={themeColor5.bgColor(1)} />
                    <Text style={[NewStyles.text4, { color: themeColor5.bgColor(1) }]}>
                      {t("Manage costs and parts")}
                    </Text>
                  </TouchableOpacity>
                </View>}
                {(data?.extra_services && data.extra_services.length > 0) ? (
                  <View style={{ gap: 10, paddingHorizontal: 15 }}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                      <Ionicons name="checkmark-circle" size={20} color={themeColor0.bgColor(1)} />
                      <Text style={NewStyles.title}>{t("Recorded costs:")}</Text>
                    </View>

                    {data.extra_services.map((extra, index) => (
                      <View
                        key={index}
                        style={[
                          NewStyles.rowWrapper,
                          NewStyles.border10,
                          {
                            backgroundColor: themeColor5.bgColor(1),
                            padding: 12,
                            gap: 8,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={NewStyles.text}>
                            {extra.title}
                          </Text>
                        </View>
                        <Text style={[NewStyles.text]}>
                          {formatPrice(extra.price)}{t(" Toman")}
                        </Text>
                      </View>
                    ))}

                    <View
                      style={[
                        NewStyles.rowWrapper,
                        NewStyles.border10,
                        {
                          backgroundColor: themeColor5.bgColor(1),
                          padding: 15,
                        },
                      ]}
                    >
                      <Text style={[NewStyles.title]}>{`${t("Total")}:`}</Text>
                      <Text style={[NewStyles.title]}>
                        {formatPrice(
                          data.extra_services.reduce((sum, extra) => sum + (parseFloat(extra.price) || 0), 0)
                        )}{t(" Toman")}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      NewStyles.center,
                      NewStyles.border10,
                      {
                        backgroundColor: themeColor4.bgColor(0.1),
                        padding: 20,
                        marginHorizontal: 15,
                        gap: 10,
                      },
                    ]}
                  >
                    <Ionicons name="information-circle-outline" size={32} color={themeColor3.bgColor(1)} />
                    <Text style={[NewStyles.text3, { textAlign: 'center' }]}>
                      {t("No extra services or parts have been recorded yet.")}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <AccordionHeader
              title={t("Delivery to user / Complete current service")}
              isActive={isDeliveryActive}
              isOpen={showDelivery}
              onPress={() => {
                if (isDeliveryActive) {
                  setShowDelivery(!showDelivery);
                } else {
                  showToastOrAlert(t("This step is not available for canceled orders."));
                }
              }}
            />

            {showDelivery && isDeliveryActive && (
              <View style={styles.contentSection}>
                {/* لاگ کردن وضعیت پرداخت */}
                {console.log('💰 payment_status:', data?.payment_status)}
                {console.log('💰 نوع داده payment_status:', typeof data?.payment_status)}

                {/* نمایش وضعیت پرداخت کاربر - payment_status: "1" = پرداخت شده، "0" = پرداخت نشده */}
                <View style={[styles.infoCard, { backgroundColor: (data?.payment_status == "1" || data?.payment_status === 1) ? themeColor7.bgColor(0.2) : themeColor3.bgColor(0.2) }]}>
                  <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                    <Ionicons
                      name={(data?.payment_status == "1" || data?.payment_status === 1) ? "checkmark-circle" : "information-circle"}
                      size={24}
                      color={(data?.payment_status == "1" || data?.payment_status === 1) ? themeColor7.bgColor(1) : themeColor3.bgColor(1)}
                    />
                   {user?.apple_check == 1 
  ? null 
  :   <Text style={[NewStyles.title4, { color: (data?.payment_status == "1" || data?.payment_status === 1) ? themeColor7.bgColor(1) : themeColor3.bgColor(1) }]}>
                      {(data?.payment_status == "1" || data?.payment_status === 1) ? t("User has paid") : t("User has not paid yet")}
                    </Text>}
                  </View>
                </View>

                {/* نمایش وضعیت تأیید کاربر برای گزارش تحویل */}
                {deliveryReportConfirmed && (
                  <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                      <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                      <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                        {t("User has confirmed the delivery report")}
                      </Text>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                      {t("Editing the report is not available")}
                    </Text>
                  </View>
                )}

                {/* فرم گزارش تحویل */}
                <Text style={[NewStyles.title, styles.sectionTitle]}>{t("Product delivery report")}</Text>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Recipient name")} <Text style={NewStyles.text6}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryReport.name}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, name: text })}
                    placeholder={t("Recipient full name")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Recipient national ID")} <Text style={NewStyles.text6}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryReport.melicode}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, melicode: text })}
                    placeholder={t("10 digits")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    keyboardType="number-pad"
                    maxLength={10}
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Product information")} <Text style={NewStyles.text6}>*</Text></Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.product_info}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, product_info: text })}
                    placeholder={t("Example: Dell laptop model XPS 15")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Included accessories")}</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.accessories}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, accessories: text })}
                    placeholder={t("Example: charger, bag, mouse")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Product label code")}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryReport.label_code}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, label_code: text })}
                    placeholder={t("Label code")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Appearance defects")}</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.appearance_defect}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, appearance_defect: text })}
                    placeholder={t("Example: scratch on the cover")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("User Description")}</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.user_description}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, user_description: text })}
                    placeholder={t("User description about the product")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>{t("Technician technical description")}</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.technical_description}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, technical_description: text })}
                    placeholder={t("Technical description about completed repairs")}
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                {/* دکمه ذخیره گزارش - فقط اگر تأیید نشده باشد */}
                {!deliveryReportConfirmed && (
                  <Button
                    title={deliveryReportId ? t("Update delivery report") : t("Submit delivery report")}
                    onPress={handleSaveDeliveryReport}
                    loading={savingDeliveryReport}
                    disabled={savingDeliveryReport || loadingDeliveryReport}
                  />
                )}

                {/* بخش تایید با کد 6 رقمی - فقط اگر گزارش ثبت شده و هنوز تایید نشده */}
                {deliveryReportId && !deliveryReportConfirmed && (
                  <View style={[styles.verificationSection, { marginTop: 10 }]}>
                    <View style={[styles.infoCard, { backgroundColor: themeColor0.bgColor(0.1) }]}>
                      <Ionicons name="mail-outline" size={24} color={themeColor0.bgColor(1)} />
                      <Text style={[NewStyles.text3, { textAlign: 'center', marginTop: 8 }]}>
                        {t("A 6-digit verification code has been sent to the user.\nPlease get the code from the user and enter it.")}
                      </Text>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>{t("6-digit verification code *")}</Text>
                      <TextInput
                        style={[styles.textInput, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        placeholder="------"
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>

                    <Button
                      title={t("Verify code and continue")}
                      onPress={handleVerifyWithCode}
                      loading={verifyingCode}
                      disabled={verifyingCode || verificationCode.length !== 6}
                    />

                    {/* دکمه ارسال مجدد کد */}
                    <View style={{ marginTop: 15, alignItems: 'center' }}>
                      {canResend ? (
                        <TouchableOpacity
                          style={[
                            NewStyles.row,
                            {
                              alignItems: 'center',
                              gap: 8,
                              paddingVertical: 10,
                              paddingHorizontal: 15,
                              backgroundColor: themeColor5.bgColor(1),
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: themeColor0.bgColor(1),
                            }
                          ]}
                          onPress={handleResendCode}
                          disabled={resendingCode}
                        >
                          {resendingCode ? (
                            <ActivityIndicator size="small" color={themeColor0.bgColor(1)} />
                          ) : (
                            <>
                              <Ionicons name="refresh-outline" size={20} color={themeColor0.bgColor(1)} />
                              <Text style={[NewStyles.text, { color: themeColor0.bgColor(1) }]}>
                                {t("Resend Code")}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <View style={[NewStyles.row, { alignItems: 'center', gap: 8 }]}>
                          <Ionicons name="time-outline" size={20} color={themeColor3.bgColor(1)} />
                          <Text style={[NewStyles.text10, { color: themeColor3.bgColor(1) }]}>
                            {t("Resend code in {{seconds}} seconds", { seconds: resendTimer })}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* دکمه اتمام سرویس - فقط اگر گزارش تایید شده باشد */}
                {deliveryReportConfirmed && (
                  <>
                    {data?.finished_at ? (
                      <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2) }]}>
                        <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                          <Ionicons name="checkmark-done" size={24} color={themeColor7.bgColor(1)} />
                          <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                            {t("Service has ended")}
                          </Text>
                        </View>
                        <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                          {t("End time:")} {formatDateTime(data.finished_at)}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={[styles.infoCard, { backgroundColor: themeColor0.bgColor(0.1) }]}>
                          <Ionicons name="information-circle" size={24} color={themeColor0.bgColor(1)} />
                          <Text style={[NewStyles.text3, { textAlign: 'center', marginTop: 8 }]}>
                            {t("The product has been delivered and is ready to complete the service.\nClick the button below to finish the service.")}
                          </Text>
                        </View>

                        <Button
                          title={t("Complete current service and deliver product")}
                          onPress={handleEndOrder}
                          loading={endingOrder}
                          disabled={endingOrder}
                        />
                      </>
                    )}
                  </>
                )}

                {/* بخش نظر تکنسین - فقط برای سفارشات تمام شده (status 2) */}
                {data?.finished_at && data?.status === 2 && (
                  <View style={{ marginTop: 20, padding: 15, backgroundColor: themeColor0.bgColor(0.1), borderRadius: 10, borderWidth: 1, borderColor: themeColor0.bgColor(1) }}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center', marginBottom: 10 }]}>
                      <Ionicons name="create-outline" size={24} color={themeColor0.bgColor(1)} />
                      <Text style={[NewStyles.title]}>
                        {t("Technician opinion about this order")}
                      </Text>
                    </View>

                    {/* نمایش نظر ثبت شده */}
                    {data?.technician_opinion && (
                      <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2), marginBottom: 15 }]}>
                        <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                          <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                          <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                            {t("Your opinion has been submitted")}
                          </Text>
                        </View>
                        <Text style={[NewStyles.text10, { marginTop: 10, textAlign: 'right', lineHeight: 24 }]}>
                          {data.technician_opinion}
                        </Text>
                      </View>
                    )}

                    <Text style={[NewStyles.text10, { marginBottom: 10 }]}>
                      {t("Please enter your opinion and details about this order:")}
                    </Text>

                    {/* فیلد نظر */}
                    <TextInput
                      style={[styles.textInput, styles.multilineInput]}
                      value={technicianOpinion}
                      onChangeText={setTechnicianOpinion}
                      placeholder={t("Example: The device main board was replaced. The battery was weak and got replaced too. The device was fully tested and has no issues...")}
                      placeholderTextColor={themeColor3.bgColor(0.5)}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      maxLength={2000}
                      editable={!data?.technician_opinion}
                    />

                    {/* شمارنده کاراکتر */}
                    <Text style={[NewStyles.text10, { textAlign: 'left', marginTop: 5, color: themeColor3.bgColor(1) }]}>
                      {technicianOpinion.length}/2000
                    </Text>

                    {/* دکمه ثبت نظر */}
                    {!data?.technician_opinion && (
                      <Button
                        title={t("Submit technician opinion")}
                        onPress={handleSubmitTechnicianOpinion}
                        loading={submittingOpinion}
                        disabled={submittingOpinion || !technicianOpinion.trim()}
                      />
                    )}
                  </View>
                )}
              </View>
            )}


          </ScrollView>
        </KeyboardAvoidingView>
        {/* DatePicker Modal */}
        <DatePickerModal
          datePickerModal={datePickerModal}
          setDatePickerModal={setDatePickerModal}
          birthDate={selectedDate}
          setBirthDate={setSelectedDate}
          maximumDate={oneYearLaterJalali}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: {
    paddingVertical: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 15,
    backgroundColor: themeColor3.bgColor(0.2),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    gap: 10,
  },
  cardContent: {
    padding: 15,
    gap: 10,
  },
  separator: {
    height: 1,
    backgroundColor: themeColor3.bgColor(0.2),
    marginVertical: 10,
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeader: {
    padding: 15,
    paddingBottom: 10,
  },
  addressItem: {
    flexDirection: 'row-reverse',
    backgroundColor: themeColor5.bgColor(1),
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    gap: 10,
  },
  detailItem: {
    backgroundColor: themeColor5.bgColor(1),
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 5,
    borderRadius: 10,
    gap: 10,
  },
  descriptionItem: {
    flexDirection: 'row-reverse',
    backgroundColor: themeColor5.bgColor(1),
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    gap: 10,
  },
  contentSection: {
    backgroundColor: themeColor4.bgColor(1),
    // marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    gap: 15,
    width: '90%',
    alignSelf: 'center',
    maxWidth: 800,
  },
  infoCard: {
    backgroundColor: themeColor5.bgColor(1),
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  inputGroup: {
    gap: 8,
  },
  dateInput: {
    backgroundColor: themeColor5.bgColor(1),
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textInput: {
    ...NewStyles.textInput, ...NewStyles.text10, backgroundColor: themeColor5.bgColor(1), ...NewStyles.border10
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  presenceStatusContainer: {
    gap: 15,
  },
  statusCard: {
    padding: 15,
    borderRadius: 10,
  },
  formContainer: {
    maxHeight: 500,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: themeColor3.bgColor(0.3),
    textAlign: 'center'
  },
  verificationSection: {
    gap: 15,
  },
  cancelSection: {
    gap: 10,
  },
  cancelOptionRow: {
    backgroundColor: themeColor3.bgColor(0.2),
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cancelOptionRowSelected: {
    backgroundColor: themeColor6.bgColor(0.2),
    borderColor: themeColor6.bgColor(1),
  },
  radioContainer: {
    marginLeft: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#757575',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: themeColor6.bgColor(1),
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: themeColor6.bgColor(1),
  },
  cancelOptionText: {
    flex: 1,
    textAlign: 'right',
    color: '#000',
  },
  cancelOptionTextSelected: {
    fontWeight: 'bold',
    color: themeColor6.bgColor(1),
  },
  cancelButton: {
    backgroundColor: themeColor6.bgColor(1),
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButtonDisabled: {
    backgroundColor: themeColor3.bgColor(1),
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencySection: {
    gap: 10,
  },
});

