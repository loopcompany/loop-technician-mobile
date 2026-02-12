import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import MapView, { Marker } from 'react-native-maps'
import NewStyles from '../../styles/NewStyles'
import { Ionicons } from '@expo/vector-icons'
import { themeColor0, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color'
import { formatDate, formatDateTime, formatPrice } from '../../helpers/Common'
import { imageUri, mainUri } from '../../services/URL'
import { createStyles } from '../../styles/NewStyles';
import { useSelector } from 'react-redux';
const DetailConponent = ({ data, renderRow, }) => {
    const user = useSelector((state) => state?.user?.data?.data?.technician);
    useEffect(() => {
        console.log("USER CHANGED:", user);
    }, [user]);
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
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
            0: t("Pending"),
            1: t("Processing"),
            2: t("Completed"),
            3: t("Canceled by user"),
            4: t("Canceled by technician"),
            5: t("Canceled by admin"),
            6: t("Expired")
        };
        return labels[status] || t("Unknown");
    };

    const totalPrice = calculateTotalWithoutDiscount();
    const totalDiscountedPrice = calculateTotalPrice();

    return (
        <View>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name="newspaper-outline" size={24} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>{t("Order details - ID: {{id}}", { id: data?.id })}</Text>
                    </View>
                    <Text style={NewStyles.text3}>{data?.category?.title || data?.category?.name}</Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.cardContent}>
                    {/* نمایش تاریخ و زمان معمولی فقط اگر سفارش سازمانی نباشد */}
                    {!data?.service_schedule_type && renderRow(t("Technician Visit Time"), data?.is_urgent > 0 ? t("Urgent Request") : t("{{date}} at {{time}}", { date: formatDate(data?.date), time: data?.time?.split(':')?.slice(0, 2)?.join(':') }), NewStyles.text, data?.is_urgent > 0 && NewStyles.title6)}
                    {renderRow(t("Order registration time"), formatDateTime(data?.created_at))}

                    {Number(data?.category?.has_gender) > 0 && (
                        renderRow(
                            t("Technician Gender"),
                            (() => {
                                const male = Number(data.male_count) || 0;
                                const female = Number(data.female_count) || 0;
                                const unspecified = Number(data.unspecified_count) || 0;
                                const total = male + female + unspecified;

                                if (total === 0) return t("Not Specified");

                                let details = [];
                                if (male > 0) details.push(t("Male"));
                                if (female > 0) details.push(t("Female"));

                                return (details.length > 0 ? `${details.join(' ')}` : '');
                            })()
                        )
                    )}

                    {data?.status == 1 && renderRow(t("Order Status"), data?.started_at ? t("In progress") : data?.arrived_at ? t("Technician arrived at order location") : data?.set_off_at ? t("Technician is on the way") : t("Active"), NewStyles.text, NewStyles.text7)}

                    {user?.apple_check != 1 && (
                        <>
                            {renderRow(
                                (Number(data?.is_fixed) == 1) ? t("Loop Fixed Amount") : t("Loop Base Amount"),
                                data?.pakar_price > 0 ? `${formatPrice(data?.pakar_price)}${t(" Toman")}` : t("Needs Review")
                            )}

                            {(data?.technician_price > 0 && Number(data?.is_fixed) == 0) &&
                                renderRow(t("Technician final amount"), `${formatPrice(data?.technician_price)}${t(" Toman")}`)}

                            {data?.extra_price > 0 &&
                                renderRow(t("Extra service amount"), `${formatPrice(data?.extra_price)}${t(" Toman")}`)}

                            {data?.discount_price > 0 &&
                                renderRow(t("Discount amount"), `${formatPrice(data?.discount_price)}${t(" Toman")}`)}

                            {totalPrice > totalDiscountedPrice &&
                                renderRow(
                                    t("Final amount without discount"),
                                    `${formatPrice(totalPrice)}${t(" Toman")}`,
                                    NewStyles.text,
                                    [NewStyles.text10, { textDecorationLine: 'line-through' }]
                                )}

                            {data?.status > 0 &&
                                renderRow(t("Payable amount"), `${formatPrice(totalDiscountedPrice)}${t(" Toman")}`)}
                        </>
                    )}


                    <View style={styles.separator} />

                    {user?.apple_check == 1
                        ? null
                        : <View style={NewStyles.rowWrapper}>
                            <Text style={[NewStyles.text]}>{t("Payment Status")}</Text>
                            <View style={[styles.paymentBadge, { backgroundColor: data?.payment_status > 0 ? themeColor7.bgColor(1) : themeColor6.bgColor(1) }]}>
                                <Text style={NewStyles.text4}>{data?.payment_status > 0 ? t("Paid") : t("Unpaid")}</Text>
                            </View>
                        </View>}

                    <View style={NewStyles.rowWrapper}>
                        <Text style={[NewStyles.text]}>{t("Order Status")}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data?.status) }]}>
                            <Text style={[NewStyles.text4, styles.statusText]}>{getStatusLabel(data?.status)}</Text>
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
                            <Text style={NewStyles.title}>{t("Organization service information")}</Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.cardContent}>
                        {renderRow(t("Schedule type"),
                            data?.service_schedule_type === 'long_term' ? t("Long term") :
                                data?.service_schedule_type === 'short_term' ? t("Short term") : t("Unknown"),
                            NewStyles.text,
                            data?.service_schedule_type === 'long_term' ? NewStyles.title7 : NewStyles.title6
                        )}

                        {/* اطلاعات سرویس بلندمدت */}
                        {data?.service_schedule_type === 'long_term' && (
                            <>
                                {data?.service_schedule_long_duration && renderRow(t("Contract duration"), t("{{count}} months", { count: data?.service_schedule_long_duration }))}
                                {data?.service_schedule_long_date && renderRow(t("Start date"), formatDate(data?.service_schedule_long_date))}
                                {data?.service_schedule_long_time && renderRow(t("Service time"), data?.service_schedule_long_time?.split(':')?.slice(0, 2)?.join(':'))}
                                {data?.service_schedule_long_file && (
                                    <TouchableOpacity
                                        style={styles.contractButton}
                                        onPress={() => {
                                            const fileUrl = `${mainUri}/storage/${data?.service_schedule_long_file}`;
                                            Linking.openURL(fileUrl).catch(err => console.log('خطا در باز کردن فایل:', err));
                                        }}
                                    >
                                        <Ionicons name="document-text" size={20} color={themeColor0.bgColor(1)} />
                                        <Text style={styles.contractButtonText}>{t("View contract")}</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}

                        {/* اطلاعات سرویس کوتاه‌مدت */}
                        {data?.service_schedule_type == 'short_term' && (
                            <>
                                {data?.service_schedule_short_date && renderRow(t("Service date"), formatDate(data?.service_schedule_short_date))}
                                {data?.service_schedule_short_time && renderRow(t("Service time"), data?.service_schedule_short_time?.split(':')?.slice(0, 2)?.join(':'))}
                                {data?.service_schedule_short_file && (
                                    <TouchableOpacity
                                        style={styles.contractButton}
                                        onPress={() => {
                                            const fileUrl = `${mainUri}/storage/${data?.service_schedule_short_file}`;
                                            Linking.openURL(fileUrl).catch(err => console.log('خطا در باز کردن فایل:', err));
                                        }}
                                    >
                                        <Ionicons name="document-text" size={20} color={themeColor0.bgColor(1)} />
                                        <Text style={styles.contractButtonText}>{t("View contract")}</Text>
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
                            <Text style={NewStyles.title}>{t("Order location")}</Text>
                        </View>
                    </View>

                    <View style={styles.addressItem}>
                        <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                        <View style={{ flex: 1 }}>
                            <Text style={[NewStyles.text10, { flex: 1 }]}>
                                {data?.user_address?.city} - {t("Region {{region}}", { region: data?.user_address?.region })} - {data?.user_address?.address}
                            </Text>
                            {data?.user_address?.phone && (
                                <Text style={[NewStyles.text10, { flex: 1, marginTop: 5 }]}>
                                    {t("Phone: {{phone}}", { phone: data?.user_address?.phone })}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* نمایش نقشه اگر latitude و longitude وجود داشته باشد */}

                    {data?.user_address?.latitude && data?.user_address?.longitude && (
                        <View style={{ padding: 15 }}>
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
                                    title={t("Order location")}
                                    description={data?.user_address?.address}
                                />
                            </MapView>

                            {/* دکمه باز کردن در نقشه */}
                            <TouchableOpacity
                                style={styles.openMapButton}
                                onPress={() => {
                                    const lat = parseFloat(data?.user_address.latitude);
                                    const lng = parseFloat(data?.user_address.longitude);
                                    const label = t("Order location");

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
                                <Text style={NewStyles.title4}>{t("Directions")}</Text>
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
                                    <Text style={[NewStyles.title, { flex: 1 }]}>{section?.title}</Text>
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
                            <Text style={NewStyles.title}>{t("User Description")}</Text>
                        </View>
                    </View>

                    <View style={styles.descriptionItem}>
                        <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.des}</Text>
                    </View>
                </View>
            )}
            {data?.image_path &&
                <Image style={[{ height: 250, margin: '5%', maxWidth: 400, resizeMode: 'contain', width: '90%', alignSelf: 'center' }, NewStyles.border10]} source={{ uri: `${imageUri}/${data?.image_path}` }} />
            }

            {/* Technician Description */}
            {data?.technician_des && (
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="create-outline" size={24} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>{t("Technician Description")}</Text>
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
                            <Text style={NewStyles.title}>{t("Loop Description")}</Text>
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

const createLocalStyles = (NewStyles) => StyleSheet.create({
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
        width: '90%',
        alignSelf: 'center',
        maxWidth: 800,
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
