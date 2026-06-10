import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { sha256 } from 'js-sha256';
import { PatternGrid } from '../components/PatternGrid';
import { COLORS } from '../utils/constants';
import { hashPattern } from '../utils/patternHash';
import { savePatternHash, saveSecurityQA } from '../utils/secureStore';

type SetupStep = 'draw' | 'confirm' | 'security';

const SECURITY_QUESTIONS = [
  "What was your first pet's name?",
  'What city were you born in?',
  "What is your mother's maiden name?",
  'What was your childhood nickname?',
  'What was the name of your first school?',
  'What is your favorite movie?',
  'What was the name of your best childhood friend?',
];

export default function PatternSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('draw');
  const [statusMessage, setStatusMessage] = useState('Draw a pattern connecting at least 4 dots');
  const [gridStatus, setGridStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const firstPattern = useRef<number[]>([]);

  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [answerError, setAnswerError] = useState('');

  const handlePattern = useCallback(
    async (pattern: number[]) => {
      if (pattern.length < 4) {
        setGridStatus('error');
        setStatusMessage('Connect at least 4 dots');
        setTimeout(() => {
          setGridStatus('idle');
          setStatusMessage(
            step === 'draw' ? 'Draw a pattern connecting at least 4 dots' : 'Confirm your pattern'
          );
        }, 800);
        return;
      }

      if (step === 'draw') {
        firstPattern.current = pattern;
        setGridStatus('success');
        setStatusMessage('Confirm your pattern');
        setTimeout(() => {
          setGridStatus('idle');
          setStep('confirm');
        }, 600);
      } else if (step === 'confirm') {
        const match =
          pattern.length === firstPattern.current.length &&
          pattern.every((v, i) => v === firstPattern.current[i]);

        if (match) {
          const hash = hashPattern(pattern);
          await savePatternHash(hash);
          setGridStatus('success');
          setStatusMessage('Pattern saved!');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => {
            setGridStatus('idle');
            setStep('security');
          }, 600);
        } else {
          setGridStatus('error');
          setStatusMessage("Patterns don't match. Try again.");
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setTimeout(() => {
            setGridStatus('idle');
            firstPattern.current = [];
            setStep('draw');
            setStatusMessage('Draw a pattern connecting at least 4 dots');
          }, 800);
        }
      }
    },
    [step]
  );

  const handleSaveSecurityQA = useCallback(async () => {
    if (!selectedQuestion || answerText.trim().length < 3) {
      setAnswerError('Please select a question and enter an answer (min 3 characters)');
      return;
    }
    const answerHash = sha256(answerText.trim().toLowerCase());
    await saveSecurityQA(selectedQuestion, answerHash);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/home');
  }, [selectedQuestion, answerText, router]);

  if (step === 'security') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Set a Security Question</Text>
          <Text style={styles.subtitle}>
            Used to recover access if you forget your pattern
          </Text>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>Choose a question</Text>
          {SECURITY_QUESTIONS.map((q) => (
            <TouchableOpacity
              key={q}
              style={[
                styles.questionChip,
                selectedQuestion === q && styles.questionChipSelected,
              ]}
              onPress={() => setSelectedQuestion(q)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.questionChipText,
                  selectedQuestion === q && styles.questionChipTextSelected,
                ]}
              >
                {q}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Your answer</Text>
          <TextInput
            style={styles.answerInput}
            placeholder="Type your answer..."
            placeholderTextColor={COLORS.textSecondary}
            value={answerText}
            onChangeText={(t) => {
              setAnswerText(t);
              setAnswerError('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {answerError ? (
            <Text style={styles.errorText}>{answerError}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedQuestion || answerText.trim().length < 3) && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveSecurityQA}
            disabled={!selectedQuestion || answerText.trim().length < 3}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save & Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {step === 'draw' ? 'Create Your Pattern' : 'Confirm Your Pattern'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'draw'
            ? 'Draw a pattern connecting at least 4 dots'
            : 'Draw the same pattern again'}
        </Text>
      </View>

      <View style={styles.gridContainer}>
        <PatternGrid onPatternComplete={handlePattern} status={gridStatus} />
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.statusText,
            gridStatus === 'error' && styles.errorText,
            gridStatus === 'success' && styles.successText,
          ]}
        >
          {statusMessage}
        </Text>
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
    marginBottom: 32,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  gridContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  successText: {
    color: COLORS.success,
  },
  // Security question step
  scrollArea: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  questionChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  questionChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(74,144,217,0.1)',
  },
  questionChipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  questionChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  answerInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceLight,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
