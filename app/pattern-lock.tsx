import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PatternGrid } from '../components/PatternGrid';
import { useSelection } from '../context/SelectionContext';
import { COLORS } from '../utils/constants';
import { verifyPattern } from '../utils/patternHash';
import { getPatternHash } from '../utils/secureStore';

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

export default function PatternLockScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: 'unlock' | 'exit' }>();
  const { clearSelection } = useSelection();

  const [gridStatus, setGridStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownInterval.current) clearInterval(cooldownInterval.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldownRemaining(COOLDOWN_SECONDS);
    cooldownInterval.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownInterval.current!);
          cooldownInterval.current = null;
          setAttempts(0);
          setMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handlePattern = useCallback(
    async (pattern: number[]) => {
      if (cooldownRemaining > 0) return;

      if (pattern.length < 4) {
        setGridStatus('error');
        setMessage('Pattern too short');
        setTimeout(() => {
          setGridStatus('idle');
          setMessage('');
        }, 800);
        return;
      }

      const storedHash = await getPatternHash();
      if (!storedHash) return;

      const isValid = verifyPattern(pattern, storedHash);

      if (isValid) {
        setGridStatus('success');
        setMessage('');
        setTimeout(() => {
          if (mode === 'exit') {
            clearSelection();
            router.replace('/home');
          } else {
            router.replace('/home');
          }
        }, 400);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setGridStatus('error');

        if (newAttempts >= MAX_ATTEMPTS) {
          setMessage(`Too many attempts. Wait ${COOLDOWN_SECONDS}s.`);
          startCooldown();
        } else {
          setMessage(`Wrong pattern. ${MAX_ATTEMPTS - newAttempts} attempts left.`);
        }

        setTimeout(() => {
          setGridStatus('idle');
        }, 800);
      }
    },
    [cooldownRemaining, attempts, mode, clearSelection, router, startCooldown]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'exit' ? 'Draw Pattern to Exit' : 'Draw Pattern to Unlock'}
        </Text>
      </View>

      <View style={styles.gridContainer}>
        <PatternGrid
          onPatternComplete={handlePattern}
          status={gridStatus}
          disabled={cooldownRemaining > 0}
        />
      </View>

      <View style={styles.footer}>
        {cooldownRemaining > 0 ? (
          <Text style={styles.cooldownText}>
            Try again in {cooldownRemaining}s
          </Text>
        ) : message ? (
          <Text style={styles.errorText}>{message}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => router.push('/security-question')}
        >
          <Text style={styles.forgotText}>Forgot pattern?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 60,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  gridContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  cooldownText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  forgotButton: {
    padding: 8,
  },
  forgotText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
