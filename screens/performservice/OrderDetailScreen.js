import React, { useState, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color';
import { getTechnicianOrderById, submitTechnicianDescription, setOffToOrder, arriveToOrder, createOrderReport, updateOrderReport, getOrderReport, getOrderReportByOrderId, sendOrderToLoop, updateLoopInfo, startRepair, createDeliveryReport, updateDeliveryReport, getDeliveryReportByOrderId, verifyDeliveryReportWithCode, endOrder, getTechnicianChatMessages, cancelOrderByTechnician, submitEmergencyHelp, submitTechnicianOpinion } from '../../services/Api';
import { showToastOrAlert, formatDate, formatDateTime, formatPrice } from '../../helpers/Common';
import AccordionHeader from '../../components/AccordionHeader';
import DetailConponent from './DetailConponent';
import DatePickerModal from '../../components/DatePickerModal';
import Button from '../../components/Button';
import jalaali from 'jalaali-js';
import { fetchOrderExtras } from '../../slices/orderExtrasSlice';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route?.params || {};
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

  // State برای نظر متخصص
  const [technicianOpinion, setTechnicianOpinion] = useState('');
  const [submittingOpinion, setSubmittingOpinion] = useState(false);

  const fetchOrderDetails = async () => {
    if (!orderId) {
      showToastOrAlert('شناسه سفارش یافت نشد');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📋 Fetching order details for orderId:', orderId);
      const result = await getTechnicianOrderById(orderId);

      console.log('📦 API Result:', result);
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
        // تنظیم نظر متخصص
        if (result.data?.technician_opinion) {
          setTechnicianOpinion(result.data.technician_opinion);
        }
      } else {
        showToastOrAlert(result.message || 'خطا در دریافت جزئیات سفارش');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      showToastOrAlert('خطا در دریافت جزئیات سفارش');
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
      // فرمت ورودی: 1403/08/17
      const parts = shamsiDate.split('/');
      if (parts.length !== 3) return shamsiDate;

      const jy = parseInt(parts[0]);
      const jm = parseInt(parts[1]);
      const jd = parseInt(parts[2]);

      const gregorian = jalaali.toGregorian(jy, jm, jd);

      // فرمت خروجی: Y-m-d (2025-11-10)
      const year = gregorian.gy;
      const month = String(gregorian.gm).padStart(2, '0');
      const day = String(gregorian.gd).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error converting date:', error);
      return shamsiDate;
    }
  };

  // تابع ذخیره تغییرات مرحله بررسی
  const handleSaveReview = async () => {
    if (!selectedDate || !timeRange) {
      showToastOrAlert('لطفاً تاریخ و ساعت را وارد کنید');
      return;
    }

    try {
      setSavingReview(true);
      const miladiDate = convertShamsiToMiladi(selectedDate);

      const requestData = {
        technician_des: reviewDescription || '',
        date: miladiDate,
        time: timeRange
      };

      // اضافه کردن مبلغ پایه متخصص اگر وارد شده باشد
      if (technicianPrice) {
        requestData.technician_price = technicianPrice;
      }

      console.log('📝 ارسال داده‌ها:', requestData);

      const result = await submitTechnicianDescription(orderId, requestData);

      if (result.success) {
        showToastOrAlert('تغییرات با موفقیت ذخیره شد', 'success');
        // بعد از ذخیره، دیتا را دوباره بارگذاری کن
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || 'خطا در ذخیره تغییرات');
      }
    } catch (error) {
      console.error('Error saving review:', error);
      showToastOrAlert('خطا در ذخیره تغییرات');
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
        showToastOrAlert('زمان حرکت با موفقیت ثبت شد', 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || 'خطا در ثبت زمان حرکت');
      }
    } catch (error) {
      console.error('Error setting off:', error);
      showToastOrAlert('خطا در ثبت زمان حرکت');
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
        showToastOrAlert('زمان رسیدن با موفقیت ثبت شد', 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || 'خطا در ثبت زمان رسیدن');
      }
    } catch (error) {
      console.error('Error arriving:', error);
      showToastOrAlert('خطا در ثبت زمان رسیدن');
    } finally {
      setArriving(false);
    }
  };

  // تابع لغو سفارش توسط متخصص
  const handleCancelOrder = async () => {
    if (!selectedCancelReason) {
      showToastOrAlert('لطفاً دلیل لغو را انتخاب کنید');
      return;
    }

    Alert.alert(
      'تأیید لغو سفارش',
      `آیا از لغو این سفارش با دلیل "${selectedCancelReason}" اطمینان دارید؟`,
      [
        {
          text: 'انصراف',
          style: 'cancel'
        },
        {
          text: 'تأیید',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelingOrder(true);
              await cancelOrderByTechnician(orderId, selectedCancelReason);
              
              showToastOrAlert('سفارش با موفقیت لغو شد', 'success');
              
              // بازگشت به صفحه قبل
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            } catch (error) {
              showToastOrAlert(error.message || 'خطا در لغو سفارش');
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
      showToastOrAlert('لطفاً توضیحات درخواست را وارد کنید');
      return;
    }

    try {
      setSubmittingEmergencyHelp(true);
      await submitEmergencyHelp(orderId, emergencyHelpText);
      
      showToastOrAlert('درخواست کمک اضطراری با موفقیت ثبت شد', 'success');
      
      // به‌روزرسانی اطلاعات سفارش
      await fetchOrderDetails();
      
    } catch (error) {
      showToastOrAlert(error.message || 'خطا در ثبت درخواست');
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
        console.error('❌ خطا در بارگذاری گزارش محصول:', error);
      }
    } finally {
      setLoadingReport(false);
    }
  };

  // تابع ذخیره گزارش محصول
  const handleSaveProductReport = async () => {
    // اعتبارسنجی فیلدهای الزامی
    if (!productReport.name || !productReport.melicode) {
      showToastOrAlert('لطفاً نام و کد ملی را وارد کنید');
      return;
    }

    // اعتبارسنجی کد ملی (10 رقم)
    if (productReport.melicode.length !== 10 || !/^\d+$/.test(productReport.melicode)) {
      showToastOrAlert('کد ملی باید 10 رقم باشد');
      return;
    }

    try {
      setSavingReport(true);
      const requestData = {
        order_id: orderId,
        ...productReport
      };

      console.log('📤 ارسال داده به API:', requestData);
      console.log('📤 فیلدهای جدید:', {
        max_price: requestData.max_price,
        min_price: requestData.min_price,
        product_password: requestData.product_password
      });

      let result;
      if (reportId) {
        // ویرایش گزارش موجود
        result = await updateOrderReport(reportId, requestData);
      } else {
        // ثبت گزارش جدید
        result = await createOrderReport(requestData);
      }

      if (result.success) {
        showToastOrAlert(reportId ? 'گزارش با موفقیت به‌روزرسانی شد' : 'گزارش با موفقیت ثبت شد', 'success');
        if (result.data?.report?.id) {
          setReportId(result.data.report.id);
        }
        await fetchOrderDetails();
        await loadProductReport();
      } else {
        showToastOrAlert(result.message || 'خطا در ذخیره گزارش');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      showToastOrAlert('خطا در ذخیره گزارش');
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
        showToastOrAlert('سفارش با موفقیت به لوپ ارسال شد', 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || 'خطا در ارسال سفارش به لوپ');
      }
    } catch (error) {
      console.error('Error sending to loop:', error);
      showToastOrAlert('خطا در ارسال سفارش به لوپ');
    } finally {
      setSendingToLoop(false);
    }
  };

  // تابع ذخیره اطلاعات لوپ
  const handleSaveLoopInfo = async () => {
    // حداقل یکی از فیلدها باید پر شده باشد
    if (!loopInfo.duration && !loopInfo.loop_cost_estimate && !loopInfo.loop_description) {
      showToastOrAlert('لطفاً حداقل یکی از فیلدها را پر کنید');
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
        showToastOrAlert('اطلاعات لوپ با موفقیت ذخیره شد', 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || 'خطا در ذخیره اطلاعات لوپ');
      }
    } catch (error) {
      console.error('Error saving loop info:', error);
      showToastOrAlert('خطا در ذخیره اطلاعات لوپ');
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
        showToastOrAlert('شروع کار با موفقیت ثبت شد', 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || 'خطا در ثبت شروع تعمیر');
      }
    } catch (error) {
      console.error('Error starting repair:', error);
      showToastOrAlert('خطا در ثبت شروع تعمیر');
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
        console.error('❌ خطا در بارگذاری گزارش تحویل:', error);
      }
    } finally {
      setLoadingDeliveryReport(false);
    }
  };

  // تابع ذخیره گزارش تحویل
  const handleSaveDeliveryReport = async () => {
    // اعتبارسنجی فیلدهای الزامی
    if (!deliveryReport.name || !deliveryReport.melicode || !deliveryReport.product_info) {
      showToastOrAlert('لطفاً نام، کد ملی و اطلاعات محصول را وارد کنید');
      return;
    }

    // اعتبارسنجی کد ملی (10 رقم)
    if (deliveryReport.melicode.length !== 10 || !/^\d+$/.test(deliveryReport.melicode)) {
      showToastOrAlert('کد ملی باید 10 رقم باشد');
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
          ? 'گزارش تحویل با موفقیت به‌روزرسانی شد'
          : 'گزارش تحویل ثبت شد و کد تایید برای کاربر ارسال شد';
        showToastOrAlert(message, 'success');
        if (result.data?.report?.id) {
          setDeliveryReportId(result.data.report.id);
        }
        await fetchOrderDetails();
        await loadDeliveryReport();
      } else {
        showToastOrAlert(result.message || 'خطا در ذخیره گزارش تحویل');
      }
    } catch (error) {
      console.error('Error saving delivery report:', error);
      showToastOrAlert('خطا در ذخیره گزارش تحویل');
    } finally {
      setSavingDeliveryReport(false);
    }
  };

  // تابع تایید گزارش با کد 6 رقمی
  const handleVerifyWithCode = async () => {
    // اعتبارسنجی کد
    if (!verificationCode || verificationCode.length !== 6) {
      showToastOrAlert('لطفاً کد 6 رقمی را وارد کنید');
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      showToastOrAlert('کد تایید باید 6 رقم عددی باشد');
      return;
    }

    try {
      setVerifyingCode(true);
      const result = await verifyDeliveryReportWithCode(orderId, verificationCode);

      if (result.success) {
        showToastOrAlert('گزارش تحویل با موفقیت تایید شد', 'success');
        setVerificationCode(''); // پاک کردن کد
        await fetchOrderDetails();
        await loadDeliveryReport();
      } else {
        if (result.error_code === 'INVALID_VERIFICATION_CODE') {
          showToastOrAlert('کد تایید اشتباه است. لطفاً دوباره تلاش کنید');
        } else {
          showToastOrAlert(result.message || 'خطا در تایید گزارش');
        }
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      showToastOrAlert('خطا در تایید گزارش');
    } finally {
      setVerifyingCode(false);
    }
  };

  // تابع اتمام سرویس جاری
  const handleEndOrder = async () => {
    try {
      setEndingOrder(true);
      const result = await endOrder(orderId);

      if (result.success) {
        showToastOrAlert('پایان کار با موفقیت ثبت شد', 'success');
        await fetchOrderDetails();
      } else {
        showToastOrAlert(result.message || 'خطا در ثبت پایان کار');
      }
    } catch (error) {
      console.error('Error ending order:', error);
      showToastOrAlert('خطا در ثبت پایان کار');
    } finally {
      setEndingOrder(false);
    }
  };

  // تابع ثبت نظر متخصص
  const handleSubmitTechnicianOpinion = async () => {
    if (!technicianOpinion.trim()) {
      showToastOrAlert('لطفاً نظر خود را وارد کنید');
      return;
    }

    try {
      setSubmittingOpinion(true);
      await submitTechnicianOpinion(orderId, technicianOpinion);
      
      showToastOrAlert('نظر شما با موفقیت ثبت شد', 'success');
      
      // به‌روزرسانی اطلاعات سفارش
      await fetchOrderDetails();
      
    } catch (error) {
      showToastOrAlert(error.message || 'خطا در ثبت نظر');
    } finally {
      setSubmittingOpinion(false);
    }
  };

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

  // شرایط فعال‌سازی مراحل
  const isReviewActive = data?.status == 0 || data?.status == 1 || data?.status == 2;

  const isPresenceActive = data?.user_initial_accept && (data?.status == 0 || data?.status == 1 || data?.status == 2);

  const isProductStatusActive = data?.arrived_at && data?.is_technician_verified == 1;

  const isSendLoopActive = reportConfirmed; // فعال می‌شود وقتی کاربر گزارش را تأیید کند

  const isPricesActive = data?.send_to_loop;

  const isDeliveryActive = data?.started_at && (data?.status == 0 || data?.status == 1 || data?.status == 2);



  if (loading && !data) {
    return (
      <LinearGradient
        colors={['#7FDBFF', '#0074D9', '#001f3f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={'جزئیات سفارش'}
          onPressLeft={() => navigation.goBack()}
          onPressRight={() => navigation.navigate('UserInfoScreen')}
        />
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>در حال بارگذاری...</Text>
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
          title={'جزئیات سفارش'}
          onPressLeft={() => navigation.goBack()}
          onPressRight={() => navigation.navigate('UserInfoScreen')}
        />
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>سفارش یافت نشد</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }



  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <LinearGradient
        colors={['#7FDBFF', '#0074D9', '#001f3f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>


          <ScreenHeaders
            title={'جزئیات سفارش'}
            onPressLeft={() => navigation.goBack()}
            onPressRight={() => navigation.navigate('UserInfoScreen')}
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
              title="جزئیات سفارش"
              isActive={true}
              isOpen={showDetails}
              onPress={() => setShowDetails(!showDetails)}
            />

            {
              showDetails &&
              <DetailConponent data={data} renderRow={renderRow} />
            }

            <AccordionHeader
              title="اطلاعات کاربر"
              isActive={true}
              isOpen={showUserInfo}
              onPress={() => setShowUserInfo(!showUserInfo)}
              badgeCount={unreadMessagesCount}
            />

            {showUserInfo && (
              <View style={styles.contentSection}>
                {/* اطلاعات کاربر */}
                <View style={{ gap: 10 }}>
                  {data?.user?.name && renderRow('نام و نام خانوادگی:', data.user.name)}
                  {data?.user?.phone && renderRow('شماره تماس:', data.user.phone)}
                  {data?.user?.email && renderRow('ایمیل:', data.user.email)}
                  {data?.address && renderRow('آدرس:', data.address)}
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
                          userName: data.user?.name || 'کاربر'
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
                        گفتگو با کاربر
                      </Text>
                      <Ionicons name="chevron-back-outline" size={20} color={themeColor5.bgColor(1)} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <AccordionHeader
              title="بررسی/جایگزینی زمانی/پیش رسید"
              isActive={isReviewActive}
              isOpen={showReview}
              onPress={() => {
                if (isReviewActive) {
                  setShowReview(!showReview);
                } else {
                  showToastOrAlert('این مرحله برای سفارش‌های لغو شده امکان‌پذیر نیست.');
                }
              }}
            />

            {showReview && isReviewActive && (
              <View style={styles.contentSection}>
                {/* نمایش تاریخ و ساعت فعلی */}
                <View style={styles.infoCard}>
                  <Text style={NewStyles.text2}>تاریخ و ساعت مراجعه فعلی:</Text>
                  <Text style={[NewStyles.title, { marginTop: 5 }]}>
                    {formatDate(data?.date)} - ساعت {data?.time?.split(':')?.slice(0, 2)?.join(':')}
                  </Text>
                </View>

                {data?.user_initial_accept ? (
                  // نمایش پیام تایید کاربر
                  <View style={[styles.infoCard,]}>

                    {data?.technician_des && (
                      <View style={{ marginTop: 10, padding: 10, backgroundColor: themeColor5.bgColor(1), borderRadius: 8 }}>
                        <Text style={NewStyles.text2}>توضیحات ثبت شده:</Text>
                        <Text style={[NewStyles.text10, { marginTop: 5 }]}>{data.technician_des}</Text>
                      </View>
                    )}
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                      <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                      <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                        کاربر تایید کرده است
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    {/* انتخاب تاریخ جدید */}
                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>تاریخ مراجعه:</Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setDatePickerModal(true)}
                      >
                        <Text style={NewStyles.text10}>
                          {selectedDate ? formatDate(selectedDate) : 'انتخاب تاریخ'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color={themeColor0.bgColor(1)} />
                      </TouchableOpacity>
                    </View>

                    {/* ورود بازه ساعت */}
                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>بازه ساعت مراجعه:</Text>
                      <TextInput
                        style={styles.textInput}
                        value={timeRange}
                        onChangeText={setTimeRange}
                        placeholder="مثال: 09:00-12:00"
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                      />
                    </View>

                    {/* ورود مبلغ پایه متخصص */}
                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>مبلغ پایه متخصص (تومان):</Text>
                      <TextInput
                        style={styles.textInput}
                        value={technicianPrice?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChangeText={(p)=>{setTechnicianPrice(p?.replace(/,/g, ""))}}
                        placeholder="مثال: 500000"
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        keyboardType="number-pad"
                      />
                    </View>

                    {/* توضیحات */}
                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>توضیحات (اختیاری):</Text>
                      <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        value={reviewDescription}
                        onChangeText={setReviewDescription}
                        placeholder="توضیحات خود را وارد کنید..."
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* دکمه ذخیره */}
                    <Button
                      title="ذخیره تغییرات"
                      onPress={handleSaveReview}
                      loading={savingReview}
                      disabled={savingReview}
                    />
                  </>
                )}
              </View>
            )}

            <AccordionHeader
              title="اعلام حضور"
              isActive={isPresenceActive}
              isOpen={showPresence}
              onPress={() => {
                if (isPresenceActive) {
                  setShowPresence(!showPresence);
                } else {
                  showToastOrAlert('ابتدا باید مرحله بررسی/جایگزینی زمانی تکمیل شود.');
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
                          حرکت کرده‌اید
                        </Text>
                      </View>
                      <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                        زمان حرکت: {formatDateTime(data.set_off_at)}
                      </Text>
                    </View>
                  ) : (
                    <Button
                      title="اعلام حرکت"
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
                              رسیده‌اید
                            </Text>
                          </View>
                          <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                            زمان رسیدن: {formatDateTime(data.arrived_at)}
                          </Text>
                        </View>
                      ) : (
                        <Button
                          title="اعلام رسیدن"
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
                    <Text style={NewStyles.text2}>مدت زمان سفر:</Text>
                    <Text style={[NewStyles.title, { marginTop: 5 }]}>
                      {(() => {
                        const setOff = new Date(data.set_off_at);
                        const arrived = new Date(data.arrived_at);
                        const diffMinutes = Math.round((arrived - setOff) / 60000);
                        return `${diffMinutes} دقیقه`;
                      })()}
                    </Text>
                  </View>
                )}

                {/* بخش لغو سفارش - فقط بعد از رسیدن */}
                {data?.arrived_at && !data?.started_at && (
                  <View style={[styles.cancelSection, { marginTop: 20, padding: 15, backgroundColor: themeColor5.bgColor(1), borderRadius: 10, borderWidth:1, borderColor:themeColor6.bgColor(1) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center', marginBottom: 15 }]}>
                      <Ionicons name="warning-outline" size={24} color={themeColor6.bgColor(1)} />
                      <Text style={[NewStyles.title4, { color: themeColor6.bgColor(1) }]}>
                        در صورت بروز مشکل
                      </Text>
                    </View>

                    <Text style={[NewStyles.text10, { marginBottom: 10 }]}>
                      اگر کاربر حضور ندارد یا مشکلی پیش آمده، دلیل لغو را انتخاب کنید:
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
                          {option}
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
                            <Text style={NewStyles.text4}>لغو سفارش</Text>
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
                        اعزام فوری همراه / جایگزین تکنسین / قطعات
                      </Text>
                    </View>

                    {/* نمایش درخواست ثبت شده */}
                    {data?.emergency_help && data?.emergency_help_at && (
                      <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2), marginBottom: 15 }]}>
                        <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                          <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                          <Text style={[NewStyles.title7]}>
                            درخواست ثبت شده
                          </Text>
                        </View>
                        <Text style={[NewStyles.text10, { marginTop: 10, textAlign: 'right' }]}>
                          {data.emergency_help}
                        </Text>
                        <Text style={[NewStyles.text10, { marginTop: 5, textAlign: 'center', color: themeColor3.bgColor(1) }]}>
                          زمان ثبت: {formatDateTime(data.emergency_help_at)}
                        </Text>
                      </View>
                    )}

                    <Text style={[NewStyles.text10, { marginBottom: 10 }]}>
                      در صورت نیاز به همراه، قطعه یا ابزار خاص، درخواست خود را ثبت کنید:
                    </Text>

                    {/* فیلد توضیحات */}
                    <TextInput
                      style={[styles.textInput, styles.multilineInput]}
                      value={emergencyHelpText}
                      onChangeText={setEmergencyHelpText}
                      placeholder="مثال: نیاز به یک تکنسین همراه برای کمک در تعویض قطعه سنگین..."
                      placeholderTextColor={themeColor3.bgColor(0.5)}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                      maxLength={1000}
                    />

                    {/* شمارنده کاراکتر */}
                    <Text style={[NewStyles.text10, { textAlign: 'left', marginTop: 5, color: themeColor3.bgColor(1) }]}>
                      {emergencyHelpText.length}/1000
                    </Text>

                    {/* دکمه ثبت درخواست */}
                    <Button
                      title={data?.emergency_help ? "به‌روزرسانی درخواست" : "ثبت درخواست کمک"}
                      onPress={handleSubmitEmergencyHelp}
                      loading={submittingEmergencyHelp}
                      disabled={submittingEmergencyHelp || !emergencyHelpText.trim()}
                    />
                  </View>
                )}
              </View>
            )}

            <AccordionHeader title="وضعیت محصول" isActive={isProductStatusActive} isOpen={showProductStatus} onPress={() => { if (isProductStatusActive) { setShowProductStatus(!showProductStatus); } else { showToastOrAlert('ابتدا باید حضور خود را اعلام کرده و تأیید شوید.'); } }} />

            {showProductStatus && isProductStatusActive && (
              <View style={styles.contentSection}>
                {/* نمایش وضعیت تأیید کاربر */}
                {reportConfirmed && (
                  <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                      <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                      <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                        کاربر گزارش را تأیید کرده است
                      </Text>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                      امکان ویرایش گزارش وجود ندارد
                    </Text>
                  </View>
                )}

                {/* بخش اطلاعات کاربر */}
                <Text style={[NewStyles.title, styles.sectionTitle]}>اطلاعات تحویل دهنده </Text>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>نام و نام خانوادگی *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.name}
                    onChangeText={(text) => setProductReport({ ...productReport, name: text })}
                    placeholder="نام کامل را وارد کنید"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>کد ملی *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.melicode}
                    onChangeText={(text) => setProductReport({ ...productReport, melicode: text })}
                    placeholder="10 رقم"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    keyboardType="number-pad"
                    maxLength={10}
                    editable={!reportConfirmed}
                  />
                </View>

                {/* بخش اطلاعات محصول */}
                <Text style={[NewStyles.title, styles.sectionTitle]}>اطلاعات محصول</Text>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>نام محصول</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_name}
                    onChangeText={(text) => setProductReport({ ...productReport, product_name: text })}
                    placeholder="مثال: لپ تاپ"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>برند محصول</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_brand}
                    onChangeText={(text) => setProductReport({ ...productReport, product_brand: text })}
                    placeholder="مثال: ایسوس"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>مدل محصول</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_model}
                    onChangeText={(text) => setProductReport({ ...productReport, product_model: text })}
                    placeholder="مثال: VivoBook 15"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>رنگ محصول</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_color}
                    onChangeText={(text) => setProductReport({ ...productReport, product_color: text })}
                    placeholder="مثال: مشکی"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>شماره سریال محصول</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_serial_number}
                    onChangeText={(text) => setProductReport({ ...productReport, product_serial_number: text })}
                    placeholder="شماره سریال"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>کد برچسب دارایی</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.asset_label_code}
                    onChangeText={(text) => setProductReport({ ...productReport, asset_label_code: text })}
                    placeholder="کد دارایی"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>لوازم جانبی</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.accessories}
                    onChangeText={(text) => setProductReport({ ...productReport, accessories: text })}
                    placeholder="مثال: شارژر، کیف لپ تاپ"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                {/* بخش ایرادات و درخواست‌ها */}
                <Text style={[NewStyles.title4, styles.sectionTitle]}>ایرادات و درخواست‌ها</Text>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>ایرادات گزارش شده توسط کاربر</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.user_reported_issues}
                    onChangeText={(text) => setProductReport({ ...productReport, user_reported_issues: text })}
                    placeholder="ایرادات اعلام شده توسط کاربر"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>ایرادات گزارش شده توسط متخصص</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.technician_reported_issues}
                    onChangeText={(text) => setProductReport({ ...productReport, technician_reported_issues: text })}
                    placeholder="ایرادات تشخیص داده شده"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>ایرادات مشاهده شده توسط متخصص</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.technician_observed_issues}
                    onChangeText={(text) => setProductReport({ ...productReport, technician_observed_issues: text })}
                    placeholder="مثال: خراشیدگی روی قاب"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>خدمات درخواستی کاربر</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={productReport.user_requested_services}
                    onChangeText={(text) => setProductReport({ ...productReport, user_requested_services: text })}
                    placeholder="مثال: تعمیر و نصب ویندوز"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!reportConfirmed}
                  />
                </View>

                {/* بخش قیمت و رمز */}
                <Text style={[NewStyles.title, styles.sectionTitle]}>اطلاعات تکمیلی</Text>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>بیشترین قیمت (تومان)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.max_price?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    onChangeText={(text) => setProductReport({ ...productReport, max_price: text?.replace(/,/g, "") })}
                    placeholder="مثال: 5000000"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    keyboardType="number-pad"
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>کمترین قیمت (تومان)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.min_price?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    onChangeText={(text) => setProductReport({ ...productReport, min_price: text?.replace(/,/g, "") })}
                    placeholder="مثال: 3000000"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    keyboardType="number-pad"
                    editable={!reportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>رمز محصول</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productReport.product_password}
                    onChangeText={(text) => setProductReport({ ...productReport, product_password: text })}
                    placeholder="رمز دستگاه (در صورت وجود)"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!reportConfirmed}
                  />
                </View>

                {/* دکمه ذخیره - فقط اگر تأیید نشده باشد */}
                {!reportConfirmed && (
                  <Button
                    title={reportId ? "به‌روزرسانی گزارش" : "ثبت گزارش"}
                    onPress={handleSaveProductReport}
                    loading={savingReport}
                    disabled={savingReport || loadingReport}
                  />
                )}
              </View>
            )}

            <AccordionHeader
              title="اعزام به لوپ"
              isActive={isSendLoopActive}
              isOpen={showSendloop}
              onPress={() => {
                if (isSendLoopActive) {
                  setShowSendloop(!showSendloop);
                } else {
                  showToastOrAlert('این مرحله بعد از تأیید گزارش توسط کاربر فعال می‌شود.');
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
                        سفارش به لوپ ارسال شده است
                      </Text>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                      زمان ارسال: {formatDateTime(data.send_to_loop)}
                    </Text>
                  </View>
                ) : (
                  <Button
                    title="ارسال به لوپ"
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
                            کاربر اطلاعات لوپ را تأیید کرده است
                          </Text>
                        </View>
                        <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                          زمان تأیید: {formatDateTime(data.user_accept_date)}
                        </Text>
                      </View>
                    )}

                    <Text style={[NewStyles.title, styles.sectionTitle]}>اطلاعات لوپ</Text>

                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>مدت زمان انجام کار (روز)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={loopInfo.duration}
                        onChangeText={(text) => setLoopInfo({ ...loopInfo, duration: text })}
                        placeholder="مثال: 5"
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        keyboardType="number-pad"
                        editable={!data?.user_accept_date}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>هزینه تقریبی (تومان)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={loopInfo.loop_cost_estimate}
                        onChangeText={(text) => setLoopInfo({ ...loopInfo, loop_cost_estimate: text })}
                        placeholder="مثال: 2500000"
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        keyboardType="number-pad"
                        editable={!data?.user_accept_date}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>توضیحات لوپ</Text>
                      <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        value={loopInfo.loop_description}
                        onChangeText={(text) => setLoopInfo({ ...loopInfo, loop_description: text })}
                        placeholder="توضیحات تکمیلی..."
                        placeholderTextColor={themeColor3.bgColor(0.5)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        editable={!data?.user_accept_date}
                      />
                    </View>

                    {/* دکمه ذخیره - فقط اگر کاربر تأیید نکرده باشد */}
                    {!data?.user_accept_date && (
                      <Button
                        title="ذخیره اطلاعات لوپ"
                        onPress={handleSaveLoopInfo}
                        loading={savingLoopInfo}
                        disabled={savingLoopInfo}
                      />
                    )}
                  </>
                )}
              </View>
            )}

            <AccordionHeader
              title="قطعات/هزینه ها/شروع"
              isActive={isPricesActive}
              isOpen={showPrices}
              onPress={async () => {
                if (!isPricesActive) {
                  showToastOrAlert('ابتدا باید دستگاه به لوپ ارسال شود.');
                  return;
                }

                const willOpen = !showPrices;
                setShowPrices(willOpen);
                if (willOpen && orderId) {
                  dispatch(fetchOrderExtras(orderId));
                }
              }}
            />

            {showPrices && isPricesActive && (
              <View style={[styles.contentSection, { gap: 15, paddingVertical: 15 }]}>
                <View style={[NewStyles.row, { gap: 10, paddingHorizontal: 15 }]}>
                  <Ionicons name="pricetag-outline" size={24} color={themeColor0.bgColor(1)} />
                  <Text style={[NewStyles.text, { flex: 1 }]}>
                    در این بخش می‌توانید هزینه ها و قطعات مورد نیاز را مشخص کنید.
                  </Text>
                </View>

                {/* دکمه شروع تعمیر */}
                {data?.started_at ? (
                  <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2), marginHorizontal: 15 }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                      <Ionicons name="construct" size={24} color={themeColor7.bgColor(1)} />
                      <Text style={[NewStyles.title, { color: themeColor7.bgColor(1) }]}>
                        تعمیر شروع شده است
                      </Text>
                    </View>
                    <Text style={[NewStyles.text, { textAlign: 'center', marginTop: 5 }]}>
                      زمان شروع: {formatDateTime(data.started_at)}
                    </Text>
                  </View>
                ) : (
                  <View style={{ paddingHorizontal: 15 }}>
                    <Button
                      title="اعلام شروع تعمیر"
                      onPress={handleStartRepair}
                      loading={startingRepair}
                      disabled={startingRepair}
                    />
                  </View>
                )}

                <View style={{ paddingHorizontal: 15 }}>
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
                        showToastOrAlert('اطلاعات دسته‌بندی یافت نشد');
                      }
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={themeColor5.bgColor(1)} />
                    <Text style={[NewStyles.text4, { color: themeColor5.bgColor(1) }]}>
                      مدیریت هزینه ها و قطعات
                    </Text>
                  </TouchableOpacity>
                </View>

                {((orderExtras && orderExtras.length > 0) || (data?.extras && data.extras.length > 0)) ? (
                  <View style={{ gap: 10, paddingHorizontal: 15 }}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                      <Ionicons name="checkmark-circle" size={20} color={themeColor0.bgColor(1)} />
                      <Text style={NewStyles.title}>هزینه های ثبت شده:</Text>
                    </View>

                    {(orderExtras && orderExtras.length > 0 ? orderExtras : data.extras).map((extra, index) => (
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
                            {extra.title || extra.extra_service?.title}
                          </Text>
                          {extra.extra_detail?.title && (
                            <Text style={[NewStyles.text, { marginTop: 4 }]}>
                              {extra.extra_detail.title}
                            </Text>
                          )}
                        </View>
                        <Text style={[NewStyles.text]}>
                          {formatPrice(extra.price)} تومان
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
                      <Text style={[NewStyles.title]}>جمع کل:</Text>
                      <Text style={[NewStyles.title]}>
                        {formatPrice(
                          (orderExtras && orderExtras.length > 0 ? orderExtras : data.extras).reduce((sum, extra) => sum + (extra.price || 0), 0)
                        )} تومان
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
                      هنوز خدمات اضافی یا قطعه‌ای ثبت نشده است.
                    </Text>
                  </View>
                )}
              </View>
            )}

            <AccordionHeader
              title="تحویل به کاربر/اتمام سرویس جاری"
              isActive={isDeliveryActive}
              isOpen={showDelivery}
              onPress={() => {
                if (isDeliveryActive) {
                  setShowDelivery(!showDelivery);
                } else {
                  showToastOrAlert('این مرحله برای سفارش‌های لغو شده امکان‌پذیر نیست.');
                }
              }}
            />

            {showDelivery && isDeliveryActive && (
              <View style={styles.contentSection}>
                {/* نمایش وضعیت پرداخت کاربر */}
                <View style={[styles.infoCard, { backgroundColor: data?.is_user_payed ? themeColor7.bgColor(0.2) : themeColor3.bgColor(0.2) }]}>
                  <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                    <Ionicons
                      name={data?.is_user_payed ? "checkmark-circle" : "information-circle"}
                      size={24}
                      color={data?.is_user_payed ? themeColor7.bgColor(1) : themeColor3.bgColor(1)}
                    />
                    <Text style={[NewStyles.title4, { color: data?.is_user_payed ? themeColor7.bgColor(1) : themeColor3.bgColor(1) }]}>
                      {data?.is_user_payed ? 'کاربر پرداخت کرده است' : 'کاربر هنوز پرداخت نکرده است'}
                    </Text>
                  </View>
                </View>

                {/* نمایش وضعیت تأیید کاربر برای گزارش تحویل */}
                {deliveryReportConfirmed && (
                  <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2) }]}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                      <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                      <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                        کاربر گزارش تحویل را تأیید کرده است
                      </Text>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                      امکان ویرایش گزارش وجود ندارد
                    </Text>
                  </View>
                )}

                {/* فرم گزارش تحویل */}
                <Text style={[NewStyles.title, styles.sectionTitle]}>گزارش تحویل محصول</Text>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>نام گیرنده *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryReport.name}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, name: text })}
                    placeholder="نام کامل گیرنده"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>کد ملی گیرنده *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryReport.melicode}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, melicode: text })}
                    placeholder="10 رقم"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    keyboardType="number-pad"
                    maxLength={10}
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>اطلاعات محصول *</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.product_info}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, product_info: text })}
                    placeholder="مثال: لپ‌تاپ Dell مدل XPS 15"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>متعلقات همراه</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.accessories}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, accessories: text })}
                    placeholder="مثال: شارژر، کیف، موس"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>کد برچسب محصول</Text>
                  <TextInput
                    style={styles.textInput}
                    value={deliveryReport.label_code}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, label_code: text })}
                    placeholder="کد برچسب"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>عیوب ظاهری</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.appearance_defect}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, appearance_defect: text })}
                    placeholder="مثال: خراش روی درب"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>توضیحات کاربر</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.user_description}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, user_description: text })}
                    placeholder="توضیحات کاربر در مورد محصول"
                    placeholderTextColor={themeColor3.bgColor(0.5)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!deliveryReportConfirmed}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={NewStyles.text}>توضیحات فنی متخصص</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={deliveryReport.technical_description}
                    onChangeText={(text) => setDeliveryReport({ ...deliveryReport, technical_description: text })}
                    placeholder="توضیحات فنی در مورد تعمیرات انجام شده"
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
                    title={deliveryReportId ? "به‌روزرسانی گزارش تحویل" : "ثبت گزارش تحویل"}
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
                        کد تایید 6 رقمی برای کاربر ارسال شده است.{'\n'}
                        لطفاً کد را از کاربر دریافت کرده و وارد کنید.
                      </Text>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={NewStyles.text}>کد تایید 6 رقمی *</Text>
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
                      title="تایید کد و ادامه"
                      onPress={handleVerifyWithCode}
                      loading={verifyingCode}
                      disabled={verifyingCode || verificationCode.length !== 6}
                    />
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
                            سرویس به پایان رسیده است
                          </Text>
                        </View>
                        <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                          زمان پایان: {formatDateTime(data.finished_at)}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={[styles.infoCard, { backgroundColor: themeColor0.bgColor(0.1) }]}>
                          <Ionicons name="information-circle" size={24} color={themeColor0.bgColor(1)} />
                          <Text style={[NewStyles.text3, { textAlign: 'center', marginTop: 8 }]}>
                            محصول تحویل شده و آماده اتمام سرویس است.{'\n'}
                            با کلیک بر روی دکمه زیر، سرویس به پایان می‌رسد.
                          </Text>
                        </View>

                        <Button
                          title="اتمام سرویس جاری و تحویل محصول"
                          onPress={handleEndOrder}
                          loading={endingOrder}
                          disabled={endingOrder}
                        />
                      </>
                    )}
                  </>
                )}

                {/* بخش نظر متخصص - فقط برای سفارشات تمام شده (status 2) */}
                {data?.finished_at && data?.status === 2 && (
                  <View style={{ marginTop: 20, padding: 15, backgroundColor: themeColor0.bgColor(0.1), borderRadius: 10, borderWidth: 1, borderColor: themeColor0.bgColor(1) }}>
                    <View style={[NewStyles.row, { gap: 10, alignItems: 'center', marginBottom: 10 }]}>
                      <Ionicons name="create-outline" size={24} color={themeColor0.bgColor(1)} />
                      <Text style={[NewStyles.title]}>
                        نظر متخصص در مورد این سفارش
                      </Text>
                    </View>

                    {/* نمایش نظر ثبت شده */}
                    {data?.technician_opinion && (
                      <View style={[styles.infoCard, { backgroundColor: themeColor7.bgColor(0.2), marginBottom: 15 }]}>
                        <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                          <Ionicons name="checkmark-circle" size={24} color={themeColor7.bgColor(1)} />
                          <Text style={[NewStyles.title4, { color: themeColor7.bgColor(1) }]}>
                            نظر شما ثبت شده است
                          </Text>
                        </View>
                        <Text style={[NewStyles.text10, { marginTop: 10, textAlign: 'right', lineHeight: 24 }]}>
                          {data.technician_opinion}
                        </Text>
                      </View>
                    )}

                    <Text style={[NewStyles.text10, { marginBottom: 10 }]}>
                      لطفاً نظر و توضیحات خود را در مورد این سفارش وارد کنید:
                    </Text>

                    {/* فیلد نظر */}
                    <TextInput
                      style={[styles.textInput, styles.multilineInput]}
                      value={technicianOpinion}
                      onChangeText={setTechnicianOpinion}
                      placeholder="مثال: برد اصلی دستگاه تعویض شد. باتری هم ضعیف بود که جایگزین شد. دستگاه به طور کامل تست شد و مشکلی ندارد..."
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
                        title="ثبت نظر متخصص"
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
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    gap: 15,
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
