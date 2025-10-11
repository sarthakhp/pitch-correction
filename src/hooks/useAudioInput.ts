import { useState, useCallback, useRef, useEffect } from 'react';

export type MicrophoneStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

interface UseAudioInputReturn {
  status: MicrophoneStatus;
  error: string | null;
  stream: MediaStream | null;
  audioContext: AudioContext | null;
  requestMicrophone: () => Promise<void>;
  cleanup: () => void;
}

export const useAudioInput = (): UseAudioInputReturn => {
  const [status, setStatus] = useState<MicrophoneStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setStream(null);
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setStatus('idle');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const requestMicrophone = useCallback(async () => {
    console.log('[useAudioInput] Requesting microphone access...');
    setStatus('requesting');
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[useAudioInput] getUserMedia not supported');
      setStatus('unavailable');
      setError(
        'Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Edge.'
      );
      return;
    }

    try {
      console.log('[useAudioInput] Calling getUserMedia with constraints:', {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
        },
      });

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
        },
      });

      console.log('[useAudioInput] MediaStream obtained:', {
        id: mediaStream.id,
        active: mediaStream.active,
        tracks: mediaStream.getTracks().length,
      });

      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('[useAudioInput] AudioContext created:', {
        state: context.state,
        sampleRate: context.sampleRate,
        baseLatency: context.baseLatency,
      });

      if (context.state === 'suspended') {
        console.log('[useAudioInput] Resuming suspended AudioContext...');
        await context.resume();
        console.log('[useAudioInput] AudioContext resumed, new state:', context.state);
      }

      audioContextRef.current = context;
      setStream(mediaStream);
      setStatus('granted');
      console.log('[useAudioInput] ✅ Microphone access granted successfully');
    } catch (err) {
      console.error('[useAudioInput] ❌ Microphone access error:', err);

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setStatus('denied');
          setError(
            'Microphone access was denied. Please allow microphone access in your browser settings and try again.'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setStatus('unavailable');
          setError('No microphone found. Please connect a microphone and try again.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setStatus('error');
          setError(
            'Microphone is already in use by another application. Please close other applications and try again.'
          );
        } else {
          setStatus('error');
          setError(`Failed to access microphone: ${err.message}`);
        }
      } else {
        setStatus('error');
        setError('An unknown error occurred while accessing the microphone.');
      }
    }
  }, []);

  return {
    status,
    error,
    stream,
    audioContext: audioContextRef.current,
    requestMicrophone,
    cleanup,
  };
};
