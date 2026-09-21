import React, { useState, useCallback, useRef } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor7, themeColor10, themeColor8, themeColor2 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { formatAmount, formatPrice, getCurrentJalaliYear, langIsRTL, showAlert } from '../../helpers/Common';
import { getYearlyIncomeChart } from '../../services/Api';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

export default function IndexScreen({ navigation }) {
  const user = useSelector((state) => state?.user?.data?.data?.technician);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const currentYear = getCurrentJalaliYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const selectedYearRef = useRef(currentYear);
  const requestIdRef = useRef(0);
  const [chartData, setChartData] = useState([]);
  const { t, i18n } = useTranslation();
  const isRTL = langIsRTL(i18n.language);
  const [yearlyData, setYearlyData] = useState({
    yearly_summary: {
      total_income: 0,
      total_settlements: 0,
      net_income: 0,
    },
    current_wallet: null,
  });

  // دریافت داده‌های نمودار
  const fetchChartData = async (year) => {
    // Only the latest request may update the screen (fast year switching).
    const requestId = ++requestIdRef.current;
    try {
      const response = await getYearlyIncomeChart(year);
      if (requestId !== requestIdRef.current) return;

      if (response.success && response.data) {
        const { monthly_data, yearly_summary, current_wallet } = response.data;

        // تبدیل داده‌ها به فرمت مورد نیاز BarChart
        const formattedData = (Array.isArray(monthly_data) ? monthly_data : []).map((item, index) => ({
          value: Math.max(Number(item.net_income) || 0, 0) / 1000000, // تبدیل به میلیون تومان
          label: String(item.month_name || '').substring(0, 3), // سه حرف اول نام ماه
          frontColor: index % 2 === 0 ? themeColor7.bgColor(1) : themeColor0.bgColor(1),
          spacing: 2,
          labelWidth: 35,
          labelTextStyle: { fontSize: 10 },
          monthName: item.month_name,
          totalIncome: Number(item.total_income) || 0,
          totalSettlements: Number(item.total_settlements) || 0,
          netIncome: Number(item.net_income) || 0,
        }));

        setChartData(formattedData);
        setYearlyData({
          yearly_summary: {
            total_income: Number(yearly_summary?.total_income || 0),
            total_settlements: Number(yearly_summary?.total_settlements || 0),
            net_income: Number(yearly_summary?.net_income || 0),
          },
          current_wallet: current_wallet ?? null,
        });
        setLoadError(false);
      } else {
        setLoadError(true);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setLoadError(true);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setChartLoading(false);
        setRefreshing(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Keep the year the user was looking at when coming back to the screen.
      fetchChartData(selectedYearRef.current);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchChartData(selectedYearRef.current);
  };

  const changeYear = (newYear) => {
    if (newYear > currentYear) return;
    selectedYearRef.current = newYear;
    setSelectedYear(newYear);
    setChartLoading(true);
    fetchChartData(newYear);
  };

  const retry = () => {
    setChartLoading(true);
    fetchChartData(selectedYearRef.current);
  };

  // Bars are drawn with a positive scale; avoid maxValue 0 for an empty year.
  const chartMax = Math.max(1, ...chartData.map((d) => d.value)) * 1.2;
  const hasIncome = chartData.some((d) => d.value > 0);
  const canGoNext = selectedYear < currentYear;

  // نمایش جزئیات هر ماه با کلیک روی ستون
  const handleBarPress = (item) => {
    if (!item) return;

    showAlert(
      `📊 ${item.monthName || t('Month')}`,
      `${t('Total income')}: ${formatPrice(item.totalIncome || 0)} ${t('Tomans')}\n` +
      `${t('Settlements')}: ${formatPrice(item.totalSettlements || 0)} ${t('Tomans')}\n` +
      `${t('Net income')}: ${formatPrice(item.netIncome || 0)} ${t('Tomans')}`,
      [{ text: t('Ok'), style: 'default' }]
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
          title={t('Index')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={{ top: 'off', bottom: 'off' }}>

      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <CustomStatusBar />
        <ScreenHeaders
          title={t('Index')}
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
            <Text style={[NewStyles.title, styles.headerTitle]}>{t('Performance report')}</Text>
          </View>

          {/* انتخاب سال */}
          <View style={styles.yearSelector}>
            {/* rowWrapper is row-reverse in RTL: the first child is at the reading start. */}
            <TouchableOpacity
              style={styles.yearButton}
              onPress={() => changeYear(selectedYear - 1)}
              accessibilityLabel={t('Previous year')}
            >
              <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>

            <View style={styles.yearDisplay}>
              <Ionicons name="calendar" size={20} color={themeColor0.bgColor(1)} />
              <Text style={[NewStyles.title, styles.yearText]}>
                {t('Year')} {selectedYear}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.yearButton, !canGoNext && styles.yearButtonDisabled]}
              onPress={() => changeYear(selectedYear + 1)}
              disabled={!canGoNext}
              accessibilityLabel={t('Next year')}
            >
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
          </View>

          {/* خلاصه سالانه */}
          {user?.apple_check == 1 || loadError
            ? null
            :
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Ionicons name="trending-up" size={24} color={themeColor7.bgColor(1)} />
                <Text style={[NewStyles.text4, styles.summaryLabel]}>{t('Total income')}</Text>
                <Text style={[NewStyles.title, styles.summaryValue]}>
                  {formatPrice(yearlyData.yearly_summary.total_income)}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Ionicons name="cash" size={24} color={themeColor0.bgColor(1)} />
                <Text style={[NewStyles.text4, styles.summaryLabel]}>{t('Net income')}</Text>
                <Text style={[NewStyles.title, styles.summaryValue]}>
                  {formatPrice(yearlyData.yearly_summary.net_income)}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Ionicons name="card" size={24} color={themeColor1.bgColor(1)} />
                <Text style={[NewStyles.text4, styles.summaryLabel]}>{t('Settlements')}</Text>
                <Text style={[NewStyles.title, styles.summaryValue]}>
                  {formatPrice(yearlyData.yearly_summary.total_settlements)}
                </Text>
              </View>
            </View>}

          {/* نمودار میله‌ای */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={[NewStyles.title, styles.chartTitle]}>{t('Monthly income chart')}</Text>
              <Text style={[NewStyles.text4, styles.chartSubtitle]}>
                {t('(Million Tomans)')}
              </Text>
              <View style={styles.chartHint}>
                <Ionicons name="information-circle" size={16} color={themeColor7.bgColor(0.7)} />
                <Text style={[NewStyles.text4, styles.chartHintText]}>
                  {t('Tap a bar to view details')}
                </Text>
              </View>
            </View>

            {chartLoading ? (
              <View style={styles.emptyChart}>
                <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
              </View>
            ) : loadError ? (
              <View style={styles.emptyChart}>
                <Ionicons name="cloud-offline-outline" size={56} color={themeColor10.bgColor(0.3)} />
                <Text style={[NewStyles.text4, styles.emptyText]}>
                  {t('There was a problem fetching information.')}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={retry}>
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={[NewStyles.title, styles.retryText]}>{t('Try again')}</Text>
                </TouchableOpacity>
              </View>
            ) : hasIncome ? (
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
                  maxValue={chartMax}
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
                  {t('No records to display!')}
                </Text>
              </View>
            )}
          </View>

          {/* موجودی فعلی */}
          {!loadError && yearlyData.current_wallet !== null && (
            <TouchableOpacity
              style={styles.walletCard}
              activeOpacity={0.8}
              disabled={user?.apple_check == 1}
              onPress={() => navigation.navigate('FinancialReportScreen')}
            >
              <Ionicons name="wallet" size={28} color={themeColor7.bgColor(1)} />
              <View style={styles.walletInfo}>
                <Text style={[NewStyles.text4, styles.walletLabel]}>{t('Wallet balance')}</Text>
                <Text style={[NewStyles.title, styles.walletValue]}>
                  {formatAmount(yearlyData.current_wallet)} {t('Tomans')}
                </Text>
              </View>
              {user?.apple_check != 1 && (
                <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={themeColor10.bgColor(0.4)} />
              )}
            </TouchableOpacity>
          )}

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
    backgroundColor: themeColor0.bgColor(0.08),
  },
  yearButtonDisabled: {
    opacity: 0.3,
  },
  retryButton: {
    ...NewStyles.row,
    gap: 6,
    backgroundColor: themeColor0.bgColor(1),
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
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
