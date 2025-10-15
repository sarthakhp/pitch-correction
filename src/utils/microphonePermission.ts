export const checkMicrophonePermission = async (): Promise<boolean> => {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state === 'granted';
  } catch (err) {
    console.error('[checkMicrophonePermission] Error checking microphone permission:', err);
    return false;
  }
};

