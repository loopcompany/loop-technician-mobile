import React, { useEffect, useState,useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import NewStyles from '../styles/NewStyles';
import CustomStatusBar from '../components/CustomStatusBar';
import { themeColor0, themeColor4, themeColor6, themeColor10, themeColor13, themeColor7, themeColor3, themeColor11 } from '../theme/Color';
import { getOrganizationOrders } from '../services/Api';
import { formatDate, showAlert } from '../helpers/Common';
import { Ionicons } from '@expo/vector-icons';
import { useFooter } from '../contexts/FooterProvider';
import ScreenHeaders from '../components/ScreenHeaders';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../styles/NewStyles';
export default function OrganizationOrdersScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { FooterComponent } = useFooter();
    const { organizationId, organizationName } = route.params;
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const alertButtons = Platform.OS === 'web' ? undefined : [{ text: t('Ok'), style: 'default' }];

    useEffect(() => {
        fetchOrders();
    }, [organizationId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const result = await getOrganizationOrders(organizationId);

            if (result.success && result.data) {
                setOrders(result.data.orders || []);
                setTotal(result.data.total || 0);
            } else {
                showAlert(t('Error'), result.message || t('Error fetching orders'), alertButtons);
            }
        } catch (error) {
            console.log('❌ خطا در دریافت سفارشات:', error);
            showAlert(t('Error'), t('Error communicating with server'), alertButtons);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    const getStatusText = (status) => {
        const statusMap = {
            0: t('Pending'),
            1: t('Processing'),
            2: t('Completed'),
            3: t('Canceled by user'),
            4: t('Canceled by technician'),
            5: t('Canceled by admin'),
            6: t('Expired'),
        };
        return statusMap[status] || t('Unknown');
    };

    const getStatusColor = (status) => {
        const colorMap = {
            0: themeColor11.bgColor(1), // در انتظار - نارنجی
            1: themeColor0.bgColor(1), // در حال انجام - آبی
            2: themeColor7.bgColor(1), // انجام شده - سبز
            3: themeColor3.bgColor(0.5), // لغو - خاکستری
            4: themeColor10.bgColor(0.5),
            5: themeColor10.bgColor(0.5),
            6: themeColor10.bgColor(0.3), // منقضی - خاکستری روشن
        };
        return colorMap[status] || themeColor10.bgColor(0.5);
    };

    const formatPrice = (price) => {
        if (!price) return '0';
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleOrderPress = (order) => {
        // Navigate to order detail screen if needed
        navigation.navigate('OrderDetailScreen', { orderId: order.id })
        // navigation.navigate('OrderDetailScreen', { orderId: order.id });
    };

    const renderOrderItem = ({ item }) => {
        // تبدیل به number برای محاسبه صحیح
        const pakarPrice = Number(item.pakar_price) || 0;
        const technicianPrice = Number(item.technician_price) || 0;
        const extraPrice = Number(item.extra_price) || 0;
        const discountPrice = Number(item.discount_price) || 0;

        const totalPrice = pakarPrice + technicianPrice + extraPrice - discountPrice;

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => handleOrderPress(item)}
            >
                {/* Header: Category and Status */}
                <View style={styles.orderHeader}>
                    <View style={styles.categoryContainer}>
                        <Ionicons name="construct-outline" size={16} color={themeColor6.bgColor(1)} />
                        <Text style={styles.categoryText}>{item.category?.name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                </View>

                {/* Order Info */}
                <View style={styles.orderInfo}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color={themeColor10.bgColor(0.7)} />
                        <Text style={styles.infoText}>{formatDate(item.date)} | {item.time}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color={themeColor10.bgColor(0.7)} />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {item.user_address?.city}, {item.user_address?.region}
                        </Text>
                    </View>

                    {item.des && (
                        <View style={styles.infoRow}>
                            <Ionicons name="document-text-outline" size={14} color={themeColor10.bgColor(0.7)} />
                            <Text style={styles.infoText} numberOfLines={2}>
                                {item.des}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Footer: Price and Urgent Badge */}
                <View style={styles.orderFooter}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>{t('Total Price:')}</Text>
                        <Text style={styles.priceValue}>{formatPrice(totalPrice)} {t('Tomans')}</Text>
                    </View>
                    {item.is_urgent === 1 && (
                        <View style={styles.urgentBadge}>
                            <Ionicons name="flash" size={12} color={themeColor0.bgColor(1)} />
                            <Text style={styles.urgentText}>{t('Urgent')}</Text>
                        </View>
                    )}
                </View>

                {/* Payment Status */}
                {item.payment_status === 1 && (
                    <View style={styles.paymentBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={themeColor3.bgColor(1)} />
                        <Text style={styles.paymentText}>{t('Paid')}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color={themeColor10.bgColor(0.3)} />
            <Text style={styles.emptyText}>{t('No orders found for this organization')}</Text>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={NewStyles.wrapper} edges={{ top: 'off', bottom: 'additive' }}>
                <CustomStatusBar />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColor6.bgColor(1)} />
                    <Text style={styles.loadingText}>{t('Loading...')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={NewStyles.wrapper} edges={{ top: 'off', bottom: 'additive' }}>

            <CustomStatusBar />

            {/* Header */}
      
            <ScreenHeaders
                title={organizationName}
            />
            <FlatList
                data={orders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[themeColor6.bgColor(1)]}
                    />
                }
            />

        </SafeAreaView>
    );
}

const createLocalStyles = (NewStyles) =>  StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
    },
    loadingText: {
        ...NewStyles.text10,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: themeColor13.bgColor(1),
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        ...NewStyles.title4,
        fontSize: 18,
    },
    headerSubtitle: {
        ...NewStyles.text10,
        fontSize: 13,
        color: themeColor10.bgColor(0.7),
        marginTop: 2,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: themeColor4.bgColor(1),
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        ...NewStyles.shadow,
    },
    orderHeader: {
        ...NewStyles.rowWrapper,
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: themeColor10.bgColor(0.1),
    },
    categoryContainer: {
        ...NewStyles.row,
        gap: 6,
        flex: 1,
    },
    categoryText: {
        ...NewStyles.title4,
        fontSize: 15,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        ...NewStyles.title4,
        fontSize: 12,
    },
    orderInfo: {
        gap: 8,
        marginBottom: 12,
    },
    infoRow: {
        ...NewStyles.row,
        gap: 8,
    },
    infoText: {
        ...NewStyles.text10,
        fontSize: 13,
        flex: 1,
        color: themeColor10.bgColor(0.8),
    },
    orderFooter: {
        ...NewStyles.rowWrapper,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: themeColor10.bgColor(0.1),
    },
    priceContainer: {
        ...NewStyles.row,
        gap: 6,
    },
    priceLabel: {
        ...NewStyles.text10,
        fontSize: 13,
        color: themeColor10.bgColor(0.7),
    },
    priceValue: {
        ...NewStyles.title4,
        fontSize: 15,
        color: themeColor6.bgColor(1),
    },
    urgentBadge: {
        ...NewStyles.row,
        gap: 4,
        backgroundColor: themeColor7.bgColor(1),
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    urgentText: {
        ...NewStyles.title,
        fontSize: 11,
    },
    paymentBadge: {
        ...NewStyles.row,
        gap: 4,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: themeColor10.bgColor(0.1),
    },
    paymentText: {
        ...NewStyles.text10,
        fontSize: 12,
        color: themeColor3.bgColor(1),
    },
    emptyContainer: {
        flex: 1,
        ...NewStyles.center,
        paddingVertical: 60,
        gap: 15,
    },
    emptyText: {
        ...NewStyles.text10,
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
        color: themeColor10.bgColor(0.6),
    },
});
