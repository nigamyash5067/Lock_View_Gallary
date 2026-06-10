import * as SecureStore from 'expo-secure-store';

const PATTERN_KEY = 'lockview_pattern_hash';

export async function savePatternHash(hash: string): Promise<void> {
  await SecureStore.setItemAsync(PATTERN_KEY, hash);
}

export async function getPatternHash(): Promise<string | null> {
  return await SecureStore.getItemAsync(PATTERN_KEY);
}

export async function deletePatternHash(): Promise<void> {
  await SecureStore.deleteItemAsync(PATTERN_KEY);
}

export async function hasPattern(): Promise<boolean> {
  const hash = await SecureStore.getItemAsync(PATTERN_KEY);
  return hash !== null;
}

const SECURITY_QUESTION_KEY = 'lockview_security_question';
const SECURITY_ANSWER_KEY = 'lockview_security_answer_hash';

export async function saveSecurityQA(question: string, answerHash: string): Promise<void> {
  await SecureStore.setItemAsync(SECURITY_QUESTION_KEY, question);
  await SecureStore.setItemAsync(SECURITY_ANSWER_KEY, answerHash);
}

export async function getSecurityQuestion(): Promise<string | null> {
  return await SecureStore.getItemAsync(SECURITY_QUESTION_KEY);
}

export async function getSecurityAnswerHash(): Promise<string | null> {
  return await SecureStore.getItemAsync(SECURITY_ANSWER_KEY);
}

export async function deleteSecurityQA(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURITY_QUESTION_KEY);
  await SecureStore.deleteItemAsync(SECURITY_ANSWER_KEY);
}
