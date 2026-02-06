import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor10 } from '../theme/Color';

const TimePickerModal = ({ visible, onClose, onSelect, selectedTime }) => {
  const [tempHour, setTempHour] = useState(
    selectedTime ? parseInt(selectedTime.split(':')[0]) : 9
  );
  const [tempMinute, setTempMinute] = useState(
    selectedTime ? parseInt(selectedTime.split(':')[1]) : 0
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    const formattedTime = `${String(tempHour).padStart(2, '0')}:${String(tempMinute).padStart(2, '0')}`;
    onSelect(formattedTime);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[NewStyles.title, styles.modalTitle]}>انتخاب ساعت</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={themeColor10.bgColor(0.8)} />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={[NewStyles.title, styles.columnLabel]}>ساعت</Text>
              <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={50}
                decelerationRate="fast"
              >
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.timeItem,
                      tempHour === hour && styles.selectedTimeItem,
                    ]}
                    onPress={() => setTempHour(hour)}
                  >
                    <Text
                      style={[
                        NewStyles.text4,
                        styles.timeText,
                        tempHour === hour && styles.selectedTimeText,
                      ]}
                    >
                      {String(hour).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={[NewStyles.title, styles.separator]}>:</Text>

            <View style={styles.pickerColumn}>
              <Text style={[NewStyles.title, styles.columnLabel]}>دقیقه</Text>
              <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={50}
                decelerationRate="fast"
              >
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.timeItem,
                      tempMinute === minute && styles.selectedTimeItem,
                    ]}
                    onPress={() => setTempMinute(minute)}
                  >
                    <Text
                      style={[
                        NewStyles.text4,
                        styles.timeText,
                        tempMinute === minute && styles.selectedTimeText,
                      ]}
                    >
                      {String(minute).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={[NewStyles.title]}>انصراف</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={[NewStyles.title4]}>تأیید</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    ...NewStyles.shadow,
  },
  modalHeader: {
    ...NewStyles.rowWrapper,
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: themeColor3.bgColor(0.2),
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
  },
  closeButton: {
    padding: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 300,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 14,
    marginBottom: 10,
    color: themeColor10.bgColor(0.7),
  },
  scrollView: {
    height: 250,
    width: '100%',
  },
  timeItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  selectedTimeItem: {
    backgroundColor: themeColor0.bgColor(1),
  },
  timeText: {
    fontSize: 20,
    color: themeColor10.bgColor(0.8),
  },
  selectedTimeText: {
    ...NewStyles.title4,
    color: themeColor4.bgColor(1),
    fontSize: 24,
  },
  separator: {
    fontSize: 30,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: themeColor10.bgColor(0.5),
  },
  buttonContainer: {
    ...NewStyles.row,
    padding: 20,
    paddingTop: 10,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: themeColor3.bgColor(0.2),
  },
  cancelButtonText: {
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: themeColor0.bgColor(1),
  },
});

export default TimePickerModal;
