import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createStyles } from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import {
  themeColor0,
  themeColor3,
  themeColor10,
  themeColor8,
  themeColor2,
  themeColor4,
  themeColor7,
  themeColor6,
  themeColor11,
} from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useSelector, useDispatch } from 'react-redux';
import { updateVehicleInfo } from '../../services/Api';
import { fetchUser } from '../../slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import DatePickerModal from '../../components/DatePickerModal';
import { getFormatedDate } from 'react-native-modern-datepicker';
import { showAlert } from '../../helpers/Common';
import { useTranslation } from 'react-i18next';

export default function VehicleInfoScreen({ navigation }) {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  // ⛔️ قبلاً اسم NewStyles با import تداخل داشت؛ اینجا تمیزش کردیم
  const baseStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(baseStyles), [baseStyles]);

  const userData = useSelector(state => state.user.data?.data?.technician);
  const userToken = useSelector(state => state.auth.token);

  const [saving, setSaving] = useState(false);
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
    insuranceExpiryDate: '',
  });

  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false);

  const vehicleTypeOptions = [
    { value: 'خودرو', label: t('Car') },
    { value: 'موتور سیکلت', label: t('Motorcycle') },
    { value: 'دوچرخه', label: t('Bicycle') },
    { value: 'پیاده', label: t('Pedestrian') },
  ];

  const vehicleTypeLabels = {
    خودرو: t('Car'),
    'موتور سیکلت': t('Motorcycle'),
    دوچرخه: t('Bicycle'),
    پیاده: t('Pedestrian'),
  };

  const vehicleTypeLabel = vehicleData.vehicleType
    ? (vehicleTypeLabels[vehicleData.vehicleType] || vehicleData.vehicleType)
    : t('Not Specified');

  useEffect(() => {
    const loadUserData = async () => {
      let plateLeft = '';
      let plateRight = '';
      let plateLetter = 'ب';
      let plateProvince = '11';
      let motorPlate = '';
      let bodyPlate = '';

      if (userData?.car_plate) {
        const plate = userData.car_plate;

        if (userData.vehicle_type === 'خودرو') {
          const carMatch = plate.match(/^(\d{2})([آ-ی])(\d{3})(?:ایران)?(\d{2})$/);
          if (carMatch) {
            plateLeft = carMatch[1];
            plateLetter = carMatch[2];
            plateRight = carMatch[3];
            plateProvince = carMatch[4];
          }
        } else if (userData.vehicle_type === 'موتور سیکلت') {
          const motorMatch = plate.match(/^(\d{3})-(\d{5})$/);
          if (motorMatch) {
            motorPlate = motorMatch[1];
            bodyPlate = motorMatch[2];
          }
        }
      }

      setVehicleData(prevData => ({
        vehicleType: userData?.vehicle_type || prevData.vehicleType,
        carModel: userData?.car_model || prevData.carModel,
        carColor: userData?.car_color || prevData.carColor,
        motorPlate: motorPlate || prevData.motorPlate,
        bodyPlate: bodyPlate || prevData.bodyPlate,
        carPlateLeft: plateLeft || prevData.carPlateLeft,
        carPlateRight: plateRight || prevData.carPlateRight,
        carPlateLetter: plateLetter || prevData.carPlateLetter,
        carPlateProvince: plateProvince || prevData.carPlateProvince,
        manufacturingYear: userData?.car_year || prevData.manufacturingYear,
        softwareType: userData?.car_fuel_type || prevData.softwareType,
        vinNumber: userData?.car_vin || prevData.vinNumber,
        insuranceExpiryCode: userData?.car_insurance_code || prevData.insuranceExpiryCode,
        insuranceExpiryDate: userData?.car_insurance_expiry_date || prevData.insuranceExpiryDate,
      }));
    };

    loadUserData();
  }, [userData, dispatch]);

  useEffect(() => {
    if (
      !showInsuranceDatePicker &&
      selectedInsuranceDate &&
      selectedInsuranceDate !== vehicleData.insuranceExpiryDate
    ) {
      updateField('insuranceExpiryDate', selectedInsuranceDate);
    }
  }, [showInsuranceDatePicker, selectedInsuranceDate]);

  const updateField = (field, value) => {
    setVehicleData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectVehicleType = async (type) => {
    setShowVehicleTypeModal(false);
    if (!type || type === vehicleData.vehicleType) return;

    const payload = {
      vehicle_type: type,
      car_model: vehicleData.carModel?.trim() || null,
      car_color: vehicleData.carColor?.trim() || null,
      car_plate: null,
      car_year: vehicleData.manufacturingYear || null,
      car_fuel_type: vehicleData.softwareType || null,
      car_vin: vehicleData.vinNumber || null,
      car_insurance_code: vehicleData.insuranceExpiryCode || null,
      car_insurance_expiry_date: vehicleData.insuranceExpiryDate || null,
    };

    setSaving(true);
    try {
      const result = await updateVehicleInfo(payload);

      if (result && result.success) {
        showAlert(t('Success'), t('Vehicle type updated successfully.'));

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
        dispatch(fetchUser(userToken));
      } else {
        showAlert(t('Error'), result?.message || t('Vehicle type update failed.'));
      }
    } finally {
      setSaving(false);
    }
  };

  const getTodayDate = () => getFormatedDate(new Date(), 'jYYYY/jMM/jDD');
  const getTenYearsLater = () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    return getFormatedDate(futureDate, 'jYYYY/jMM/jDD');
  };

  const handleSave = async () => {
    if (vehicleData.vinNumber && vehicleData.vinNumber.length > 17) {
      showAlert(t('Error'), t('VIN number must not exceed 17 characters.'));
      return;
    }

    if (vehicleData.manufacturingYear && vehicleData.manufacturingYear.length > 4) {
      showAlert(t('Error'), t('Manufacturing year must not exceed 4 digits.'));
      return;
    }

    setSaving(true);
    try {
      let carPlate = null;

      if (vehicleData.vehicleType === 'خودرو') {
        if (
          vehicleData.carPlateLeft &&
          vehicleData.carPlateLetter &&
          vehicleData.carPlateRight &&
          vehicleData.carPlateProvince
        ) {
          carPlate = `${vehicleData.carPlateLeft}${vehicleData.carPlateLetter}${vehicleData.carPlateRight}ایران${vehicleData.carPlateProvince}`;
        }
      } else if (vehicleData.vehicleType === 'موتور سیکلت') {
        if (vehicleData.motorPlate && vehicleData.bodyPlate) {
          carPlate = `${vehicleData.motorPlate}-${vehicleData.bodyPlate}`;
        }
      }

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

      const result = await updateVehicleInfo(apiData);

      if (result.success) {
        showAlert(t('Success'), t('Information updated successfully.'));
        dispatch(fetchUser(userToken));
      } else {
        showAlert(t('Error'), result.message || t('There was a problem updating.'));
      }
    } catch (error) {
      showAlert(t('Error'), t('There was an error connecting to the server.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={baseStyles.container} edges={{ top: 'off', bottom: 'off' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <LinearGradient
          colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        >
          <CustomStatusBar />
          <ScreenHeaders title={t('Account / Privacy')} />

          <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
              <Text style={styles.buttonText}>{t('Vehicle Information')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.vehicleTypeBox}
              onPress={() => setShowVehicleTypeModal(true)}
              disabled={saving}
            >
              <Text style={styles.vehicleTypeLabel}>
                {t('Vehicle type: {{type}}', { type: vehicleTypeLabel })}
              </Text>
            </TouchableOpacity>

            <View style={styles.formContainer}>
              {(vehicleData.vehicleType === 'دوچرخه' || vehicleData.vehicleType === 'پیاده') && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    {t('For {{type}}, no specific information is required.', { type: vehicleTypeLabel })}
                  </Text>
                </View>
              )}

              {vehicleData.vehicleType === 'موتور سیکلت' && (
                <View style={styles.plateSection}>
                  <Text style={styles.label}>{t('Motorcycle plate:')}</Text>
                  <View style={styles.plateRow}>
                    <TextInput
                      style={[styles.input, styles.plateInput]}
                      value={vehicleData.motorPlate}
                      onChangeText={(value) =>
                        updateField('motorPlate', String(value).replace(/[^0-9]/g, '').slice(0, 3))
                      }
                      keyboardType="numeric"
                      placeholder={t('Top 3 digits')}
                      maxLength={3}
                      editable={!saving}
                    />
                    <TextInput
                      style={[styles.input, styles.plateInput]}
                      value={vehicleData.bodyPlate}
                      onChangeText={(value) =>
                        updateField('bodyPlate', String(value).replace(/[^0-9]/g, '').slice(0, 5))
                      }
                      keyboardType="numeric"
                      placeholder={t('Bottom 5 digits')}
                      maxLength={5}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.platePreviewWrap}>
                    {/* ✅ styles پاس داده شد */}
                    <PlatePreviewMotorcycle styles={styles} left={vehicleData.motorPlate} right={vehicleData.bodyPlate} />
                  </View>
                </View>
              )}

              {vehicleData.vehicleType === 'خودرو' && (
                <View style={styles.plateSection}>
                  <Text style={styles.label}>{t('Car plate:')}</Text>
                  <View style={styles.plateRow}>
                    <TextInput
                      style={[styles.input, styles.plateInput]}
                      value={vehicleData.carPlateLeft}
                      onChangeText={(v) => updateField('carPlateLeft', v)}
                      placeholder={t('Example: 12')}
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!saving}
                    />
                    <TextInput
                      style={[styles.input, styles.plateInput]}
                      value={vehicleData.carPlateRight}
                      onChangeText={(v) => updateField('carPlateRight', v)}
                      placeholder={t('Example: 345')}
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
                      placeholder={t('Plate letter')}
                      maxLength={1}
                      editable={!saving}
                    />
                    <TextInput
                      style={[styles.input, styles.plateProvinceInput]}
                      value={vehicleData.carPlateProvince}
                      onChangeText={(v) => updateField('carPlateProvince', v)}
                      placeholder={t('Province code')}
                      keyboardType="numeric"
                      maxLength={2}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.platePreviewWrap}>
                    {/* ✅ styles پاس داده شد */}
                    <PlatePreview
                      styles={styles}
                      left={vehicleData.carPlateLeft}
                      right={vehicleData.carPlateRight}
                      letter={vehicleData.carPlateLetter}
                      province={vehicleData.carPlateProvince}
                    />
                  </View>
                </View>
              )}

              {(vehicleData.vehicleType === 'موتور سیکلت' || vehicleData.vehicleType === 'خودرو') && (
                <>
                  <View style={styles.inputRow}>
                    <Text style={styles.label}>{t('Model:')}</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.carModel}
                      onChangeText={(value) => updateField('carModel', value)}
                      placeholder={t('Example: Pride 131')}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>{t('Color:')}</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.carColor}
                      onChangeText={(value) => updateField('carColor', value)}
                      placeholder={t('Example: White')}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>{t('Manufacturing year:')}</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.manufacturingYear}
                      onChangeText={(value) => updateField('manufacturingYear', value)}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>{t('Fuel type:')}</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.softwareType}
                      onChangeText={(value) => updateField('softwareType', value)}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>{t('Vehicle identification number (VIN):')}</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.vinNumber}
                      onChangeText={(value) => updateField('vinNumber', value)}
                      maxLength={17}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>{t('Third-party insurance unique code:')}</Text>
                    <TextInput
                      style={styles.input}
                      value={vehicleData.insuranceExpiryCode}
                      onChangeText={(value) => updateField('insuranceExpiryCode', value)}
                      editable={!saving}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.label}>{t('Third-party insurance expiry date:')}</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => !saving && setShowInsuranceDatePicker(true)}
                      disabled={saving}
                    >
                      <Text style={[styles.dateText, !vehicleData.insuranceExpiryDate && styles.placeholderText]}>
                        {vehicleData.insuranceExpiryDate || t('Select date (e.g., 1405/05/15)')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            <Button title={t('Save information')} onPress={handleSave} loading={saving} />
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      <Modal
        visible={showVehicleTypeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVehicleTypeModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowVehicleTypeModal(false)}>
          <View style={styles.modalContent}>
            <Text style={[baseStyles.title, { textAlign: 'center', marginBottom: 10 }]}>
              {t('Select vehicle type')}
            </Text>

            {vehicleTypeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.modalOption}
                onPress={() => handleSelectVehicleType(opt.value)}
                disabled={saving}
              >
                <Text style={baseStyles.text}>{opt.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.modalCancel]} onPress={() => setShowVehicleTypeModal(false)}>
              <Text style={baseStyles.text4}>{t('Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

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

// ✅ styles از بیرون میاد
function PlatePreview({ styles, left = '', right = '', letter = 'ب', province = '11' }) {
  const { t } = useTranslation();

  const toPersian = (s) => {
    const map = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return String(s || '')
      .split('')
      .map(ch => (ch >= '0' && ch <= '9' ? map[ch.charCodeAt(0) - 48] : ch))
      .join('');
  };

  const leftText = left ? left.padStart(2, '0') : '__';
  const rightText = right ? right.padStart(3, '0') : '___';

  let plateLetter = letter || 'ب';
  if (plateLetter === 'ا' || plateLetter === 'آ') plateLetter = 'الف';

  const plateProvince = province || '11';

  return (
    <View style={styles.plateBox}>
      <View style={styles.plateFlagStrip}>
        <View style={styles.flagColors}>
          <View style={[styles.flagStripe, { backgroundColor: themeColor7.bgColor(1) }]} />
          <View style={[styles.flagStripe, { backgroundColor: themeColor4.bgColor(1) }]} />
          <View style={[styles.flagStripe, { backgroundColor: themeColor6.bgColor(1) }]} />
        </View>
        <Text style={styles.flagText}>I.R.{"\n"}IRAN</Text>
      </View>

      <View style={styles.plateMainArea}>
        <View style={styles.plateNumberWrap}>
          <Text style={styles.plateNumberText}>{toPersian(rightText)}</Text>
          <Text style={[styles.plateLetterText, plateLetter === 'الف' && { fontSize: 22 }]}>
            {plateLetter}
          </Text>
          <Text style={styles.plateNumberText}>{toPersian(leftText)}</Text>
        </View>
      </View>

      <View style={styles.plateCityBoxNew}>
        <Text style={styles.plateCityTop}>{t('Iran')}</Text>
        <Text style={styles.plateCityNumber}>{toPersian(plateProvince)}</Text>
      </View>
    </View>
  );
}

// ✅ styles از بیرون میاد
function PlatePreviewMotorcycle({ styles, left = '', right = '' }) {
  const toPersian = (s) => {
    const map = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return String(s || '')
      .split('')
      .map(ch => (ch >= '0' && ch <= '9' ? map[ch.charCodeAt(0) - 48] : ch))
      .join('');
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

const createLocalStyles = (NewStyles) => StyleSheet.create({
  background: { flex: 1 },
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
    ...NewStyles.title4,
    fontSize: 16,
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
  inputRow: { marginVertical: 5 },
  plateSection: { marginVertical: 5 },
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
    // textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: themeColor3.bgColor(0.3),
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: themeColor4.bgColor(1),
    // textAlign: 'right',
    ...NewStyles.text10,
    minHeight: 40,
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
    fontFamily: 'VazirBold',
  },
  plateProvinceInput: {
    width: 100,
    textAlign: 'center',
    fontFamily: 'VazirBold',
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
  flagStripe: { flex: 1 },
  flagText: {
    color: themeColor4.bgColor(1),
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
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
    ...NewStyles.text10,
    fontSize: 24,
    letterSpacing: 6,
    marginHorizontal: 6,
  },
  plateLetterText: {
    ...NewStyles.title10,
    fontSize: 28,
    marginHorizontal: 4,
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
    ...NewStyles.title10,
    fontSize: 10,
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
  motorTop: { fontSize: 36, fontWeight: '900' },
  motorBottom: { fontSize: 46, fontWeight: '900', marginTop: 6 },
  dateText: {
    ...NewStyles.text10,
    fontSize: 14,
    // textAlign: 'right',
  },
  placeholderText: { color: themeColor3.bgColor(0.6) },
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
    gap: 8,
    paddingBottom: 40,
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
