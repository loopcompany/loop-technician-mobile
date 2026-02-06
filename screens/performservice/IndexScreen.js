import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor7, themeColor10, themeColor8, themeColor2 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { faDigitsToEn, formatPrice, getCurrentJalaliYear, showAlert } from '../../helpers/Common';
import { getYearlyIncomeChart } from '../../services/Api';

const { width } = Dimensions.get('window');

export default function IndexScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null); // شروع با null
  const [chartData, setChartData] = useState([]);
  const [yearlyData, setYearlyData] = useState({
    year: 1404,
    yearly_summary: {
      total_income: 0,
      total_settlements: 0,
      net_income: 0,
    },
    current_wallet: 0,
  });

  // دریافت داده‌های نمودار
  const fetchChartData = async (year) => {
    try {
      // اطمینان از اینکه year یک عدد معتبر است
      const currentJalali = getCurrentJalaliYear();
      const validYear = isNaN(year) || !year ? currentJalali : parseInt(year);
      console.log('====================================');
      console.log('currentJalali:', currentJalali);
      console.log('year:', year);
      console.log('====================================');
      const response = await getYearlyIncomeChart(validYear);

      if (response.success && response.data) {
        const { monthly_data, yearly_summary, current_wallet, year: responseYear } = response.data;

        // تبدیل داده‌ها به فرمت مورد نیاز BarChart
        const formattedData = monthly_data.map((item, index) => ({
          value: Number(item.net_income) / 1000000, // تبدیل به میلیون تومان
          label: item.month_name.substring(0, 3), // سه حرف اول نام ماه
          frontColor: index % 2 === 0 ? themeColor7.bgColor(1) : themeColor0.bgColor(1),
          spacing: 2,
          labelWidth: 35,
          labelTextStyle: { fontSize: 10 },
          monthName: item.month_name,
          totalIncome: Number(item.total_income),
          totalSettlements: Number(item.total_settlements),
          netIncome: Number(item.net_income),
        }));

        setChartData(formattedData);
        setYearlyData({
          year: Number(responseYear),
          yearly_summary: {
            total_income: Number(yearly_summary?.total_income || 0),
            total_settlements: Number(yearly_summary?.total_settlements || 0),
            net_income: Number(yearly_summary?.net_income || 0),
          },
          current_wallet: Number(current_wallet || 0),
        });
        setSelectedYear(Number(responseYear));
      } else {

        // استفاده از داده‌های موقت برای تست UI
        useMockData();
      }
    } catch (error) {
      useMockData();

      showAlert(
        'اطلاعیه',
        'در حال حاضر اطلاعات واقعی در دسترس نیست. داده‌های نمونه نمایش داده می‌شود.',
        [{ text: 'باشه' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // تابع برای استفاده از داده‌های موقت
  const useMockData = () => {
    const mockMonthlyData = [
      { month_name: 'فروردین', total_income: 7000000, total_settlements: 2000000, net_income: 5000000 },
      { month_name: 'اردیبهشت', total_income: 6500000, total_settlements: 2000000, net_income: 4500000 },
      { month_name: 'خرداد', total_income: 8000000, total_settlements: 2000000, net_income: 6000000 },
      { month_name: 'تیر', total_income: 9000000, total_settlements: 2000000, net_income: 7000000 },
      { month_name: 'مرداد', total_income: 7500000, total_settlements: 2000000, net_income: 5500000 },
      { month_name: 'شهریور', total_income: 10000000, total_settlements: 2000000, net_income: 8000000 },
      { month_name: 'مهر', total_income: 8500000, total_settlements: 2000000, net_income: 6500000 },
      { month_name: 'آبان', total_income: 9500000, total_settlements: 2000000, net_income: 7500000 },
      { month_name: 'آذر', total_income: 6000000, total_settlements: 2000000, net_income: 4000000 },
      { month_name: 'دی', total_income: 5000000, total_settlements: 2000000, net_income: 3000000 },
      { month_name: 'بهمن', total_income: 7000000, total_settlements: 2000000, net_income: 5000000 },
      { month_name: 'اسفند', total_income: 8000000, total_settlements: 2000000, net_income: 6000000 },
    ];

    const formattedData = mockMonthlyData.map((item, index) => ({
      value: Number(item.net_income) / 1000000,
      label: item.month_name.substring(0, 3),
      frontColor: index % 2 === 0 ? themeColor7.bgColor(1) : themeColor0.bgColor(1),
      spacing: 2,
      labelWidth: 35,
      labelTextStyle: { fontSize: 10 },
      monthName: item.month_name,
      totalIncome: Number(item.total_income),
      totalSettlements: Number(item.total_settlements),
      netIncome: Number(item.net_income),
    }));

    setChartData(formattedData);
    setYearlyData({
      year: 1404,
      yearly_summary: {
        total_income: 92000000,
        total_settlements: 24000000,
        net_income: 68000000,
      },
      current_wallet: 5000000,
    });
    setSelectedYear(1404);
  };

  useFocusEffect(
    useCallback(() => {
      // بار اول سال جاری رو بفرست
      const jalaliYear = getCurrentJalaliYear();

      console.log('🗓️ Jalali Year:', jalaliYear);

      setSelectedYear(jalaliYear);
      fetchChartData(jalaliYear);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    // اگر selectedYear داریم ازش استفاده کن، وگرنه سال جاری
    const yearToFetch = selectedYear || yearlyData.year;
    // اطمینان از معتبر بودن سال
    const validYear = isNaN(yearToFetch) || !yearToFetch ? 1404 : parseInt(yearToFetch);
    console.log('🔄 Refreshing with year:', validYear);
    fetchChartData(validYear);
  };

  const handleYearChange = (direction) => {
    const currentYear = selectedYear || yearlyData.year || 1404;
    const validCurrentYear = isNaN(currentYear) ? 1404 : parseInt(currentYear);
    const newYear = direction === 'next' ? validCurrentYear + 1 : validCurrentYear - 1;
    console.log('📆 Year changed:', validCurrentYear, '->', newYear);
    setSelectedYear(newYear);
    setLoading(true);
    fetchChartData(newYear);
  };

  // نمایش جزئیات هر ماه با کلیک روی ستون
  const handleBarPress = (item) => {
    if (!item) return;

    showAlert(
      `📊 ${item.monthName || 'ماه'}`,
      `کل درآمد: ${formatPrice(item.totalIncome || 0)} تومان\n` +
      `تسویه‌ها: ${formatPrice(item.totalSettlements || 0)} تومان\n` +
      `خالص دریافتی: ${formatPrice(item.netIncome || 0)} تومان`,
      [{ text: 'باشه', style: 'default' }]
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
          title={'شاخص'}
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
        title={'شاخص'}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* هدر گزارش عملکرد */}
        <View style={[styles.headerCard, { backgroundColor: themeColor0.bgColor(0.9) }]}>
          <Ionicons name="bar-chart" size={28} color="#fff" />
          <Text style={[NewStyles.title, styles.headerTitle]}>گزارش عملکرد</Text>
        </View>

        {/* انتخاب سال */}
        <View style={styles.yearSelector}>
          <TouchableOpacity
            style={styles.yearButton}
            onPress={() => handleYearChange('next')}
          >
            <Ionicons name="chevron-forward" size={20} color={themeColor0.bgColor(1)} />
          </TouchableOpacity>

          <View style={styles.yearDisplay}>
            <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.title, styles.yearText]}>
              سال {selectedYear || yearlyData.year}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.yearButton}
            onPress={() => handleYearChange('prev')}
          >
            <Ionicons name="chevron-back" size={20} color={themeColor0.bgColor(1)} />
          </TouchableOpacity>
        </View>

        {/* خلاصه سالانه */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-up" size={24} color={themeColor7.bgColor(1)} />
            <Text style={[NewStyles.text4, styles.summaryLabel]}>کل درآمد</Text>
            <Text style={[NewStyles.title, styles.summaryValue]}>
              {formatPrice(yearlyData.yearly_summary.total_income)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Ionicons name="cash" size={24} color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.text4, styles.summaryLabel]}>خالص دریافتی</Text>
            <Text style={[NewStyles.title, styles.summaryValue]}>
              {formatPrice(yearlyData.yearly_summary.net_income)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Ionicons name="card" size={24} color={themeColor1.bgColor(1)} />
            <Text style={[NewStyles.text4, styles.summaryLabel]}>تسویه‌ها</Text>
            <Text style={[NewStyles.title, styles.summaryValue]}>
              {formatPrice(yearlyData.yearly_summary.total_settlements)}
            </Text>
          </View>
        </View>

        {/* نمودار میله‌ای */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={[NewStyles.title, styles.chartTitle]}>نمودار درآمد ماهانه</Text>
            <Text style={[NewStyles.text4, styles.chartSubtitle]}>
              (میلیون تومان)
            </Text>
            <View style={styles.chartHint}>
              <Ionicons name="information-circle" size={16} color={themeColor7.bgColor(0.7)} />
              <Text style={[NewStyles.text4, styles.chartHintText]}>
                برای مشاهده جزئیات روی هر ستون کلیک کنید
              </Text>
            </View>
          </View>

          {chartData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <BarChart
                data={chartData}
                barWidth={18}
                spacing={8}
                roundedTop
                roundedBottom
                hideRules={false}
                rulesType="solid"
                rulesColor={themeColor10.bgColor(0.15)}
                rulesThickness={1}
                showVerticalLines
                verticalLinesColor={themeColor10.bgColor(0.1)}
                xAxisThickness={1}
                yAxisThickness={1}
                yAxisTextStyle={{ fontSize: 8, color: themeColor10.bgColor(0.7) }}
                xAxisLabelTextStyle={{ fontSize: 8, color: themeColor10.bgColor(0.7), textAlign: 'center' }}
                noOfSections={5}
                maxValue={Math.max(...chartData.map(d => d.value)) * 1.2}
                height={180}
                width={width - 100}
                yAxisColor={themeColor10.bgColor(0.3)}
                xAxisColor={themeColor10.bgColor(0.3)}
                isAnimated
                animationDuration={800}
                onPress={(item) => handleBarPress(item)}
                showGradient
                gradientColor={themeColor0.bgColor(0.3)}
                yAxisLabelWidth={30}
                initialSpacing={5}
                endSpacing={5}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons name="bar-chart-outline" size={60} color={themeColor10.bgColor(0.3)} />
              <Text style={[NewStyles.text4, styles.emptyText]}>
                داده‌ای برای نمایش وجود ندارد
              </Text>
            </View>
          )}
        </View>

        {/* موجودی فعلی */}
        <View style={styles.walletCard}>
          <Ionicons name="wallet" size={28} color={themeColor7.bgColor(1)} />
          <View style={styles.walletInfo}>
            <Text style={[NewStyles.text4, styles.walletLabel]}>موجودی فعلی کیف پول</Text>
            <Text style={[NewStyles.title, styles.walletValue]}>
              {formatPrice(yearlyData.current_wallet)} تومان
            </Text>
          </View>
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
  headerCard: {
    ...NewStyles.row,
    ...NewStyles.center,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    gap: 12,
    ...NewStyles.shadow,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
  },
  yearSelector: {
    ...NewStyles.rowWrapper,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    ...NewStyles.shadow,
  },
  yearButton: {
    ...NewStyles.center,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColor4.bgColor(0.5),
  },
  yearDisplay: {
    ...NewStyles.row,
    ...NewStyles.center,
    flex: 1,
    gap: 8,
  },
  yearText: {
    fontSize: 18,
  },
  summaryContainer: {
    ...NewStyles.rowWrapper,
    gap: 10,
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    gap: 8,
    ...NewStyles.shadow,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: themeColor10.bgColor(0.7),
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    ...NewStyles.shadow,
    overflow: 'hidden',
  },
  chartHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: themeColor10.bgColor(0.7),
    marginBottom: 8,
  },
  chartHint: {
    ...NewStyles.row,
    ...NewStyles.center,
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: themeColor7.bgColor(0.1),
    borderRadius: 8,
  },
  chartHintText: {
    fontSize: 11,
    color: themeColor7.bgColor(0.8),
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  emptyChart: {
    ...NewStyles.center,
    paddingVertical: 60,
    gap: 15,
  },
  emptyText: {
    fontSize: 14,
    color: themeColor10.bgColor(0.5),
  },
  walletCard: {
    ...NewStyles.row,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 20,
    gap: 15,
    ...NewStyles.shadow,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: themeColor10.bgColor(0.7),
  },
  walletValue: {
    fontSize: 20,
    color: themeColor7.bgColor(1),
  },
});
