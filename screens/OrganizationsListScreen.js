import React, { useEffect, useState,useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import NewStyles from '../styles/NewStyles';
import CustomStatusBar from '../components/CustomStatusBar';
import { themeColor0, themeColor4, themeColor6, themeColor10, themeColor13 } from '../theme/Color';
import { getOrganizationsList } from '../services/Api';
import { showAlert } from '../helpers/Common';
import { Ionicons } from '@expo/vector-icons';
import { useFooter } from '../contexts/FooterProvider';
import { uri } from '../services/URL';
import ScreenHeaders from '../components/ScreenHeaders';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../styles/NewStyles';
import {langIsRTL} from'../helpers/Common';
export default function OrganizationsListScreen() {
    const navigation = useNavigation();
    const { FooterComponent } = useFooter();
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
    const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
        const isRtl = langIsRTL(i18n.language)
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    const [stats, setStats] = useState({
        total_organization_orders: 0,
        total_organizations: 0,
    });

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const result = await getOrganizationsList();

            if (result.success && result.data) {
                console.log('📊 داده دریافتی از Backend:', JSON.stringify(result.data, null, 2));
                console.log('📋 اولین سازمان:', JSON.stringify(result.data.organizations?.[0], null, 2));
                
                setOrganizations(result.data.organizations || []);
                setStats({
                    total_organization_orders: result.data.total_organization_orders || 0,
                    total_organizations: result.data.total_organizations || 0,
                });
            } else {
                showAlert(t('Error'), result.message || t('Error fetching organizations list'));
            }
        } catch (error) {
            console.log('❌ خطا در دریافت سازمان‌ها:', error);
            showAlert(t('Error'), t('Error communicating with server'));
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrganizations();
        setRefreshing(false);
    };

    const handleOrganizationPress = (organization) => {
        navigation.navigate('OrganizationOrdersScreen', {
            organizationId: organization.organization_id,
            organizationName: organization.organization_name,
        });
    };

    const renderOrganizationItem = ({ item }) => {
        const imageUrl = item.profile_image
            ? `${uri}/storage/${item.profile_image}`
            : null;

        // محاسبه تعداد سفارشات فعال (فقط وضعیت 0 و 1)
        // وضعیت 0: در انتظار
        // وضعیت 1: در حال پردازش
        // اگر Backend فیلد active_orders_count رو برگردوند از اون استفاده می‌کنیم
        // وگرنه موقتاً از total_orders استفاده می‌کنیم
        const activeOrdersCount = item.active_orders_count !== undefined 
            ? item.active_orders_count 
            : (item.total_orders || 0);

        console.log(`🏢 ${item.organization_name}:`, {
            total_orders: item.total_orders,
            active_orders_count: item.active_orders_count,
            activeOrdersCount: activeOrdersCount
        });

        return (
            <TouchableOpacity
                style={styles.organizationCard}
                onPress={() => handleOrganizationPress(item)}
            >
                <View style={styles.cardContent}>
                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={[styles.logo, styles.defaultLogo]}>
                                <Ionicons name="business" size={32} color={themeColor10.bgColor(0.5)} />
                            </View>
                        )}
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoContainer}>
                        <Text style={[styles.organizationName, { flex: 1 }]} numberOfLines={1}>
                            {item?.organization_name}
                        </Text>

                        <View style={styles.detailsRow}>
                            <Ionicons name="call-outline" size={14} color={themeColor10.bgColor(0.7)} />
                            <Text style={styles.detailText}>{item.organization_phone}</Text>
                        </View>

                        {item.organization_code && (
                            <View style={styles.detailsRow}>
                                <Ionicons name="barcode-outline" size={14} color={themeColor10.bgColor(0.7)} />
                                <Text style={styles.detailText}>{t('Code:')} {item.organization_code}</Text>
                            </View>
                        )}
                    </View>

                    {/* Badge Section - فقط نمایش داده شود اگر سفارش فعال وجود داشته باشد */}
                    {activeOrdersCount > 0 && (
                        <View style={styles.badgeContainer}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {activeOrdersCount > 99 ? '99+' : activeOrdersCount}
                                </Text>
                            </View>
                            <Text style={styles.badgeLabel}>{t('Order')}</Text>
                        </View>
                    )}
                </View>

                {/* Arrow */}
                <Ionicons   name={isRtl ? 'chevron-back' : 'chevron-forward'} size={20} color={themeColor10.bgColor(0.5)} style={styles.arrow} />
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerStats}>
            <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.total_organizations}</Text>
                <Text style={styles.statLabel}>{t('Organization')}</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.total_organization_orders}</Text>
                <Text style={styles.statLabel}>{t('Total orders')}</Text>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={80} color={themeColor10.bgColor(0.3)} />
            <Text style={styles.emptyText}>{t('You have not received any orders from organizations yet')}</Text>
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
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <ScreenHeaders title={t('Organization / Company')} />

            <FlatList
                data={organizations}
                renderItem={renderOrganizationItem}
                keyExtractor={(item) => item.organization_id.toString()}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={organizations.length > 0 ? renderHeader : null}
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

const createLocalStyles = (NewStyles) => StyleSheet.create({
    loadingContainer: {
        flex: 1,
        ...NewStyles.center,
        gap: 15,
    },
    loadingText: {
        ...NewStyles.text10,
        fontSize: 16,
    },
    header: {
        ...NewStyles.rowWrapper,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: themeColor13.bgColor(1),
    },
    backButton: {
        width: 40,
        height: 40,
        ...NewStyles.center,
    },
    headerTitle: {
        ...NewStyles.title4,
        fontSize: 18,
    },
    headerStats: {
        ...NewStyles.rowWrapper,
        paddingVertical: 20,
        marginBottom: 10,
        gap: 15,
        maxWidth: 800,
        alignSelf: 'center',
        width:'100%'
    },
    statBox: {
        flex: 1,
        backgroundColor: themeColor4.bgColor(1),
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        ...NewStyles.shadow,
    },
    statNumber: {
        ...NewStyles.title4,
        fontSize: 28,
        color: themeColor6.bgColor(1),
        marginBottom: 5,
    },
    statLabel: {
        ...NewStyles.text10,
        fontSize: 14,
        color: themeColor10.bgColor(0.7),
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 130,
    },
    organizationCard: {
        backgroundColor: themeColor4.bgColor(1),
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        width: '100%',
        ...NewStyles.shadow,
        ...NewStyles.row,
        maxWidth: 800,
        alignSelf: 'center',
    },
    cardContent: {
        flex: 1,
        ...NewStyles.row,
    },
    logoContainer: {
        marginLeft: 15,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: themeColor10.bgColor(0.05),
    },
    defaultLogo: {
        ...NewStyles.center,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
    },
    organizationName: {
        ...NewStyles.title,
        fontSize: 16,
        marginBottom: 8,
    },
    detailsRow: {
        ...NewStyles.row,
        gap: 6,
        marginBottom: 4,
    },
    detailText: {
        ...NewStyles.text10,
        fontSize: 13,
        color: themeColor10.bgColor(0.7),
    },
    badgeContainer: {
        alignItems: 'center',
        marginRight: 10,
    },
    badge: {
        backgroundColor: themeColor6.bgColor(1),
        borderRadius: 20,
        minWidth: 40,
        height: 40,
        paddingHorizontal: 8,
        ...NewStyles.center,
    },
    badgeText: {
        ...NewStyles.text4,
        fontSize: 14,
        fontWeight: 'bold',
    },
    badgeLabel: {
        ...NewStyles.text10,
        fontSize: 11,
        color: themeColor10.bgColor(0.6),
    },
    arrow: {
        marginRight: 5,
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
