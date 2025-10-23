import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from './Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor10 } from '../theme/Color';

export default function RequestsScreen({ navigation }) {
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    {
      id: 1,
      title: 'آموزش / مراجعه',
      type: 'training'
    },
    {
      id: 2,
      title: 'مرخصی / استعلاجی',
      type: 'leave'
    },
    {
      id: 3,
      title: 'تسهیلات / وام بدون بهره',
      type: 'loan'
    },
    {
      id: 4,
      title: 'نیروی انسانی',
      type: 'hr'
    },
    {
      id: 5,
      title: 'انتقال / سمت',
      type: 'transfer'
    },
    {
      id: 6,
      title: 'سایر / توضیحات',
      type: 'other'
    },
    {
      id: 7,
      title: 'عدم همراهی',
      type: 'cooperation'
    }
  ];

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // محتوای بخش آموزش / مراجعه
  const renderTrainingContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity style={styles.subOption}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>مدیر آموزشی سخت افزار</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subOption}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>مدیر آموزشی نرم افزار</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subOption}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>مدیر داخلی</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subOption}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>مدیر میدانی</Text>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
    </View>
  );

  // محتوای بخش مرخصی / استعلاجی
  const renderLeaveContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity style={styles.subOptionDropdown}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>ساعتی</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>تاریخ:</Text>
          <TextInput style={styles.dateInput} placeholder="" />
        </View>
        <View style={styles.timeField}>
          <Text style={styles.timeLabel}>از ساعت:</Text>
          <TextInput style={styles.timeInput} placeholder="ای" />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
      <TouchableOpacity style={styles.subOptionDropdown}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>روزانه</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>از تاریخ:</Text>
          <TextInput style={styles.dateInput} placeholder="" />
        </View>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>تا تاریخ:</Text>
          <TextInput style={styles.dateInput} placeholder="" />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
    </View>
  );

  // محتوای بخش تسهیلات / وام بدون بهره
  const renderLoanContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity style={styles.subOptionDropdown}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>ضامن / ضمانت نامه</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
      <TouchableOpacity style={styles.subOptionDropdown}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>وام بدون بهره</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.loanRow}>
        <Text style={styles.loanLabel}>مبلغ وام:</Text>
        <TextInput style={styles.loanInput} placeholder="" />
        <Text style={styles.currency}>ریال</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>آیا ضامن دارید؟ توضیح دهید:</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
      <View style={styles.monthRow}>
        <Text style={styles.monthLabel}>مدت زمان پرداخت:</Text>
        <TextInput style={styles.monthInput} placeholder="" />
        <Text style={styles.monthText}>ماه</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>در صورت نیاز فوری / شهری، توضیح دهید:</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
    </View>
  );

  // محتوای بخش نیروی انسانی
  const renderHRContent = () => (
    <View style={styles.expandedContent}>
      <View style={styles.hrOptions}>
        <TouchableOpacity style={styles.hrOption}>
          <Text style={[NewStyles.text4, styles.hrOptionText]}>درخواست نیروی انسانی میدانی دارید ؟ توضیح دهید</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hrOption}>
          <Text style={[NewStyles.text4, styles.hrOptionText]}>درخواست نیروی انسانی  داخلی دارید ؟ توضیح دهید</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // محتوای بخش انتقال / سمت
  const renderTransferContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity style={styles.subOptionDropdown}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>انتقال به شهر / منطقه دیگر</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
      <TouchableOpacity style={styles.subOptionDropdown}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>ارتقا / تغییر سمت</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
    </View>
  );

  // محتوای بخش سایر / توضیحات
  const renderOtherContent = () => (
    <View style={styles.expandedContent}>
      <View style={styles.otherOptions}>
        <TouchableOpacity style={styles.otherOption}>
          <Text style={[NewStyles.text4, styles.otherOptionText]}>آموزشی</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.otherOption}>
          <Text style={[NewStyles.text4, styles.otherOptionText]}>مرخصی / استعلاجی</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.otherOption}>
          <Text style={[NewStyles.text4, styles.otherOptionText]}>تسهیلات / وام بدون بهره</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.otherOption}>
          <Text style={[NewStyles.text4, styles.otherOptionText]}>نیروی انسانی</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.otherOption}>
          <Text style={[NewStyles.text4, styles.otherOptionText]}>انتقال / سمت</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.otherOption}>
          <Text style={[NewStyles.text4, styles.otherOptionText]}>عدم همراهی</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات:</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
    </View>
  );

  // محتوای بخش عدم همراهی
  const renderCooperationContent = () => (
    <View style={styles.expandedContent}>
      <TouchableOpacity style={styles.subOptionDropdown}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>بصورت موقت</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>از تاریخ:</Text>
          <TextInput style={styles.dateInput} placeholder="" />
        </View>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>تا تاریخ:</Text>
          <TextInput style={styles.dateInput} placeholder="" />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
      <TouchableOpacity style={styles.subOptionDropdown}>
        <Text style={[NewStyles.text4, styles.subOptionText]}>بصورت دائم</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>از تاریخ:</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="تاریخ را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={[NewStyles.text4, styles.inputLabel]}>توضیحات (ضروری):</Text>
        <TextInput
          style={[NewStyles.textInput, styles.textInput]}
          placeholder="توضیحات خود را وارد کنید"
          placeholderTextColor={themeColor10.bgColor(0.7)}
          multiline
        />
      </View>
    </View>
  );

  const renderContent = (type) => {
    switch (type) {
      case 'training': return renderTrainingContent();
      case 'leave': return renderLeaveContent();
      case 'loan': return renderLoanContent();
      case 'hr': return renderHRContent();
      case 'transfer': return renderTransferContent();
      case 'other': return renderOtherContent();
      case 'cooperation': return renderCooperationContent();
      default: return null;
    }
  };

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'درخواست ها'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => toggleItem(item.id)}
              >
                <Text style={[NewStyles.text4, styles.menuButtonText]}>
                  {item.title}
                </Text>
                <View style={styles.arrow}>
                  <Text style={styles.arrowText}>
                    {expandedItems[item.id] ? '▲' : '▼'}
                  </Text>
                </View>
              </TouchableOpacity>
              
              {expandedItems[item.id] && renderContent(item.type)}
            </View>
          ))}
        </View>
      </ScrollView>
      
      <Footer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1 
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  menuItem: {
    marginVertical: 5,
  },
  menuButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  arrow: {
    backgroundColor: '#FFEB3B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandedContent: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 15,
    marginTop: 5,
  },
  contentText: {
    color: '#fff',
    textAlign: 'right',
    fontSize: 14,
  },
  subOption: {
    backgroundColor: 'rgba(200,200,200,0.8)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 3,
    alignItems: 'center',
  },
  subOptionDropdown: {
    backgroundColor: 'rgba(200,200,200,0.8)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 3,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subOptionText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    marginVertical: 8,
  },
  inputLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
    color: '#000',
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    color: '#000',
    textAlign: 'right',
  },
  dateRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  dateField: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeField: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 6,
    marginBottom: 3,
    color: '#000',
    textAlign: 'right',
    fontSize: 12,
  },
  timeLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 6,
    marginBottom: 3,
    color: '#000',
    textAlign: 'right',
    fontSize: 12,
  },
  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    color: '#000',
    textAlign: 'center',
  },
  timeInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    color: '#000',
    textAlign: 'center',
  },
  loanRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 8,
  },
  loanLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    color: '#000',
    marginLeft: 10,
    textAlign: 'right',
  },
  loanInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    flex: 1,
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 5,
  },
  currency: {
    backgroundColor: '#FFEB3B',
    borderRadius: 6,
    padding: 8,
    color: '#000',
    fontWeight: 'bold',
  },
  monthRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 8,
  },
  monthLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    color: '#000',
    marginLeft: 10,
    textAlign: 'right',
  },
  monthInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    flex: 1,
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 5,
  },
  monthText: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    color: '#000',
    fontWeight: 'bold',
  },
  hrOptions: {
    marginVertical: 5,
  },
  hrOption: {
    backgroundColor: 'rgba(200,200,200,0.8)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 3,
    alignItems: 'center',
  },
  hrOptionText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
  },
  otherOptions: {
    marginVertical: 5,
  },
  otherOption: {
    backgroundColor: 'rgba(200,200,200,0.8)',
    borderRadius: 8,
    padding: 10,
    marginVertical: 2,
    alignItems: 'center',
  },
  otherOptionText: {
    color: '#000',
    fontSize: 12,
    textAlign: 'center',
  },
});