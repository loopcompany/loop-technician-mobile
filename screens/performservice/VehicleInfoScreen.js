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
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor10 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';

export default function VehicleInfoScreen({ navigation }) {
  const [vehicleData, setVehicleData] = useState({
    vehicleType: '',
    modelColor: '',
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

  const updateField = (field, value) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
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

        {/* باکس نوع وسیله نقلیه */}
        <View style={styles.vehicleTypeBox}>
          <Text style={styles.vehicleTypeLabel}>
            نوع وسیله نقلیه: موتور سیکلت / خودرو / دوچرخه / پیاده
          </Text>
        </View>

        {/* فرم اطلاعات وسیله */}
        <View style={styles.formContainer}>
          
          <View style={styles.inputRow}>
            <Text style={styles.label}>مدل و رنگ :</Text>
            <TextInput
              style={styles.input}
              value={vehicleData.modelColor}
              onChangeText={(value) => updateField('modelColor', value)}
              placeholder=""
            />
          </View>

          {/* پلاک موتور سیکلت - دو باکس کنار هم */}
          <View style={styles.plateSection}>
            <Text style={styles.label}>پلاک موتور سیکلت :</Text>
            <View style={styles.plateRow}>
              <TextInput
                style={[styles.input, styles.plateInput]}
                value={vehicleData.motorPlate}
                onChangeText={(value) => updateField('motorPlate', String(value).replace(/[^0-9]/g, '').slice(0,3))}
                keyboardType="numeric"
                placeholder=""
                maxLength={3}
              />
              <TextInput
                style={[styles.input, styles.plateInput]}
                value={vehicleData.bodyPlate}
                onChangeText={(value) => updateField('bodyPlate', String(value).replace(/[^0-9]/g, '').slice(0,5))}
                keyboardType="numeric"
                placeholder=""
                maxLength={5}
              />
            </View>
            <View style={styles.platePreviewWrap}>
              <PlatePreviewMotorcycle left={vehicleData.motorPlate} right={vehicleData.bodyPlate} />
            </View>
          </View>

          {/* پلاک خودرو - دو باکس کنار هم */}
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
              />
              <TextInput
                style={[styles.input, styles.plateInput]}
                value={vehicleData.carPlateRight}
                onChangeText={(v) => updateField('carPlateRight', v)}
                placeholder="مثال: 345"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.plateExtraRow}>
              <TextInput
                style={[styles.input, styles.plateLetterInput]}
                value={vehicleData.carPlateLetter}
                onChangeText={(v) => updateField('carPlateLetter', v)}
                placeholder="حرف پلاک"
                maxLength={1}
              />
              <TextInput
                style={[styles.input, styles.plateProvinceInput]}
                value={vehicleData.carPlateProvince}
                onChangeText={(v) => updateField('carPlateProvince', v)}
                placeholder="کد استان"
                keyboardType="numeric"
                maxLength={2}
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

          <View style={styles.inputRow}>
            <Text style={styles.label}>سال ساخت :</Text>
            <TextInput
              style={styles.input}
              value={vehicleData.manufacturingYear}
              onChangeText={(value) => updateField('manufacturingYear', value)}
              placeholder=""
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>نوع سوخت :</Text>
            <TextInput
              style={styles.input}
              value={vehicleData.softwareType}
              onChangeText={(value) => updateField('softwareType', value)}
              placeholder=""
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>شماره شناسه وسیله (VIN) :</Text>
            <TextInput
              style={styles.input}
              value={vehicleData.vinNumber}
              onChangeText={(value) => updateField('vinNumber', value)}
              placeholder=""
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>کد یکتای بیمه شخص ثالث :</Text>
            <TextInput
              style={styles.input}
              value={vehicleData.insuranceExpiryCode}
              onChangeText={(value) => updateField('insuranceExpiryCode', value)}
              placeholder=""
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>تاریخ انقضاء بیمه شخص ثالث :</Text>
            <TextInput
              style={styles.input}
              value={vehicleData.insuranceExpiryDate}
              onChangeText={(value) => updateField('insuranceExpiryDate', value)}
              placeholder=""
            />
          </View>

        </View>

        {/* دکمه‌های ثبت و ویرایش */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
            <Text style={styles.actionButtonText}>ویرایش مشخصات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.saveButton]}>
            <Text style={styles.actionButtonText}>ثبت مشخصات</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
   
    </LinearGradient>
  );
}

  // Small preview component that renders a stylized Iranian-like car plate
  function PlatePreview({ left = '', right = '', letter = 'ب', province = '11' }) {
    // helper: convert ASCII digits to Persian digits
    const toPersian = (s) => {
      const map = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      return String(s || '').split('').map(ch => {
        if (ch >= '0' && ch <= '9') return map[ch.charCodeAt(0) - 48];
        return ch;
      }).join('');
    };

    // left should be 2 digits, right 3 digits
    const leftText = left ? left.padStart(2, '0') : '__';
    const rightText = right ? right.padStart(3, '0') : '___';

    // use provided letter and province (already defaulted in params)
    const plateLetter = letter || 'ب';
    const plateProvince = province || '11';

    return (
      <View style={styles.plateBox}>
        {/* left vertical flag/blue strip */}
        <View style={styles.plateFlagStrip}>
          <View style={styles.flagColors}>
            <View style={[styles.flagStripe, { backgroundColor: '#239e3b' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#fff' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#da0000' }]} />
          </View>
          <Text style={styles.flagText}>I.R.{"\n"}IRAN</Text>
        </View>

        {/* main plate area */}
        <View style={styles.plateMainArea}>
          <View style={styles.plateNumberWrap}>
            <Text style={styles.plateNumberText}>{toPersian(rightText)}</Text>
            <Text style={styles.plateLetterText}>{plateLetter}</Text>
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
      const map = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
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
            <View style={[styles.flagStripe, { backgroundColor: '#239e3b' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#fff' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#da0000' }]} />
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehicleTypeBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
  },
  vehicleTypeLabel: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'right',
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
    backgroundColor: '#FF9800',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: 'white',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  plateFlagStrip: {
    width: 34,
    height: '100%',
    backgroundColor: '#0b5394',
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
    color: '#fff',
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
    fontSize: 28,
    fontWeight: '900',
    marginHorizontal: 4,
  },
  plateCityBox: {
    width: 60,
    height: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  plateCityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
  },
  plateCityBoxNew: {
    width: 56,
    height: '100%',
    backgroundColor: '#fff',
    borderLeftWidth: 2,
    borderLeftColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateCityTop: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  plateCityNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginTop: 4,
  },
  motorPlateBox: {
    width: 220,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  motorFlagStrip: {
    width: 30,
    height: '100%',
    backgroundColor: '#0b5394',
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
});