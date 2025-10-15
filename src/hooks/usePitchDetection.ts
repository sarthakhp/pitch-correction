import { useEffect, useState, useRef } from 'react';
import { detectPitchAutocorrelation } from '../utils/pitchDetection';
import type { PitchDetectionResult } from '../utils/pitchDetectionCommon';

interface UsePitchDetectionOptions {
  analyserNode: AnalyserNode | null;
  audioContext: AudioContext | null;
  isActive: boolean;
}

export const usePitchDetection = ({
  analyserNode,
  audioContext,
  isActive,
}: UsePitchDetectionOptions): PitchDetectionResult => {
  const [pitchResult, setPitchResult] = useState<PitchDetectionResult>({
    frequency: null,
    clarity: 0,
  });

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive || !analyserNode || !audioContext) {
      setPitchResult({ frequency: null, clarity: 0 });
      return;
    }

    const detectPitchLoop = () => {
      const result = detectPitchAutocorrelation(analyserNode, audioContext.sampleRate);
      setPitchResult(result);
      animationFrameRef.current = requestAnimationFrame(detectPitchLoop);
    };

    detectPitchLoop();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, analyserNode, audioContext]);

  return pitchResult;
};
