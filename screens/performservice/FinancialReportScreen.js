import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor7, themeColor10, themeColor8, themeColor2 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useSelector } from 'react-redux';
import { formatPrice, showAlert } from '../../helpers/Common';
import { validateToken } from '../../services/Api';

export default function FinancialReportScreen({ navigation }) {
  const user = useSelector(state => state.user.data);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletData, setWalletData] = useState({
    wallet: 0,
    total_settlements: 0,
  });

  // دریافت اطلاعات مالی از API
  const fetchFinancialData = async () => {
    try {
      const response = await validateToken();

      if (response.success && response.data?.technician) {
        const { wallet, total_settlements } = response.data.technician;
        setWalletData({
          wallet: Number(wallet) || 0,
          total_settlements: Number(total_settlements) || 0,
        });
      }
    } catch (error) {
      console.log('❌ خطا در دریافت اطلاعات مالی:', error);
      showAlert('خطا', 'مشکلی در دریافت اطلاعات پیش آمد');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFinancialData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinancialData();
  };

  // محاسبه کل دریافتی
  const getTotalEarnings = () => {
    return walletData.wallet + walletData.total_settlements;
  };

  // محاسبه درصد تسویه
  const getSettlementPercentage = () => {
    const total = getTotalEarnings();
    if (total === 0) return 0;
    return Math.round((walletData.total_settlements / total) * 100);
  };

  const handleReportError = () => {
    showAlert(
      'گزارش خطا',
      'چگونه می‌خواهید با پشتیبانی تماس بگیرید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'تماس تلفنی',
          onPress: async () => {
            const phoneNumber = '02122656819';
            const url = `tel:${phoneNumber}`;

            try {
              await Linking.openURL(url);
            } catch (err) {
              console.log('❌ خطا در باز کردن شماره تلفن:', err);

              // fallback برای وب
              if (Platform.OS === 'web') {
                try {
                  window.open(url, '_self');
                } catch (webErr) {
                  showAlert('خطا', 'مشکلی در باز کردن تماس پیش آمد');
                }
              } else {
                showAlert('خطا', 'امکان تماس تلفنی در دستگاه شما وجود ندارد');
              }
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <CustomStatusBar />
        <ScreenHeaders
          title={'گزارش مالی'}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title={'گزارش مالی'}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* کارت موجودی کیف پول */}
        <View style={[styles.card, styles.walletCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={32} color={themeColor7.bgColor(1)} />
            <Text style={[NewStyles.title, styles.cardTitle]}>موجودی فعلی</Text>
          </View>
          <Text style={[styles.amountLarge, { color: themeColor7.bgColor(1) }]}>
            {formatPrice(walletData.wallet)} تومان
          </Text>
          <Text style={[NewStyles.text4, styles.cardSubtitle]}>
            قابل برداشت
          </Text>
        </View>

        {/* کارت مجموع تسویه‌ها */}
        <View style={[styles.card, styles.settlementsCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={32} color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.title, styles.cardTitle]}>مجموع تسویه‌ها</Text>
          </View>
          <Text style={[styles.amountLarge, { color: themeColor0.bgColor(1) }]}>
            {formatPrice(walletData.total_settlements)} تومان
          </Text>
          <Text style={[NewStyles.text4, styles.cardSubtitle]}>
            کل مبلغ دریافتی از سیستم
          </Text>
        </View>

        {/* آمار مالی */}
        <View style={styles.statsContainer}>
          <Text style={[NewStyles.title, styles.statsTitle]}>
            اطلاعات مالی
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={28} color={themeColor7.bgColor(1)} />
              <Text style={[NewStyles.text4, styles.statLabel]}>کل دریافتی (تومان)</Text>
              <Text style={[NewStyles.title, styles.statValue]}>
                {formatPrice(getTotalEarnings())}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="pie-chart" size={28} color={themeColor1.bgColor(1)} />
              <Text style={[NewStyles.text4, styles.statLabel]}>درصد تسویه</Text>
              <Text style={[NewStyles.title, styles.statValue]}>
                {getSettlementPercentage()}%
              </Text>
            </View>
          </View>
        </View>

        {/* راهنما و گزارش خطا */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={themeColor0.bgColor(1)} />
          <Text style={[NewStyles.text4, styles.infoText]}>
            برای درخواست تسویه یا گزارش خطا با پشتیبانی تماس بگیرید
          </Text>
        </View>

        {/* دکمه‌های اقدام */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.closeButton]}
            onPress={() => {
              if (Platform.OS == 'web') {
                window.history.back()
              } else {
                navigation.goBack()
              }
            }}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={[NewStyles.text4, styles.buttonText]}>بستن</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.errorButton]}
            onPress={handleReportError}
          >
            <Ionicons name="alert-circle" size={20} color="#fff" />
            <Text style={[NewStyles.text4, styles.buttonText]}>گزارش خطا</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    ...NewStyles.shadow,
  },
  walletCard: {
    borderLeftWidth: 5,
    borderLeftColor: themeColor7.bgColor(1),
  },
  settlementsCard: {
    borderLeftWidth: 5,
    borderLeftColor: themeColor0.bgColor(1),
  },
  cardHeader: {
    ...NewStyles.row,
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
  },
  amountLarge: {
    ...NewStyles.title,
    fontSize: 20,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: themeColor10.bgColor(0.7),
  },
  statsContainer: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    ...NewStyles.shadow,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  statRow: {
    ...NewStyles.rowWrapper,
    gap: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: themeColor4.bgColor(0.5),
    borderRadius: 10,
    padding: 15,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    color: themeColor10.bgColor(0.7),
  },
  statValue: {
    ...NewStyles.title,
    fontSize: 18,
  },
  infoBox: {
    ...NewStyles.row,
    backgroundColor: themeColor4.bgColor(0.7),
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: themeColor10.bgColor(0.8),
  },
  buttonRow: {
    ...NewStyles.rowWrapper,
    gap: 15,
  },
  actionButton: {
    ...NewStyles.row,
    ...NewStyles.center,
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  closeButton: {
    backgroundColor: themeColor7.bgColor(1),
  },
  errorButton: {
    backgroundColor: themeColor1.bgColor(1),
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
