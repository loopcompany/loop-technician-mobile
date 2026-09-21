import React, { useState, useCallback, useMemo } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import CustomStatusBar from '../../components/CustomStatusBar';
import { themeColor0, themeColor2, themeColor4, themeColor6, themeColor7, themeColor8, themeColor10, themeColor11 } from '../../theme/Color';
import { isDebitTransaction, transactionVisual } from '../../helpers/transactions';
import { formatAmount, formatDate, langIsRTL, showAlert, toAmount } from '../../helpers/Common';
import { getTransactions } from '../../services/Api';
import { fetchUser } from '../../slices/userSlice';

const SUPPORT_PHONE = '02122656819';
const RECENT_LIMIT = 5;

export default function FinancialReportScreen({ navigation }) {
  const dispatch = useDispatch();
  const technician = useSelector((state) => state.user?.data?.data?.technician);
  const { t, i18n } = useTranslation();
  const isRTL = langIsRTL(i18n.language);
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const [balanceStatus, setBalanceStatus] = useState(technician ? 'ready' : 'loading'); // loading | ready | error
  const [balanceStale, setBalanceStale] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txStatus, setTxStatus] = useState('loading'); // loading | ready | error
  const [refreshing, setRefreshing] = useState(false);

  const wallet = toAmount(technician?.wallet);
  const totalSettlements = toAmount(technician?.total_settlements) ?? 0;

  const fetchBalance = useCallback(async () => {
    try {
      // Refreshes the shared profile so the dashboard header shows the same balance.
      await dispatch(fetchUser()).unwrap();
      setBalanceStatus('ready');
      setBalanceStale(false);
      setUpdatedAt(new Date());
    } catch (error) {
      // Keep showing the last known balance, but say it may be out of date.
      setBalanceStatus((prev) => (prev === 'ready' ? 'ready' : 'error'));
      setBalanceStale(true);
    }
  }, [dispatch]);

  const fetchRecentTransactions = useCallback(async () => {
    try {
      const response = await getTransactions();
      if (response?.success && Array.isArray(response.data)) {
        const recent = [...response.data]
          .sort((a, b) => Number(b.id) - Number(a.id))
          .slice(0, RECENT_LIMIT);
        setTransactions(recent);
        setTxStatus('ready');
      } else {
        setTxStatus('error');
      }
    } catch (error) {
      setTxStatus('error');
    }
  }, []);

  const loadAll = useCallback(
    () => Promise.all([fetchBalance(), fetchRecentTransactions()]),
    [fetchBalance, fetchRecentTransactions]
  );

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const retryBalance = () => {
    setBalanceStatus('loading');
    fetchBalance();
  };

  const retryTransactions = () => {
    setTxStatus('loading');
    fetchRecentTransactions();
  };

  const callSupport = async () => {
    const url = `tel:${SUPPORT_PHONE}`;
    try {
      await Linking.openURL(url);
    } catch (err) {
      if (Platform.OS === 'web') {
        try {
          window.open(url, '_self');
        } catch (webErr) {
          showAlert(t('Error'), t('There was a problem starting the call.'));
        }
      } else {
        showAlert(t('Error'), t('Phone calls are not available on your device.'));
      }
    }
  };

  const confirmCall = (title, message) => {
    showAlert(title, message, [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Call Support'), onPress: callSupport },
    ]);
  };

  const hasDebt = wallet !== null && wallet < 0;
  // Lifetime earnings = what's already been paid out + what's still in the wallet.
  // A negative wallet (fines/debt) isn't earnings, so it isn't counted.
  const totalEarnings = totalSettlements + Math.max(wallet ?? 0, 0);
  const settledPercent = totalEarnings > 0
    ? Math.min(100, Math.round((totalSettlements / totalEarnings) * 100))
    : 0;

  const balanceCaption = () => {
    if (hasDebt) return t('You owe this amount to Loop');
    if (wallet > 0) return t('Available for withdrawal');
    return t('Your wallet is empty');
  };

  const formatUpdatedAt = (date) => {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const renderBalanceCard = () => {
    if (balanceStatus === 'loading') {
      return (
        <LinearGradient colors={[themeColor0.bgColor(1), themeColor2.bgColor(1)]} style={[styles.balanceCard, styles.balanceCentered]}>
          <ActivityIndicator size="large" color="#fff" />
        </LinearGradient>
      );
    }

    if (balanceStatus === 'error') {
      return (
        <View style={[styles.card, styles.errorCard]}>
          <Ionicons name="cloud-offline-outline" size={40} color={themeColor6.bgColor(1)} />
          <Text style={[NewStyles.title, styles.centerText]}>{t('Could not load your balance')}</Text>
          <Text style={[NewStyles.text10, styles.mutedText, styles.centerText]}>
            {t('Check your internet connection and try again.')}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryBalance}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.buttonText}>{t('Try again')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <LinearGradient
        colors={hasDebt ? ['#8E1B1B', themeColor6.bgColor(1)] : [themeColor0.bgColor(1), themeColor2.bgColor(1)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={[NewStyles.rowWrapper, styles.balanceTop]}>
          <View style={[NewStyles.row, styles.gap8]}>
            <View style={styles.balanceIcon}>
              <Ionicons name="wallet" size={20} color="#fff" />
            </View>
            <Text style={[NewStyles.text4, styles.balanceLabel]}>{t('Current balance')}</Text>
          </View>
          {hasDebt && (
            <View style={styles.debtChip}>
              <Text style={styles.debtChipText}>{t('Debt')}</Text>
            </View>
          )}
        </View>

        <View style={[NewStyles.row, styles.amountRow]}>
          <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit>
            {formatAmount(wallet, { absolute: true })}
          </Text>
          <Text style={[NewStyles.text4, styles.balanceCurrency]}>{t('Toman')}</Text>
        </View>

        <Text style={[NewStyles.text4, styles.balanceCaption]}>{balanceCaption()}</Text>

        {(balanceStale || updatedAt) && (
          <View style={[NewStyles.row, styles.gap6, styles.updatedRow]}>
            <Ionicons
              name={balanceStale ? 'alert-circle-outline' : 'time-outline'}
              size={14}
              color="rgba(255,255,255,0.75)"
            />
            <Text style={[NewStyles.text4, styles.updatedText]}>
              {balanceStale
                ? t('Could not refresh. Showing last known balance.')
                : t('Updated at {{time}}', { time: formatUpdatedAt(updatedAt) })}
            </Text>
          </View>
        )}
      </LinearGradient>
    );
  };

  const renderStats = () => {
    if (balanceStatus !== 'ready') return null;
    return (
      <View style={styles.card}>
        <View style={[NewStyles.rowWrapper, styles.statsRow]}>
          <View style={styles.statItem}>
            <Ionicons name="trending-up" size={22} color={themeColor7.bgColor(1)} />
            <Text style={[NewStyles.text10, styles.statLabel]}>{t('Total earnings')}</Text>
            <Text style={[NewStyles.title, styles.statValue]} numberOfLines={1} adjustsFontSizeToFit>
              {formatAmount(totalEarnings)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="checkmark-done" size={22} color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.text10, styles.statLabel]}>{t('Total settlements')}</Text>
            <Text style={[NewStyles.title, styles.statValue]} numberOfLines={1} adjustsFontSizeToFit>
              {formatAmount(totalSettlements)}
            </Text>
          </View>
        </View>

        {totalEarnings > 0 && (
          <View style={styles.progressBlock}>
            <View style={NewStyles.rowWrapper}>
              <Text style={[NewStyles.text10, styles.mutedText]}>{t('Settled so far')}</Text>
              <Text style={[NewStyles.title, styles.progressValue]}>{settledPercent}%</Text>
            </View>
            <View style={[styles.progressTrack, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.progressFill, { width: `${settledPercent}%` }]} />
            </View>
          </View>
        )}
        <Text style={[NewStyles.text10, styles.footnote]}>{t('All amounts are in Toman')}</Text>
      </View>
    );
  };

  const renderTransaction = (item, index) => {
    const debit = isDebitTransaction(item);
    const visual = transactionVisual(item);
    return (
      <View
        key={String(item.id ?? index)}
        style={[NewStyles.rowWrapper, styles.txRow, index < transactions.length - 1 && styles.txDivider]}
      >
        <View style={[NewStyles.row, styles.gap10, styles.flexShrink]}>
          <View style={[styles.txIcon, { backgroundColor: visual.tint }]}>
            <Ionicons name={visual.icon} size={18} color={visual.color} />
          </View>
          <View style={styles.flexShrink}>
            <Text style={[NewStyles.title10, styles.txTitle]} numberOfLines={1}>
              {item.type_label || item.description || t('Transaction')}
            </Text>
            <Text style={[NewStyles.text10, styles.txMeta]} numberOfLines={1}>
              {[item.date && formatDate(item.date), item.order_id && `${t('Order #')}${item.order_id}`]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
        </View>
        <Text style={[NewStyles.title, styles.txAmount, { color: debit ? themeColor6.bgColor(1) : themeColor7.bgColor(1) }]}>
          {debit ? '−' : '+'}{formatAmount(item.price, { absolute: true })}
        </Text>
      </View>
    );
  };

  const renderTransactions = () => (
    <View style={styles.card}>
      <View style={[NewStyles.rowWrapper, styles.sectionHeader]}>
        <Text style={[NewStyles.title, styles.sectionTitle]}>{t('Recent transactions')}</Text>
        {txStatus === 'ready' && transactions.length > 0 && (
          <TouchableOpacity
            style={[NewStyles.row, styles.gap4]}
            onPress={() => navigation.navigate('PerformanceScreen')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[NewStyles.title, styles.linkText]}>{t('View all')}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={themeColor0.bgColor(1)} />
          </TouchableOpacity>
        )}
      </View>

      {txStatus === 'loading' && (
        <ActivityIndicator style={styles.txPlaceholder} color={themeColor0.bgColor(1)} />
      )}

      {txStatus === 'error' && (
        <View style={styles.txPlaceholder}>
          <Text style={[NewStyles.text10, styles.mutedText, styles.centerText]}>
            {t('There was a problem fetching the transactions list.')}
          </Text>
          <TouchableOpacity onPress={retryTransactions} style={styles.inlineRetry}>
            <Text style={[NewStyles.title, styles.linkText]}>{t('Try again')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {txStatus === 'ready' && transactions.length === 0 && (
        <View style={styles.txPlaceholder}>
          <Ionicons name="receipt-outline" size={36} color={themeColor10.bgColor(0.25)} />
          <Text style={[NewStyles.text10, styles.mutedText, styles.centerText]}>
            {t('No transactions have been recorded yet')}
          </Text>
        </View>
      )}

      {txStatus === 'ready' && transactions.map(renderTransaction)}
    </View>
  );

  const renderActions = () => (
    <View style={styles.card}>
      <TouchableOpacity
        style={[NewStyles.rowWrapper, styles.actionRow, styles.txDivider]}
        onPress={() => confirmCall(t('Settlement request'), t('Settlements are handled by support. Do you want to call now?'))}
      >
        <View style={[NewStyles.row, styles.gap10]}>
          <View style={[styles.txIcon, { backgroundColor: themeColor0.bgColor(0.12) }]}>
            <Ionicons name="cash-outline" size={18} color={themeColor0.bgColor(1)} />
          </View>
          <Text style={[NewStyles.title10, styles.txTitle]}>{t('Request settlement')}</Text>
        </View>
        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={themeColor10.bgColor(0.4)} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[NewStyles.rowWrapper, styles.actionRow]}
        onPress={() => confirmCall(t('Error report'), t('Do you want to contact support?'))}
      >
        <View style={[NewStyles.row, styles.gap10]}>
          <View style={[styles.txIcon, { backgroundColor: themeColor11.bgColor(0.15) }]}>
            <Ionicons name="alert-circle-outline" size={18} color={themeColor11.bgColor(1)} />
          </View>
          <Text style={[NewStyles.title10, styles.txTitle]}>{t('Report a wrong amount')}</Text>
        </View>
        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={themeColor10.bgColor(0.4)} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={{ top: 'off', bottom: 'off' }}>
      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <CustomStatusBar />
        <ScreenHeaders title={t('Financial report')} />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[themeColor0.bgColor(1)]}
              tintColor="#fff"
            />
          }
        >
          {renderBalanceCard()}
          {renderStats()}
          {renderTransactions()}
          {renderActions()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 14,
  },
  gap4: { gap: 4 },
  gap6: { gap: 6 },
  gap8: { gap: 8 },
  gap10: { gap: 10 },
  flexShrink: { flexShrink: 1 },
  centerText: { textAlign: 'center' },
  mutedText: { color: themeColor10.bgColor(0.55), fontSize: 13 },
  card: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 16,
    padding: 16,
    ...NewStyles.shadow,
    shadowOpacity: 0.25,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    minHeight: 170,
    ...NewStyles.shadow,
  },
  balanceCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceTop: {
    marginBottom: 14,
  },
  balanceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  debtChip: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  debtChipText: {
    ...NewStyles.title,
    color: '#fff',
    fontSize: 12,
  },
  amountRow: {
    alignItems: 'baseline',
    gap: 8,
  },
  balanceAmount: {
    ...NewStyles.title,
    color: '#fff',
    fontSize: 34,
    flexShrink: 1,
  },
  balanceCurrency: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  balanceCaption: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  updatedRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  updatedText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  errorCard: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
  },
  retryButton: {
    ...NewStyles.row,
    gap: 8,
    marginTop: 6,
    backgroundColor: themeColor0.bgColor(1),
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },
  buttonText: {
    ...NewStyles.title,
    color: '#fff',
    fontSize: 14,
  },
  statsRow: {
    alignItems: 'stretch',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: themeColor10.bgColor(0.15),
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: themeColor10.bgColor(0.55),
  },
  statValue: {
    fontSize: 17,
    textAlign: 'center',
  },
  progressBlock: {
    marginTop: 16,
    gap: 8,
  },
  progressValue: {
    fontSize: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: themeColor0.bgColor(0.1),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: themeColor0.bgColor(1),
  },
  footnote: {
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
    color: themeColor10.bgColor(0.4),
  },
  sectionHeader: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
  },
  linkText: {
    fontSize: 13,
  },
  txPlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  inlineRetry: {
    padding: 6,
  },
  txRow: {
    paddingVertical: 12,
    gap: 10,
  },
  txDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: themeColor10.bgColor(0.12),
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 14,
  },
  txMeta: {
    fontSize: 12,
    color: themeColor10.bgColor(0.5),
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
  },
  actionRow: {
    paddingVertical: 10,
  },
});
