import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, SIZES } from '../utils/constants';

interface Point {
  x: number;
  y: number;
}

interface PatternLineProps {
  from: Point;
  to: Point;
  isTrailing?: boolean;
}

export function PatternLine({ from, to, isTrailing = false }: PatternLineProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  if (length < 1) return null;

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <View
      style={[
        styles.line,
        {
          width: length,
          left: midX - length / 2,
          top: midY - 1.5,
          transform: [{ rotate: `${angle}deg` }],
          opacity: isTrailing ? 0.4 : 0.8,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
});

export type { Point };
