import {
  type PitchDetectionResult,
  MIN_FREQUENCY,
  MAX_FREQUENCY,
  RMS_THRESHOLD,
  calculateRMS,
  isValidFrequency,
} from './pitchDetectionCommon';

const CLARITY_THRESHOLD = 0.5;

export const detectPitchAutocorrelation = (
  analyserNode: AnalyserNode,
  sampleRate: number
): PitchDetectionResult => {
  const bufferLength = analyserNode.fftSize;
  const buffer = new Float32Array(bufferLength);

  analyserNode.getFloatTimeDomainData(buffer);

  const rms = calculateRMS(buffer);

  if (rms < RMS_THRESHOLD) {
    return { frequency: null, clarity: 0 };
  }

  const maxLag = Math.floor(sampleRate / MIN_FREQUENCY);
  const minLag = Math.floor(sampleRate / MAX_FREQUENCY);

  const correlations = new Float32Array(maxLag);

  for (let lag = 0; lag < maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < bufferLength - lag; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    correlations[lag] = sum / (bufferLength - lag);
  }

  let bestLag = -1;
  let bestCorrelation = -1;
  let foundFirstDip = false;

  for (let lag = minLag; lag < maxLag; lag++) {
    if (!foundFirstDip && correlations[lag] < correlations[0] * 0.5) {
      foundFirstDip = true;
    }

    if (foundFirstDip && correlations[lag] > bestCorrelation) {
      bestCorrelation = correlations[lag];
      bestLag = lag;
    }
  }

  const normalizedCorrelation = bestCorrelation / correlations[0];

  if (bestLag === -1 || normalizedCorrelation < CLARITY_THRESHOLD) {
    return { frequency: null, clarity: normalizedCorrelation };
  }

  const frequency = sampleRate / bestLag;

  if (!isValidFrequency(frequency)) {
    return { frequency: null, clarity: normalizedCorrelation };
  }

  return {
    frequency: Math.round(frequency * 10) / 10,
    clarity: normalizedCorrelation,
  };
};
