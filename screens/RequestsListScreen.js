import React, { useState, useEffect, useCallback,useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Modal,
    ScrollView,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor10, themeColor11, themeColor2, themeColor3, themeColor4, themeColor6, themeColor7, themeColor8 } from '../theme/Color';
import { getEducationRequests, getEducationRequestById } from '../services/Api';
import { formatDate, formatDateTime , showAlert} from '../helpers/Common';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../styles/NewStyles';
export default function RequestsListScreen({ navigation }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            console.log('📋 بارگذاری لیست درخواست‌ها...');

            const response = await getEducationRequests();

            if (response.success && response.data) {
                setRequests(response.data);
                console.log(`✅ ${response.data.length} درخواست بارگذاری شد`);
            }
        } catch (error) {
            console.log('❌ خطا در بارگذاری درخواست‌ها:', error);
            showAlert(t("Error"), error.message || t("There was a problem loading the request list."));
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchRequests();
        setRefreshing(false);
    }, []);

    const getStatusBadge = (status) => {
        const statusStr = String(status);
        switch (statusStr) {
            case '0':
                return { text: t("Pending review"), color: themeColor11.bgColor(1), icon: 'time' };
            case '1':
                return { text: t("Approved"), color: themeColor7.bgColor(1), icon: 'checkmark-circle' };
            case '2':
                return { text: t("Rejected"), color: themeColor6.bgColor(1), icon: 'close-circle' };
            default:
                return { text: t("Unknown"), color: themeColor3.bgColor(1), icon: 'help-circle' };
        }
    };

    

    const handleViewDetails = async (item) => {
        try {
            setLoadingDetail(true);
            setModalVisible(true);
            console.log(`📄 نمایش جزئیات درخواست #${item.id}`);

            const response = await getEducationRequestById(item.id);

            if (response.success && response.data) {
                setSelectedRequest(response.data);
            }
        } catch (error) {
            console.log('❌ خطا در نمایش جزئیات:', error);
            setModalVisible(false);
            showAlert(t("Error"), error.message || t("There was a problem loading the details."));
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedRequest(null);
    };

    const renderItem = ({ item }) => {
        const statusBadge = getStatusBadge(item.status);

        return (
            <TouchableOpacity
                style={styles.requestCard}
                onPress={() => handleViewDetails(item)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                        <Text style={[NewStyles.title10]}>#{item.id}</Text>
                        <Text style={[NewStyles.title10]} numberOfLines={1}>
                            {item.section}
                        </Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
                        <Ionicons name={statusBadge.icon} size={16} color={themeColor4.bgColor(1)} />
                        <Text style={[NewStyles.title4, { fontSize: 12 }]}>{statusBadge.text}</Text>
                    </View>
                </View>

                <Text style={[NewStyles.text4, styles.requestDescription]} numberOfLines={3}>
                    {item.description}
                </Text>

                <View style={styles.cardFooter}>
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={14} color={themeColor10.bgColor(0.7)} />
                        <Text style={[NewStyles.text4, styles.dateText]}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => handleViewDetails(item)}
                    >
                        <Text style={[NewStyles.text]}>{t("Details")}</Text>
                        <Ionicons name="chevron-back" size={16} color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={themeColor4.bgColor(1)} />
            <Text style={[NewStyles.text4, styles.emptyText]}>{t("No requests have been submitted.")}</Text>
        </View>
    );

    const renderDetailModal = () => {
        if (!selectedRequest) return null;
        
        const statusBadge = getStatusBadge(selectedRequest.status);

        return (
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {loadingDetail ? (
                            <View style={styles.modalLoading}>
                                <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
                                <Text style={[NewStyles.text4, { marginTop: 10 }]}>{t("Loading...")}</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={[NewStyles.title, styles.modalTitle]}>
                                        {t("Request details #{{id}}", { id: selectedRequest.id })}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={closeModal}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={28} color={themeColor10.bgColor(0.8)} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLabel}>
                                            <Ionicons name="bookmarks" size={18} color={themeColor0.bgColor(1)} />
                                            <Text style={[NewStyles.text, styles.labelText]}>{t("Section:")}</Text>
                                        </View>
                                        <Text style={[NewStyles.text4, styles.detailValue]}>
                                            {selectedRequest.section}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLabel}>
                                            <Ionicons name="information-circle" size={18} color={themeColor0.bgColor(1)} />
                                            <Text style={[NewStyles.text, styles.labelText]}>{t("Status:")}</Text>
                                        </View>
                                        <View style={[styles.statusBadgeLarge, { backgroundColor: statusBadge.color }]}>
                                            <Ionicons name={statusBadge.icon} size={18} color={themeColor4.bgColor(1)} />
                                            <Text style={[NewStyles.title4]}>{statusBadge.text}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLabel}>
                                            <Ionicons name="calendar" size={18} color={themeColor0.bgColor(1)} />
                                            <Text style={[NewStyles.text, styles.labelText]}>{t("Submitted at:")}</Text>
                                        </View>
                                        <Text style={[NewStyles.text4, styles.detailValue]}>
                                            {formatDate(selectedRequest.created_at)}
                                        </Text>
                                    </View>

                                    {selectedRequest.updated_at && (
                                        <View style={styles.detailRow}>
                                            <View style={styles.detailLabel}>
                                                <Ionicons name="time" size={18} color={themeColor0.bgColor(1)} />
                                                <Text style={[NewStyles.text, styles.labelText]}>{t("Last updated:")}</Text>
                                            </View>
                                            <Text style={[NewStyles.text4, styles.detailValue]}>
                                                {formatDate(selectedRequest.updated_at)}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.descriptionSection}>
                                        <View style={styles.detailLabel}>
                                            <Ionicons name="document-text" size={18} color={themeColor0.bgColor(1)} />
                                            <Text style={[NewStyles.text, styles.labelText]}>{t("Description")}:</Text>
                                        </View>
                                        <View style={styles.descriptionBox}>
                                            <Text style={[NewStyles.text4, styles.descriptionText]}>
                                                {selectedRequest.description}
                                            </Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                <TouchableOpacity 
                                    style={styles.modalCloseButton}
                                    onPress={closeModal}
                                >
                                    <Text style={[NewStyles.title4, { fontSize: 16 }]}>{t("Close")}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <LinearGradient
            colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.background}
        >
            <ScreenHeaders
                title={t("Request list")}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text4, styles.loadingText]}>{t("Loading...")}</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[themeColor0.bgColor(1)]}
                            tintColor={themeColor0.bgColor(1)}
                        />
                    }
                />
            )}

            {renderDetailModal()}
        </LinearGradient>
    );
}

