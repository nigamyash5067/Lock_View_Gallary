import { sha256 } from 'js-sha256';

export function hashPattern(pattern: number[]): string {
  const patternString = pattern.join(',');
  return sha256(patternString);
}

export function verifyPattern(pattern: number[], storedHash: string): boolean {
  return hashPattern(pattern) === storedHash;
}
