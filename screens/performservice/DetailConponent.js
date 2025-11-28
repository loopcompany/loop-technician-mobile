import { SectionList, StyleSheet, Text, View, Linking, TouchableOpacity, Platform } from 'react-native'
import React from 'react'
import MapView, { Marker } from 'react-native-maps'
import NewStyles from '../../styles/NewStyles'
import { Ionicons } from '@expo/vector-icons'
import { themeColor0, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color'
import { formatDate, formatDateTime, formatPrice } from '../../helpers/Common'
import { mainUri } from '../../services/URL'

const DetailConponent = ({ data, renderRow, }) => {
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

    const totalPrice = calculateTotalWithoutDiscount();
    const totalDiscountedPrice = calculateTotalPrice();

    return (
        <View>
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
                    {/* نمایش تاریخ و زمان معمولی فقط اگر سفارش سازمانی نباشد */}
                    {!data?.service_schedule_type && renderRow('زمان مراجعه تکنسین', data?.is_urgent > 0 ? 'درخواست فوری' : `${formatDate(data?.date)} ساعت ${data?.time?.split(':')?.slice(0, 2)?.join(':')}`, NewStyles.text, data?.is_urgent > 0 && NewStyles.title6)}
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

            {/* اطلاعات سرویس سازمانی */}
            {data?.service_schedule_type && (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="business-outline" size={24} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>اطلاعات سرویس سازمانی</Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.cardContent}>
                        {renderRow('نوع زمان‌بندی', 
                            data?.service_schedule_type === 'long_term' ? 'بلندمدت' : 
                            data?.service_schedule_type === 'short_term' ? 'کوتاه‌مدت' : 'نامشخص',
                            NewStyles.text,
                            data?.service_schedule_type === 'long_term' ? NewStyles.title7 : NewStyles.title6
                        )}

                        {/* اطلاعات سرویس بلندمدت */}
                        {data?.service_schedule_type === 'long_term' && (
                            <>
                                {data?.service_schedule_long_duration && renderRow('مدت قرارداد', `${data?.service_schedule_long_duration} ماه`)}
                                {data?.service_schedule_long_date && renderRow('تاریخ شروع', formatDate(data?.service_schedule_long_date))}
                                {data?.service_schedule_long_time && renderRow('ساعت سرویس', data?.service_schedule_long_time?.split(':')?.slice(0, 2)?.join(':'))}
                                {data?.service_schedule_long_file && (
                                    <TouchableOpacity 
                                        style={styles.contractButton}
                                        onPress={() => {
                                            const fileUrl = `${mainUri}/storage/${data?.service_schedule_long_file}`;
                                            Linking.openURL(fileUrl).catch(err => console.error('خطا در باز کردن فایل:', err));
                                        }}
                                    >
                                        <Ionicons name="document-text" size={20} color={themeColor0.bgColor(1)} />
                                        <Text style={styles.contractButtonText}>مشاهده قرارداد</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                        
                        {/* اطلاعات سرویس کوتاه‌مدت */}
                        {data?.service_schedule_type == 'short_term' && (
                            <>
                                {data?.service_schedule_short_date && renderRow('تاریخ سرویس', formatDate(data?.service_schedule_short_date))}
                                {data?.service_schedule_short_time && renderRow('ساعت سرویس', data?.service_schedule_short_time?.split(':')?.slice(0, 2)?.join(':'))}
                                {data?.service_schedule_short_file && (
                                    <TouchableOpacity 
                                        style={styles.contractButton}
                                        onPress={() => {
                                            const fileUrl = `${mainUri}/storage/${data?.service_schedule_short_file}`;
                                            Linking.openURL(fileUrl).catch(err => console.error('خطا در باز کردن فایل:', err));
                                        }}
                                    >
                                        <Ionicons name="document-text" size={20} color={themeColor0.bgColor(1)} />
                                        <Text style={styles.contractButtonText}>مشاهده قرارداد</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </View>
            )}

            {data?.user_address && (
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
                                {data?.user_address?.city} - منطقه {data?.user_address?.region} - {data?.user_address?.address}
                            </Text>
                            {data?.user_address?.phone && (
                                <Text style={[NewStyles.text10, { flex: 1, marginTop: 5 }]}>
                                    تلفن: {data?.user_address?.phone}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* نمایش نقشه اگر latitude و longitude وجود داشته باشد */}
                   
                    {data?.user_address?.latitude && data?.user_address?.longitude && (
                        <View style={{ padding:15 }}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: parseFloat(data?.user_address.latitude),
                                    longitude: parseFloat(data?.user_address.longitude),
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                
                            >
                                <Marker
                                    coordinate={{
                                        latitude: parseFloat(data?.user_address.latitude),
                                        longitude: parseFloat(data?.user_address.longitude),
                                    }}
                                    title="محل سفارش"
                                    description={data?.user_address?.address}
                                />
                            </MapView>

                            {/* دکمه باز کردن در نقشه */}
                            <TouchableOpacity
                                style={styles.openMapButton}
                                onPress={() => {
                                    const lat = parseFloat(data?.user_address.latitude);
                                    const lng = parseFloat(data?.user_address.longitude);
                                    const label = 'محل سفارش';
                                    
                                    // باز کردن در Google Maps یا Apple Maps
                                    const scheme = Platform.select({
                                        ios: 'maps:0,0?q=',
                                        android: 'geo:0,0?q='
                                    });
                                    const latLng = `${lat},${lng}`;
                                    const url = Platform.select({
                                        ios: `${scheme}${label}@${latLng}`,
                                        android: `${scheme}${latLng}(${label})`
                                    });
                                    
                                    Linking.openURL(url);
                                }}
                            >
                                <Ionicons name="navigate" size={20} color="#fff" />
                                <Text style={styles.openMapButtonText}>مسیریابی</Text>
                            </TouchableOpacity>
                        </View>
                    )}
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

            {/* Loop Description */}
            {data?.loop_description && (
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="document-text-outline" size={24} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>توضیحات لوپ</Text>
                        </View>
                    </View>

                    <View style={styles.descriptionItem}>
                        <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.loop_description}</Text>
                    </View>
                </View>
            )}
        </View>
    )
}

export default DetailConponent

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: {
    paddingVertical: 15,
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
    width:'90%',
    alignSelf:'center',
    maxWidth:800,
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
  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    ...NewStyles.border10
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor0.bgColor(1),
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  openMapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor0.bgColor(1),
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 5,
    gap: 8,
  },
  contractButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
