import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor5 } from '../../theme/Color';
import { getTechnicianOrders } from '../../services/Api';
import { showToastOrAlert, formatPrice as formatPriceCommon, formatDate, formatDateTime } from '../../helpers/Common';

export default function OrderListScreen({ navigation }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filter changes
    fetchOrders(1);
  }, [selectedStatus]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const result = await getTechnicianOrders(selectedStatus, page);
      
      if (result.success) {
        setOrders(result.data.orders || []);
        setPagination(result.data.pagination || null);
        setCurrentPage(page);
      } else {
        showToastOrAlert(result.message || 'خطا در دریافت سفارشات');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToastOrAlert('خطا در دریافت سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(currentPage);
    setRefreshing(false);
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.last_page) {
      fetchOrders(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchOrders(currentPage - 1);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      0: 'در انتظار',
      1: 'در حال پردازش',
      2: 'انجام شده',
      3: 'لغو شده توسط کاربر',
      4: 'لغو شده توسط تکنسین',
      5: 'لغو شده توسط ادمین',
      6: 'منقضی شده'
    };
    return labels[status] || 'نامشخص';
  };

  const getStatusColor = (status) => {
    const colors = {
      0: '#FF9800',      // نارنجی - در انتظار
      1: '#2196F3',      // آبی - در حال پردازش
      2: '#4CAF50',      // سبز - انجام شده
      3: '#F44336',      // قرمز - لغو شده توسط کاربر
      4: '#F44336',      // قرمز - لغو شده توسط تکنسین
      5: '#F44336',      // قرمز - لغو شده توسط ادمین
      6: '#9E9E9E'       // خاکستری - منقضی شده
    };
    return colors[status] || '#9E9E9E';
  };

  const formatSendToLoop = (sendToLoop) => {
    if (!sendToLoop) {
      return '-';
    }
    return formatDateTime(sendToLoop);
  };

  const formatPrice = (price) => {
    if (!price || price === 0) {
      return '-';
    }
    return price.toLocaleString() + ' تومان';
  };

  const getFinalPrice = (order) => {
    if (order.technician_price && order.technician_price > 0) {
      return order.technician_price;
    }
    return order.pakar_price || 0;
  };

  const renderOrderCard = (order) => (
    <View key={order.id} style={styles.orderCard}>
      {/* شماره سفارش */}
      <View style={styles.cardSection}>
        <Text style={styles.orderIdText}>سفارش #{order.id}</Text>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* اطلاعات کاربر */}
      <View style={styles.cardSection}>
        <Text style={styles.customerName}>
          {order.customer?.name || ''} {order.customer?.last_name || ''}
        </Text>
        <Text style={styles.customerPhone}>{order.customer?.phone || '-'}</Text>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* آدرس */}
      <View style={styles.cardSection}>
        <Text style={styles.addressText}>
          {order.address?.city || ''}{order.address?.city && order.address?.region ? '، ' : ''}
          {order.address?.region ? `منطقه ${order.address.region}` : ''}
          {(order.address?.city || order.address?.region) && order.address?.address ? ' - ' : ''}
          {order.address?.address || 'آدرس نامشخص'}
        </Text>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* دسته‌بندی */}
      <View style={styles.cardSection}>
        <Text style={styles.categoryText}>{order.category?.title || order.category?.name || 'دسته‌بندی نامشخص'}</Text>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* وضعیت */}
      <View style={styles.cardSection}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>وضعیت: </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* ارسال به لوپ */}
      <View style={styles.cardSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>اعزام به لوپ: </Text>
          <Text style={styles.infoValue}>{formatSendToLoop(order.send_to_loop)}</Text>
        </View>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* قیمت نهایی */}
      <View style={styles.cardSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>قیمت نهایی: </Text>
          <Text style={styles.priceValue}>{formatPrice(getFinalPrice(order))}</Text>
        </View>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* هزینه اضافی */}
      <View style={styles.cardSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>هزینه مازاد: </Text>
          <Text style={styles.priceValue}>{formatPrice(order.extra_price)}</Text>
        </View>
      </View>

      {/* دکمه جزئیات */}
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => navigation.navigate('OrderDetailScreen', { orderId: order.id })}
      >
        <Text style={styles.detailsButtonText}>مشاهده جزئیات</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => {
    const filters = [
      { label: 'همه', value: null },
      { label: 'در انتظار', value: 0 },
      { label: 'در حال پردازش', value: 1 },
      { label: 'انجام شده', value: 2 },
      { label: 'لغو کاربر', value: 3 },
      { label: 'لغو تکنسین', value: 4 },
      { label: 'لغو ادمین', value: 5 },
      { label: 'منقضی شده', value: 6 },
    ];

    return (
      <View style={styles.filterContainer}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.label}
          renderItem={({ item: filter }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedStatus === filter.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyText}>سرویسی یافت نشد</Text>
    </View>
  );

  const renderFooter = () => {
    if (!pagination || pagination.total === 0) return null;
    
    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            صفحه {pagination.current_page} از {pagination.last_page}
          </Text>
          <Text style={styles.paginationText}>
            مجموع: {pagination.total} سفارش
          </Text>
        </View>
        
        {pagination.last_page > 1 && (
          <View style={styles.paginationButtons}>
            <TouchableOpacity
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled
              ]}
              onPress={handlePrevPage}
              disabled={currentPage === 1}
            >
              <Text style={[
                styles.pageButtonText,
                currentPage === 1 && styles.pageButtonTextDisabled
              ]}>صفحه قبل</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.pageButton,
                currentPage === pagination.last_page && styles.pageButtonDisabled
              ]}
              onPress={handleNextPage}
              disabled={currentPage === pagination.last_page}
            >
              <Text style={[
                styles.pageButtonText,
                currentPage === pagination.last_page && styles.pageButtonTextDisabled
              ]}>صفحه بعد</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#7FDBFF', '#0074D9', '#001f3f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders
        title={'سرویس های من'}
        onPressLeft={() => navigation.navigate('FolderScreen')}
        onPressRight={() => navigation.navigate('UserInfoScreen')}
      />
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
        {/* فیلترها */} 
        {renderFilters()}

        {/* لیست سفارشات */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>در حال بارگذاری...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderOrderCard(item)}
            contentContainerStyle={styles.container}
            ListEmptyComponent={renderEmptyComponent}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#fff"
                colors={['#fff']}
              />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 15,
    paddingBottom: 100,
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
  
  // فیلترها
  filterContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#0074D9',
  },

  // کارت سفارش
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSection: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0074D9',
    textAlign: 'right',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    direction: 'ltr',
  },
  addressText: {
    fontSize: 13,
    color: '#555',
    textAlign: 'right',
    lineHeight: 20,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  detailsButton: {
    backgroundColor: '#0074D9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Pagination
  paginationContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  paginationInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  paginationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paginationButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 15,
  },
  pageButton: {
    backgroundColor: '#0074D9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  pageButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pageButtonTextDisabled: {
    color: '#999',
  },
});
