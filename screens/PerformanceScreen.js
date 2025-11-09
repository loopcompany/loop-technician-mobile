import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getFormatedDate } from 'react-native-modern-datepicker';
import { useFocusEffect } from '@react-navigation/native';
import Footer from './Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import DatePickerModal from '../components/DatePickerModal';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor4, themeColor6, themeColor7, themeColor8, themeColor11 } from '../theme/Color';
import { getTransactions } from '../services/Api';
import { formatDate } from '../helpers/Common';

export default function PerformanceScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // تاریخ‌های شمسی
  const [fromDateJalali, setFromDateJalali] = useState('');
  const [toDateJalali, setToDateJalali] = useState('');

  // Modal states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // محاسبه تاریخ امروز به صورت شمسی
  const todayJalali = useMemo(() =>
    getFormatedDate(new Date(), 'jYYYY/jMM/jDD'),
    []);

  // محاسبه تاریخ 3 سال قبل به صورت شمسی
  const threeYearsAgoJalali = useMemo(() => {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    return getFormatedDate(threeYearsAgo, 'jYYYY/jMM/jDD');
  }, []);

  const fetchTransactions = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      console.log('💰 دریافت لیست تراکنش‌ها...');
      console.log('📅 تاریخ‌های شمسی:', { fromDateJalali, toDateJalali });

      // ساخت فیلترها
      const filters = {};

      if (fromDateJalali && toDateJalali) {
        filters.from_date = fromDateJalali.replace(/\//g, '-');
        filters.to_date = toDateJalali.replace(/\//g, '-');
      } else if (fromDateJalali) {
        filters.from_date = fromDateJalali.replace(/\//g, '-');
      } else if (toDateJalali) {
        filters.to_date = toDateJalali.replace(/\//g, '-');
      }
      setShowFromDatePicker(false)
      setShowToDatePicker(false)
      console.log('📆 فیلترهای ارسالی به API (شمسی):', filters);

      const response = await getTransactions(filters);

      if (response.success && response.data) {
        setTransactions(response.data);
        console.log(`✅ ${response.data.length} تراکنش دریافت شد`);
      }
    } catch (error) {
      console.error('❌ خطا در دریافت لیست تراکنش‌ها:', error);
      Alert.alert('خطا', error.message || 'مشکلی در دریافت لیست تراکنش‌ها پیش آمد');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fromDateJalali, toDateJalali])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
  };

  const clearFilters = () => {
    setFromDateJalali('');
    setToDateJalali('');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 1: return themeColor7.bgColor(1); // واریز - سبز
      case 2: return themeColor6.bgColor(1); // برداشت - قرمز
      case 3: return themeColor11.bgColor(1); // جریمه - نارنجی
      default: return themeColor10.bgColor(0.5);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 1: return 'arrow-down-circle'; // واریز
      case 2: return 'arrow-up-circle'; // برداشت
      case 3: return 'warning'; // جریمه
      default: return 'help-circle';
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('fa-IR').format(Math.abs(numPrice));
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={'عملکرد من'}
          onPressLeft={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
          <Text style={[NewStyles.text4, styles.loadingText]}>در حال بارگذاری...</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderHeader = () => (
    <View style={styles.dateFilterContainer}>
      <View style={styles.filterHeader}>
        <Text style={[NewStyles.title, styles.filterTitle]}>فیلتر بر اساس تاریخ</Text>
        {(fromDateJalali || toDateJalali) && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={themeColor6.bgColor(1)} />
            <Text style={[NewStyles.text4, styles.clearText]}>پاک کردن</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateInputContainer}>
          <Text style={[NewStyles.text4, styles.dateLabel]}>از تاریخ</Text>
          <TouchableOpacity
            style={styles.dateInputButton}
            onPress={() => setShowFromDatePicker(true)}
          >
            <Text style={[NewStyles.text10, styles.dateText]}>
              {fromDateJalali || 'انتخاب تاریخ'}
            </Text>
            <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
          </TouchableOpacity>
        </View>

        <View style={styles.dateInputContainer}>
          <Text style={[NewStyles.text4, styles.dateLabel]}>تا تاریخ</Text>
          <TouchableOpacity
            style={styles.dateInputButton}
            onPress={() => setShowToDatePicker(true)}
          >
            <Text style={[NewStyles.text10, styles.dateText]}>
              {toDateJalali || 'انتخاب تاریخ'}
            </Text>
            <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.transactionsHeader}>
      <Ionicons name="receipt" size={24} color={themeColor0.bgColor(1)} />
      <Text style={[NewStyles.title, styles.transactionsTitle]}>
        لیست تراکنش‌ها ({transactions.length})
      </Text>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={80} color={themeColor10.bgColor(0.3)} />
      <Text style={[NewStyles.text, styles.emptyText]}>هیچ تراکنشی یافت نشد</Text>
      <Text style={[NewStyles.text4, styles.emptySubText]}>
        {fromDateJalali || toDateJalali
          ? 'در بازه زمانی انتخاب شده تراکنشی وجود ندارد'
          : 'هنوز هیچ تراکنشی ثبت نشده است'
        }
      </Text>
    </View>
  );

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
            <Ionicons name={getTypeIcon(item.type)} size={18} color="#fff" />
            <Text style={[NewStyles.title4, styles.typeText]}>{item.type_label}</Text>
          </View>
          <Text style={[NewStyles.text10, styles.transactionId]}>#{item.id}</Text>
        </View>

        <Text style={[NewStyles.title, styles.priceText, {
          color: parseFloat(item.price) >= 0 ? themeColor7.bgColor(1) : themeColor6.bgColor(1)
        }]}>
          {parseFloat(item.price) >= 0 ? '+' : '-'} {formatPrice(item.price)} ریال
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={themeColor10.bgColor(0.7)} />
          <Text style={[NewStyles.text4, styles.infoText]}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={themeColor10.bgColor(0.7)} />
          <Text style={[NewStyles.text4, styles.infoText]}>{item.time}</Text>
        </View>
      </View>

      {item.customer_name && (
        <View style={styles.customerInfo}>
          <Ionicons name="person-outline" size={16} color={themeColor0.bgColor(1)} />
          <Text style={[NewStyles.text4, styles.customerText]}>
            {item.customer_name} - {item.customer_phone}
          </Text>
        </View>
      )}

      {item.order_id && (
        <View style={styles.orderInfo}>
          <Ionicons name="document-text-outline" size={16} color={themeColor0.bgColor(1)} />
          <Text style={[NewStyles.text4, styles.orderText]}>سفارش #{item.order_id}</Text>
        </View>
      )}

      {item.description && (
        <View style={styles.descriptionContainer}>
          <Text style={[NewStyles.text4, styles.descriptionText]}>{item.description}</Text>
        </View>
      )}

      {item.commission > 0 && (
        <View style={styles.commissionBadge}>
          <Text style={[NewStyles.text4, styles.commissionText]}>
            درصد شما: {item.commission}%
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders
        title={'عملکرد من'}
        onPressLeft={() => navigation.goBack()}
      />

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {transactions.length > 0 && renderListHeader()}
          </>
        )}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColor0.bgColor(1)]}
            tintColor={themeColor0.bgColor(1)}
          />
        }
      />

      {/* Date Picker Modals */}
      <DatePickerModal
        datePickerModal={showFromDatePicker}
        setDatePickerModal={setShowFromDatePicker}
        birthDate={fromDateJalali}
        setBirthDate={setFromDateJalali}
        minimumDate={threeYearsAgoJalali}
        maximumDate={toDateJalali || todayJalali}
      />

      <DatePickerModal
        datePickerModal={showToDatePicker}
        setDatePickerModal={setShowToDatePicker}
        birthDate={toDateJalali}
        setBirthDate={setToDateJalali}
        minimumDate={fromDateJalali || threeYearsAgoJalali}
        maximumDate={todayJalali}
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: themeColor10.bgColor(0.7),
  },
  container: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  dateFilterContainer: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    ...NewStyles.shadow,
  },
  filterHeader: {
    ...NewStyles.rowWrapper,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.1),
  },
  filterTitle: {
    fontSize: 16,
    flex: 1,
  },
  clearButton: {
    ...NewStyles.row,
    gap: 5,
  },
  clearText: {
    color: themeColor6.bgColor(1),
    fontSize: 12,
  },
  dateRow: {
    ...NewStyles.rowWrapper,
    gap: 10,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: 8,
    fontSize: 14,
    color: themeColor10.bgColor(0.8),
  },
  dateInputButton: {
    ...NewStyles.row,
    ...NewStyles.rowWrapper,
    backgroundColor: themeColor10.bgColor(0.05),
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.2),
  },
  dateText: {
    flex: 1,
    fontSize: 14,
  },
  emptyContainer: {
    ...NewStyles.center,
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: themeColor10.bgColor(0.7),
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: themeColor10.bgColor(0.5),
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  transactionsHeader: {
    ...NewStyles.row,
    marginBottom: 15,
    gap: 10,
    paddingTop: 5,
  },
  transactionsTitle: {
    fontSize: 18,
  },
  transactionCard: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...NewStyles.shadow,
  },
  cardHeader: {
    ...NewStyles.rowWrapper,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.1),
  },
  typeContainer: {
    ...NewStyles.row,
    gap: 10,
    flex: 1,
  },
  typeBadge: {
    ...NewStyles.row,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
  },
  transactionId: {
    fontSize: 12,
    color: themeColor10.bgColor(0.6),
  },
  priceText: {
    ...NewStyles.title7,
    fontSize: 18,
  },
  cardBody: {
    ...NewStyles.rowWrapper,
    gap: 20,
    marginBottom: 10,
  },
  infoRow: {
    ...NewStyles.row,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: themeColor10.bgColor(0.7),
  },
  customerInfo: {
    ...NewStyles.row,
    backgroundColor: themeColor1.bgColor(0.1),
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  customerText: {
    fontSize: 13,
    color: themeColor0.bgColor(1),
    flex: 1,
  },
  orderInfo: {
    ...NewStyles.row,
    backgroundColor: themeColor10.bgColor(0.05),
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  orderText: {
    fontSize: 13,
    color: themeColor10.bgColor(0.8),
  },
  descriptionContainer: {
    backgroundColor: themeColor10.bgColor(0.05),
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: themeColor10.bgColor(0.8),
  },
  commissionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: themeColor7.bgColor(0.2),
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  commissionText: {
    ...NewStyles.title7,
    fontSize: 12,
    color: themeColor7.bgColor(1),
  },
});