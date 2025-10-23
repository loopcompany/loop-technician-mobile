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

export default function FeedbackSuggestionScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const categories = [
    { id: 1, title: 'اپلیکیشن کاربر' },
    { id: 2, title: 'اپلیکیشن تکنسین' },
    { id: 3, title: 'پرسنل داخلی' },
    { id: 4, title: 'پرسنل میدانی' },
    { id: 5, title: 'سایر موارد' },
  ];

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
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
              style={[
                styles.categoryButton, 
                { backgroundColor: themeColor0.bgColor(0.8) }
              ]}
              onPress={() => setSelectedCategory(category.id)}
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
                placeholderTextColor="#999"
                value={selectedCategory === category.id ? feedbackText : ''}
                onChangeText={(text) => {
                  if (selectedCategory === category.id) {
                    setFeedbackText(text);
                  }
                }}
                textAlignVertical="top"
              />
            </View>
          </View>
        ))}

      </ScrollView>
      
      <Footer />
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
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  feedbackBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    minHeight: 80,
  },
  feedbackInput: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    minHeight: 50,
  },
});