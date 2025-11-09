import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { 
  themeColor0, 
  themeColor1, 
  themeColor3, 
  themeColor10, 
  themeColor8, 
  themeColor2,
  themeColor4,
  themeColor7,
  themeColor6
} from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { 
  getAdminReportViolations, 
  getAdminReportViolationById, 
  replyToAdminReportViolation 
} from '../../services/Api';
import { showToastOrAlert, formatDateTime } from '../../helpers/Common';

export default function LoopReportScreen({ navigation }) {
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.token);

  // State management
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first, 'asc' for oldest first

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  /**
   * Fetch all admin violation reports
   */
  const fetchReports = async () => {
    try {
      setLoading(true);
      const result = await getAdminReportViolations();
      
      if (result.success && result.data) {
        setReports(result.data);
      } else {
        showToastOrAlert(result.message || 'خطا در دریافت گزارش‌ها');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToastOrAlert('خطا در دریافت گزارش‌ها');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh reports list
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  /**
   * Toggle sort order between newest and oldest
   */
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  /**
   * Get sorted reports based on sort order
   */
  const getSortedReports = () => {
    if (!reports || reports.length === 0) return [];
    
    return [...reports].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };

  /**
   * Open reply modal for a specific report
   */
  const openReplyModal = (report) => {
    if (!report.can_reply) {
      showToastOrAlert('امکان پاسخ‌دهی به این گزارش وجود ندارد');
      return;
    }
    
    if (report.has_response) {
      showToastOrAlert('شما قبلاً به این گزارش پاسخ داده‌اید');
      return;
    }

    setSelectedReport(report);
    setReplyText('');
    setReplyModalVisible(true);
  };

  /**
   * Submit reply to a report
   */
  const submitReply = async () => {
    if (!replyText || replyText.trim().length === 0) {
      showToastOrAlert('لطفاً متن پاسخ را وارد کنید');
      return;
    }

    if (replyText.length > 5000) {
      showToastOrAlert('متن پاسخ نباید بیش از 5000 کاراکتر باشد');
      return;
    }

    try {
      setSubmittingReply(true);
      const result = await replyToAdminReportViolation(selectedReport.id, replyText);
      
      if (result.success) {
        showToastOrAlert('پاسخ شما با موفقیت ثبت شد');
        setReplyModalVisible(false);
        setReplyText('');
        setSelectedReport(null);
        // Refresh the reports list
        await fetchReports();
      } else {
        showToastOrAlert(result.message || 'خطا در ارسال پاسخ');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      showToastOrAlert(error.message || 'خطا در ارسال پاسخ');
    } finally {
      setSubmittingReply(false);
    }
  };

  /**
   * Get status color based on report status
   */
  const getStatusColor = (report) => {
    if (!report.can_reply) return themeColor7.bgColor(0.8); // Gray for no reply allowed
    if (report.has_response) return themeColor6.bgColor(0.8); // Green for replied
    return themeColor10.bgColor(0.8); // Orange for pending
  };

  /**
   * Render individual report card
   */
  const renderReportCard = (report) => (
    <View key={report.id} style={styles.reportCard}>
      {/* Report Header */}
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report) }]}>
          <Text style={styles.statusText}>{report.response_status_label}</Text>
        </View>
      </View>

      {/* Report Description */}
      <Text style={styles.reportDescription}>{report.description}</Text>

      {/* Report Date */}
      <Text style={styles.reportDate}>
        تاریخ ثبت: {formatDateTime(report.created_at)}
      </Text>

      {/* Technician Response (if exists) */}
      {report.has_response && report.technician_response && (
        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>پاسخ شما:</Text>
          <Text style={styles.responseText}>{report.technician_response}</Text>
        </View>
      )}

      {/* Reply Button */}
      {report.can_reply==1 && !report.has_response && (
        <TouchableOpacity 
          style={styles.replyButton}
          onPress={() => openReplyModal(report)}
        >
          <Text style={styles.replyButtonText}>پاسخ به گزارش</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <LinearGradient 
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders 
        title={'گزارش تخلفات'} 
        onPressLeft={() => navigation.goBack()} 
      />
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header Section */}
          <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
            <Text style={styles.buttonText}>گزارش‌های تخلف</Text>
          </TouchableOpacity>

          {/* Sort Button */}
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={toggleSortOrder}
          >
            <Text style={styles.sortButtonText}>
              {sortOrder === 'desc' ? '🔽 جدیدترین به قدیمی‌ترین' : '🔼 قدیمی‌ترین به جدیدترین'}
            </Text>
          </TouchableOpacity>

          {/* Reports List */}
          {getSortedReports().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>گزارش تخلفی یافت نشد</Text>
            </View>
          ) : (
            getSortedReports().map(report => renderReportCard(report))
          )}

          {/* Total Count */}
          {reports.length > 0 && (
            <View style={styles.totalCountBox}>
              <Text style={styles.totalCountText}>
                تعداد کل گزارش‌ها: {reports.length}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>پاسخ به گزارش</Text>
            
            {selectedReport && (
              <>
                <Text style={styles.modalReportTitle}>{selectedReport.title}</Text>
                
                <TextInput
                  style={styles.replyInput}
                  placeholder="متن پاسخ خود را وارد کنید..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={6}
                  value={replyText}
                  onChangeText={setReplyText}
                  maxLength={5000}
                  textAlignVertical="top"
                />
                
                <Text style={styles.charCount}>
                  {replyText.length} / 5000 کاراکتر
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setReplyModalVisible(false);
                      setReplyText('');
                      setSelectedReport(null);
                    }}
                    disabled={submittingReply}
                  >
                    <Text style={styles.modalButtonText}>انصراف</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={submitReply}
                    disabled={submittingReply}
                  >
                    {submittingReply ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                        ارسال پاسخ
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 15,
  },
  centerContainer: {
    flex: 1,
    ...NewStyles.center,
  },
  loadingText: {
    ...NewStyles.text4,
    marginTop: 10,
    fontSize: 16,
  },
  mainButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    ...NewStyles.title4,
    fontSize: 16,
  },
  sortButton: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: themeColor4.bgColor(0.9),
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 3,
  },
  sortButtonText: {
    ...NewStyles.text3,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    ...NewStyles.center,
  },
  emptyText: {
    ...NewStyles.text4,
    fontSize: 16,
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    ...NewStyles.shadow
  },
  reportHeader: {
    ...NewStyles.rowWrapper,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  reportTitle: {
    ...NewStyles.title10,
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...NewStyles.text4,
    fontSize: 11,
  },
  reportDescription: {
    ...NewStyles.text3,
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'right',
  },
  reportDate: {
    ...NewStyles.text3,
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'right',
  },
  responseBox: {
    backgroundColor: themeColor3.bgColor(0.1),
    borderLeftWidth: 3,
    borderLeftColor: themeColor7.bgColor(1),
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  responseLabel: {
    ...NewStyles.title7,
    fontSize: 13,
    marginBottom: 5,
    textAlign: 'right',
  },
  responseText: {
    ...NewStyles.text3,
    fontSize: 13,
    textAlign: 'right',
  },
  replyButton: {
    backgroundColor: themeColor0.bgColor(0.9),
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  replyButtonText: {
    ...NewStyles.text4,
    fontSize: 14,
  },
  totalCountBox: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  totalCountText: {
    ...NewStyles.title10,
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: themeColor10.bgColor(0.5),
    ...NewStyles.center,
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    ...NewStyles.shadow
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalReportTitle: {
    ...NewStyles.text3,
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  replyInput: {
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.5),
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    maxHeight: 200,
    textAlign: 'right',
    backgroundColor: themeColor3.bgColor(0.1),
  },
  charCount: {
    ...NewStyles.text3,
    fontSize: 12,
    textAlign: 'left',
    marginTop: 5,
    marginBottom: 15,
  },
  modalButtons: {
    ...NewStyles.rowWrapper,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    ...NewStyles.center
  },
  cancelButton: {
    backgroundColor: themeColor3.bgColor(0.3),
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.5),
  },
  submitButton: {
    backgroundColor: themeColor0.bgColor(0.9),
  },
  modalButtonText: {
    ...NewStyles.text3,
    fontSize: 14,
  },
});
