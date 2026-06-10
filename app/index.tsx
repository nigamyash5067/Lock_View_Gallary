import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/constants';
import { hasPattern } from '../utils/secureStore';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const patternExists = await hasPattern();
      if (patternExists) {
        router.replace('/pattern-lock?mode=unlock');
      } else {
        router.replace('/pattern-setup');
      }
    })();
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🔒</Text>
      <Text style={styles.title}>LockView</Text>
      <ActivityIndicator color={COLORS.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 48,
  },
  spinner: {
    marginTop: 16,
  },
});
