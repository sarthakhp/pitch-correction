import type { NoteInfo } from './noteDetection';

export interface PitchDetectionResult {
  frequency: number | null;
  clarity: number;
  note: NoteInfo | null;
}

export const MIN_FREQUENCY = 80;
export const MAX_FREQUENCY = 2500;
export const RMS_THRESHOLD = 0.01;

export const calculateRMS = (buffer: Float32Array): number => {
  const sum = buffer.reduce((acc, val) => acc + val * val, 0);
  return Math.sqrt(sum / buffer.length);
};

export const isValidFrequency = (frequency: number): boolean => {
  return frequency >= MIN_FREQUENCY && frequency <= MAX_FREQUENCY;
};

