import { useState, useRef, useEffect, useCallback } from 'react';
import {
  startAudioStream,
  stopAudioStream,
  type AudioStreamRefs,
  type AudioStreamResult,
} from '../utils/audioStream';
import * as React from 'react';

interface UseAudioStreamOptions {
  autoStart?: boolean;
}

interface UseAudioStreamReturn {
  isListening: number;
  error: string | null;
  audioRefs: React.RefObject<AudioStreamRefs>;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  toggleListening: () => Promise<void>;
}

export const useAudioStream = (options: UseAudioStreamOptions = {}): UseAudioStreamReturn => {
  const { autoStart = false } = options;

  const [isListening, setIsListening] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const audioRefsRef = useRef<AudioStreamRefs>({
    stream: null,
    audioContext: null,
    sourceNode: null,
    analyserNode: null,
  });

  const handleAudioStreamResult = useCallback((result: AudioStreamResult) => {
    if (result.success) {
      audioRefsRef.current = result.refs;
      setIsListening(1);
    } else {
      setError(result.error || 'Failed to start audio stream');
      setIsListening(-1);
    }
  }, []);

  const startListening = useCallback(async () => {
    console.log('[useAudioStream] Starting audio listening...');
    setError(null);
    setIsListening(0);

    const result = await startAudioStream();
    handleAudioStreamResult(result);
  }, [handleAudioStreamResult]);

  const stopListening = useCallback(async () => {
    console.log('[useAudioStream] Stopping audio listening...');
    await stopAudioStream(audioRefsRef.current);

    audioRefsRef.current = {
      analyserNode: null,
      audioContext: null,
      sourceNode: null,
      stream: null,
    };

    setIsListening(-1);
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening === 0) {
      return;
    }

    if (isListening === 1) {
      await stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    if (!autoStart) return;

    console.log('[useAudioStream] useEffect mounted');
    const abortController = new AbortController();

    const initializeAudio = async () => {
      console.log('[useAudioStream] Auto-starting audio listening...');
      setError(null);
      setIsListening(0);

      const result = await startAudioStream();

      if (!abortController.signal.aborted) {
        handleAudioStreamResult(result);
      } else {
        console.log('[useAudioStream] Component unmounted before audio started, stopping audio...');
        await stopAudioStream(result.refs);
      }
    };

    initializeAudio();

    return () => {
      console.log('[useAudioStream] useEffect cleanup running');
      abortController.abort();
      stopAudioStream(audioRefsRef.current);
    };
  }, [autoStart, handleAudioStreamResult]);

  return {
    isListening,
    error,
    audioRefs: audioRefsRef,
    startListening,
    stopListening,
    toggleListening,
  };
};
