import { useEffect, useState, useRef } from 'react';
import { detectPitchYIN } from '../utils/pitchDetectionYIN';
import type { PitchDetectionResult } from '../utils/pitchDetectionCommon';

interface UsePitchDetectionYINOptions {
  analyserNode: AnalyserNode | null;
  audioContext: AudioContext | null;
  isActive: boolean;
}

export const usePitchDetectionYIN = ({
  analyserNode,
  audioContext,
  isActive,
}: UsePitchDetectionYINOptions): PitchDetectionResult => {
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
      const result = detectPitchYIN(analyserNode, audioContext.sampleRate);
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

