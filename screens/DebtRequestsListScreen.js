import React, { useState, useEffect, useMemo } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor4, themeColor8 } from '../theme/Color';
import { getDebtRequests, getDebtRequestById } from '../services/Api';
import { formatDate, langIsRTL, showAlert } from '../helpers/Common';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../styles/NewStyles';
export default function DebtRequestsListScreen({ navigation }) {
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
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getDebtRequests();

      if (response.success) {
        setRequests(response.data);
      } else {
        showAlert(t("Error"), t("Error fetching request list."));
      }
    } catch (error) {
      console.log('خطا در دریافت لیست:', error);
      showAlert(t("Error"), t("There was a problem fetching the list."));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const getStatusBadge = (status) => {
    const statusStr = String(status);
    const badges = {
      '0': { text: t("Pending review"), color: '#FF9800' },
      '1': { text: t("Approved"), color: '#4CAF50' },
      '2': { text: t("Rejected"), color: '#F44336' },
    };
    return badges[statusStr] || badges['0'];
  };

  const getTypeBadge = (type) => {
    const badges = {
      sponsor: { text: t("Guarantor / Guarantee"), color: themeColor1.bgColor(1) },
      free: { text: t("Interest-free loan"), color: '#2196F3' },
    };
    return badges[type] || badges.sponsor;
  };

  const handleViewDetails = async (requestId) => {
    setModalVisible(true);
    setLoadingDetail(true);

    try {
      const response = await getDebtRequestById(requestId);

      if (response.success) {
        setSelectedRequest(response.data);
      } else {
        showAlert(t("Error"), t("Error fetching request details."));
        setModalVisible(false);
      }
    } catch (error) {
      console.log('خطا در دریافت جزئیات:', error);
      showAlert(t("Error"), error.message || t("There was a problem fetching the details."));
      setModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '-';
    return `${new Intl.NumberFormat('fa-IR').format(amount)} ${t("Rial")}`;
  };

  const renderItem = ({ item }) => {
    const statusBadge = getStatusBadge(item.status);
    const typeBadge = getTypeBadge(item.type);

    return (
      <View style={styles.requestCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerRight}>
            <Text style={[NewStyles.text, styles.requestId]}>{t("Request #{{id}}", { id: item.id })}</Text>
          </View>
          <View style={styles.badgesContainer}>
            <View style={[styles.typeBadge, { backgroundColor: typeBadge.color }]}>
              <Ionicons name="cash-outline" size={14} color="#fff" />
              <Text style={styles.badgeText}>{typeBadge.text}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
              <Text style={styles.statusText}>{statusBadge.text}</Text>
            </View>
          </View>
        </View>

        {/* Amount (for free type) */}
        {item.type === 'free' && item.amount && (
          <View style={styles.amountRow}>
            <Ionicons name="wallet-outline" size={18} color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.text, styles.amountText]}>{t("Amount")}: {formatAmount(item.amount)}</Text>
          </View>
        )}

        {/* Month (for free type) */}
        {item.type === 'free' && item.month && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={themeColor10.bgColor(0.8)} />
            <Text style={[NewStyles.text, styles.infoText]}>
              {t("Duration")}: {item.month} {t("Month")}
            </Text>
          </View>
        )}

        {/* Description Preview */}
        <Text style={[NewStyles.text4, styles.description]} numberOfLines={2}>
          {item.description}
        </Text>
        {item?.response &&
          <>
            <Text style={NewStyles.text}>
              {t("Admin descriptions")}
            </Text>
            <Text style={[NewStyles.text4, styles.description]} numberOfLines={3}>
              {item?.response}
            </Text>
          </>
        }
        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={[NewStyles.text4, styles.dateText]}>
            {formatDate(item.created_at)}
          </Text>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleViewDetails(item.id)}
          >
            <Text style={styles.detailButtonText}>{t("Details")}</Text>
            <Ionicons name={langIsRTL(i18n.language) ? "chevron-back" : "chevron-forward"} size={16} color={themeColor0.bgColor(1)} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={80} color={themeColor4.bgColor(1)} />
      <Text style={[NewStyles.title, styles.emptyText]}>
        {t("No loan requests have been submitted.")}
      </Text>

    </View>
  );

  const renderDetailModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView edges={{ top: 'additive', bottom: 'additive' }} style={styles.modalOverlay}>
        <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View>
            {loadingDetail ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
                <Text style={[NewStyles.text, { marginTop: 15 }]}>{t("Loading...")}</Text>
              </View>
            ) : selectedRequest ? (
              <>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={[NewStyles.title, styles.modalTitle]}>{t("Request details")}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={themeColor10.bgColor(1)} />
                  </TouchableOpacity>
                </View>

                {/* Body */}

                {/* Type */}
                <View style={styles.detailRow}>
                  <Text style={[NewStyles.text4, styles.detailLabel]}>{t("Request type:")}</Text>
                  <View style={[styles.typeBadgeLarge, { backgroundColor: getTypeBadge(selectedRequest.type).color }]}>
                    <Text style={styles.badgeTextLarge}>{getTypeBadge(selectedRequest.type).text}</Text>
                  </View>
                </View>

                {/* Status */}
                <View style={styles.detailRow}>
                  <Text style={[NewStyles.text4, styles.detailLabel]}>{t("Status:")}</Text>
                  <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusBadge(selectedRequest.status).color }]}>
                    <Text style={styles.statusTextLarge}>{getStatusBadge(selectedRequest.status).text}</Text>
                  </View>
                </View>

                {/* Amount (for free type) */}
                {selectedRequest.type === 'free' && selectedRequest.amount && (
                  <View style={styles.detailRow}>
                    <Text style={[NewStyles.text4, styles.detailLabel]}>{t("Loan amount:")}</Text>
                    <Text style={[NewStyles.text, styles.detailValue]}>{formatAmount(selectedRequest.amount)}</Text>
                  </View>
                )}

                {/* Sponsor (for free type) */}
                {selectedRequest.type === 'free' && selectedRequest.sponsor && (
                  <View style={styles.detailRow}>
                    <Text style={[NewStyles.text4, styles.detailLabel]}>{t("Guarantor status:")}</Text>
                    <Text style={[NewStyles.text, styles.detailValue]}>{selectedRequest.sponsor}</Text>
                  </View>
                )}

                {/* Month (for free type) */}
                {selectedRequest.type === 'free' && selectedRequest.month && (
                  <View style={styles.detailRow}>
                    <Text style={[NewStyles.text4, styles.detailLabel]}>{t("Repayment duration:")}</Text>
                    <Text style={[NewStyles.text, styles.detailValue]}>{selectedRequest.month} {t("Month")}</Text>
                  </View>
                )}

                {/* Created At */}
                <View style={styles.detailRow}>
                  <Text style={[NewStyles.text4, styles.detailLabel]}>{t("Submitted at:")}</Text>
                  <Text style={[NewStyles.text4, styles.detailValue]}>{formatDate(selectedRequest.created_at)}</Text>
                </View>

                {/* Updated At */}
                {selectedRequest.updated_at && selectedRequest.updated_at !== selectedRequest.created_at && (
                  <View style={styles.detailRow}>
                    <Text style={[NewStyles.text4, styles.detailLabel]}>{t("Last updated:")}</Text>
                    <Text style={[NewStyles.text4, styles.detailValue]}>{formatDate(selectedRequest.updated_at)}</Text>
                  </View>
                )}

                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={[NewStyles.text4, styles.sectionTitle]}>{t("Request description:")}</Text>
                  <View style={styles.descriptionBox}>
                    <Text style={[NewStyles.text10, styles.descriptionText]}>
                      {selectedRequest.description}
                    </Text>
                  </View>
                </View>

                {/* Urgent Description (for free type) */}
                {selectedRequest.type === 'free' && selectedRequest.urgent_description && (
                  <View style={styles.descriptionSection}>
                    <Text style={[NewStyles.text4, styles.sectionTitle]}>{t("Urgent description:")}</Text>
                    <View style={[styles.descriptionBox, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={[NewStyles.text10, styles.descriptionText]}>
                        {selectedRequest.urgent_description}
                      </Text>
                    </View>
                  </View>
                )}
                {
                  selectedRequest?.response && <View style={styles.descriptionSection}>
                    <Text style={[NewStyles.text4, styles.sectionTitle]}>{t("Admin descriptions")}:</Text>
                    <View style={styles.descriptionBox}>
                      <Text style={[NewStyles.text10, styles.descriptionText]}>
                        {selectedRequest.response}
                      </Text>
                    </View>
                  </View>
                }
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[NewStyles.title4]}>{t("Close")}</Text>
                </TouchableOpacity>

                {/* Footer */}
              </>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <LinearGradient
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders
        title={t("Loan/facilities requests")}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
          <Text style={[NewStyles.text, { marginTop: 15 }]}>{t("Loading...")}</Text>
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
            />
          }
        />
      )}

      {renderDetailModal()}
    </LinearGradient>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: {
    flex: 1,
    paddingBottom: 120
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    ...NewStyles.shadow,
  },
  cardHeader: {
    ...NewStyles.rowWrapper,
    marginBottom: 12,
  },
  headerRight: {
    flex: 1,
  },
  badgesContainer: {
    gap: 8,
  },
  requestId: {
    ...NewStyles.title,
    fontSize: 14,
  },
  typeBadge: {
    ...NewStyles.row,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  badgeText: {
    ...NewStyles.title4,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    ...NewStyles.title4,
    fontSize: 11,
  },
  amountRow: {
    ...NewStyles.row,
    gap: 8,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: themeColor0.bgColor(0.1),
    borderRadius: 10,
  },
  amountText: {
    ...NewStyles.title,
    fontSize: 14,
  },
  infoRow: {
    ...NewStyles.row,
    gap: 6,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: themeColor10.bgColor(0.8),
    marginBottom: 12,
  },
  cardFooter: {
    ...NewStyles.rowWrapper,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: themeColor10.bgColor(0.1),
  },
  dateText: {
    fontSize: 11,
    color: themeColor10.bgColor(0.6),
  },
  detailButton: {
    ...NewStyles.row,
    gap: 5,
  },
  detailButtonText: {
    ...NewStyles.text,
    color: themeColor0.bgColor(1),
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    ...NewStyles.center,
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    color: themeColor4.bgColor(1),
  },
  addButton: {
    ...NewStyles.row,
    backgroundColor: themeColor0.bgColor(1),
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
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
    padding: 10
  },
  modalHeader: {
    ...NewStyles.rowWrapper,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.1),
  },
  modalTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    width: '100%'
  },
  detailRow: {
    ...NewStyles.rowWrapper,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.1),
  },
  detailLabel: {
    ...NewStyles.title10,
    fontSize: 13,
  },
  detailValue: {
    ...NewStyles.title,
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
    marginRight: 10,
  },
  typeBadgeLarge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeTextLarge: {
    ...NewStyles.title4,
    fontSize: 12,
  },
  statusBadgeLarge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusTextLarge: {
    ...NewStyles.title4,
    fontSize: 12,
  },
  descriptionSection: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 13,
    marginBottom: 10,
    color: themeColor10.bgColor(0.7),
  },
  descriptionBox: {
    backgroundColor: themeColor4.bgColor(0.3),
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.1),
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 22,
  },
  closeModalButton: {
    backgroundColor: themeColor0.bgColor(1),
    margin: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
});
