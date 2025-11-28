import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10, themeColor8, themeColor2, themeColor4, themeColor7, themeColor6, themeColor11 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useSelector, useDispatch } from 'react-redux';
import { updateVehicleInfo } from '../../services/Api';
import { setUserData } from '../../slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import DatePickerModal from '../../components/DatePickerModal';
import { getFormatedDate } from 'react-native-modern-datepicker';
import { showAlert } from '../../helpers/Common';
export default function VehicleInfoScreen({ navigation }) {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user.data);
  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // State for DatePicker
  const [showInsuranceDatePicker, setShowInsuranceDatePicker] = useState(false);
  const [selectedInsuranceDate, setSelectedInsuranceDate] = useState('');

  const [vehicleData, setVehicleData] = useState({
    vehicleType: '',
    carModel: '',
    carColor: '',
    motorPlate: '',
    bodyPlate: '',
    carPlateLeft: '',
    carPlateRight: '',
    carPlateLetter: 'ب',
    carPlateProvince: '11',
    manufacturingYear: '',
    softwareType: '',
    vinNumber: '',
    insuranceExpiryCode: '',
    insuranceExpiryDate: ''
  });

  // Modal state for editing vehicle type
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false);

  const vehicleTypeOptions = [
    'خودرو',
    'موتور سیکلت',
    'دوچرخه',
    'پیاده',
    'وانت',
    'کامیون',
    'مینی‌ون',
  ];

  // Load user vehicle data from AsyncStorage if not in Redux
  useEffect(() => {
    const loadUserData = async () => {
      // If no data in Redux, try to load from AsyncStorage
      if (!userData) {
        console.log('⚠️ userData در Redux خالی است، از AsyncStorage می‌خوانیم...');
        setIsLoadingData(true);
        try {
          const storedData = await AsyncStorage.getItem('userData');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log('✅ داده از AsyncStorage خوانده شد');
            dispatch(setUserData(parsedData));
          }
        } catch (error) {
          console.error('خطا در خواندن از AsyncStorage:', error);
        } finally {
          setIsLoadingData(false);
        }
        return;
      }

      // API returns data in format: { technician: {...}, token_info: {...} }
      const technicianData = userData.technician || userData;

      // Parse car/motor plate based on vehicle type
      let plateLeft = '';
      let plateRight = '';
      let plateLetter = 'ب';
      let plateProvince = '11';
      let motorPlate = '';
      let bodyPlate = '';

      if (technicianData.car_plate) {
        const plate = technicianData.car_plate;
        
        if (technicianData.vehicle_type === 'خودرو') {
          // پلاک خودرو: 12ب345ایران56
          const carMatch = plate.match(/^(\d{2})([آ-ی])(\d{3})(?:ایران)?(\d{2})$/);
          if (carMatch) {
            plateLeft = carMatch[1];
            plateLetter = carMatch[2];
            plateRight = carMatch[3];
            plateProvince = carMatch[4];
            console.log('✅ پلاک خودرو parse شد:', { plateLeft, plateLetter, plateRight, plateProvince });
          }
        } else if (technicianData.vehicle_type === 'موتور سیکلت') {
          // پلاک موتور: 123-12345
          const motorMatch = plate.match(/^(\d{3})-(\d{5})$/);
          if (motorMatch) {
            motorPlate = motorMatch[1];
            bodyPlate = motorMatch[2];
            console.log('✅ پلاک موتور parse شد:', { motorPlate, bodyPlate });
          }
        }
      }

      setVehicleData(prevData => ({
        vehicleType: technicianData.vehicle_type || prevData.vehicleType,
        carModel: technicianData.car_model || prevData.carModel,
        carColor: technicianData.car_color || prevData.carColor,
        motorPlate: motorPlate || prevData.motorPlate,
        bodyPlate: bodyPlate || prevData.bodyPlate,
        carPlateLeft: plateLeft || prevData.carPlateLeft,
        carPlateRight: plateRight || prevData.carPlateRight,
        carPlateLetter: plateLetter || prevData.carPlateLetter,
        carPlateProvince: plateProvince || prevData.carPlateProvince,
        manufacturingYear: technicianData.car_year || prevData.manufacturingYear,
        softwareType: technicianData.car_fuel_type || prevData.softwareType,
        vinNumber: technicianData.car_vin || prevData.vinNumber,
        insuranceExpiryCode: technicianData.car_insurance_code || prevData.insuranceExpiryCode,
        insuranceExpiryDate: technicianData.car_insurance_expiry_date || prevData.insuranceExpiryDate
      }));
    };

    loadUserData();
  }, [userData, dispatch]);

  // وقتی modal تاریخ بیمه بسته می‌شود
  useEffect(() => {
    if (!showInsuranceDatePicker && selectedInsuranceDate && selectedInsuranceDate !== vehicleData.insuranceExpiryDate) {
      updateField('insuranceExpiryDate', selectedInsuranceDate);
    }
  }, [showInsuranceDatePicker, selectedInsuranceDate]);

  const updateField = (field, value) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler: when user selects a new vehicle type from modal
  const handleSelectVehicleType = async (type) => {
    setShowVehicleTypeModal(false);
    if (!type || type === vehicleData.vehicleType) return;

    // Prepare payload for API. Include vehicle_type so backend can persist it.
    const payload = {
      vehicle_type: type,
      // include existing fields so backend keeps them (or null to clear)
      car_model: vehicleData.carModel?.trim() || null,
      car_color: vehicleData.carColor?.trim() || null,
      car_plate: null, // clear plate when changing type; backend may accept null
      car_year: vehicleData.manufacturingYear || null,
      car_fuel_type: vehicleData.softwareType || null,
      car_vin: vehicleData.vinNumber || null,
      car_insurance_code: vehicleData.insuranceExpiryCode || null,
      car_insurance_expiry_date: vehicleData.insuranceExpiryDate || null,
    };

    setSaving(true);
    try {
      console.log('📤 updateVehicleInfo - changing vehicle type ->', type, payload);
      const result = await updateVehicleInfo(payload);
      console.log('📥 updateVehicleInfo result raw:', result);
      if (result && result.success) {
        showAlert('موفق', 'نوع وسیله با موفقیت به‌روزرسانی شد');

        // Update local UI state: clear plate fields that don't apply
        const newLocal = { ...vehicleData, vehicleType: type };
        if (type !== 'خودرو') {
          newLocal.carPlateLeft = '';
          newLocal.carPlateRight = '';
          newLocal.carPlateLetter = 'ب';
          newLocal.carPlateProvince = '11';
        }
        if (type !== 'موتور سیکلت') {
          newLocal.motorPlate = '';
          newLocal.bodyPlate = '';
        }
        setVehicleData(newLocal);

        // Update Redux + AsyncStorage if API returned updated technician
        if (result.data && result.data.technician) {
          const updatedUserData = {
            ...userData,
            technician: {
              ...userData.technician,
              ...result.data.technician
            }
          };
          dispatch(setUserData(updatedUserData));
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
          console.log('✅ Redux/AsyncStorage updated after vehicle type change');
        }
      } else {
        showAlert('خطا', result?.message || 'به‌روزرسانی نوع وسیله موفقیت‌آمیز نبود');
      }
    } catch (err) {
      console.error('خطا در updateVehicleInfo (vehicle type):', err);
      showAlert('خطا', 'ارتباط با سرور برقرار نشد');
    } finally {
      setSaving(false);
    }
  };

  // محاسبه تاریخ امروز به صورت شمسی
  const getTodayDate = () => {
    return getFormatedDate(new Date(), 'jYYYY/jMM/jDD');
  };

  // محاسبه تاریخ 10 سال آینده برای بیمه
  const getTenYearsLater = () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    return getFormatedDate(futureDate, 'jYYYY/jMM/jDD');
  };

  // Save vehicle info
  const handleSave = async () => {
    // Validation
    if (vehicleData.vinNumber && vehicleData.vinNumber.length > 17) {
      showAlert('خطا', 'شماره VIN نباید بیشتر از 17 کاراکتر باشد');
      return;
    }

    if (vehicleData.manufacturingYear && vehicleData.manufacturingYear.length > 4) {
      showAlert('خطا', 'سال ساخت نباید بیشتر از 4 رقم باشد');
      return;
    }

    setSaving(true);
    try {
      // Build car_plate based on vehicle type
      let carPlate = null;
      
      if (vehicleData.vehicleType === 'خودرو') {
        // پلاک خودرو: 12ب345ایران56
        if (vehicleData.carPlateLeft && vehicleData.carPlateLetter &&
            vehicleData.carPlateRight && vehicleData.carPlateProvince) {
          carPlate = `${vehicleData.carPlateLeft}${vehicleData.carPlateLetter}${vehicleData.carPlateRight}ایران${vehicleData.carPlateProvince}`;
          console.log('✅ پلاک خودرو ساخته شد:', carPlate);
        }
      } else if (vehicleData.vehicleType === 'موتور سیکلت') {
        // پلاک موتور: 123-12345 (فرمت ساده با dash)
        if (vehicleData.motorPlate && vehicleData.bodyPlate) {
          carPlate = `${vehicleData.motorPlate}-${vehicleData.bodyPlate}`;
          console.log('✅ پلاک موتور ساخته شد:', carPlate);
        }
      }

      // Prepare data in format expected by Backend
      console.log('====================================');
      console.log('نوع وسیله:', vehicleData.vehicleType);
      console.log('car_plate:', carPlate);
      console.log('car_model:', vehicleData.carModel);
      console.log('car_color:', vehicleData.carColor);
      console.log('====================================');
      const apiData = {
        car_model: vehicleData.carModel.trim() || null,
        car_color: vehicleData.carColor.trim() || null,
        car_plate: carPlate,
        car_year: vehicleData.manufacturingYear || null,
        car_fuel_type: vehicleData.softwareType || null,
        car_vin: vehicleData.vinNumber || null,
        car_insurance_code: vehicleData.insuranceExpiryCode || null,
        car_insurance_expiry_date: vehicleData.insuranceExpiryDate || null,
      };

      console.log('📤 ارسال داده به API:', apiData);

      const result = await updateVehicleInfo(apiData);

      if (result.success) {
        console.log('✅ پاسخ موفق از API دریافت شد');
        console.log('📦 result.data:', JSON.stringify(result.data, null, 2));

        showAlert('موفق', 'اطلاعات  با موفقیت به‌روزرسانی شد');

        // Update Redux with new data
        if (result.data && result.data.technician) {
          console.log('🔄 به‌روزرسانی Redux و AsyncStorage...');

          const updatedUserData = {
            ...userData,
            technician: {
              ...userData.technician,
              ...result.data.technician
            }
          };

          console.log('💾 داده‌های جدید technician:', result.data.technician);

          // Update Redux
          dispatch(setUserData(updatedUserData));

          // ⭐ IMPORTANT: Update AsyncStorage as well!
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
          console.log('✅ AsyncStorage به‌روز شد با car_model:', result.data.technician.car_model);
        } else {
          console.log('⚠️ result.data یا result.data.technician خالی است');
        }
      } else {
        showAlert('خطا', result.message || 'مشکلی در به‌روزرسانی پیش آمد');
      }
    } catch (error) {
      console.error('خطا در ذخیره:', error);
      showAlert('خطا', 'مشکلی در ارتباط با سرور پیش آمد');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <LinearGradient
          colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        >
          <CustomStatusBar />
          <ScreenHeaders
            title={'حساب کاربری / حریم خصوصی'}
            onPressLeft={() => navigation.goBack()}
          />

          <ScrollView contentContainerStyle={styles.container}>

            {/* دکمه مشخصات وسیله نقلیه */}
            <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
              <Text style={styles.buttonText}>مشخصات وسیله نقلیه</Text>
            </TouchableOpacity>

            {/* باکس نوع وسیله نقلیه (قابل ویرایش) */}
            <TouchableOpacity style={styles.vehicleTypeBox} onPress={() => setShowVehicleTypeModal(true)} disabled={saving}>
              <Text style={styles.vehicleTypeLabel}>
                نوع وسیله نقلیه: {vehicleData.vehicleType || 'مشخص نشده'}
              </Text>
            </TouchableOpacity>

            {/* فرم اطلاعات وسیله */}
            <View style={styles.formContainer}>

              {/* پیام برای دوچرخه و پیاده */}
              {(vehicleData.vehicleType === 'دوچرخه' || vehicleData.vehicleType === 'پیاده') && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    برای {vehicleData.vehicleType}، نیازی به ثبت اطلاعات خاصی نیست.
                  </Text>
                </View>
              )}

              {/* پلاک موتور سیکلت - فقط برای موتور */}
              {vehicleData.vehicleType === 'موتور سیکلت' && (
                <View style={styles.plateSection}>
                  <Text style={styles.label}>پلاک موتور سیکلت :</Text>
                  <View style={styles.plateRow}>
                    <TextInput
                      style={[styles.input, styles.plateInput]}
                      value={vehicleData.motorPlate}
                      onChangeText={(value) => updateField('motorPlate', String(value).replace(/[^0-9]/g, '').slice(0, 3))}
                      keyboardType="numeric"
                      placeholder="3 رقم بالا"
                      maxLength={3}
                      editable={!saving}
                    />
                    <TextInput
                      style={[styles.input, styles.plateInput]}
                      value={vehicleData.bodyPlate}
                      onChangeText={(value) => updateField('bodyPlate', String(value).replace(/[^0-9]/g, '').slice(0, 5))}
                      keyboardType="numeric"
                      placeholder="5 رقم پایین"
                      maxLength={5}
                      editable={!saving}
                    />
                  </View>
                  <View style={styles.platePreviewWrap}>
                    <PlatePreviewMotorcycle left={vehicleData.motorPlate} right={vehicleData.bodyPlate} />
                  </View>
                </View>
              )}

              {/* پلاک خودرو - فقط برای خودرو */}
              {vehicleData.vehicleType === 'خودرو' && (
                <View style={styles.plateSection}>
                  <Text style={styles.label}>پلاک خودرو :</Text>
                  <View style={styles.plateRow}>
                    <TextInput
                      style={[styles.input, styles.plateInput]}
                      value={vehicleData.carPlateLeft}
                      onChangeText={(v) => updateField('carPlateLeft', v)}
                      placeholder="مثال: 12"
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!saving}
                    />
                    <TextInput
                      style={[styles.input, styles.plateInput]}
                      value={vehicleData.carPlateRight}
                      onChangeText={(v) => updateField('carPlateRight', v)}
                      placeholder="مثال: 345"
                      keyboardType="numeric"
                      maxLength={3}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.plateExtraRow}>
                    <TextInput
                      style={[styles.input, styles.plateLetterInput]}
                      value={vehicleData.carPlateLetter}
                      onChangeText={(v) => updateField('carPlateLetter', v)}
                      placeholder="حرف پلاک"
                      maxLength={1}
                      editable={!saving}
                    />
                    <TextInput
                      style={[styles.input, styles.plateProvinceInput]}
                      value={vehicleData.carPlateProvince}
                      onChangeText={(v) => updateField('carPlateProvince', v)}
                      placeholder="کد استان"
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!saving}
                    />
                  </View>

                  {/* Plate preview */}
                  <View style={styles.platePreviewWrap}>
                    <PlatePreview
                      left={vehicleData.carPlateLeft}
                      right={vehicleData.carPlateRight}
                      letter={vehicleData.carPlateLetter}
                      province={vehicleData.carPlateProvince}
                    />
                  </View>
                </View>
              )}

              {/* فیلدهای زیر فقط برای موتور و خودرو */}
              {(vehicleData.vehicleType === 'موتور سیکلت' || vehicleData.vehicleType === 'خودرو') && (
                <>
                  <View style={styles.inputRow}>
                    <Text style={styles.label}>مدل :</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.carModel}
                      onChangeText={(value) => updateField('carModel', value)}
                      placeholder="مثال: پراید 131"
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>رنگ :</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.carColor}
                      onChangeText={(value) => updateField('carColor', value)}
                      placeholder="مثال: سفید"
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>سال ساخت :</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.manufacturingYear}
                      onChangeText={(value) => updateField('manufacturingYear', value)}
                      placeholder=""
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>نوع سوخت :</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.softwareType}
                      onChangeText={(value) => updateField('softwareType', value)}
                      placeholder=""
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>شماره شناسه وسیله (VIN) :</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.vinNumber}
                      onChangeText={(value) => updateField('vinNumber', value)}
                      placeholder=""
                      maxLength={17}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>کد یکتای بیمه شخص ثالث :</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.insuranceExpiryCode}
                      onChangeText={(value) => updateField('insuranceExpiryCode', value)}
                      placeholder=""
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>تاریخ انقضاء بیمه شخص ثالث :</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => !saving && setShowInsuranceDatePicker(true)}
                      disabled={saving}
                    >
                      <Text style={[
                        styles.dateText,
                        !vehicleData.insuranceExpiryDate && styles.placeholderText
                      ]}>
                        {vehicleData.insuranceExpiryDate || 'انتخاب تاریخ (مثال: 1405/05/15)'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

            </View>

            {/* دکمه‌های ثبت و ویرایش */}
            
            <Button title={'ثبت مشخصات'} onPress={handleSave} loading={saving}/>

          </ScrollView>

        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Modal انتخاب نوع وسیله نقلیه */}
      <Modal
        visible={showVehicleTypeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVehicleTypeModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowVehicleTypeModal(false)}>
          <View style={styles.modalContent}>
            <Text style={[NewStyles.title, { textAlign: 'center', marginBottom: 10 }]}>انتخاب نوع وسیله</Text>
            {vehicleTypeOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.modalOption}
                onPress={() => handleSelectVehicleType(opt)}
                disabled={saving}
              >
                <Text style={NewStyles.text}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.modalCancel]} onPress={() => setShowVehicleTypeModal(false)}>
              <Text style={NewStyles.text4}>انصراف</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* DatePicker Modal for Insurance Expiry Date */}
      <DatePickerModal
        datePickerModal={showInsuranceDatePicker}
        setDatePickerModal={setShowInsuranceDatePicker}
        birthDate={selectedInsuranceDate || vehicleData.insuranceExpiryDate}
        setBirthDate={setSelectedInsuranceDate}
        minimumDate={getTodayDate()}
        maximumDate={getTenYearsLater()}
        isCurrentDate={selectedInsuranceDate || vehicleData.insuranceExpiryDate || getTodayDate()}
      />
    </SafeAreaView>
  );
}

