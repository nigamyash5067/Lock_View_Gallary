import React, { useCallback, useRef } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../utils/constants';

interface PhotoTileProps {
  uri: string;
  isSelected: boolean;
  selectionMode: boolean;
  onPreview: () => void;
  onToggle: () => void;
  onLongPress: () => void;
  size: number;
}

export const PhotoTile = React.memo(function PhotoTile({
  uri,
  isSelected,
  selectionMode,
  onPreview,
  onToggle,
  onLongPress,
  size,
}: PhotoTileProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: false,
      tension: 200,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 200,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (selectionMode) {
      onToggle();
    } else {
      onPreview();
    }
  }, [selectionMode, onToggle, onPreview]);

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={350}
    >
      <Animated.View
        style={[
          styles.container,
          { width: size, height: size, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image source={uri} style={styles.image} contentFit="cover" />

        {/* In selection mode: show checkbox on ALL tiles */}
        {selectionMode && (
          <View style={styles.overlay}>
            <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
              {isSelected && <View style={styles.checkmark} />}
            </View>
          </View>
        )}

        {/* Subtle blue tint on selected tiles */}
        {selectionMode && isSelected && (
          <View style={styles.selectedTint} pointerEvents="none" />
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 6,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    width: 8,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  selectedTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
});
