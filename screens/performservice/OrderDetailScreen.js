import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SectionList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color';
import { getTechnicianOrderById } from '../../services/Api';
import { showToastOrAlert, formatDate, formatDateTime, formatPrice } from '../../helpers/Common';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route?.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderDetails = async () => {
    if (!orderId) {
      showToastOrAlert('شناسه سفارش یافت نشد');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📋 Fetching order details for orderId:', orderId);
      const result = await getTechnicianOrderById(orderId);
      
      console.log('📦 API Result:', result);
      if (result.success) {
        setData(result.data);
      } else {
        showToastOrAlert(result.message || 'خطا در دریافت جزئیات سفارش');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      showToastOrAlert('خطا در دریافت جزئیات سفارش');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        fetchOrderDetails();
      }
    }, [orderId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
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
      0: '#FF9800',
      1: '#2196F3',
      2: '#4CAF50',
      3: '#F44336',
      4: '#F44336',
      5: '#F44336',
      6: '#9E9E9E'
    };
    return colors[status] || '#9E9E9E';
  };

  const renderRow = (label, value, labelStyle, valueStyle) => (
    <View style={NewStyles.rowWrapper}>
      <Text style={[NewStyles.text, labelStyle]}>{label}</Text>
      <Text style={[NewStyles.text10, valueStyle]}>{value}</Text>
    </View>
  );

  const calculateTotalPrice = () => {
    if (!data) return 0;
    const basePrice = Number(data?.technician_price || data?.pakar_price || 0);
    const extraPrice = Number(data?.extra_price || 0);
    const discountPrice = Number(data?.discount_price || 0);
    return basePrice + extraPrice - discountPrice;
  };

  const calculateTotalWithoutDiscount = () => {
    if (!data) return 0;
    const basePrice = Number(data?.technician_price || data?.pakar_price || 0);
    const extraPrice = Number(data?.extra_price || 0);
    return basePrice + extraPrice;
  };

  if (loading && !data) {
    return (
      <LinearGradient
        colors={['#7FDBFF', '#0074D9', '#001f3f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={'جزئیات سفارش'}
          onPressLeft={() => navigation.goBack()}
          onPressRight={() => navigation.navigate('UserInfoScreen')}
        />
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>در حال بارگذاری...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!data) {
    return (
      <LinearGradient
        colors={['#7FDBFF', '#0074D9', '#001f3f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={'جزئیات سفارش'}
          onPressLeft={() => navigation.goBack()}
          onPressRight={() => navigation.navigate('UserInfoScreen')}
        />
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>سفارش یافت نشد</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const totalPrice = calculateTotalWithoutDiscount();
  const totalDiscountedPrice = calculateTotalPrice();

  return (
    <LinearGradient
      colors={['#7FDBFF', '#0074D9', '#001f3f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders
        title={'جزئیات سفارش'}
        onPressLeft={() => navigation.goBack()}
        onPressRight={() => navigation.navigate('UserInfoScreen')}
      />
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={['#fff']}
            />
          }
        >
          {/* Order Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[NewStyles.row, { gap: 5 }]}>
                <Ionicons name="newspaper-outline" size={24} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.title}>جزئیات سفارش - شناسه: {data?.id}</Text>
              </View>
              <Text style={NewStyles.text3}>{data?.category?.title || data?.category?.name}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.cardContent}>
              {renderRow('زمان مراجعه تکنسین', data?.is_urgent > 0 ? 'درخواست فوری' : `${formatDate(data?.date)} ساعت ${data?.time?.split(':')?.slice(0, 2)?.join(':')}`, NewStyles.text, data?.is_urgent > 0 && NewStyles.title6)}
              {renderRow('زمان ثبت سفارش', formatDateTime(data?.created_at))}
              
              {Number(data?.category?.has_gender) > 0 && renderRow(
                'جنسیت و تعداد تکنسینین',
                (() => {
                  const male = Number(data.male_count) || 0;
                  const female = Number(data.female_count) || 0;
                  const unspecified = Number(data.unspecified_count) || 0;
                  const total = male + female + unspecified;

                  if (total === 0) return 'مشخص نشده';

                  let details = [];
                  if (male > 0) details.push(`${male} آقا`);
                  if (female > 0) details.push(`${female} خانم`);

                  return `${total} تکنسین` + (details.length > 0 ? ` (${details.join(' ')} الزامی)` : '');
                })()
              )}

              {data?.status == 1 && renderRow('وضعیت سفارش', data?.started_at ? 'در حال انجام' : data?.arrived_at ? 'تکنسین به محل سفارش رسید' : data?.set_off_at ? 'تکنسین در راه است' : 'جاری', NewStyles.text, NewStyles.text7)}
              
              {renderRow((Number(data?.is_fixed) == 1) ? 'مبلغ قطعی لوپ' : 'مبلغ پایه لوپ', data?.pakar_price > 0 ? `${formatPrice(data?.pakar_price)} تومان` : 'نیاز به بررسی')}
              {(data?.technician_price > 0 && Number(data?.is_fixed) == 0) && renderRow('مبلغ نهایی تکنسین', `${formatPrice(data?.technician_price)} تومان`)}
              {data?.extra_price > 0 && renderRow('مبلغ خدمات مازاد', `${formatPrice(data?.extra_price)} تومان`)}
              {data?.discount_price > 0 && renderRow('مبلغ تخفیف', `${formatPrice(data?.discount_price)} تومان`)}
              {totalPrice > totalDiscountedPrice && renderRow('مبلغ نهایی بدون تخفیف', `${formatPrice(totalPrice)} تومان`, NewStyles.text, [NewStyles.text10, { textDecorationLine: 'line-through' }])}
              {data?.status > 0 && renderRow('مبلغ قابل پرداخت', `${formatPrice(totalDiscountedPrice)} تومان`)}

              <View style={styles.separator} />

              <View style={NewStyles.rowWrapper}>
                <Text style={[NewStyles.text]}>وضعیت پرداخت</Text>
                <View style={[styles.paymentBadge, { backgroundColor: data?.payment_status > 0 ? themeColor7.bgColor(1) : themeColor6.bgColor(1) }]}>
                  <Text style={NewStyles.text4}>{data?.payment_status > 0 ? 'پرداخت شده' : 'پرداخت نشده'}</Text>
                </View>
              </View>

              <View style={NewStyles.rowWrapper}>
                <Text style={[NewStyles.text]}>وضعیت سفارش</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data?.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(data?.status)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Address Card */}
          {data?.address && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                  <Ionicons name="locate" size={24} color={themeColor0.bgColor(1)} />
                  <Text style={NewStyles.title}>محل سفارش</Text>
                </View>
              </View>

              <View style={styles.addressItem}>
                <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                <View style={{ flex: 1 }}>
                  <Text style={[NewStyles.text10, { flex: 1 }]}>
                    {data?.address?.city} - منطقه {data?.address?.region} - {data?.address?.address}
                  </Text>
                  {data?.address?.phone && (
                    <Text style={[NewStyles.text10, { flex: 1, marginTop: 5 }]}>
                      تلفن: {data?.address?.phone}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Order Details Sections */}
          {data?.order_details && data?.order_details?.length > 0 && (
            <View style={styles.card}>
              <SectionList
                scrollEnabled={false}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                sections={data?.order_details || []}
                keyExtractor={(item, index) => item?.id + index}
                renderSectionHeader={({ section }) => (
                  <View style={styles.sectionHeader}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                      <Ionicons name={section?.icon_name || 'list'} size={24} color={themeColor0.bgColor(1)} />
                      <Text style={NewStyles.title}>{section?.title}</Text>
                    </View>
                  </View>
                )}
                SectionSeparatorComponent={() => <View style={{ paddingVertical: 5 }} />}
                renderItem={({ item }) => (
                  <View style={styles.detailItem}>
                    <View style={NewStyles.rowWrapper}>
                      <View style={[NewStyles.rowWrapper, { justifyContent: 'flex-end', flex: 2, gap: 5 }]}>
                        <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                        {item?.type == 'input' ? (
                          <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.field_detail?.second_title}</Text>
                        ) : (
                          <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.field_detail?.title}</Text>
                        )}
                      </View>
                      {(item?.field_detail?.has_counter >= 1 && item?.type != 'input') && (
                        <Text style={[NewStyles.text10, { flex: 1, textAlign: 'auto' }]}>{item?.value}</Text>
                      )}
                    </View>
                    {(item?.field_detail?.has_counter >= 1 && item?.type == 'input') && (
                      <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.value}</Text>
                    )}
                  </View>
                )}
              />
            </View>
          )}

          {/* User Description */}
          {data?.des && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                  <Ionicons name="create-outline" size={24} color={themeColor0.bgColor(1)} />
                  <Text style={NewStyles.title}>توضیحات کاربر</Text>
                </View>
              </View>

              <View style={styles.descriptionItem}>
                <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.des}</Text>
              </View>
            </View>
          )}

          {/* Technician Description */}
          {data?.technician_des && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                  <Ionicons name="create-outline" size={24} color={themeColor0.bgColor(1)} />
                  <Text style={NewStyles.title}>توضیحات تکنسین</Text>
                </View>
              </View>

              <View style={styles.descriptionItem}>
                <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.technician_des}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: {
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
  card: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 15,
    backgroundColor: themeColor3.bgColor(0.2),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    gap: 10,
  },
  cardContent: {
    padding: 15,
    gap: 10,
  },
  separator: {
    height: 1,
    backgroundColor: themeColor3.bgColor(0.2),
    marginVertical: 10,
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
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
  sectionHeader: {
    padding: 15,
    paddingBottom: 10,
  },
  addressItem: {
    flexDirection: 'row-reverse',
    backgroundColor: themeColor5.bgColor(1),
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    gap: 10,
  },
  detailItem: {
    backgroundColor: themeColor5.bgColor(1),
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 5,
    borderRadius: 10,
    gap: 10,
  },
  descriptionItem: {
    flexDirection: 'row-reverse',
    backgroundColor: themeColor5.bgColor(1),
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    gap: 10,
  },
});
