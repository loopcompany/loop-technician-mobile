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

export default function NotesScreen({ navigation }) {
  const [notes, setNotes] = useState(['']);
  const [mainNote, setMainNote] = useState('');

  const addNote = () => {
    setNotes([...notes, '']);
  };

  const updateNote = (index, text) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = text;
    setNotes(updatedNotes);
  };

  return (
    <LinearGradient 
      colors={['#7FDBFF', '#0074D9', '#001f3f']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <ScreenHeaders 
        title={'یادداشت'} 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.notesContainer}>
          
          {/* دکمه اضافه کردن یادداشت */}
          <TouchableOpacity style={styles.addButton} onPress={addNote}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>

          {/* یادداشت اصلی */}
          <View style={styles.mainNoteContainer}>
            <Text style={[NewStyles.text4, styles.noteLabel]}>یادداشت:</Text>
            <TextInput
              style={[NewStyles.textInput, styles.mainNoteInput]}
              value={mainNote}
              onChangeText={setMainNote}
              placeholder="یادداشت خود را اینجا بنویسید"
              placeholderTextColor={themeColor10.bgColor(0.7)}
              multiline
              numberOfLines={8}
            />
          </View>

          {/* یادداشت‌های کوچک */}
          <View style={styles.smallNotesContainer}>
            {notes.map((note, index) => (
              <View key={index} style={styles.smallNoteContainer}>
                <TextInput
                  style={[NewStyles.textInput, styles.smallNoteInput]}
                  value={note}
                  onChangeText={(text) => updateNote(index, text)}
                  placeholder=""
                  placeholderTextColor={themeColor10.bgColor(0.7)}
                  multiline
                />
              </View>
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
  },
  notesContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  mainNoteContainer: {
    marginTop: 60,
    marginBottom: 20,
  },
  noteLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    color: '#000',
    textAlign: 'right',
    fontSize: 14,
  },
  mainNoteInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 15,
    minHeight: 200,
    textAlignVertical: 'top',
    color: '#000',
    textAlign: 'right',
    fontSize: 16,
  },
  smallNotesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  smallNoteContainer: {
    width: '48%',
    marginVertical: 5,
  },
  smallNoteInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#000',
    textAlign: 'right',
    fontSize: 14,
  },
});