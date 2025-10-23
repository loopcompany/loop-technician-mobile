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

export default function RateListScreen({ navigation }) {
  const [expandedSections, setExpandedSections] = useState({});

  const rateCategories = [
    {
      id: 'union1403',
      title: 'نرخنامه اتحادیه 1403',
      fields: Array(13).fill(''), // 13 فیلد خالی
    },
    {
      id: 'loop1403', 
      title: 'نرخنامه لوپ 1403',
      fields: Array(13).fill(''), // 13 فیلد خالی
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderRateFields = (fields) => (
    <View style={styles.fieldsContainer}>
      {fields.map((field, index) => (
        <View key={index} style={styles.fieldContainer}>
          <TextInput
            style={[NewStyles.textInput, styles.fieldInput]}
            placeholder=""
            placeholderTextColor={themeColor10.bgColor(0.7)}
          />
        </View>
      ))}
    </View>
  );

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'نرخنامه'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.rateContainer}>
          
          {rateCategories.map((category) => (
            <View key={category.id} style={styles.categoryContainer}>
              <TouchableOpacity 
                style={styles.categoryButton}
                onPress={() => toggleSection(category.id)}
              >
                <Text style={[NewStyles.text4, styles.categoryButtonText]}>
                  {category.title}
                </Text>
                <View style={styles.arrow}>
                  <Text style={styles.arrowText}>
                    {expandedSections[category.id] ? '▲' : '▼'}
                  </Text>
                </View>
              </TouchableOpacity>
              
              {expandedSections[category.id] && (
                <View style={styles.expandedContent}>
                  <View style={styles.fieldsGrid}>
                    <View style={styles.column}>
                      {category.fields.slice(0, Math.ceil(category.fields.length / 2)).map((field, index) => (
                        <TextInput
                          key={index}
                          style={[NewStyles.textInput, styles.gridInput]}
                          placeholder=""
                          placeholderTextColor={themeColor10.bgColor(0.7)}
                        />
                      ))}
                    </View>
                    <View style={styles.column}>
                      {category.fields.slice(Math.ceil(category.fields.length / 2)).map((field, index) => (
                        <TextInput
                          key={index + Math.ceil(category.fields.length / 2)}
                          style={[NewStyles.textInput, styles.gridInput]}
                          placeholder=""
                          placeholderTextColor={themeColor10.bgColor(0.7)}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              )}
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
  rateContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  categoryContainer: {
    marginVertical: 8,
  },
  categoryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryButtonText: {
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
  fieldsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  gridInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 10,
    marginVertical: 3,
    minHeight: 40,
    color: '#000',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});