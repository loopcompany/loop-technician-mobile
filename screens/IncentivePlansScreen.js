import React, { useState, useCallback,useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor2, themeColor8, themeColor4, themeColor10, themeColor7, themeColor6, themeColor11 } from '../theme/Color';
import { getIncentivePlans } from '../services/Api';
import { formatDate, formatDateTime, showAlert } from '../helpers/Common';

export default function IncentivePlansScreen({ navigation }) {
  const [plans, setPlans] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  // دریافت لیست طرح‌ها
  const fetchPlans = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const response = await getIncentivePlans();

      if (response.success) {
        setPlans(response.data || []);
        setStatistics(response.statistics || {});
        console.log(`✅ ${response.data?.length || 0} طرح تشویقی دریافت شد`);
      }
    } catch (error) {
      console.log('❌ خطا در دریافت طرح‌ها:', error);
      showAlert(t('Error'), error.message || t('There was a problem fetching incentive plans.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans(true);
  };

  // رنگ بر اساس وضعیت
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return themeColor7.bgColor(1); // فعال - سبز
      case 'Used': return themeColor11.bgColor(1); // استفاده شده - نارنجی
      case 'Expired': return themeColor6.bgColor(1); // منقضی - قرمز
      default: return themeColor10.bgColor(0.5);
    }
  };

  // آیکون بر اساس وضعیت
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return 'checkmark-circle'; // فعال
      case 'Used': return 'checkmark-done-circle'; // استفاده شده
      case 'Expired': return 'close-circle'; // منقضی
      default: return 'help-circle';
    }
  };

  // رندر هر طرح
  const renderPlanItem = ({ item }) => (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status_label) }]}>
          <Ionicons name={getStatusIcon(item.status_label)} size={18} color="#fff" />
          <Text style={[NewStyles.title4, styles.statusText]}>{t(item.status_label)}</Text>
        </View>
        <Text style={[NewStyles.text10, styles.planId]}>#{item.id}</Text>
      </View>

      <Text style={[NewStyles.text, styles.planDescription]}>{item.description}</Text>

      <View style={styles.planFooter}>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={14} color={themeColor10.bgColor(0.7)} />
          <Text style={[NewStyles.text4, styles.dateText]}>
            {t('Created:')} {formatDate(item.created_at)}
          </Text>
        </View>
        {item.status !== 0 && (
          <View style={styles.dateInfo}>
            <Ionicons name="time-outline" size={14} color={themeColor10.bgColor(0.7)} />
            <Text style={[NewStyles.text4, styles.dateText]}>
              {t('Updated:')} {formatDate(item.updated_at)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // رندر هدر با آمار
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* جعبه جوایز */}
      <TouchableOpacity style={styles.prizeBoxButton}>
        <Ionicons name="gift" size={28} color="#fff" />
        <Text style={[NewStyles.text, styles.prizeBoxText]}>{t('Prize Box')}</Text>
      </TouchableOpacity>
    </View>
  );

  // رندر حالت خالی
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="gift-outline" size={80} color={themeColor10.bgColor(0.3)} />
      <Text style={[NewStyles.text, styles.emptyText]}>{t('No incentive plans found')}</Text>
      <Text style={[NewStyles.text4, styles.emptySubText]}>
        {t('There are currently no incentive plans defined for you')}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={t('Promotional Plans')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
          <Text style={[NewStyles.text4, styles.loadingText]}>{t('Loading...')}</Text>
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
      <ScreenHeaders
        title={t('Promotional Plans')}
      />

      <FlatList
        data={plans}
        renderItem={renderPlanItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
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
    </LinearGradient>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
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
    padding: 15,
    paddingBottom: 100,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 20,
  },
  prizeBoxButton: {
    ...NewStyles.row,
    ...NewStyles.center,
    backgroundColor: themeColor0.bgColor(1),
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 30,
    marginBottom: 20,
    gap: 10,
    ...NewStyles.shadow,
  },
  prizeBoxText: {
    color: '#fff',
  },
  statisticsContainer: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    ...NewStyles.shadow,
  },
  statisticsTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: themeColor4.bgColor(0.5),
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    ...NewStyles.shadow,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: themeColor10.bgColor(0.7),
    marginTop: 4,
  },
  listHeaderContainer: {
    ...NewStyles.row,
    ...NewStyles.center,
    marginBottom: 15,
    gap: 10,
  },
  listHeaderText: {
    fontSize: 18,
  },
  planCard: {
    backgroundColor: themeColor4.bgColor(1),
    ...NewStyles.border10,
    padding: 16,
    marginBottom: 12,
    ...NewStyles.shadow,
  },
  planHeader: {
    ...NewStyles.rowWrapper,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.1),
  },
  statusBadge: {
    ...NewStyles.row,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
  },
  planId: {
    fontSize: 12,
    color: themeColor10.bgColor(0.6),
  },
  planDescription: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  planFooter: {
    gap: 8,
  },
  dateInfo: {
    ...NewStyles.row,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: themeColor10.bgColor(0.7),
  },
  emptyContainer: {
    ...NewStyles.center,
    paddingVertical: 80,
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
});
