import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor4, themeColor8 } from '../theme/Color';
import { getTransferRequestById } from '../services/Api';
import { showAlert } from '../helpers/Common';

export default function TransferRequestDetailScreen({ route, navigation }) {
  const { requestId } = route.params;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestDetail();
  }, []);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      console.log(`📋 دریافت جزئیات درخواست #${requestId}`);
      
      const response = await getTransferRequestById(requestId);

      if (response.success && response.data) {
        setRequest(response.data);
        console.log('✅ جزئیات درخواست دریافت شد');
      }
    } catch (error) {
      console.error('❌ خطا در دریافت جزئیات:', error);
      showAlert(
        'خطا',
        error.message || 'مشکلی در دریافت جزئیات پیش آمد',
        [
          {
            text: 'باشه',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 0:
        return {
          backgroundColor: '#FFF3CD',
          color: '#856404',
          text: 'در انتظار بررسی',
          icon: 'time-outline'
        };
      case 1:
        return {
          backgroundColor: '#D4EDDA',
          color: '#155724',
          text: 'تأیید شده',
          icon: 'checkmark-circle-outline'
        };
      case 2:
        return {
          backgroundColor: '#F8D7DA',
          color: '#721C24',
          text: 'رد شده',
          icon: 'close-circle-outline'
        };
      default:
        return {
          backgroundColor: '#E2E3E5',
          color: '#383D41',
          text: 'نامشخص',
          icon: 'help-circle-outline'
        };
    }
  };

  const getTypeLabel = (type) => {
    return type === 'city' ? 'انتقال به شهر/منطقه دیگر' : 'ارتقا/تغییر سمت';
  };

  const getTypeIcon = (type) => {
    return type === 'city' ? 'location' : 'trending-up';
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
          title={'جزئیات درخواست'}
          onPressLeft={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!request) {
    return (
      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScreenHeaders
          title={'جزئیات درخواست'}
          onPressLeft={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={themeColor10.bgColor(0.3)} />
          <Text style={styles.errorText}>درخواست یافت نشد</Text>
        </View>
      </LinearGradient>
    );
  }

  const statusStyle = getStatusStyle(request.status);

  return (
    <LinearGradient
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders
        title={'جزئیات درخواست'}
        onPressLeft={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="swap-horizontal" size={24} color={themeColor0.bgColor(1)} />
              <Text style={styles.title}>درخواست انتقال/سمت</Text>
            </View>
            <Text style={styles.id}>#{request.id}</Text>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Ionicons name={statusStyle.icon} size={20} color={statusStyle.color} style={{ marginLeft: 8 }} />
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {statusStyle.text}
            </Text>
          </View>

          {/* Type Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={getTypeIcon(request.type)} size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
              <Text style={styles.label}>نوع درخواست:</Text>
            </View>
            <View style={styles.typeTag}>
              <Text style={styles.typeValue}>{getTypeLabel(request.type)}</Text>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="reader-outline" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
              <Text style={styles.label}>توضیحات:</Text>
            </View>
            <View style={styles.descriptionBox}>
              <Text style={styles.description}>{request.description}</Text>
            </View>
          </View>

          {/* Date Info */}
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={18} color={themeColor10.bgColor(0.6)} style={{ marginLeft: 6 }} />
              <Text style={styles.dateLabel}>تاریخ ثبت:</Text>
            </View>
            <Text style={styles.dateValue}>
              {new Date(request.created_at).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {request.updated_at !== request.created_at && (
            <View style={styles.dateContainer}>
              <View style={styles.dateItem}>
                <Ionicons name="refresh-outline" size={18} color={themeColor10.bgColor(0.6)} style={{ marginLeft: 6 }} />
                <Text style={styles.dateLabel}>آخرین بروزرسانی:</Text>
              </View>
              <Text style={styles.dateValue}>
                {new Date(request.updated_at).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}

          {/* Technician Info */}
          <View style={styles.technicianSection}>
            <View style={styles.technicianHeader}>
              <Ionicons name="person-circle-outline" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
              <Text style={styles.label}>اطلاعات متخصص:</Text>
            </View>
            <View style={styles.technicianInfo}>
              <View style={styles.technicianRow}>
                <Ionicons name="person" size={16} color={themeColor10.bgColor(0.6)} style={{ marginLeft: 6 }} />
                <Text style={styles.technicianLabel}>نام:</Text>
                <Text style={styles.technicianValue}>{request.technician.name}</Text>
              </View>
              <View style={styles.technicianRow}>
                <Ionicons name="call" size={16} color={themeColor10.bgColor(0.6)} style={{ marginLeft: 6 }} />
                <Text style={styles.technicianLabel}>شماره تماس:</Text>
                <Text style={styles.phoneValue}>{request.technician.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={themeColor0.bgColor(1)} style={{ marginLeft: 8 }} />
          <Text style={styles.infoText}>
            {request.status === 0
              ? 'درخواست شما در انتظار بررسی توسط مدیریت است.'
              : request.status === 1
              ? 'درخواست شما تأیید شده است.'
              : 'متأسفانه درخواست شما رد شده است.'}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: themeColor10.bgColor(0.7),
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColor10.bgColor(0.7),
  },
  card: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 20,
    ...NewStyles.shadow,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: themeColor10.bgColor(0.1),
  },
  titleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColor0.bgColor(1),
    marginRight: 8,
  },
  id: {
    fontSize: 16,
    color: themeColor10.bgColor(0.6),
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: themeColor10.bgColor(0.6),
    fontWeight: '600',
  },
  typeTag: {
    backgroundColor: themeColor1.bgColor(0.2),
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: themeColor1.bgColor(0.3),
  },
  typeValue: {
    fontSize: 15,
    color: themeColor0.bgColor(1),
    fontWeight: 'bold',
  },
  descriptionBox: {
    backgroundColor: themeColor10.bgColor(0.05),
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.1),
  },
  description: {
    fontSize: 15,
    color: themeColor10.bgColor(0.9),
    lineHeight: 24,
    textAlign: 'right',
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColor10.bgColor(0.1),
  },
  dateItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 13,
    color: themeColor10.bgColor(0.6),
  },
  dateValue: {
    fontSize: 13,
    color: themeColor10.bgColor(0.8),
    fontWeight: '500',
  },
  technicianSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: themeColor10.bgColor(0.1),
  },
  technicianHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  technicianInfo: {
    backgroundColor: themeColor10.bgColor(0.05),
    padding: 16,
    borderRadius: 10,
  },
  technicianRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
  },
  technicianLabel: {
    fontSize: 13,
    color: themeColor10.bgColor(0.6),
    marginLeft: 8,
  },
  technicianValue: {
    fontSize: 14,
    color: themeColor10.bgColor(0.9),
    fontWeight: '500',
  },
  phoneValue: {
    fontSize: 14,
    color: themeColor0.bgColor(1),
    fontWeight: '500',
    direction: 'ltr',
  },
  infoBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: themeColor1.bgColor(0.1),
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: themeColor1.bgColor(0.2),
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: themeColor10.bgColor(0.8),
    lineHeight: 20,
    textAlign: 'right',
  },
});


