import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor2, themeColor3, themeColor5, themeColor6, themeColor7, themeColor8 } from '../theme/Color';
import { getEducationRequests } from '../services/Api';
import { formatDateTime } from '../helpers/Common';

export default function EducationRequestsListScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const result = await getEducationRequests();
      
      if (result.success) {
        setRequests(result.data || []);
      } else {
        console.error('خطا در دریافت درخواست‌ها:', result.message);
      }
    } catch (error) {
      console.error('خطا در بارگذاری درخواست‌ها:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const getStatusColor = (status) => {
    const statusStr = String(status);
    switch (statusStr) {
      case '0': return themeColor8.bgColor(1); // در انتظار - نارنجی
      case '1': return themeColor7.bgColor(1); // تأیید - سبز
      case '2': return themeColor6.bgColor(1); // رد - قرمز
      default: return themeColor3.bgColor(1);
    }
  };

  const getStatusIcon = (status) => {
    const statusStr = String(status);
    switch (statusStr) {
      case '0': return 'time-outline';
      case '1': return 'checkmark-circle';
      case '2': return 'close-circle';
      default: return 'help-circle-outline';
    }
  };

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => navigation.navigate('EducationRequestDetail', { requestId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="document-text" size={20} color={themeColor0.bgColor(1)} />
          <Text style={[NewStyles.text, styles.cardTitle]} numberOfLines={1}>
            {item.section}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="#fff" />
          <Text style={styles.statusText}>{item.status_label}</Text>
        </View>
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={themeColor3.bgColor(1)} />
          <Text style={styles.dateText}>{formatDateTime(item.created_at)}</Text>
        </View>
        <Ionicons name="chevron-back-outline" size={18} color={themeColor0.bgColor(1)} />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={'درخواست‌های من'}
          onPressLeft={() => navigation.goBack()}
        />
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={styles.container}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>در حال بارگذاری...</Text>
          </View>
        </SafeAreaView>
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
        title={'درخواست‌های من'}
        onPressLeft={() => navigation.goBack()}
      />
      
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={styles.container}>
        {requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>هنوز درخواستی ثبت نکرده‌اید</Text>
            <Text style={styles.emptySubtext}>
              با کلیک روی دکمه زیر، اولین درخواست خود را ثبت کنید
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('RequestsScreen')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>ثبت درخواست جدید</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={requests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#fff"
              />
            }
            ListHeaderComponent={
              <View style={styles.headerInfo}>
                <Ionicons name="information-circle" size={20} color="#fff" />
                <Text style={styles.headerInfoText}>
                  {requests.length} درخواست ثبت شده
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
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
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  headerInfo: {
    ...NewStyles.row,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  headerInfoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 11,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColor0.bgColor(1),
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
