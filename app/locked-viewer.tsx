import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { LockExitButton } from '../components/LockExitButton';
import { LockedImageViewer } from '../components/LockedImageViewer';
import { EmptyState } from '../components/EmptyState';
import { useSelection } from '../context/SelectionContext';
import { useScreenSecurity } from '../hooks/useScreenSecurity';
import { COLORS } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LockedViewerScreen() {
  const router = useRouter();
  const { selectedPhotos } = useSelection();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screenshotBlockEnabled, setScreenshotBlockEnabled] = useState(true);

  useScreenSecurity(screenshotBlockEnabled);

  useEffect(() => {
    AsyncStorage.getItem('lockview_screenshot_block').then((val) => {
      setScreenshotBlockEnabled(val !== 'false');
    });
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    return () => subscription.remove();
  }, []);

  const handleExitPress = useCallback(() => {
    router.push('/pattern-lock?mode=exit');
  }, [router]);

  if (selectedPhotos.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <EmptyState
          title="No Photos Selected"
          subtitle="Go back and select some photos first."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <LockedImageViewer
        photos={selectedPhotos}
        initialIndex={0}
        onPageChange={setCurrentIndex}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar} pointerEvents="box-none">
          <View style={styles.counter} pointerEvents="none">
            <Text style={styles.counterText}>
              {currentIndex + 1} / {selectedPhotos.length}
            </Text>
          </View>
          <LockExitButton onPress={handleExitPress} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  counter: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  counterText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
  },
});
