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

export default function FinancialInfoScreen({ navigation }) {
  const [financialData, setFinancialData] = useState({
    cityId: '',
    bankName: '',
    cardNumber: '',
    bankName2: ''
  });

  const updateField = (field, value) => {
    setFinancialData(prev => ({
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
        
        {/* دکمه اطلاعات مالی */}
        <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
          <Text style={styles.buttonText}>اطلاعات مالی</Text>
        </TouchableOpacity>

        {/* فرم اطلاعات مالی */}
        <View style={styles.formContainer}>
          
          <View style={styles.inputRow}>
            <Text style={styles.label}>شماره شبا :</Text>
            <TextInput
              style={styles.input}
              value={financialData.cityId}
              onChangeText={(value) => updateField('cityId', value)}
              placeholder=""
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>بانک :</Text>
            <TextInput
              style={styles.input}
              value={financialData.bankName}
              onChangeText={(value) => updateField('bankName', value)}
              placeholder=""
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>شماره کارت :</Text>
            <TextInput
              style={styles.input}
              value={financialData.cardNumber}
              onChangeText={(value) => updateField('cardNumber', value)}
              placeholder=""
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>بانک :</Text>
            <TextInput
              style={styles.input}
              value={financialData.bankName2}
              onChangeText={(value) => updateField('bankName2', value)}
              placeholder=""
            />
          </View>

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
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    gap: 15,
  },
  inputRow: {
    marginVertical: 5,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'right',
    minHeight: 45,
  },
});