import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getFormatedDate } from 'react-native-modern-datepicker';

import ScreenHeaders from '../components/ScreenHeaders';
import DatePickerModal from '../components/DatePickerModal';
import TimePickerModal from '../components/TimePickerModal';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor4, themeColor7, themeColor8 } from '../theme/Color';
import { createEducationRequest, createLeaveRequest, createDebtRequest, createManpowerRequest, createTransferRequest, createTerminationRequest } from '../services/Api';
import { showAlert } from '../helpers/Common';

export default function RequestsScreen({ navigation }) {
  const [section, setSection] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // محاسبه تاریخ امروز به صورت شمسی
  const todayJalali = useMemo(() =>
    getFormatedDate(new Date(), 'jYYYY/jMM/jDD'),
    []);

  // محاسبه تاریخ یک سال بعد به صورت شمسی
  const oneYearLaterJalali = useMemo(() => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return getFormatedDate(oneYearLater, 'jYYYY/jMM/jDD');
  }, []);

  // مرخصی states
  const [leaveType, setLeaveType] = useState(''); // 'hourly' or 'daily'
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveToDate, setLeaveToDate] = useState('');
  const [leaveHour, setLeaveHour] = useState('');
  const [leaveDescription, setLeaveDescription] = useState('');

  // وام states
  const [loanType, setLoanType] = useState(''); // 'sponsor' or 'free'
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDescription, setLoanDescription] = useState('');
  const [loanSponsor, setLoanSponsor] = useState('');
  const [loanMonth, setLoanMonth] = useState('');
  const [loanUrgentDescription, setLoanUrgentDescription] = useState('');

  // نیروی انسانی states
  const [manpowerType, setManpowerType] = useState(''); // 'field' or 'human'
  const [manpowerDescription, setManpowerDescription] = useState('');

  // انتقال/سمت states
  const [transferType, setTransferType] = useState(''); // 'city' or 'position'
  const [transferDescription, setTransferDescription] = useState('');

  // قطع همکاری states
  const [terminationType, setTerminationType] = useState(''); // 'temporary' or 'permanent'
  const [terminationStartDate, setTerminationStartDate] = useState('');
  const [terminationEndDate, setTerminationEndDate] = useState('');
  const [terminationDescription, setTerminationDescription] = useState('');

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('from'); // 'from' or 'to'

  const menuItems = [
    {
      id: 1,
      title: 'آموزش / مراجعه',
      type: 'training'
    },
    {
      id: 2,
      title: 'مرخصی / استعلاجی',
      type: 'leave'
    },
    {
      id: 3,
      title: 'تسهیلات / وام بدون بهره',
      type: 'loan'
    },
    {
      id: 4,
      title: 'نیروی انسانی',
      type: 'hr'
    },
    {
      id: 5,
      title: 'انتقال / سمت',
      type: 'transfer'
    },
    {
      id: 7,
      title: 'عدم همراهی',
      type: 'cooperation'
    },
    {
      id: 6,
      title: 'پیگیری',
      type: 'other'
    },
  ];

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSubmitRequest = async () => {
    // Validation
    if (!section.trim()) {
      showAlert('خطا', 'لطفاً بخش را انتخاب کنید');
      return;
    }

    if (!description.trim()) {
      showAlert('خطا', 'لطفاً توضیحات را وارد کنید');
      return;
    }

    if (description.length > 5000) {
      showAlert('خطا', 'توضیحات نباید بیشتر از 5000 کاراکتر باشد');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        section: section.trim(),
        description: description.trim()
      };

      console.log('📝 ارسال درخواست آموزش:', requestData);

      const response = await createEducationRequest(requestData);

      if (response.success) {
        showAlert(
          'موفقیت',
          'درخواست شما با موفقیت ثبت شد',
          [
            {
              text: 'باشه',
              onPress: () => {
                // پاک کردن فرم
                setSection('');
                setDescription('');
                // بستن آکاردئون
                setExpandedItems({});
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log('❌ خطا در ارسال درخواست:', error);
      showAlert('خطا', error.message || 'مشکلی در ارسال درخواست پیش آمد');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeaveRequest = async () => {
    // Validation
    if (!leaveType) {
      showAlert('خطا', 'لطفاً نوع مرخصی را انتخاب کنید');
      return;
    }

    if (!leaveDate) {
      showAlert('خطا', 'لطفاً تاریخ را انتخاب کنید');
      return;
    }

    if (leaveType === 'daily' && !leaveToDate) {
      showAlert('خطا', 'لطفاً تاریخ پایان را انتخاب کنید');
      return;
    }

    if (leaveType === 'hourly' && !leaveHour) {
      showAlert('خطا', 'لطفاً ساعت را انتخاب کنید');
      return;
    }

    if (!leaveDescription.trim()) {
      showAlert('خطا', 'لطفاً توضیحات را وارد کنید');
      return;
    }

    if (leaveDescription.length > 1000) {
      showAlert('خطا', 'توضیحات نباید بیشتر از 1000 کاراکتر باشد');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        type: leaveType,
        date: leaveDate,
        description: leaveDescription.trim()
      };

      if (leaveType === 'daily') {
        requestData.to_date = leaveToDate;
      } else if (leaveType === 'hourly') {
        requestData.houre = leaveHour;
      }

      console.log('📝 ارسال درخواست مرخصی:', requestData);

      const response = await createLeaveRequest(requestData);

      if (response.success) {
        showAlert(
          'موفقیت',
          'درخواست مرخصی شما با موفقیت ثبت شد',
          [
            {
              text: 'باشه',
              onPress: () => {
                // پاک کردن فرم
                setLeaveType('');
                setLeaveDate('');
                setLeaveToDate('');
                setLeaveHour('');
                setLeaveDescription('');
                // بستن آکاردئون
                setExpandedItems({});
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log('❌ خطا در ارسال درخواست مرخصی:', error);
      showAlert('خطا', error.message || 'مشکلی در ارسال درخواست مرخصی پیش آمد');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLoanRequest = async () => {
    // Validation
    if (!loanType) {
      showAlert('خطا', 'لطفاً نوع درخواست را انتخاب کنید');
      return;
    }

    if (!loanDescription.trim()) {
      showAlert('خطا', 'لطفاً توضیحات را وارد کنید');
      return;
    }

    if (loanDescription.length > 5000) {
      showAlert('خطا', 'توضیحات نباید بیشتر از 5000 کاراکتر باشد');
      return;
    }

    // اعتبارسنجی برای وام بدون بهره
    if (loanType === 'free') {
      if (!loanAmount.trim()) {
        showAlert('خطا', 'لطفاً مبلغ وام را وارد کنید');
        return;
      }

      if (!loanSponsor.trim()) {
        showAlert('خطا', 'لطفاً وضعیت ضامن را مشخص کنید');
        return;
      }

      if (!loanMonth.trim()) {
        showAlert('خطا', 'لطفاً مدت زمان پرداخت را وارد کنید');
        return;
      }

      const monthNum = parseInt(loanMonth);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 60) {
        showAlert('خطا', 'مدت زمان پرداخت باید بین 1 تا 60 ماه باشد');
        return;
      }
    }

    try {
      setLoading(true);

      const requestData = {
        type: loanType,
        description: loanDescription.trim()
      };

      if (loanType === 'free') {
        requestData.amount = loanAmount.trim();
        requestData.sponsor = loanSponsor.trim();
        requestData.month = parseInt(loanMonth);

        if (loanUrgentDescription.trim()) {
          requestData.urgent_description = loanUrgentDescription.trim();
        }
      }

      console.log('💰 ارسال درخواست وام:', requestData);

      const response = await createDebtRequest(requestData);

      if (response.success) {
        showAlert(
          'موفقیت',
          'درخواست وام شما با موفقیت ثبت شد',
          [
            {
              text: 'باشه',
              onPress: () => {
                // پاک کردن فرم
                setLoanType('');
                setLoanAmount('');
                setLoanDescription('');
                setLoanSponsor('');
                setLoanMonth('');
                setLoanUrgentDescription('');
                // بستن آکاردئون
                setExpandedItems({});
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log('❌ خطا در ارسال درخواست وام:', error);
      showAlert('خطا', error.message || 'مشکلی در ارسال درخواست وام پیش آمد');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManpowerRequest = async () => {
    // Validation
    if (!manpowerType) {
      showAlert('خطا', 'لطفاً نوع درخواست را انتخاب کنید');
      return;
    }

    if (!manpowerDescription.trim()) {
      showAlert('خطا', 'لطفاً توضیحات را وارد کنید');
      return;
    }

    if (manpowerDescription.length > 5000) {
      showAlert('خطا', 'توضیحات نباید بیشتر از 5000 کاراکتر باشد');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        type: manpowerType,
        description: manpowerDescription.trim()
      };

      console.log('👥 ارسال درخواست نیروی انسانی:', requestData);

      const response = await createManpowerRequest(requestData);

      if (response.success) {
        showAlert(
          'موفقیت',
          'درخواست نیروی انسانی شما با موفقیت ثبت شد',
          [
            {
              text: 'باشه',
              onPress: () => {
                // پاک کردن فرم
                setManpowerType('');
                setManpowerDescription('');
                // بستن آکاردئون
                setExpandedItems({});
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log('❌ خطا در ارسال درخواست نیروی انسانی:', error);
      showAlert('خطا', error.message || 'مشکلی در ارسال درخواست نیروی انسانی پیش آمد');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransferRequest = async () => {
    // Validation
    if (!transferType) {
      showAlert('خطا', 'لطفاً نوع درخواست را انتخاب کنید');
      return;
    }

    if (!transferDescription.trim()) {
      showAlert('خطا', 'لطفاً توضیحات را وارد کنید');
      return;
    }

    if (transferDescription.length > 5000) {
      showAlert('خطا', 'توضیحات نباید بیشتر از 5000 کاراکتر باشد');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        type: transferType,
        description: transferDescription.trim()
      };

      console.log('🔄 ارسال درخواست انتقال/سمت:', requestData);

      const response = await createTransferRequest(requestData);

      if (response.success) {
        showAlert(
          'موفقیت',
          'درخواست انتقال/سمت شما با موفقیت ثبت شد',
          [
            {
              text: 'باشه',
              onPress: () => {
                // پاک کردن فرم
                setTransferType('');
                setTransferDescription('');
                // بستن آکاردئون
                setExpandedItems({});
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log('❌ خطا در ارسال درخواست انتقال/سمت:', error);
      showAlert('خطا', error.message || 'مشکلی در ارسال درخواست انتقال/سمت پیش آمد');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTerminationRequest = async () => {
    // Validation
    if (!terminationType) {
      showAlert('خطا', 'لطفاً نوع درخواست را انتخاب کنید');
      return;
    }

    if (!terminationStartDate) {
      showAlert('خطا', 'لطفاً تاریخ شروع را انتخاب کنید');
      return;
    }

    if (terminationType === 'temporary' && !terminationEndDate) {
      showAlert('خطا', 'لطفاً تاریخ پایان را انتخاب کنید');
      return;
    }

    if (!terminationDescription.trim()) {
      showAlert('خطا', 'لطفاً توضیحات را وارد کنید');
      return;
    }

    if (terminationDescription.length > 5000) {
      showAlert('خطا', 'توضیحات نباید بیشتر از 5000 کاراکتر باشد');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        type: terminationType,
        start_date: terminationStartDate,
        description: terminationDescription.trim()
      };

      if (terminationType === 'temporary') {
        requestData.end_date = terminationEndDate;
      }

      console.log('🔌 ارسال درخواست قطع همکاری:', requestData);

      const response = await createTerminationRequest(requestData);

      if (response.success) {
        showAlert(
          'موفقیت',
          'درخواست قطع همکاری شما با موفقیت ثبت شد',
          [
            {
              text: 'باشه',
              onPress: () => {
                // پاک کردن فرم
                setTerminationType('');
                setTerminationStartDate('');
                setTerminationEndDate('');
                setTerminationDescription('');
                // بستن آکاردئون
                setExpandedItems({});
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log('❌ خطا در ارسال درخواست قطع همکاری:', error);
      showAlert('خطا', error.message || 'مشکلی در ارسال درخواست قطع همکاری پیش آمد');
    } finally {
      setLoading(false);
    }
  };

  // محتوای بخش آموزش / مراجعه
  const renderTrainingContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={[styles.subOption, section === 'مدیر آموزشی سخت افزار' && styles.selectedOption]}
        onPress={() => setSection('مدیر آموزشی سخت افزار')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>مدیر آموزشی سخت افزار</Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.subOption, section === 'مدیر آموزشی نرم افزار' && styles.selectedOption]}
        onPress={() => setSection('مدیر آموزشی نرم افزار')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>مدیر آموزشی نرم افزار</Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.subOption, section === 'مدیر داخلی' && styles.selectedOption]}
        onPress={() => setSection('مدیر داخلی')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>مدیر داخلی</Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.subOption, section === 'مدیر میدانی' && styles.selectedOption]}
        onPress={() => setSection('مدیر میدانی')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>مدیر میدانی</Text>

      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
          placeholder="توضیحات کامل درخواست خود را وارد کنید..."
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
          numberOfLines={6}
          value={description}
          onChangeText={setDescription}
          maxLength={5000}
        />
        <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
          {description.length}/5000
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.6 }]}
        onPress={handleSubmitRequest}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.title4]}>ارسال درخواست</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.viewListButton}
        onPress={() => navigation.navigate('RequestsListScreen')}
      >
        <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
        <Text style={[NewStyles.text]}>مشاهده لیست درخواست‌ها</Text>
      </TouchableOpacity>
    </View>
  );

  // محتوای بخش مرخصی / استعلاجی
  const renderLeaveContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={[styles.subOption, leaveType === 'hourly' && styles.selectedOption]}
        onPress={() => setLeaveType('hourly')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>ساعتی</Text>
      </TouchableOpacity>

      {leaveType === 'hourly' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>تاریخ:</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('from');
                setShowDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {leaveDate || 'انتخاب تاریخ'}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>ساعت:</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[NewStyles.text10]}>
                {leaveHour || 'انتخاب ساعت'}
              </Text>
              <Ionicons name="time" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 100 }]}
              placeholder="توضیحات کامل درخواست خود را وارد کنید..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={4}
              value={leaveDescription}
              onChangeText={setLeaveDescription}
              maxLength={1000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {leaveDescription.length}/1000
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.subOption, leaveType === 'daily' && styles.selectedOption]}
        onPress={() => setLeaveType('daily')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>روزانه</Text>
      </TouchableOpacity>

      {leaveType === 'daily' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>از تاریخ:</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('from');
                setShowDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {leaveDate || 'انتخاب تاریخ'}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>تا تاریخ:</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('to');
                setShowToDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {leaveToDate || 'انتخاب تاریخ'}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 100 }]}
              placeholder="توضیحات کامل درخواست خود را وارد کنید..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={4}
              value={leaveDescription}
              onChangeText={setLeaveDescription}
              maxLength={1000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {leaveDescription.length}/1000
            </Text>
          </View>
        </>
      )}

      {leaveType && (
        <>
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmitLeaveRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 8 }} />
                <Text style={[NewStyles.title4]}>ارسال درخواست</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('LeaveRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>مشاهده لیست درخواست‌ها</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // محتوای بخش تسهیلات / وام بدون بهره
  const renderLoanContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={[styles.subOption, loanType === 'sponsor' && styles.selectedOption]}
        onPress={() => setLoanType('sponsor')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>ضامن / ضمانت نامه</Text>
      </TouchableOpacity>

      {loanType === 'sponsor' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder="توضیحات کامل درخواست خود را وارد کنید..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={6}
              value={loanDescription}
              onChangeText={setLoanDescription}
              maxLength={5000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {loanDescription.length}/5000
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.subOption, loanType === 'free' && styles.selectedOption]}
        onPress={() => setLoanType('free')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>وام بدون بهره</Text>
      </TouchableOpacity>

      {loanType === 'free' && (
        <>
          <View style={styles.loanRow}>
            <View style={[{ backgroundColor: themeColor4.bgColor(1), paddingVertical: 8, paddingHorizontal: 5 }, NewStyles.center, NewStyles.border5]}>
              <Text style={NewStyles.text10}>مبلغ وام:</Text>
            </View>
            <TextInput
              style={[styles.loanInput, NewStyles.text10]}
              placeholder="مثلاً: 30000000"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              value={loanAmount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              onChangeText={(p) => { setLoanAmount(p?.replace(/,/g, "")) }}
              keyboardType="numeric"
            />
            <View style={[{ backgroundColor: themeColor1.bgColor(1), paddingVertical: 8, paddingHorizontal: 5 }, NewStyles.center, NewStyles.border5]}>
              <Text style={[NewStyles.text10]}>تومان</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 100 }]}
              placeholder="دلیل درخواست وام را توضیح دهید..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={4}
              value={loanDescription}
              onChangeText={setLoanDescription}
              maxLength={5000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {loanDescription.length}/5000
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>آیا ضامن دارید؟ توضیح دهید:</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 80 }]}
              placeholder="مثلاً: بله، ضامن دارم یا خیر، ضامن ندارم..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={3}
              value={loanSponsor}
              onChangeText={setLoanSponsor}
              maxLength={255}
            />
          </View>

          <View style={styles.monthRow}>
            <View style={[{backgroundColor: themeColor4.bgColor(1), paddingHorizontal:5, paddingVertical:8}, NewStyles.border5]}>
              <Text style={NewStyles.text10}>مدت زمان پرداخت:</Text>
            </View>
            <TextInput
              style={[styles.monthInput, NewStyles.text10]}
              placeholder="1-60"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              value={loanMonth}
              onChangeText={setLoanMonth}
              keyboardType="numeric"
            />
            <Text style={NewStyles.text10}>ماه</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>در صورت نیاز فوری / شهری، توضیح دهید:</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 100 }]}
              placeholder="توضیحات اضطراری خود را وارد کنید (اختیاری)..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={4}
              value={loanUrgentDescription}
              onChangeText={setLoanUrgentDescription}
              maxLength={2000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {loanUrgentDescription.length}/2000
            </Text>
          </View>
        </>
      )}

      {loanType && (
        <>
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmitLoanRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 8 }} />
                <Text style={[NewStyles.title4]}>ارسال درخواست</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('DebtRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>مشاهده لیست درخواست‌ها</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // محتوای بخش نیروی انسانی
  const renderHRContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={[styles.subOption, manpowerType === 'field' && styles.selectedOption]}
        onPress={() => setManpowerType('field')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>نیروی میدانی</Text>
      </TouchableOpacity>

      {manpowerType === 'field' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات درخواست (ضروری):</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              درخواست نیروی میدانی خود را با جزئیات کامل توضیح دهید
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder="مثال: نیاز به یک نفر نیروی میدانی برای پروژه فوری در منطقه 5 تهران..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={6}
              value={manpowerDescription}
              onChangeText={setManpowerDescription}
              maxLength={5000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {manpowerDescription.length}/5000
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.subOption, manpowerType === 'human' && styles.selectedOption]}
        onPress={() => setManpowerType('human')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>نیروی انسانی (داخلی)</Text>
      </TouchableOpacity>

      {manpowerType === 'human' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات درخواست (ضروری):</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              درخواست نیروی انسانی داخلی خود را با جزئیات کامل توضیح دهید
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder="مثال: نیاز به نیروی پشتیبانی تلفنی برای پاسخگویی به مشتریان..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={6}
              value={manpowerDescription}
              onChangeText={setManpowerDescription}
              maxLength={5000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {manpowerDescription.length}/5000
            </Text>
          </View>
        </>
      )}

      {manpowerType && (
        <>
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmitManpowerRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 8 }} />
                <Text style={[NewStyles.title4]}>ارسال درخواست</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('ManpowerRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>مشاهده لیست درخواست‌ها</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // محتوای بخش انتقال / سمت
  const renderTransferContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={[styles.subOption, transferType === 'city' && styles.selectedOption]}
        onPress={() => setTransferType('city')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>انتقال به شهر / منطقه دیگر</Text>
      </TouchableOpacity>

      {transferType === 'city' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات درخواست (ضروری):</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              دلیل درخواست انتقال و شهر مورد نظر خود را با جزئیات کامل توضیح دهید
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder="مثال: به دلیل شرایط خانوادگی نیاز به انتقال به شهر تهران دارم. همسرم در تهران مشغول به کار است..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={6}
              value={transferDescription}
              onChangeText={setTransferDescription}
              maxLength={5000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {transferDescription.length}/5000
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.subOption, transferType === 'position' && styles.selectedOption]}
        onPress={() => setTransferType('position')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>ارتقا / تغییر سمت</Text>
      </TouchableOpacity>

      {transferType === 'position' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات درخواست (ضروری):</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              دلیل درخواست تغییر سمت، سابقه کاری و توانمندی‌های خود را شرح دهید
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder="مثال: با توجه به 5 سال سابقه کار و عملکرد مثبت، درخواست ارتقا به سمت سرپرست تیم فنی را دارم..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={6}
              value={transferDescription}
              onChangeText={setTransferDescription}
              maxLength={5000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {transferDescription.length}/5000
            </Text>
          </View>
        </>
      )}

      {transferType && (
        <>
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmitTransferRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 8 }} />
                <Text style={[NewStyles.title4]}>ارسال درخواست</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('TransferRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>مشاهده لیست درخواست‌ها</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // محتوای بخش سایر / توضیحات
  const renderOtherContent = () => (
    <View style={styles.expandedContent}>
      <View style={styles.otherOptions}>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('RequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>آموزشی</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('LeaveRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>مرخصی / استعلاجی</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('DebtRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>تسهیلات / وام بدون بهره</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('ManpowerRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>نیروی انسانی</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('TransferRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>انتقال / سمت</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('TerminationRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>عدم همراهی</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  // محتوای بخش عدم همراهی
  const renderCooperationContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity
        style={[styles.subOption, terminationType === 'temporary' && styles.selectedOption]}
        onPress={() => setTerminationType('temporary')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>بصورت موقت</Text>
      </TouchableOpacity>

      {terminationType === 'temporary' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>از تاریخ:</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('termination_start');
                setShowDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {terminationStartDate || 'انتخاب تاریخ'}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>تا تاریخ:</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('termination_end');
                setShowToDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {terminationEndDate || 'انتخاب تاریخ'}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              دلیل درخواست قطع همکاری موقت خود را با جزئیات کامل توضیح دهید
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder="مثال: به دلیل ادامه تحصیل در دوره کارشناسی ارشد، نیاز به تعلیق فعالیت برای 3 ماه دارم..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={6}
              value={terminationDescription}
              onChangeText={setTerminationDescription}
              maxLength={5000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {terminationDescription.length}/5000
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.subOption, terminationType === 'permanent' && styles.selectedOption]}
        onPress={() => setTerminationType('permanent')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>بصورت دائم</Text>
      </TouchableOpacity>

      {terminationType === 'permanent' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>از تاریخ:</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('termination_start');
                setShowDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {terminationStartDate || 'انتخاب تاریخ'}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              دلیل درخواست قطع همکاری دائم خود را با جزئیات کامل شرح دهید
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder="مثال: به دلیل یافتن فرصت شغلی جدید در حوزه مدیریت، تصمیم به قطع همکاری گرفته‌ام..."
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={6}
              value={terminationDescription}
              onChangeText={setTerminationDescription}
              maxLength={5000}
            />
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), textAlign: 'left', marginTop: 5 }]}>
              {terminationDescription.length}/5000
            </Text>
          </View>
        </>
      )}

      {terminationType && (
        <>
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmitTerminationRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 8 }} />
                <Text style={[NewStyles.title4]}>ارسال درخواست</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('TerminationRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>مشاهده لیست درخواست‌ها</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderContent = (type) => {
    switch (type) {
      case 'training': return renderTrainingContent();
      case 'leave': return renderLeaveContent();
      case 'loan': return renderLoanContent();
      case 'hr': return renderHRContent();
      case 'transfer': return renderTransferContent();
      case 'other': return renderOtherContent();
      case 'cooperation': return renderCooperationContent();
      default: return null;
    }
  };

  return (
    <LinearGradient
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders
        title={'درخواست ها'}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{}}>
          {menuItems.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => toggleItem(item.id)}
              >
                <Text style={[NewStyles.title4, { textAlign: 'center', flex: 1 }]}>
                  {item.title}
                </Text>
                <View style={styles.arrow}>
                  <Ionicons name={expandedItems[item.id] ? 'chevron-up' : 'chevron-down'} color={themeColor10.bgColor(1)} size={20} />
                </View>
              </TouchableOpacity>

              {expandedItems[item.id] && renderContent(item.type)}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Date Picker Modal for Leave */}
      <DatePickerModal
        datePickerModal={showDatePicker}
        setDatePickerModal={setShowDatePicker}
        birthDate={datePickerMode === 'termination_start' || datePickerMode === 'termination_end' ? terminationStartDate : leaveDate}
        setBirthDate={(date) => {
          if (datePickerMode === 'termination_start' || datePickerMode === 'termination_end') {
            setTerminationStartDate(date);
          } else {
            setLeaveDate(date);
          }
        }}
        minimumDate={todayJalali}
        maximumDate={oneYearLaterJalali}
      />

      {/* To Date Picker Modal for Leave */}
      <DatePickerModal
        datePickerModal={showToDatePicker}
        setDatePickerModal={setShowToDatePicker}
        birthDate={datePickerMode === 'termination_end' ? terminationEndDate : leaveToDate}
        setBirthDate={(date) => {
          if (datePickerMode === 'termination_end') {
            setTerminationEndDate(date);
          } else {
            setLeaveToDate(date);
          }
        }}
        minimumDate={datePickerMode === 'termination_end' ? (terminationStartDate || todayJalali) : (leaveDate || todayJalali)}
        maximumDate={oneYearLaterJalali}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelect={(time) => {
          setLeaveHour(time);
          setShowTimePicker(false);
        }}
        selectedTime={leaveHour}
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },

  menuItem: {
    marginVertical: 5,
  },
  menuButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  arrow: {
    backgroundColor: '#FFEB3B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandedContent: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 15,
    marginTop: 5,
  },
  contentText: {
    color: '#fff',
    textAlign: 'right',
    fontSize: 14,
  },
  subOption: {
    backgroundColor: themeColor4.bgColor(1),
    ...NewStyles.border10,
    padding: 12,
    marginVertical: 3,
    ...NewStyles.center
  },
  selectedOption: {
    backgroundColor: themeColor1.bgColor(1),

  },
  subOptionDropdown: {
    backgroundColor: 'rgba(200,200,200,0.8)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 3,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subOptionText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    marginVertical: 8,
  },
  inputLabel: {
    paddingBottom: 10
  },
  textInput: {
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    ...NewStyles.text10
  },
  dateInputButton: {
    ...NewStyles.row,
    ...NewStyles.rowWrapper,
    padding: 12,
    minHeight: 50,
    ...NewStyles.border10
  },
  dateRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  dateField: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeField: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 6,
    padding: 6,
    marginBottom: 3,
    color: '#000',
    textAlign: 'right',
    fontSize: 12,
  },
  timeLabel: {
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 6,
    padding: 6,
    marginBottom: 3,
    color: '#000',
    textAlign: 'right',
    fontSize: 12,
  },
  dateInput: {
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 6,
    padding: 8,
    color: '#000',
    textAlign: 'center',
  },
  timeInput: {
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 6,
    padding: 8,
    color: '#000',
    textAlign: 'center',
  },
  loanRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 8,
  },
  loanLabel: {
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 6,
    padding: 8,
    color: '#000',
    marginLeft: 10,
    textAlign: 'right',
  },
  loanInput: {
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 6,
    padding: 8,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  currency: {
    backgroundColor: '#FFEB3B',
    borderRadius: 6,
    padding: 8,
    color: '#000',
    fontWeight: 'bold',
  },
  monthRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 8,
  },
  monthLabel: {
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 6,
    padding: 8,
    color: '#000',
    marginLeft: 10,
    textAlign: 'right',
  },
  monthInput: {
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 6,
    padding: 8,
    flex: 1, 
    textAlign: 'center',
    marginHorizontal: 5,
  },
  monthText: {
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 6,
    padding: 8,
    color: '#000',
    fontWeight: 'bold',
  },
  hrOptions: {
    marginVertical: 5,
  },
  hrOption: {
    backgroundColor: 'rgba(200,200,200,0.8)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 3,
    alignItems: 'center',
  },
  hrOptionText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
  },
  otherOptions: {
    marginVertical: 5,
  },
  otherOption: {
    backgroundColor: 'rgba(200,200,200,0.8)',
    borderRadius: 8,
    padding: 10,
    marginVertical: 2,
    alignItems: 'center',
  },
  otherOptionText: {
    color: '#000',
    fontSize: 12,
    textAlign: 'center',
  },

  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  viewListButtonText: {
    color: themeColor0.bgColor(1),
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: themeColor0.bgColor(1),
    borderRadius: 10,
    padding: 15,
    ...NewStyles.row,
    ...NewStyles.center,
    marginTop: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewListButton: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 2,
    borderColor: themeColor0.bgColor(1),
    ...NewStyles.row,
    ...NewStyles.center
  },
  viewListButtonText: {
    color: themeColor0.bgColor(1),
    fontSize: 14,
    fontWeight: 'bold',
  },
});

