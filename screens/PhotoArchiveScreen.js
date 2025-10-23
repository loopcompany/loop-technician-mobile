import React from 'react';
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

  const archiveSections = [
    {
      id: 1,
      title: 'ارسال به لوپ',
      type: 'send'
    },
    {
      id: 2,
      title: 'دریافت از لوپ',
      type: 'receive'
    }
  ];

export default function PhotoArchiveScreen({ navigation }) {

  const renderActionButtons = (type) => (
    <View style={styles.actionContainer}>
      <View style={styles.photoArea}>
        {/* منطقه نمایش عکس */}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={[NewStyles.text4, styles.actionButtonText]}>
            ارسال
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={[NewStyles.text4, styles.actionButtonText]}>
            {type === 'send' ? 'حذف' : 'ذخیره'}
          </Text>
        </TouchableOpacity>
      </View>
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
        title={'آرشیو عکس'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.archiveContainer}>
          {archiveSections.map((section) => (
            <View key={section.id} style={styles.sectionContainer}>
              <View style={styles.sectionHeaderWrapper}>
                <View style={styles.sectionButton}>
                  <Text style={[NewStyles.text4, styles.sectionButtonText]}>
                    {section.title}
                  </Text>
                </View>
                {/* small yellow down indicator under header */}
                <View style={styles.triangleContainer}>
                  <Text style={styles.triangleText}>▼</Text>
                </View>
              </View>

              {/* show the small upload button under the first (send) header */}
              {section.type === 'send' && (
                <TouchableOpacity style={styles.smallWhiteButton}>
                  <Text style={styles.smallWhiteButtonText}>بارگذاری</Text>
                </TouchableOpacity>
              )}

              {/* photo area and action buttons (static, no dropdown) */}
              {renderActionButtons(section.type)}
            </View>
          ))}
          
          {/* بخش بارگذاری - فقط زمانی که یک بخش باز است نمایش داده شود */}

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
  archiveContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
  },
  sectionContainer: {
    marginVertical: 10,
  },
  sectionButton: {
    backgroundColor: '#0D6EFD',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  sectionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
  arrow: {
    display: 'none'
  },
  arrowText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeaderWrapper: {
    alignItems: 'center',
  },
  triangleContainer: {
    marginTop: 6,
    alignItems: 'center',
  },
  triangleText: {
    color: '#FFEA00',
    fontSize: 18,
  },
  actionContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 15,
    marginTop: 5,
  },
  photoArea: {
    backgroundColor: 'rgba(200,200,200,0.8)',
    borderRadius: 10,
    height: 150,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  uploadSection: {
    marginTop: 20,
  },
  smallWhiteButton: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 30,
    marginTop: 8,
    marginBottom: 12,
    elevation: 2,
  },
  smallWhiteButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  uploadLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
  },
  uploadArea: {
    backgroundColor: 'rgba(200,200,200,0.8)',
    borderRadius: 10,
    height: 150,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  buttonContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
  },
});