// Small preview component that renders a stylized Iranian-like car plate
function PlatePreview({ left = '', right = '', letter = 'ب', province = '11' }) {
  // helper: convert ASCII digits to Persian digits
  const toPersian = (s) => {
    const map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(s || '').split('').map(ch => {
      if (ch >= '0' && ch <= '9') return map[ch.charCodeAt(0) - 48];
      return ch;
    }).join('');
  };

  // left should be 2 digits, right 3 digits
  const leftText = left ? left.padStart(2, '0') : '__';
  const rightText = right ? right.padStart(3, '0') : '___';

  // use provided letter and province (already defaulted in params)
  // تبدیل "ا" و "آ" به "الف"
  let plateLetter = letter || 'ب';
  if (plateLetter === 'ا' || plateLetter === 'آ') {
    plateLetter = 'الف';
  }
  const plateProvince = province || '11';

  return (
    <View style={styles.plateBox}>
      {/* left vertical flag/blue strip */}
      <View style={styles.plateFlagStrip}>
        <View style={styles.flagColors}>
          <View style={[styles.flagStripe, { backgroundColor: themeColor7.bgColor(1) }]} />
          <View style={[styles.flagStripe, { backgroundColor: themeColor4.bgColor(1) }]} />
          <View style={[styles.flagStripe, { backgroundColor: themeColor6.bgColor(1) }]} />
        </View>
        <Text style={styles.flagText}>I.R.{"\n"}IRAN</Text>
      </View>

      {/* main plate area */}
      <View style={styles.plateMainArea}>
        <View style={styles.plateNumberWrap}>
          <Text style={styles.plateNumberText}>{toPersian(rightText)}</Text>
          <Text style={[styles.plateLetterText, plateLetter === 'الف' && { fontSize: 22 }]}>
            {plateLetter}
          </Text>
          <Text style={styles.plateNumberText}>{toPersian(leftText)}</Text>
        </View>
      </View>

      {/* right small box with IRAN / province code */}
      <View style={styles.plateCityBoxNew}>
        <Text style={styles.plateCityTop}>ایران</Text>
        <Text style={styles.plateCityNumber}>{toPersian(plateProvince)}</Text>
      </View>
    </View>
  );
}

