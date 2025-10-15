import {
  type PitchDetectionResult,
  MIN_FREQUENCY,
  MAX_FREQUENCY,
  RMS_THRESHOLD,
  calculateRMS,
  isValidFrequency,
} from './pitchDetectionCommon';

const YIN_THRESHOLD = 0.15;

export const detectPitchYIN = (
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

  const differenceFunction = new Float32Array(maxLag);

  for (let tau = 0; tau < maxLag; tau++) {
    let sum = 0;
    for (let i = 0; i < bufferLength - tau; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    differenceFunction[tau] = sum;
  }

  const cumulativeMeanNormalizedDifference = new Float32Array(maxLag);
  cumulativeMeanNormalizedDifference[0] = 1;

  let runningSum = 0;
  for (let tau = 1; tau < maxLag; tau++) {
    runningSum += differenceFunction[tau];
    cumulativeMeanNormalizedDifference[tau] =
      differenceFunction[tau] / (runningSum / tau);
  }

  let bestTau = -1;
  for (let tau = minLag; tau < maxLag; tau++) {
    if (cumulativeMeanNormalizedDifference[tau] < YIN_THRESHOLD) {
      while (
        tau + 1 < maxLag &&
        cumulativeMeanNormalizedDifference[tau + 1] < cumulativeMeanNormalizedDifference[tau]
      ) {
        tau++;
      }
      bestTau = tau;
      break;
    }
  }

  if (bestTau === -1) {
    let minValue = 1;
    for (let tau = minLag; tau < maxLag; tau++) {
      if (cumulativeMeanNormalizedDifference[tau] < minValue) {
        minValue = cumulativeMeanNormalizedDifference[tau];
        bestTau = tau;
      }
    }
  }

  if (bestTau === -1) {
    return { frequency: null, clarity: 0 };
  }

  let betterTau = bestTau;
  if (bestTau > 0 && bestTau < maxLag - 1) {
    const s0 = cumulativeMeanNormalizedDifference[bestTau - 1];
    const s1 = cumulativeMeanNormalizedDifference[bestTau];
    const s2 = cumulativeMeanNormalizedDifference[bestTau + 1];
    betterTau = bestTau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  const frequency = sampleRate / betterTau;

  if (!isValidFrequency(frequency)) {
    return { frequency: null, clarity: 0 };
  }

  const clarity = 1 - cumulativeMeanNormalizedDifference[bestTau];

  return {
    frequency: Math.round(frequency * 10) / 10,
    clarity: Math.max(0, Math.min(1, clarity)),
  };
};

