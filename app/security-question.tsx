import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { sha256 } from 'js-sha256';
import { useSelection } from '../context/SelectionContext';
import { COLORS } from '../utils/constants';
import {
  deletePatternHash,
  deleteSecurityQA,
  getSecurityAnswerHash,
  getSecurityQuestion,
} from '../utils/secureStore';

export default function SecurityQuestionScreen() {
  const router = useRouter();
  const { clearSelection } = useSelection();

  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    getSecurityQuestion().then((q) => {
      setQuestion(q);
      setLoading(false);
    });
  }, []);

  const handleVerify = async () => {
    if (answer.trim().length < 1) {
      setError('Please enter your answer');
      return;
    }
    setVerifying(true);
    setError('');

    const inputHash = sha256(answer.trim().toLowerCase());
    const storedHash = await getSecurityAnswerHash();

    if (inputHash === storedHash) {
      await deletePatternHash();
      await deleteSecurityQA();
      clearSelection();
      router.replace('/pattern-setup');
    } else {
      setError('Wrong answer. Try again.');
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorLabel}>No security question set.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Pattern?</Text>
          <Text style={styles.subtitle}>Answer your security question to reset</Text>
        </View>

        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>Your question</Text>
          <Text style={styles.questionText}>{question}</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Type your answer..."
          placeholderTextColor={COLORS.textSecondary}
          value={answer}
          onChangeText={(t) => {
            setAnswer(t);
            setError('');
          }}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleVerify}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.verifyButton, verifying && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={verifying}
          activeOpacity={0.8}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Answer</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  questionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  questionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  questionText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceLight,
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 16,
  },
  errorLabel: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  backButton: {
    padding: 12,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 15,
  },
});
