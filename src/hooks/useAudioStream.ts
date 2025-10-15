import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type AudioStreamRefs,
  type AudioStreamResult,
  startAudioStream,
  stopAudioStream,
} from '../utils/audioStream';

interface UseAudioStreamOptions {
  autoStart?: boolean;
}

export const ListeningState = {
  Stopped: 'stopped',
  Starting: 'starting',
  Listening: 'listening',
} as const;

export type ListeningStateType = (typeof ListeningState)[keyof typeof ListeningState];

interface UseAudioStreamReturn {
  isListening: ListeningStateType;
  error: string | null;
  audioRefs: React.RefObject<AudioStreamRefs>;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  toggleListening: () => Promise<void>;
}

export const useAudioStream = (options: UseAudioStreamOptions = {}): UseAudioStreamReturn => {
  const { autoStart = false } = options;

  const [isListening, setIsListening] = useState<ListeningStateType>(ListeningState.Stopped);
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
      setIsListening(ListeningState.Listening);
    } else {
      setError(result.error || 'Failed to start audio stream');
      setIsListening(ListeningState.Stopped);
    }
  }, []);

  const startListening = useCallback(async () => {
    console.log('[useAudioStream] Starting audio listening...');
    setError(null);
    setIsListening(ListeningState.Starting);

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

    setIsListening(ListeningState.Stopped);
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening === ListeningState.Starting) {
      return;
    }

    if (isListening === ListeningState.Listening) {
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
      setIsListening(ListeningState.Starting);

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
