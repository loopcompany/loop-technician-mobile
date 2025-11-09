import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor2, themeColor3, themeColor6, themeColor7, themeColor8 } from '../theme/Color';
import { getEducationRequestById } from '../services/Api';
import { formatDateTime } from '../helpers/Common';

export default function EducationRequestDetailScreen({ navigation, route }) {
  const { requestId } = route.params;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequestDetail();
  }, [requestId]);

  const loadRequestDetail = async () => {
    try {
      setLoading(true);
      const result = await getEducationRequestById(requestId);
      
      if (result.success) {
        setRequest(result.data);
      } else {
        Alert.alert('خطا', result.message || 'خطا در بارگذاری جزئیات درخواست');
        navigation.goBack();
      }
    } catch (error) {
      console.error('خطا در بارگذاری جزئیات:', error);
      Alert.alert('خطا', 'خطا در بارگذاری جزئیات درخواست');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return themeColor8.bgColor(1); // در انتظار
      case 1: return themeColor7.bgColor(1); // تأیید
      case 2: return themeColor6.bgColor(1); // رد
      default: return themeColor3.bgColor(1);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return 'time-outline';
      case 1: return 'checkmark-circle';
      case 2: return 'close-circle';
      default: return 'help-circle-outline';
    }
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
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={styles.container}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>در حال بارگذاری...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!request) {
    return null;
  }

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
      
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View style={[styles.statusCard, { backgroundColor: getStatusColor(request.status) }]}>
            <Ionicons name={getStatusIcon(request.status)} size={40} color="#fff" />
            <Text style={styles.statusLabel}>{request.status_label}</Text>
          </View>

          {/* Section */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="bookmark" size={20} color={themeColor0.bgColor(1)} />
              <Text style={styles.infoTitle}>بخش</Text>
            </View>
            <Text style={styles.infoContent}>{request.section}</Text>
          </View>

          {/* Description */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="document-text" size={20} color={themeColor0.bgColor(1)} />
              <Text style={styles.infoTitle}>توضیحات</Text>
            </View>
            <Text style={styles.infoContent}>{request.description}</Text>
          </View>

          {/* Created At */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="calendar-outline" size={20} color={themeColor0.bgColor(1)} />
              <Text style={styles.infoTitle}>تاریخ ثبت</Text>
            </View>
            <Text style={styles.infoContent}>{formatDateTime(request.created_at)}</Text>
          </View>

          {/* Updated At */}
          {request.updated_at && request.updated_at !== request.created_at && (
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="refresh-outline" size={20} color={themeColor0.bgColor(1)} />
                <Text style={styles.infoTitle}>آخرین بروزرسانی</Text>
              </View>
              <Text style={styles.infoContent}>{formatDateTime(request.updated_at)}</Text>
            </View>
          )}

          {/* Response (if rejected or approved with notes) */}
          {request.response && (
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="chatbox-ellipses" size={20} color={themeColor0.bgColor(1)} />
                <Text style={styles.infoTitle}>پاسخ</Text>
              </View>
              <Text style={styles.infoContent}>{request.response}</Text>
            </View>
          )}

          {/* Status Info */}
          <View style={styles.statusInfo}>
            <Ionicons name="information-circle" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statusInfoText}>
              {request.status === 0 && 'درخواست شما در حال بررسی است و به زودی پاسخ داده خواهد شد.'}
              {request.status === 1 && 'درخواست شما تأیید شده است.'}
              {request.status === 2 && 'متأسفانه درخواست شما رد شده است.'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  statusCard: {
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    gap: 10,
  },
  statusInfoText: {
    flex: 1,
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    lineHeight: 20,
  },
});
