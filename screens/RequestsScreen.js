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
import { createStyles } from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import DatePickerModal from '../components/DatePickerModal';
import TimePickerModal from '../components/TimePickerModal';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor4, themeColor7, themeColor8 } from '../theme/Color';
import { createEducationRequest, createLeaveRequest, createDebtRequest, createManpowerRequest, createTransferRequest, createTerminationRequest } from '../services/Api';
import { showAlert } from '../helpers/Common';
import { useTranslation } from 'react-i18next';

export default function RequestsScreen({ navigation }) {
  const [section, setSection] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
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
      title: t("Training / Visit"),
      type: 'training'
    },
    {
      id: 2,
      title: t("Leave / Sick Leave"),
      type: 'leave'
    },
    {
      id: 3,
      title: t("Facilities / Interest-free Loan"),
      type: 'loan'
    },
    {
      id: 4,
      title: t("Manpower"),
      type: 'hr'
    },
    {
      id: 5,
      title: t("Transfer / Position"),
      type: 'transfer'
    },
    {
      id: 7,
      title: t("Termination"),
      type: 'cooperation'
    },
    {
      id: 6,
      title: t("Follow-up"),
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
      showAlert(t("Error"), t("Please select a section."));
      return;
    }

    if (!description.trim()) {
      showAlert(t("Error"), t("Please enter the description."));
      return;
    }

    if (description.length > 5000) {
      showAlert(t("Error"), t("Description must not exceed 5000 characters."));
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
          t("Success"),
          t("Your request was submitted successfully."),
          [
            {
              text: t("Ok"),
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
      showAlert(t("Error"), error.message || t("There was a problem submitting the request."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeaveRequest = async () => {
    // Validation
    if (!leaveType) {
      showAlert(t("Error"), t("Please select the leave type."));
      return;
    }

    if (!leaveDate) {
      showAlert(t("Error"), t("Please select a date."));
      return;
    }

    if (leaveType === 'daily' && !leaveToDate) {
      showAlert(t("Error"), t("Please select an end date."));
      return;
    }

    if (leaveType === 'hourly' && !leaveHour) {
      showAlert(t("Error"), t("Please select a time."));
      return;
    }

    if (!leaveDescription.trim()) {
      showAlert(t("Error"), t("Please enter the description."));
      return;
    }

    if (leaveDescription.length > 1000) {
      showAlert(t("Error"), t("Description must not exceed 1000 characters."));
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
          t("Success"),
          t("Your leave request was submitted successfully."),
          [
            {
              text: t("Ok"),
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
      showAlert(t("Error"), error.message || t("There was a problem submitting the leave request."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLoanRequest = async () => {
    // Validation
    if (!loanType) {
      showAlert(t("Error"), t("Please select a request type."));
      return;
    }

    if (!loanDescription.trim()) {
      showAlert(t("Error"), t("Please enter the description."));
      return;
    }

    if (loanDescription.length > 5000) {
      showAlert(t("Error"), t("Description must not exceed 5000 characters."));
      return;
    }

    // اعتبارسنجی برای وام بدون بهره
    if (loanType === 'free') {
      if (!loanAmount.trim()) {
        showAlert(t("Error"), t("Please enter the loan amount."));
        return;
      }

      if (!loanSponsor.trim()) {
        showAlert(t("Error"), t("Please specify the guarantor status."));
        return;
      }

      if (!loanMonth.trim()) {
        showAlert(t("Error"), t("Please enter the repayment duration."));
        return;
      }

      const monthNum = parseInt(loanMonth);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 60) {
        showAlert(t("Error"), t("Repayment duration must be between 1 and 60 months."));
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
          t("Success"),
          t("Your loan request was submitted successfully."),
          [
            {
              text: t("Ok"),
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
      showAlert(t("Error"), error.message || t("There was a problem submitting the loan request."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManpowerRequest = async () => {
    // Validation
    if (!manpowerType) {
      showAlert(t("Error"), t("Please select a request type."));
      return;
    }

    if (!manpowerDescription.trim()) {
      showAlert(t("Error"), t("Please enter the description."));
      return;
    }

    if (manpowerDescription.length > 5000) {
      showAlert(t("Error"), t("Description must not exceed 5000 characters."));
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
          t("Success"),
          t("Your manpower request was submitted successfully."),
          [
            {
              text: t("Ok"),
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
      showAlert(t("Error"), error.message || t("There was a problem submitting the manpower request."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransferRequest = async () => {
    // Validation
    if (!transferType) {
      showAlert(t("Error"), t("Please select a request type."));
      return;
    }

    if (!transferDescription.trim()) {
      showAlert(t("Error"), t("Please enter the description."));
      return;
    }

    if (transferDescription.length > 5000) {
      showAlert(t("Error"), t("Description must not exceed 5000 characters."));
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
          t("Success"),
          t("Your transfer/position request was submitted successfully."),
          [
            {
              text: t("Ok"),
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
      showAlert(t("Error"), error.message || t("There was a problem submitting the transfer/position request."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTerminationRequest = async () => {
    // Validation
    if (!terminationType) {
      showAlert(t("Error"), t("Please select a request type."));
      return;
    }

    if (!terminationStartDate) {
      showAlert(t("Error"), t("Please select a start date."));
      return;
    }

    if (terminationType === 'temporary' && !terminationEndDate) {
      showAlert(t("Error"), t("Please select an end date."));
      return;
    }

    if (!terminationDescription.trim()) {
      showAlert(t("Error"), t("Please enter the description."));
      return;
    }

    if (terminationDescription.length > 5000) {
      showAlert(t("Error"), t("Description must not exceed 5000 characters."));
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
          t("Success"),
          t("Your termination request was submitted successfully."),
          [
            {
              text: t("Ok"),
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
      showAlert(t("Error"), error.message || t("There was a problem submitting the termination request."));
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Hardware training manager")}</Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.subOption, section === 'مدیر آموزشی نرم افزار' && styles.selectedOption]}
        onPress={() => setSection('مدیر آموزشی نرم افزار')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Software training manager")}</Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.subOption, section === 'مدیر داخلی' && styles.selectedOption]}
        onPress={() => setSection('مدیر داخلی')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Internal manager")}</Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.subOption, section === 'مدیر میدانی' && styles.selectedOption]}
        onPress={() => setSection('مدیر میدانی')}
      >
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Field manager")}</Text>

      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Description (required):")}</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
          placeholder={t("Enter the full details of your request...")}
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
            <Text style={[NewStyles.title4]}>{t("Submit request")}</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.viewListButton}
        onPress={() => navigation.navigate('RequestsListScreen')}
      >
        <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
        <Text style={[NewStyles.text]}>{t("View request list")}</Text>
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Hourly")}</Text>
      </TouchableOpacity>

      {leaveType === 'hourly' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Date:")}</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('from');
                setShowDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {leaveDate || t("Select Date")}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Time:")}</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[NewStyles.text10]}>
                {leaveHour || t("Select Time")}
              </Text>
              <Ionicons name="time" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Description (required):")}</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 100 }]}
              placeholder={t("Enter the full details of your request...")}
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Daily")}</Text>
      </TouchableOpacity>

      {leaveType === 'daily' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("From Date:")}</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('from');
                setShowDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {leaveDate || t("Select Date")}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("To Date:")}</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('to');
                setShowToDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {leaveToDate || t("Select Date")}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Description (required):")}</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 100 }]}
              placeholder={t("Enter the full details of your request...")}
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
                <Text style={[NewStyles.title4]}>{t("Submit request")}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('LeaveRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>{t("View request list")}</Text>
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Guarantor / Guarantee")}</Text>
      </TouchableOpacity>

      {loanType === 'sponsor' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Description (required):")}</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder={t("Enter the full details of your request...")}
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Interest-free loan")}</Text>
      </TouchableOpacity>

      {loanType === 'free' && (
        <>
          <View style={styles.loanRow}>
            <View style={[{ backgroundColor: themeColor4.bgColor(1), paddingVertical: 8, paddingHorizontal: 5 }, NewStyles.center, NewStyles.border5]}>
              <Text style={NewStyles.text10}>{t("Loan amount:")}</Text>
            </View>
            <TextInput
              style={[styles.loanInput, NewStyles.text10]}
              placeholder={t("Example: 30000000")}
              placeholderTextColor={themeColor10.bgColor(0.5)}
              value={loanAmount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              onChangeText={(p) => { setLoanAmount(p?.replace(/,/g, "")) }}
              keyboardType="numeric"
            />
            <View style={[{ backgroundColor: themeColor1.bgColor(1), paddingVertical: 8, paddingHorizontal: 5 }, NewStyles.center, NewStyles.border5]}>
              <Text style={[NewStyles.text10]}>{t("Tomans")}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Description (required):")}</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 100 }]}
              placeholder={t("Explain the reason for your loan request...")}
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
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Do you have a guarantor? Explain:")}</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 80 }]}
              placeholder={t("Example: Yes, I have a guarantor or no, I don't have one...")}
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
              <Text style={NewStyles.text10}>{t("Repayment duration:")}</Text>
            </View>
            <TextInput
              style={[styles.monthInput, NewStyles.text10]}
              placeholder="1-60"
              placeholderTextColor={themeColor10.bgColor(0.5)}
              value={loanMonth}
              onChangeText={setLoanMonth}
              keyboardType="numeric"
            />
            <Text style={NewStyles.text10}>{t("Month")}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("If urgent or city-related, explain:")}</Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 100 }]}
              placeholder={t("Enter your urgent notes (optional)...")}
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
                <Text style={[NewStyles.title4]}>{t("Submit request")}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('DebtRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>{t("View request list")}</Text>
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Field personnel")}</Text>
      </TouchableOpacity>

      {manpowerType === 'field' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Request description (required):")}</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              {t("Explain your field personnel request in full detail")}
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder={t("Example: Need one field personnel for an urgent project in Tehran District 5...")}
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Internal personnel")}</Text>
      </TouchableOpacity>

      {manpowerType === 'human' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Request description (required):")}</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              {t("Explain your internal manpower request in full detail")}
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder={t("Example: Need phone support staff to answer customers...")}
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
                <Text style={[NewStyles.title4]}>{t("Submit request")}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('ManpowerRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>{t("View request list")}</Text>
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Transfer to another city / region")}</Text>
      </TouchableOpacity>

      {transferType === 'city' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Request description (required):")}</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              {t("Explain the reason for the transfer and the desired city in full detail")}
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder={t("Example: Due to family circumstances, I need a transfer to Tehran. My spouse works in Tehran...")}
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Promotion / Position change")}</Text>
      </TouchableOpacity>

      {transferType === 'position' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Request description (required):")}</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              {t("Explain the reason for requesting a position change, your experience, and skills")}
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder={t("Example: With 5 years of experience and strong performance, I request promotion to technical team lead...")}
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
                <Text style={[NewStyles.title4]}>{t("Submit request")}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('TransferRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>{t("View request list")}</Text>
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
          <Text style={[NewStyles.text4, styles.otherOptionText]}>{t("Training")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('LeaveRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>{t("Leave / Sick Leave")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('DebtRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>{t("Facilities / Interest-free Loan")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('ManpowerRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>{t("Manpower")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('TransferRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>{t("Transfer / Position")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.otherOption}
          onPress={() => navigation.navigate('TerminationRequestsListScreen')}
        >
          <Text style={[NewStyles.text4, styles.otherOptionText]}>{t("Termination")}</Text>
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Temporary")}</Text>
      </TouchableOpacity>

      {terminationType === 'temporary' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("From Date:")}</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('termination_start');
                setShowDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {terminationStartDate || t("Select Date")}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("To Date:")}</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('termination_end');
                setShowToDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {terminationEndDate || t("Select Date")}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Description (required):")}</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              {t("Explain the reason for your temporary termination request in full detail")}
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder={t("Example: Due to continuing my studies in a master's program, I need to suspend my activity for 3 months...")}
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
        <Text style={[NewStyles.title10, { textAlign: 'center', width: '100%' }]}>{t("Permanent")}</Text>
      </TouchableOpacity>

      {terminationType === 'permanent' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("From Date:")}</Text>
            <TouchableOpacity
              style={[NewStyles.textInput, styles.dateInputButton]}
              onPress={() => {
                setDatePickerMode('termination_start');
                setShowDatePicker(true);
              }}
            >
              <Text style={[NewStyles.text10]}>
                {terminationStartDate || t("Select Date")}
              </Text>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[NewStyles.text4, styles.inputLabel]}>{t("Description (required):")}</Text>
            <Text style={[NewStyles.text4, { fontSize: 12, color: themeColor10.bgColor(0.8), marginBottom: 8 }]}>
              {t("Explain the reason for your permanent termination request in full detail")}
            </Text>
            <TextInput
              style={[NewStyles.textInput, styles.textInput, { minHeight: 120 }]}
              placeholder={t("Example: Due to finding a new job opportunity in management, I decided to terminate cooperation...")}
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
                <Text style={[NewStyles.title4]}>{t("Submit request")}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewListButton}
            onPress={() => navigation.navigate('TerminationRequestsListScreen')}
          >
            <Ionicons name="list" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
            <Text style={[NewStyles.text]}>{t("View request list")}</Text>
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
        title={t("Requests")}
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

const createLocalStyles = (NewStyles) =>  StyleSheet.create({
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
   ...NewStyles.row,
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
    ...NewStyles.row,
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

