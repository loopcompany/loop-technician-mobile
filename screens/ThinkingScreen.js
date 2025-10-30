import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from './Footer';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';

export default function ThinkingScreen({ navigation }) {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { id: 1, name: 'کلمات تصاویر' },
    { id: 2, name: 'کلمات تصاویر' }
  ];

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'فکر و بکر'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.contentContainer}>
          
          {/* پیام اصلی */}
          <View style={styles.messageContainer}>
            <Text style={[NewStyles.text4, styles.welcomeText]}>
            دوست لوپ سلام
            </Text>
            <Text style={[NewStyles.text10, styles.descriptionText]}>
فکر و بکر برای اشنایی و یادگیری با شاخه های کامپیوتر به صورت سرگرمی و بازی می باشد.
            </Text>
            <Text style={[NewStyles.text10, styles.descriptionText]}>
        گروه سنی : 5 سال تا 1 سال
            </Text>

          </View>

          {/* دکمه‌های خدمات */}
          <View style={styles.servicesContainer}>
            {services.map((service) => (
              <TouchableOpacity 
                key={service.id}
                style={[
                  styles.serviceButton,
                  selectedService === service.id && styles.selectedService
                ]}
                onPress={() => setSelectedService(service.id)}
              >
                <Text style={[NewStyles.text4, styles.serviceButtonText]}>
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </ScrollView>
      

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
    flex: 1,
  },
  contentContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 20,
    flex: 1,
    alignItems: 'center',
  },
  messageContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  descriptionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  hoursText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  serviceButton: {
    backgroundColor: '#64B5F6',
    borderRadius: 10,
    padding: 15,
    paddingHorizontal: 25,
    marginHorizontal: 10,
  },
  selectedService: {
    backgroundColor: '#2196F3',
  },
  serviceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});