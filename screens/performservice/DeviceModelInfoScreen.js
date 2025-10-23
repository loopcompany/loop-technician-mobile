import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '../Footer';
import ScreenHeaders from '../../components/ScreenHeaders';
import ScreenTitle from '../../components/ScreenTitle';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10 } from '../../theme/Color';
export default function DeviceModelInfoScreen({ navigation }) {

  return (
    <LinearGradient
      colors={['#7FDBFF', '#0074D9', '#001f3f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders
        title={' انجام سرویس'}
        onPressLeft={() => navigation.navigate('FolderScreen')}
        onPressRight={() => navigation.navigate('UserInfoScreen')}
      />
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} >
        <ScrollView contentContainerStyle={styles.container} edges={['left', 'right']}>
          {/* <ScreenTitle title={'بررسی دستگاه'} /> */}


          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('NewServiceScreen')}
          >
            <Text style={NewStyles.text4}>  سرویس جدید </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('UserInfoScreen')}
          >
            <Text style={NewStyles.text4}> اطلاعات کاربری</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('DeviceStatusScreen')}
          >
            <Text style={NewStyles.text4}>وضعیت محصول</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('CompletionInfoScreen')}
          >
            <Text style={NewStyles.text4}>اطلاعات تکمیلی </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('UserHistoryScreen')}
          >
            <Text style={NewStyles.text4}>سابقه کاربر </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('AttendanceScreen')}
          >
            <Text style={NewStyles.text4}> مراجعه / حضور</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('LaptopDispatchScreen')}
          >
            <Text style={NewStyles.text4}>  اعزام به لوپ/لپ تاپ بصورت امانت</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('TechnicalIssuesScreen')}
          >
            <Text style={NewStyles.text4}>ایراد های فنی </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('PartsExpensesScreen')}
          >
            <Text style={NewStyles.text4}>قطعات / هزینه ها </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => navigation.navigate('ServiceCompletionScreen')}
          >
            <Text style={NewStyles.text4}>تحویل به کاربر / اتمام سرویس جاری  </Text>
          </TouchableOpacity>

        </ScrollView>
        <Footer />
      </SafeAreaView>

      
    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 100,

  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#003366',
    color: '#00ffff',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionButton: {
    backgroundColor: themeColor0.bgColor(1),
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
  sectionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  sectionContent: {
    backgroundColor: '#fff8dc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    textAlign: 'right'
  },
  yellowLabel: {
    backgroundColor: '#ffff33',
    padding: 6,
    marginBottom: 8,
    borderRadius: 5,
    textAlign: 'right'
  },
  yellowText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'right',
  },
  whiteInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    color: '#000',
    textAlign: 'right',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  optionButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginVertical: 4,
  },
  optionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    backgroundColor: '#005b9f',
  },
  timeSelected: {
    backgroundColor: '#00ffff',
  },
  timeText: {
    color: '#000',
    fontWeight: 'bold',
  },
  genderButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    width: '48%',
  },
  genderSelected: {
    backgroundColor: '#2196f3',
  },
  genderText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
  dottedBox: {
    backgroundColor: '#ffff99',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  dottedText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadText: {
    fontWeight: 'bold',
    color: '#000',
  },
  cameraBox: {
    alignItems: 'center',
    marginTop: 10,
  },
  cameraIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  cameraText: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },

});
