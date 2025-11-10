import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

console.log('🧪 SimpleTest component loaded');

export default function SimpleTest() {
  console.log('🎨 SimpleTest rendering');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ React Native Web is Working!</Text>
      <Text style={styles.subtext}>Check the browser console for logs</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});
