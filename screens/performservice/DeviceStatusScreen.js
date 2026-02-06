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
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor4, themeColor10 } from '../../theme/Color';

export default function DeviceStatusScreen({ navigation }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showProductInfo, setShowProductInfo] = useState(true);
  const [showSoftware, setShowSoftware] = useState(false);
  const [showHardware, setShowHardware] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showPrinter, setShowPrinter] = useState(false);

  const toggleOption = (key) => {
    setSelectedOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <LinearGradient 
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'وضعیت محصول'} 
      />
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* اطلاعات محصول */}
          <TouchableOpacity 
            style={styles.accordionHeader}
            onPress={() => setShowProductInfo(!showProductInfo)}
          >
            <View style={[NewStyles.row, { gap: 5 }]}>
              <Ionicons 
                name={showProductInfo ? 'chevron-down' : 'chevron-forward'} 
                size={24} 
                color={themeColor4.bgColor(1)} 
              />
              <Text style={styles.accordionTitle}>اطلاعات محصول</Text>
            </View>
          </TouchableOpacity>
          
          {showProductInfo && (
            <View style={styles.accordionContent}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>نوع انتخاب :</Text>
                <Text style={styles.fieldValue}>انتخاب سیستماتیک</Text>
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>نوع محصول :</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="لپ تاپ"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                />
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>مدل محصول :</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="A 595 L"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                />
              </View>

              <View style={styles.fullWidthField}>
                <Text style={styles.fullWidthLabel}>ایراد ظاهری :</Text>
                <TextInput
                  style={styles.fullWidthInput}
                  placeholder="توضیحات ایراد ظاهری"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                  multiline
                />
              </View>
            </View>
          )}

          {/* نرم افزار */}
          <TouchableOpacity 
            style={styles.accordionHeader}
            onPress={() => setShowSoftware(!showSoftware)}
          >
            <View style={[NewStyles.row, { gap: 5 }]}>
              <Ionicons 
                name={showSoftware ? 'chevron-down' : 'chevron-forward'} 
                size={24} 
                color={themeColor4.bgColor(1)} 
              />
              <Text style={styles.accordionTitle}>نرم افزار</Text>
            </View>
          </TouchableOpacity>
          
          {showSoftware && (
            <View style={styles.accordionContent}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>تعداد محصول نرم افزار :</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="2 محصول"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                />
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>نصب سیستم عامل :</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="ویندوز 10"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                />
              </View>

              <View style={styles.fullWidthField}>
                <Text style={styles.fullWidthLabel}>پیش فرض :</Text>
                <TextInput
                  style={styles.fullWidthInput}
                  placeholder="توضیحات پیش فرض"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                  multiline
                />
              </View>

              <View style={styles.fullWidthField}>
                <Text style={styles.fullWidthLabel}>توضیحات نرم افزاری :</Text>
                <TextInput
                  style={styles.fullWidthInput}
                  placeholder="توضیحات نرم افزاری"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                  multiline
                />
              </View>
            </View>
          )}

          {/* سخت افزار */}
          <TouchableOpacity 
            style={styles.accordionHeader}
            onPress={() => setShowHardware(!showHardware)}
          >
            <View style={[NewStyles.row, { gap: 5 }]}>
              <Ionicons 
                name={showHardware ? 'chevron-down' : 'chevron-forward'} 
                size={24} 
                color={themeColor4.bgColor(1)} 
              />
              <Text style={styles.accordionTitle}>سخت افزار</Text>
            </View>
          </TouchableOpacity>
          
          {showHardware && (
            <View style={styles.accordionContent}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>تعداد محصول سخت افزار :</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="2 محصول"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                />
              </View>

              <View style={styles.fullWidthField}>
                <Text style={styles.fullWidthLabel}>پیش فرض :</Text>
                <TextInput
                  style={styles.fullWidthInput}
                  placeholder="توضیحات پیش فرض"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                  multiline
                />
              </View>

              <View style={styles.fullWidthField}>
                <Text style={styles.fullWidthLabel}>توضیحات سخت افزاری :</Text>
                <TextInput
                  style={styles.fullWidthInput}
                  placeholder="توضیحات سخت افزاری"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                  multiline
                />
              </View>
            </View>
          )}

          {/* شبکه */}
          <TouchableOpacity 
            style={styles.accordionHeader}
            onPress={() => setShowNetwork(!showNetwork)}
          >
            <View style={[NewStyles.row, { gap: 5 }]}>
              <Ionicons 
                name={showNetwork ? 'chevron-down' : 'chevron-forward'} 
                size={24} 
                color={themeColor4.bgColor(1)} 
              />
              <Text style={styles.accordionTitle}>شبکه</Text>
            </View>
          </TouchableOpacity>
          
          {showNetwork && (
            <View style={styles.accordionContent}>
              <View style={styles.fullWidthField}>
                <Text style={styles.fullWidthLabel}>شبکه چند محصول :</Text>
                <TextInput
                  style={styles.fullWidthInput}
                  placeholder="توضیحات شبکه"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                  multiline
                />
              </View>
            </View>
          )}

          {/* چاپگر */}
          <TouchableOpacity 
            style={styles.accordionHeader}
            onPress={() => setShowPrinter(!showPrinter)}
          >
            <View style={[NewStyles.row, { gap: 5 }]}>
              <Ionicons 
                name={showPrinter ? 'chevron-down' : 'chevron-forward'} 
                size={24} 
                color={themeColor4.bgColor(1)} 
              />
              <Text style={styles.accordionTitle}>چاپگر</Text>
            </View>
          </TouchableOpacity>
          
          {showPrinter && (
            <View style={styles.accordionContent}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>نصب نرم افزار چاپگر :</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="دارد"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                />
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>مارک / مدل چاپگر :</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="hp laserjet 1012"
                  placeholderTextColor={themeColor10.bgColor(0.5)}
                />
              </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 15,
    paddingBottom: 100,
  },
  accordionHeader: {
    backgroundColor: themeColor0.bgColor(0.95),
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    ...NewStyles.shadow,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColor4.bgColor(1),
    fontFamily: 'Vazirmatn-Bold',
  },
  accordionContent: {
    backgroundColor: themeColor0.bgColor(0.85),
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    gap: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldLabel: {
    flex: 1,
    fontSize: 14,
    color: themeColor4.bgColor(1),
    fontFamily: 'Vazirmatn-Bold',
  },
  fieldInput: {
    flex: 2,
    backgroundColor: themeColor0.bgColor(1),
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: themeColor10.bgColor(1),
    fontFamily: 'Vazirmatn-Light',
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.2),
  },
  fieldValue: {
    flex: 2,
    fontSize: 14,
    color: themeColor10.bgColor(1),
    fontFamily: 'Vazirmatn-Light',
  },
  fullWidthField: {
    gap: 8,
  },
  fullWidthLabel: {
    fontSize: 14,
    color: themeColor4.bgColor(1),
    fontFamily: 'Vazirmatn-Bold',
  },
  fullWidthInput: {
    backgroundColor: themeColor0.bgColor(1),
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: themeColor10.bgColor(1),
    fontFamily: 'Vazirmatn-Light',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.2),
  },
});