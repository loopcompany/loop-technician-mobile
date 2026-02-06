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
import { themeColor0, themeColor10, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import { getTechnicianOrders } from '../../services/Api';
import { showToastOrAlert ,formatDateTime, formatPrice } from '../../helpers/Common';
import BlankScreen from '../../components/BlankScreen';
import Button from '../../components/Button';

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
      console.log('Error fetching orders:', error);
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
      0: 'بررسی',
      1: 'در حال پردازش',
      2: 'انجام شده',
      3: 'لغو شده توسط کاربر',
      4: 'لغو شده توسط تکنسین',
      5: 'لغو شده توسط ادمین'
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


  const getFinalPrice = (order) => {
    if (order.technician_price && order.technician_price > 0) {
      return order.technician_price;
    }
    return order.pakar_price || 0;
  };

  const renderOrderCard = (order) => (
    <View key={order.id} style={[styles.orderCard, NewStyles.shadow, NewStyles.border10]}>
      {/* شماره سفارش */}
      <View style={styles.cardSection}>
        <Text style={NewStyles.title}>سفارش #{order.id}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardSection}>
        <Text style={NewStyles.text10}>
          {order.customer?.name || ''} {order.customer?.last_name || ''}
        </Text>
        <Text style={NewStyles.text10}>{order.customer?.phone || '-'}</Text>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* آدرس */}
      <View style={styles.cardSection}>
        <Text style={NewStyles.text10}>
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
        <Text style={NewStyles.text10}>{order.category?.title || order.category?.name || 'دسته‌بندی نامشخص'}</Text>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* وضعیت */}
      <View style={styles.cardSection}>
        <View style={[NewStyles.row]}>
          <Text style={NewStyles.text10}>وضعیت: </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={NewStyles.text4}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* ارسال به لوپ */}
      <View style={styles.cardSection}>
        <View style={[NewStyles.row]}>
          <Text style={NewStyles.text10}>اعزام به لوپ: </Text>
          <Text style={NewStyles.text10}>{formatSendToLoop(order.send_to_loop)}</Text>
        </View>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* قیمت نهایی */}
      <View style={styles.cardSection}>
        <View style={[NewStyles.row]}>
          <Text style={NewStyles.text10}>قیمت نهایی: </Text>
          <Text style={NewStyles.text7}>{formatPrice(getFinalPrice(order))}</Text>
        </View>
      </View>

      {/* خط جداکننده */}
      <View style={styles.divider} />

      {/* هزینه اضافی */}
      <View style={styles.cardSection}>
        <View style={[NewStyles.row]}>
          <Text style={NewStyles.text10}>هزینه مازاد: </Text>
          <Text style={NewStyles.text7}>{formatPrice(order.extra_price)}</Text>
        </View>
      </View>

      {/* دکمه جزئیات */}
      
      <Button title="مشاهده جزئیات" onPress={() => navigation.navigate('OrderDetailScreen', { orderId: order.id })}/>
    </View>
  );

  const renderFilters = () => {
    const filters = [
      { label: 'همه', value: null },
      { label: 'بررسی', value: '0' },
      { label: 'در حال پردازش', value: '1' },
      { label: 'انجام شده', value: '2' },
      { label: 'لغو کاربر', value: '3' },
      { label: 'لغو تکنسین', value: '4' },
      { label: 'لغو ادمین', value: '5' },
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
                selectedStatus == filter.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(filter.value)}
            >
              <Text
                style={[
                  NewStyles.text4,
                  selectedStatus === filter.value && NewStyles.text,
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



  const renderFooter = () => {
    if (!pagination || pagination.total === 0) return null;

    return (
      <View style={styles.paginationContainer}>
        <View style={[styles.paginationInfo, NewStyles.rowWrapper]}>
          <Text style={NewStyles.text4}>
            صفحه {pagination.current_page} از {pagination.last_page}
          </Text>
          <Text style={NewStyles.title4}>
            مجموع: {pagination.total} سفارش
          </Text>
        </View>

        {pagination.last_page > 1 && (
          <View style={[NewStyles.rowWrapper]}>

            <View style={{ flex: 1 }}>
              <Button title={'صفحه قبل'} onPress={handlePrevPage} disabled={currentPage === 1} textStyle={[currentPage === 1 && NewStyles.title]} style={[currentPage === 1 && styles.pageButtonDisabled]} />
            </View>

            <View style={{ flex: 1 }}>
              <Button title={'صفحه بعد'} onPress={handleNextPage} disabled={currentPage === pagination.last_page} textStyle={[currentPage === pagination.last_page && NewStyles.text]} style={[currentPage === pagination.last_page && styles.pageButtonDisabled]} />
            </View>


          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
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
          {/* فیلترها */}
          {renderFilters()}

          {/* لیست سفارشات */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={themeColor4.bgColor(1)} />
              <Text style={NewStyles.text4}>در حال بارگذاری...</Text>
            </View>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderOrderCard(item)}
              contentContainerStyle={[styles.container, orders.length === 0 && { flex: 1 }]}
              ListEmptyComponent={() => {
                return (
                  <BlankScreen title='سرویسی یافت نشد' />
                )
              }}
              ListFooterComponent={renderFooter}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}

                />
              }
            />
          )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 15,
    gap:15
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
 

  // فیلترها
  filterContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: themeColor10.bgColor(0.1),
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: themeColor3.bgColor(0.2),
    borderWidth: 1,
    borderColor: themeColor4.bgColor(0.5),
  },
  filterButtonActive: {
    backgroundColor: themeColor4.bgColor(1),
  },
 

  // کارت سفارش
  orderCard: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 15,
  },
  cardSection: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: themeColor3.bgColor(0.2),
    marginVertical: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
 
 
  // Pagination
  paginationContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  paginationInfo: {
    marginBottom: 15,
  },
  pageButtonDisabled: {
    backgroundColor: themeColor3.bgColor(1),
  },
});
