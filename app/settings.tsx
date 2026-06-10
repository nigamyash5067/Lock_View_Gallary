import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, RELEASE_VERSION } from '../utils/constants';
import { deletePatternHash } from '../utils/secureStore';

export default function SettingsScreen() {
  const router = useRouter();
  const [screenshotBlock, setScreenshotBlock] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('lockview_screenshot_block').then((val) => {
      setScreenshotBlock(val !== 'false');
    });
  }, []);

  const handleScreenshotToggle = async (value: boolean) => {
    setScreenshotBlock(value);
    await AsyncStorage.setItem('lockview_screenshot_block', value ? 'true' : 'false');
  };

  const handleChangePattern = () => {
    router.push('/pattern-setup');
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete your saved pattern and reset LockView. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await deletePatternHash();
            router.replace('/pattern-setup');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.appTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <TouchableOpacity style={styles.row} onPress={handleChangePattern} activeOpacity={0.7}>
          <Text style={styles.rowLabel}>Change Pattern</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>

        <View style={[styles.row, styles.rowLast]}>
          <View>
            <Text style={styles.rowLabel}>Block Screenshots</Text>
            <Text style={styles.rowSubtitle}>Prevent screen capture in locked mode</Text>
          </View>
          <Switch
            value={screenshotBlock}
            onValueChange={handleScreenshotToggle}
            trackColor={{ false: '#555', true: COLORS.primary }}
            thumbColor={screenshotBlock ? '#fff' : '#ccc'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>LockView</Text>
          <Text style={styles.rowValue}>{RELEASE_VERSION}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.row, styles.rowLast, styles.dangerRow]} onPress={handleResetApp} activeOpacity={0.7}>
          <Text style={styles.dangerText}>Reset App Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 70,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 18,
  },
  appTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    color: COLORS.text,
    fontSize: 16,
  },
  rowSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rowChevron: {
    color: COLORS.textSecondary,
    fontSize: 20,
  },
  rowValue: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  dangerRow: {
    justifyContent: 'center',
  },
  dangerText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '500',
  },
});
