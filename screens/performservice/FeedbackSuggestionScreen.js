import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from "react-i18next";
import { createStyles } from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import { themeColor0, themeColor1, themeColor3, themeColor10, themeColor8, themeColor2, themeColor4, themeColor6, themeColor7 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { checkPollStatus, submitPoll } from '../../services/Api';
import { showAlert } from '../../helpers/Common';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedbackSuggestionScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
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
    { id: 'user_application', title: t("User application"), maxLength: 1000 },
    { id: 'technician_application', title: t("Technician application"), maxLength: 1000 },
    { id: 'inner_personnel', title: t("Internal personnel"), maxLength: 1000 },
    { id: 'field_personnel', title: t("Field personnel"), maxLength: 1000 },
    { id: 'other', title: t("Other items"), maxLength: 2000 },
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
      console.log('❌ خطا در بررسی وضعیت:', error);
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
    // بررسی پر بودن همه فیلدها
    const emptyFields = [];
    categories.forEach(category => {
      if (!feedbacks[category.id] || feedbacks[category.id].trim().length === 0) {
        emptyFields.push(category.title);
      }
    });

    if (emptyFields.length > 0) {
      showAlert(
        t("Warning"),
        t("Please complete all fields:\n{{fields}}", { fields: emptyFields.join('\n') })
      );
      return;
    }

    try {
      setSubmitting(true);

      // فقط فیلدهایی که پر شده‌اند را ارسال کن
      const dataToSend = {};
      Object.keys(feedbacks).forEach(key => {
        if (feedbacks[key].trim().length > 0) {
          dataToSend[key] = feedbacks[key].trim();
        }
      });

      // اطمینان از اینکه حداقل یک فیلد پر شده باشد
      if (Object.keys(dataToSend).length === 0) {
        showAlert(t("Warning"), t("Please fill in at least one field"));
        return;
      }

      const response = await submitPoll(dataToSend);

      if (response.success) {
        showAlert(
          t("Success"),
          response.message || t("Your feedback was submitted successfully"),
          [
            {
              text: t("Ok"),
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
      console.log('❌ خطا در ثبت نظرات:', error);
      showAlert(t("Error"), error.message || t("Something went wrong while submitting your feedback"));
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
          title={t("Feedback / Suggestions")}
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
          title={t("Feedback / Suggestions")}
        />
        <View style={styles.submittedContainer}>
          <Ionicons name="checkmark-circle" size={100} color={themeColor7.bgColor(1)} />
          <Text style={[NewStyles.title4, styles.submittedTitle]}>
            {t("You have already submitted your comment.")}
          </Text>
          <Text style={[NewStyles.text4, styles.submittedText]}>
            {t("Thank you for your cooperation")}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={NewStyles.container} edges={{top:'off', bottom:'additive'}}>

      <LinearGradient
        colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <CustomStatusBar />
        <ScreenHeaders
          title={t("Feedback / Suggestions")}
        />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

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
                <View style={[styles.feedbackBox, { gap: 5 }]}>
                  <Text style={NewStyles.text1}>{t("Feedback")}</Text>
                  <TextInput
                    style={styles.feedbackInput}
                    multiline={true}
                    numberOfLines={3}
                    placeholder={t("Feedback")}
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

            <Button
              title={t("Submit feedback")}
              onPress={handleSubmit}
              loading={submitting}
            />

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: {
    flex: 1,
    paddingBottom:50
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
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 15,
    paddingBottom: 50,
  },
  categoryContainer: {
    width: '100%',
    marginVertical: 5,
    maxWidth: 800,
    alignSelf: 'center'
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

