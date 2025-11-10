import React, { useState } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';

import ScreenHeaders from '../../components/ScreenHeaders';
import ScreenTitle from '../../components/ScreenTitle';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor2, themeColor6, themeColor8 } from '../../theme/Color';
import { cancelOrderByTechnician } from '../../services/Api';
import { showToastOrAlert , showAlert} from '../../helpers/Common';

export default function AttendanceScreen({ navigation, route }) {
  const { orderId } = route?.params || {};
  
  const [selectedOption, setSelectedOption] = useState('');
  const [notes, setNotes] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // دلایل لغو که نیاز به نمایش دکمه لغو دارند
  const cancelReasons = [
    'اعلام حضور / لغو از سوی کاربر',
    'اعلام حضور / لغو از سوی تکنسین',
    'اعلام حضور / نادرست بودن آدرس',
    'اعلام حضور / موکول به زمان دیگر از سوی کاربر',
    'اعلام حضور / عدم پاسخ تماس و پیام از سوی کاربر     ',
    'اعلام حضور/عدم حضورکاربر - حضور خانواده یا آشنایان',
    'اعلام حضور / نادرست بودن مشخصات کاربر',
  ];

  const attendanceOptions = [
    'اعلام حضور / در حال انجام',
    ...cancelReasons,
    'عدم حضور از سوی تکنسین'
  ];

  // چک کردن اینکه آیا گزینه انتخاب شده نیاز به لغو دارد
  const shouldShowCancelButton = cancelReasons.includes(selectedOption);

  const handleCancelOrder = async () => {
    if (!orderId) {
      showToastOrAlert('خطا', 'شناسه سفارش یافت نشد');
      return;
    }

    if (!notes.trim()) {
      showToastOrAlert('خطا', 'لطفاً توضیحات را وارد کنید');
      return;
    }

    showAlert(
      'تأیید لغو سفارش',
      `آیا از لغو این سفارش با دلیل "${selectedOption}" اطمینان دارید؟`,
      [
        {
          text: 'انصراف',
          style: 'cancel'
        },
        {
          text: 'تأیید',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const cancelReason = `${selectedOption}\n\nتوضیحات: ${notes}`;
              await cancelOrderByTechnician(orderId, cancelReason);
              
              showToastOrAlert('موفق', 'سفارش با موفقیت لغو شد');
              
              // بازگشت به صفحه قبل
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            } catch (error) {
              showToastOrAlert('خطا', error.message || 'خطا در لغو سفارش');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
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
        title={' انجام سرویس '} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('LaptopDispatchScreen')} 
      />
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle title={'مراجعه / حضور'} />

        {/* لیست گزینه‌های حضور */}
        {attendanceOptions.map((option, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.optionRow,
              selectedOption === option && styles.optionRowSelected
            ]}
            onPress={() => setSelectedOption(option)}
          >
            <View style={styles.radioContainer}>
              <View style={[
                styles.radioOuter,
                selectedOption === option && styles.radioOuterSelected
              ]}>
                {selectedOption === option && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={[
              NewStyles.text4, 
              styles.optionText,
              selectedOption === option && styles.optionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}

        {/* توضیحات */}
        <View style={styles.fullWidthField}>
          <Text style={[NewStyles.text4, styles.fullWidthLabel]}>
            توضیحات {shouldShowCancelButton && '(الزامی برای لغو)'}:
          </Text>
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
            placeholder="توضیحات خود را وارد کنید..."
            placeholderTextColor={themeColor10.bgColor(0.5)}
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* دکمه لغو سفارش - فقط برای گزینه‌های لغو */}
        {shouldShowCancelButton && (
          <TouchableOpacity 
            style={[
              styles.cancelButton,
              (!notes.trim() || loading) && styles.cancelButtonDisabled
            ]}
            onPress={handleCancelOrder}
            disabled={!notes.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={22} color="#fff" />
                <Text style={styles.cancelButtonText}>لغو سفارش</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* بخش اعزام فوری همراه چاپگر */}
        <View style={styles.specialSection}>
          <Text style={[NewStyles.text4, styles.specialTitle]}>
            اعزام فوری همراه / جایگزین تکنسین / قطعات
          </Text>
          
          <View style={styles.fullWidthField}>
            <Text style={[NewStyles.text4, styles.fullWidthLabel]}>
              توضیحات تکنسین ( ضروری ) :
            </Text>
            <TextInput
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.fullWidthInput]}
              placeholder="توضیحات خود را وارد کنید..."
              placeholderTextColor={themeColor10.bgColor(0.5)}
              multiline
              value={emergencyNotes}
              onChangeText={setEmergencyNotes}
            />
          </View>
        </View>

      </ScrollView>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  optionRow: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    backgroundColor: '#BBDEFB',
    borderColor: '#2196F3',
  },
  radioContainer: {
    marginLeft: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#757575',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: '#2196F3',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
  },
  optionText: {
    flex: 1,
    textAlign: 'right',
    color: '#000',
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  fullWidthField: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    marginTop: 15,
  },
  fullWidthLabel: {
    textAlign: 'right',
    color: '#000',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  fullWidthInput: {
    minHeight: 60,
    fontSize: 13,
    backgroundColor: '#fff',
    textAlign: 'right',
    textAlignVertical: 'top',
  },
  cancelButton: {
    backgroundColor: themeColor6.bgColor(1),
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  specialTitle: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    marginBottom: 10,
  },
});