const createLocalStyles = (NewStyles) =>  StyleSheet.create({
    background: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: themeColor10.bgColor(0.8),
        fontSize: 16,
    },
    listContainer: {
        padding: 15,
        paddingBottom: 100,
    },
    requestCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        ...NewStyles.shadow,
    },
    cardHeader: {
        ...NewStyles.rowWrapper,
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    cardTitleRow: {
        flex: 1,
        ...NewStyles.row,
        marginLeft: 10,
    },
    requestId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: themeColor0.bgColor(1),
        marginLeft: 8,
    },
    requestSection: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    statusBadge: {
        ...NewStyles.row,
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        gap: 5,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    requestDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 12,
        ...NewStyles.text10
    },
    cardFooter: {
        ...NewStyles.rowWrapper,
        borderTopWidth: 1,
        borderTopColor: themeColor3.bgColor(0.3),
        paddingTop: 10,
    },
    dateContainer: {
       ...NewStyles.row,
        alignItems: 'center',
        gap: 5,
    },
    dateText: {
        fontSize: 12,
        color: themeColor10.bgColor(0.7),
    },
    detailsButton: {
        ...NewStyles.row,
        gap: 5,
    },
    detailsButtonText: {
        fontSize: 14,
        color: themeColor0.bgColor(1),
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16, 
        marginTop: 15,
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: themeColor0.bgColor(1),
        borderRadius: 10,
        padding: 15,
        ...NewStyles.row,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        // maxHeight: '80%',
        ...NewStyles.shadow,
    },
    modalLoading: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalHeader: {
        ...NewStyles.rowWrapper,
        padding: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: themeColor3.bgColor(0.2),
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
    },
    closeButton: {
        padding: 5,
    },
    modalBody: {
        padding: 20,
        // maxHeight: 400,
    },
    detailRow: {
        ...NewStyles.rowWrapper,
        marginBottom: 15,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: themeColor3.bgColor(0.1),
    },
    detailLabel: {
        ...NewStyles.row,
        gap: 8,
        minWidth: 120,
    },
    labelText: {
        ...NewStyles.title,
        fontSize: 14,
    },
    detailValue: {
        flex: 1,
        fontSize: 14,
        color: themeColor10.bgColor(0.8),
        textAlign:'left'
    },
    statusBadgeLarge: {
        ...NewStyles.row,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        gap: 6,
    },
    descriptionSection: {
        marginTop: 10,
    },
    descriptionBox: {
        backgroundColor: themeColor3.bgColor(0.05),
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: themeColor3.bgColor(0.2),
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 24,
        color: themeColor10.bgColor(0.9),
    },
    modalCloseButton: {
        backgroundColor: themeColor0.bgColor(1),
        padding: 15,
        margin: 20,
        marginTop: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
});

