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

export default function MessageScreen({ navigation }) {
  const [messageText, setMessageText] = useState('');
  const [explanations, setExplanations] = useState('');

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders 
        title={'پیام'} 
        onPressLeft={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* دکمه پیام‌های دریافتی از اپ */}
        <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
          <Text style={styles.buttonText}>پیام‌های دریافتی از اپ</Text>
        </TouchableOpacity>

        {/* باکس متن پیام */}
        <View style={styles.messageBox}>
          <TextInput
            style={styles.messageInput}
            multiline={true}
            numberOfLines={4}
            placeholder="متن پیام خود را اینجا وارد کنید..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            textAlignVertical="top"
          />
        </View>

        {/* دکمه ارسال پیام به لوپ */}
        <TouchableOpacity style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}>
          <Text style={styles.buttonText}>ارسال پیام به لوپ</Text>
        </TouchableOpacity>

        {/* باکس توضیحات */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>توضیحات :</Text>
          <TextInput
            style={styles.explanationInput}
            multiline={true}
            numberOfLines={3}
            placeholder="توضیحات اضافی..."
            placeholderTextColor="#999"
            value={explanations}
            onChangeText={setExplanations}
            textAlignVertical="top"
          />
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
    gap: 20,
  },
  mainButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    minHeight: 120,
  },
  messageInput: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    minHeight: 90,
  },
  explanationBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
  },
  explanationTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'right',
  },
  explanationInput: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    minHeight: 60,
  },
});