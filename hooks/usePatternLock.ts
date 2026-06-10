import { useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { hashPattern, verifyPattern } from '../utils/patternHash';
import { getPatternHash, savePatternHash } from '../utils/secureStore';

export type PatternStatus = 'idle' | 'success' | 'error';

interface UsePatternLockResult {
  status: PatternStatus;
  attemptCount: number;
  handlePattern: (pattern: number[]) => Promise<boolean>;
  resetStatus: () => void;
}

export function usePatternLock(
  mode: 'setup' | 'verify',
  onSuccess?: () => void,
  onError?: (attempts: number) => void
): UsePatternLockResult {
  const [status, setStatus] = useState<PatternStatus>('idle');
  const [attemptCount, setAttemptCount] = useState(0);

  const resetStatus = useCallback(() => {
    setStatus('idle');
  }, []);

  const handlePattern = useCallback(
    async (pattern: number[]): Promise<boolean> => {
      if (pattern.length < 4) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 800);
        return false;
      }

      if (mode === 'verify') {
        const storedHash = await getPatternHash();
        if (!storedHash) return false;

        const isValid = verifyPattern(pattern, storedHash);
        if (isValid) {
          setStatus('success');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onSuccess?.();
          return true;
        } else {
          const newCount = attemptCount + 1;
          setAttemptCount(newCount);
          setStatus('error');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          onError?.(newCount);
          setTimeout(() => setStatus('idle'), 800);
          return false;
        }
      }

      return false;
    },
    [mode, attemptCount, onSuccess, onError]
  );

  return { status, attemptCount, handlePattern, resetStatus };
}

export { hashPattern, savePatternHash };