// Motorcycle plate preview (two-row Persian digits style)
function PlatePreviewMotorcycle({ left = '', right = '' }) {
  const toPersian = (s) => {
    const map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(s || '').split('').map(ch => {
      if (ch >= '0' && ch <= '9') return map[ch.charCodeAt(0) - 48];
      return ch;
    }).join('');
  };

  const leftText = left ? left : '__';
  const rightText = right ? right : '_____';

  return (
    <View style={styles.motorPlateBox}>
      <View style={styles.motorFlagStrip}>
        <View style={styles.flagColors}>
          <View style={[styles.flagStripe, { backgroundColor: themeColor7.bgColor(1) }]} />
          <View style={[styles.flagStripe, { backgroundColor: themeColor4.bgColor(1) }]} />
          <View style={[styles.flagStripe, { backgroundColor: themeColor6.bgColor(1) }]} />
        </View>
        <Text style={styles.flagText}>I.R.{"\n"}IRAN</Text>
      </View>
      <View style={styles.motorInner}>
        <Text style={styles.motorTop}>{toPersian(leftText)}</Text>
        <Text style={styles.motorBottom}>{toPersian(rightText)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 15,
  },
  mainButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    ...NewStyles.text4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehicleTypeBox: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 15,
  },
  vehicleTypeLabel: {
    ...NewStyles.text10,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: themeColor8.bgColor(1),
  },
  infoText: {
    ...NewStyles.text,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 15,
    gap: 10,
  },
  inputRow: {
    marginVertical: 5,
  },
  plateSection: {
    marginVertical: 5,
  },
  plateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  plateInput: {
    ...NewStyles.text10,
    flex: 1,
  },
  label: {
    ...NewStyles.text10,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.3),
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: themeColor4.bgColor(1),
    textAlign: 'right',
    ...NewStyles.text10,
    minHeight: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: themeColor11.bgColor(1),
  },
  saveButton: {
    backgroundColor: themeColor7.bgColor(1),
  },
  saveButtonDisabled: {
    backgroundColor: themeColor3.bgColor(1),
  },
  actionButtonText: {
    ...NewStyles.text4,
    color: themeColor4.bgColor(1),
    fontSize: 14,
    fontWeight: '600',
  },
  platePreviewWrap: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  plateExtraRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  plateLetterInput: {
    width: 80,
    textAlign: 'center',
    fontWeight: '900',
  },
  plateProvinceInput: {
    width: 100,
    textAlign: 'center',
    fontWeight: '900',
  },
  plateBox: {
    width: 260,
    height: 90,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 8,
    borderWidth: 3,
    borderColor: themeColor10.bgColor(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  plateFlagStrip: {
    width: 34,
    height: '100%',
    backgroundColor: themeColor2.bgColor(1),
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  flagColors: {
    width: 18,
    height: 36,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  flagStripe: {
    flex: 1,
  },
  flagText: {
    color: themeColor4.bgColor(1),
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  plateNumberArea: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  plateMainArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateNumberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateNumberText: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 6,
    marginHorizontal: 6,
  },
  plateLetterText: {
    ...NewStyles.text10,
    fontSize: 28,
    fontWeight: '900',
    marginHorizontal: 4,
  },
  plateCityBox: {
    width: 60,
    height: '100%',
    backgroundColor: themeColor10.bgColor(1),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  plateCityText: {
    color: themeColor10.bgColor(1),
    fontSize: 12,
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
  },
  plateCityBoxNew: {
    width: 56,
    height: '100%',
    backgroundColor: themeColor4.bgColor(1),
    borderLeftWidth: 2,
    borderLeftColor: themeColor10.bgColor(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateCityTop: {
    ...NewStyles.text10,
    fontSize: 10,
    fontWeight: '700',

  },
  plateCityNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: themeColor10.bgColor(1),
    marginTop: 4,
  },
  motorPlateBox: {
    width: 220,
    height: 120,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 8,
    borderWidth: 3,
    borderColor: themeColor10.bgColor(1),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  motorFlagStrip: {
    width: 30,
    height: '100%',
    backgroundColor: themeColor2.bgColor(1),
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  motorInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  motorTop: {
    fontSize: 36,
    fontWeight: '900',
  },
  motorBottom: {
    fontSize: 46,
    fontWeight: '900',
    marginTop: 6,
  },
  dateText: {
    ...NewStyles.text10,
    fontSize: 14,
    textAlign: 'right',
  },
  placeholderText: {
    color: themeColor3.bgColor(0.6),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: themeColor4.bgColor(1),
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '60%',
    gap: 8,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: themeColor3.bgColor(0.2),
  },
  modalCancel: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: themeColor0.bgColor(0.9),
    borderRadius: 8,
  },
});
