import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10, themeColor8, themeColor2, themeColor4, themeColor6, themeColor7 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { checkPollStatus, submitPoll } from '../../services/Api';
import { showAlert } from '../../helpers/Common';

export default function FeedbackSuggestionScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);
  
  // State برای هر فیلد
  const [feedbacks, setFeedbacks] = useState({
    user_application: '',
    technician_application: '',
    inner_personnel: '',
    field_personnel: '',
    other: '',
  });

  const categories = [
    { id: 'user_application', title: 'اپلیکیشن کاربر', maxLength: 1000 },
    { id: 'technician_application', title: 'اپلیکیشن تکنسین', maxLength: 1000 },
    { id: 'inner_personnel', title: 'پرسنل داخلی', maxLength: 1000 },
    { id: 'field_personnel', title: 'پرسنل میدانی', maxLength: 1000 },
    { id: 'other', title: 'سایر موارد', maxLength: 2000 },
  ];

  // بررسی وضعیت ثبت نظر
  const checkStatus = async () => {
    try {
      setLoading(true);
      
      const response = await checkPollStatus();
      
      if (response.success && response.data) {
        setHasSubmitted(response.data.has_submitted);
        if (response.data.submitted_at) {
          setSubmittedAt(response.data.submitted_at);
        }
      }
    } catch (error) {
      console.error('❌ خطا در بررسی وضعیت:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [])
  );

  // تغییر متن
  const handleTextChange = (categoryId, text) => {
    setFeedbacks(prev => ({
      ...prev,
      [categoryId]: text,
    }));
  };

  // ثبت نظرات
  const handleSubmit = async () => {
    try {
      // بررسی اینکه حداقل یک فیلد پر شده باشد
      const hasAnyFeedback = Object.values(feedbacks).some(text => text.trim().length > 0);
      
      if (!hasAnyFeedback) {
        showAlert('خطا', 'لطفاً حداقل یکی از فیلدها را پر کنید');
        return;
      }

      setSubmitting(true);

      // فقط فیلدهایی که پر شده‌اند را ارسال کن
      const dataToSend = {};
      Object.keys(feedbacks).forEach(key => {
        if (feedbacks[key].trim().length > 0) {
          dataToSend[key] = feedbacks[key].trim();
        }
      });

      const response = await submitPoll(dataToSend);

      if (response.success) {
        showAlert(
          'موفقیت',
          response.message || 'نظرات شما با موفقیت ثبت شد',
          [
            {
              text: 'باشه',
              onPress: () => {
                setHasSubmitted(true);
                if (response.data?.submitted_at) {
                  setSubmittedAt(response.data.submitted_at);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ خطا در ثبت نظرات:', error);
      showAlert('خطا', error.message || 'مشکلی در ثبت نظرات پیش آمد');
    } finally {
      setSubmitting(false);
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
        <CustomStatusBar />
        <ScreenHeaders 
          title={'نظرات / پیشنهادات'} 
          onPressLeft={() => navigation.goBack()} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
        </View>
      </LinearGradient>
    );
  }

  if (hasSubmitted) {
    return (
      <LinearGradient 
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <CustomStatusBar />
        <ScreenHeaders 
          title={'نظرات / پیشنهادات'} 
          onPressLeft={() => navigation.goBack()} 
        />
        <View style={styles.submittedContainer}>
          <Ionicons name="checkmark-circle" size={100} color={themeColor7.bgColor(1)} />
          <Text style={[NewStyles.title, styles.submittedTitle]}>
            نظرات شما قبلاً ثبت شده است
          </Text>
          <Text style={[NewStyles.text4, styles.submittedText]}>
            از همکاری شما سپاسگزاریم
          </Text>
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
      <CustomStatusBar />
      <ScreenHeaders 
        title={'نظرات / پیشنهادات'} 
        onPressLeft={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* دکمه‌های دسته‌بندی */}
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <TouchableOpacity 
              style={[styles.categoryButton, { backgroundColor: themeColor0.bgColor(0.8) }]}
              disabled={submitting}
            >
              <Text style={styles.categoryButtonText}>{category.title}</Text>
            </TouchableOpacity>
            
            {/* باکس بازخورد برای هر دسته */}
            <View style={styles.feedbackBox}>
              <TextInput
                style={styles.feedbackInput}
                multiline={true}
                numberOfLines={3}
                placeholder="بازخورد :"
                placeholderTextColor={themeColor3.bgColor(1)}
                value={feedbacks[category.id]}
                onChangeText={(text) => handleTextChange(category.id, text)}
                textAlignVertical="top"
                maxLength={category.maxLength}
                editable={!submitting}
              />
            </View>
          </View>
        ))}

        {/* دکمه ثبت */}
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[NewStyles.text4, styles.submitButtonText]}>ثبت نظرات</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submittedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  submittedTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  submittedText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: themeColor10.bgColor(0.7),
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 15,
  },
  categoryContainer: {
    width: '100%',
    marginVertical: 5,
  },
  categoryButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryButtonText: {
    ...NewStyles.title4,
    fontSize: 15,
  },
  feedbackBox: {
    width: '100%',
  },
  feedbackInput: {
    ...NewStyles.textInput,
    ...NewStyles.text10,
    ...NewStyles.border10,
    fontSize: 14,
    textAlign: 'right',
    minHeight: 80,
  },
  submitButton: {
    width: '100%',
    backgroundColor: themeColor7.bgColor(1),
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: themeColor10.bgColor(0.5),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

