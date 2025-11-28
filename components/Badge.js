import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Badge({ count = 0, size = 18, style }) {
  if (!count || count <= 0) return null;

  return (
    <View style={[styles.container, { minWidth: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    position: 'absolute',
    zIndex: 10,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
