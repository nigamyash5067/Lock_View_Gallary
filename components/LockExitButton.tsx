import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SIZES } from '../utils/constants';

interface LockExitButtonProps {
  onPress: () => void;
}

export function LockExitButton({ onPress }: LockExitButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.icon}>🔒</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZES.lockIconSize,
    height: SIZES.lockIconSize,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
  },
  icon: {
    fontSize: 22,
  },
});
