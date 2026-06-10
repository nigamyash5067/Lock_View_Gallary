import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS, SIZES } from '../utils/constants';

interface PatternDotProps {
  isActive: boolean;
  status: 'idle' | 'success' | 'error';
}

export const PatternDot = React.memo(function PatternDot({ isActive, status }: PatternDotProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgColorAnim = useRef(new Animated.Value(0)).current;

  // All animations use useNativeDriver: false — required because
  // color (backgroundColor/borderColor) cannot use the native driver,
  // and you cannot mix native/JS drivers on the same Animated.View.
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.3 : 1,
      useNativeDriver: false,
      tension: 150,
      friction: 5,
    }).start();
  }, [isActive, scaleAnim]);

  useEffect(() => {
    if (status === 'success' && isActive) {
      Animated.sequence([
        Animated.timing(bgColorAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(bgColorAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      ]).start();
    } else if (status === 'error' && isActive) {
      Animated.sequence([
        Animated.timing(bgColorAnim, { toValue: 2, duration: 200, useNativeDriver: false }),
        Animated.timing(bgColorAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      ]).start();
    }
  }, [status, isActive, bgColorAnim]);

  const dotBg = bgColorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [isActive ? COLORS.primary : '#444444', COLORS.success, COLORS.error],
  });

  const dotBorder = bgColorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [isActive ? COLORS.primary : '#666666', COLORS.success, COLORS.error],
  });

  return (
    <View style={styles.dotContainer}>
      <Animated.View
        style={[
          styles.dot,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: dotBg,
            borderColor: dotBorder,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  dotContainer: {
    width: SIZES.dotSize + 20,
    height: SIZES.dotSize + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: SIZES.dotSize,
    height: SIZES.dotSize,
    borderRadius: SIZES.dotSize / 2,
    borderWidth: 2,
  },
});
