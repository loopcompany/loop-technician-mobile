import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor4, themeColor6, themeColor7, themeColor8, themeColor11 } from '../theme/Color';
import { getTransferRequests, getTransferRequestById } from '../services/Api';
import { useFocusEffect } from '@react-navigation/native';
import { formatDateTime, showAlert } from '../helpers/Common';
import { useTranslation } from 'react-i18next';

export default function TransferRequestsListScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { t } = useTranslation();

  const fetchRequests = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      console.log('📋 دریافت لیست درخواست‌های انتقال/سمت...');
      const response = await getTransferRequests();

      if (response.success && response.data) {
        setRequests(response.data);
        console.log(`✅ ${response.data.length} درخواست دریافت شد`);
      }
    } catch (error) {
      console.log('❌ خطا در دریافت لیست:', error);
      showAlert(t("Error"), error.message || t("There was a problem fetching the list."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // بارگذاری اولیه و refresh هنگام بازگشت به صفحه
  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests(true);
  };

  const getStatusBadge = (status) => {
    const statusStr = String(status);
    switch (statusStr) {
      case '0':
        return { text: t("Pending review"), color: '#FFA500', icon: 'time-outline' };
      case '1':
        return { text: t("Approved"), color: '#4CAF50', icon: 'checkmark-circle-outline' };
      case '2':
        return { text: t("Rejected"), color: '#F44336', icon: 'close-circle-outline' };
      default:
        return { text: t("Unknown"), color: '#9E9E9E', icon: 'help-circle-outline' };
    }
  };

  const getTypeLabel = (type) => {
    return type === 'city' ? t("City transfer") : t("Position change");
  };

  const getTypeIcon = (type) => {
    return type === 'city' ? 'location-outline' : 'trending-up-outline';
  };

  const handleViewDetails = async (item) => {
    try {
      setLoadingDetail(true);
      setModalVisible(true);
      console.log(`📄 نمایش جزئیات درخواست #${item.id}`);

      const response = await getTransferRequestById(item.id);

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
        style={styles.card}
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.id}>#{item.id}</Text>
          <View style={[styles.badge, { backgroundColor: statusBadge.color }]}>
            <Ionicons name={statusBadge.icon} size={16} color="#fff" style={{ marginLeft: 4 }} />
            <Text style={styles.badgeText}>{statusBadge.text}</Text>
          </View>
        </View>

        <View style={styles.typeContainer}>
          <Ionicons name={getTypeIcon(item.type)} size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
          <Text style={styles.typeLabel}>{getTypeLabel(item.type)}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.date}>
            {formatDateTime(item.created_at)}
          </Text>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>{t("View Details")}</Text>
            <Ionicons name="chevron-back" size={16} color={themeColor0.bgColor(1)} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="swap-horizontal-outline" size={80} color={themeColor4.bgColor(1)} />
      <Text style={[NewStyles.text4,styles.emptyText]}>{t("No requests have been submitted.")}</Text>
      <Text style={[NewStyles.text4,styles.emptySubText]}>{t("Your transfer/position requests will appear here.")}</Text>

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
                <Text style={styles.loadingText}>{t("Loading...")}</Text>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
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
                      <Ionicons name={getTypeIcon(selectedRequest.type)} size={18} color={themeColor0.bgColor(1)} />
                      <Text style={styles.labelText}>{t("Request type:")}</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {getTypeLabel(selectedRequest.type)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <Ionicons name="information-circle" size={18} color={themeColor0.bgColor(1)} />
                      <Text style={styles.labelText}>{t("Status:")}</Text>
                    </View>
                    <View style={[styles.statusBadgeLarge, { backgroundColor: statusBadge.color }]}>
                      <Ionicons name={statusBadge.icon} size={18} color="#fff" />
                      <Text style={[styles.badgeText, { fontSize: 14 }]}>{statusBadge.text}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                      <Ionicons name="calendar" size={18} color={themeColor0.bgColor(1)} />
                      <Text style={styles.labelText}>{t("Submitted at:")}</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatDateTime(selectedRequest.created_at)}
                    </Text>
                  </View>

                  {selectedRequest.updated_at && selectedRequest.updated_at !== selectedRequest.created_at && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <Ionicons name="time" size={18} color={themeColor0.bgColor(1)} />
                        <Text style={styles.labelText}>{t("Last updated:")}</Text>
                      </View>
                      <Text style={styles.detailValue}>
                        {formatDateTime(selectedRequest.updated_at)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.descriptionSection}>
                    <View style={styles.detailLabel}>
                      <Ionicons name="document-text" size={18} color={themeColor0.bgColor(1)} />
                      <Text style={styles.labelText}>{t("Description")}:</Text>
                    </View>
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>
                        {selectedRequest.description}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeModal}
                >
                  <Text style={styles.modalCloseButtonText}>{t("Close")}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={t("Transfer/position requests")}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
          <Text style={styles.loadingText}>{t("Loading...")}</Text>
        </View>
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
        title={t("Transfer/position requests")}
      />

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          requests.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColor0.bgColor(1)]}
            tintColor={themeColor0.bgColor(1)}
          />
        }
        ListEmptyComponent={renderEmpty}
      />

      {renderDetailModal()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    ...NewStyles.center,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: themeColor10.bgColor(0.7),
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...NewStyles.shadow,
  },
  header: {
    ...NewStyles.rowWrapper,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.1),
  },
  id: {
    ...NewStyles.title10,
    fontSize: 14,
  },
  badge: {
    ...NewStyles.row,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    ...NewStyles.title4,
    fontSize: 12,
  },
  typeContainer: {
    ...NewStyles.row,
    marginBottom: 12,
  },
  typeLabel: {
    ...NewStyles.title,
    fontSize: 16,
    color: themeColor0.bgColor(1),
  },
  description: {
    ...NewStyles.text3,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'right',
  },
  footer: {
    ...NewStyles.rowWrapper,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: themeColor10.bgColor(0.1),
  },
  date: {
    fontSize: 12,
    color: themeColor10.bgColor(0.5),
  },
  viewDetailsButton: {
    ...NewStyles.row,
  },
  viewDetailsText: {
    ...NewStyles.title,
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    ...NewStyles.center,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: themeColor4.bgColor(1),
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: themeColor4.bgColor(1),
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    ...NewStyles.row,
    backgroundColor: themeColor0.bgColor(1),
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 24,
  },
  addButtonText: {
    ...NewStyles.text4,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 20,
    width: '100%',
    ...NewStyles.shadow,
  },
  modalLoading: {
    padding: 40,
    ...NewStyles.center,
  },
  modalHeader: {
    ...NewStyles.rowWrapper,
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.2),
  },
  modalTitle: {
    ...NewStyles.title,
    fontSize: 18,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  detailRow: {
    ...NewStyles.rowWrapper,
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.1),
  },
  detailLabel: {
    ...NewStyles.row,
    gap: 8,
    minWidth: 120,
  },
  labelText: {
    ...NewStyles.text,
    fontSize: 14,
  },
  detailValue: {
    ...NewStyles.text4,
    flex: 1,
    fontSize: 14,
    color: themeColor10.bgColor(0.8),
    textAlign: 'left'
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
    backgroundColor: themeColor10.bgColor(0.05),
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.2),
  },
  descriptionText: {
    ...NewStyles.text4,
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
  modalCloseButtonText: {
    ...NewStyles.title4,
    fontSize: 16,
  },
});

