import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { SIZES } from '../utils/constants';
import { PatternDot } from './PatternDot';
import { PatternLine, Point } from './PatternLine';

interface PatternGridProps {
  onPatternComplete: (pattern: number[]) => void;
  status: 'idle' | 'success' | 'error';
  disabled?: boolean;
}

const GRID_COLS = 3;
const DOT_COUNT = GRID_COLS * GRID_COLS;
const CELL_SIZE = SIZES.dotSpacing;
const GRID_DIMENSION = CELL_SIZE * (GRID_COLS - 1) + SIZES.dotSize + 20;

function getDotCenter(index: number): Point {
  const col = index % GRID_COLS;
  const row = Math.floor(index / GRID_COLS);
  const padding = (SIZES.dotSize + 20) / 2;
  return {
    x: col * CELL_SIZE + padding,
    y: row * CELL_SIZE + padding,
  };
}

function isNearDot(point: Point, dotCenter: Point): boolean {
  const dx = point.x - dotCenter.x;
  const dy = point.y - dotCenter.y;
  return Math.sqrt(dx * dx + dy * dy) < SIZES.dotHitRadius;
}

const dotCenters = Array.from({ length: DOT_COUNT }, (_, i) => getDotCenter(i));

export function PatternGrid({ onPatternComplete, status, disabled = false }: PatternGridProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [fingerPos, setFingerPos] = useState<Point | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const patternRef = useRef<number[]>([]);
  const containerOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keep a ref to the latest callback so the PanResponder (created once) always
  // calls the current version — avoids stale closure on prop changes.
  const onPatternCompleteRef = useRef(onPatternComplete);
  useEffect(() => {
    onPatternCompleteRef.current = onPatternComplete;
  }, [onPatternComplete]);

  const disabledRef = useRef(disabled);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: false }),
    ]).start();
  }, [shakeAnim]);

  const resetPattern = useCallback(() => {
    setTimeout(() => {
      patternRef.current = [];
      setPattern([]);
      setFingerPos(null);
    }, 600);
  }, []);

  useEffect(() => {
    if (status === 'error') {
      triggerShake();
      resetPattern();
    } else if (status === 'success') {
      resetPattern();
    }
  }, [status, triggerShake, resetPattern]);

  const handleTouchAt = useCallback((touchX: number, touchY: number) => {
    const localX = touchX - containerOffset.current.x;
    const localY = touchY - containerOffset.current.y;
    const touchPoint: Point = { x: localX, y: localY };

    setFingerPos(touchPoint);

    for (let i = 0; i < DOT_COUNT; i++) {
      if (patternRef.current.includes(i)) continue;
      const center = dotCenters[i];
      if (isNearDot(touchPoint, center)) {
        patternRef.current = [...patternRef.current, i];
        setPattern([...patternRef.current]);
        break;
      }
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        handleTouchAt(pageX, pageY);
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        handleTouchAt(pageX, pageY);
      },
      onPanResponderRelease: () => {
        const finalPattern = [...patternRef.current];
        setFingerPos(null);
        onPatternCompleteRef.current(finalPattern);
      },
      onPanResponderTerminate: () => {
        const finalPattern = [...patternRef.current];
        setFingerPos(null);
        onPatternCompleteRef.current(finalPattern);
      },
    })
  ).current;

  const lines: Array<{ from: Point; to: Point; key: string }> = [];
  for (let i = 0; i < pattern.length - 1; i++) {
    lines.push({
      from: dotCenters[pattern[i]],
      to: dotCenters[pattern[i + 1]],
      key: `${pattern[i]}-${pattern[i + 1]}`,
    });
  }

  const trailingLine =
    pattern.length > 0 && fingerPos
      ? { from: dotCenters[pattern[pattern.length - 1]], to: fingerPos }
      : null;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateX: shakeAnim }] }]}>
      <View
        style={styles.container}
        onLayout={(e) => {
          e.target.measure((_fx, _fy, _w, _h, px, py) => {
            containerOffset.current = { x: px, y: py };
          });
        }}
        {...panResponder.panHandlers}
      >
        <View style={styles.linesLayer} pointerEvents="none">
          {lines.map((line) => (
            <PatternLine key={line.key} from={line.from} to={line.to} />
          ))}
          {trailingLine && (
            <PatternLine from={trailingLine.from} to={trailingLine.to} isTrailing />
          )}
        </View>

        <View style={styles.dotsLayer} pointerEvents="none">
          {Array.from({ length: DOT_COUNT }, (_, i) => {
            const center = dotCenters[i];
            return (
              <View
                key={i}
                style={[
                  styles.dotWrapper,
                  {
                    left: center.x - (SIZES.dotSize + 20) / 2,
                    top: center.y - (SIZES.dotSize + 20) / 2,
                  },
                ]}
              >
                <PatternDot isActive={pattern.includes(i)} status={status} />
              </View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: GRID_DIMENSION,
    height: GRID_DIMENSION,
    position: 'relative',
  },
  linesLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dotsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dotWrapper: {
    position: 'absolute',
  },
});
