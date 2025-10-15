import { useState, useCallback } from 'react';

interface UseMicrophonePermissionReturn {
  permissionGranted: boolean;
  isChecking: boolean;
  error: string | null;
  requestMicrophonePermission: () => Promise<void>;
}

export const useMicrophonePermission = (): UseMicrophonePermissionReturn => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestMicrophonePermission = useCallback(async (): Promise<void> => {
    setIsChecking(true);
    setError(null);

    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });

      if (result.state === 'granted') {
        console.log('[useMicrophonePermission] Microphone permission already granted');
        setPermissionGranted(true);
      } else if (result.state === 'prompt') {
        console.log('[useMicrophonePermission] Requesting microphone permission...');
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        testStream.getTracks().forEach((track) => track.stop());
        console.log('[useMicrophonePermission] Microphone permission granted');
        setPermissionGranted(true);
      } else {
        setError(
          'Microphone permission was denied. Please allow microphone access in your browser settings.'
        );
      }
    } catch (err) {
      console.error('[useMicrophonePermission] Error requesting microphone permission:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access was denied. Please allow microphone access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError(`Failed to access microphone: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred while checking microphone access.');
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    permissionGranted,
    isChecking,
    error,
    requestMicrophonePermission,
  };
};
