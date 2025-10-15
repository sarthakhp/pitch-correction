export interface AudioStreamRefs {
  stream: MediaStream | null;
  audioContext: AudioContext | null;
  sourceNode: MediaStreamAudioSourceNode | null;
  analyserNode: AnalyserNode | null;
}

export interface AudioStreamResult {
  success: boolean;
  error?: string;
  refs: AudioStreamRefs;
}

export const startAudioStream = async (): Promise<AudioStreamResult> => {
  console.log('[AudioStream] Starting audio listening...');

  const refs: AudioStreamRefs = {
    stream: null,
    audioContext: null,
    sourceNode: null,
    analyserNode: null,
  };

  try {
    console.log('[AudioStream] Requesting microphone access...');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
      },
    });

    console.log('[AudioStream] MediaStream obtained:', {
      id: stream.id,
      active: stream.active,
      tracks: stream.getTracks().length,
    });

    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('[AudioStream] AudioContext created:', {
      state: context.state,
      sampleRate: context.sampleRate,
    });

    if (context.state === 'suspended') {
      console.log('[AudioStream] Resuming suspended AudioContext...');
      await context.resume();
    }

    const sourceNode = context.createMediaStreamSource(stream);
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 2048 * 8;

    sourceNode.connect(analyserNode);

    refs.stream = stream;
    refs.audioContext = context;
    refs.sourceNode = sourceNode;
    refs.analyserNode = analyserNode;

    console.log('[AudioStream] ✅ Audio pipeline connected - listening started');

    return {
      success: true,
      refs,
    };
  } catch (err) {
    console.error('[AudioStream] ❌ Error starting audio:', err);

    let errorMessage = 'An unknown error occurred while accessing the microphone.';

    if (err instanceof Error) {
      if (err.name === 'NotAllowedError') {
        errorMessage =
          'Microphone access was denied. Please allow microphone access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else {
        errorMessage = `Failed to access microphone: ${err.message}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
      refs,
    };
  }
};

export const stopAudioStream = async (refs: AudioStreamRefs): Promise<void> => {
  console.log('[AudioStream] Stopping audio listening...');
  console.log('[AudioStream] Stream info before stop:', {
    hasStream: !!refs.stream,
    streamId: refs.stream?.id,
    streamActive: refs.stream?.active,
    trackCount: refs.stream?.getTracks().length,
  });

  if (refs.sourceNode) {
    try {
      refs.sourceNode.disconnect();
      console.log('[AudioStream] Source node disconnected');
    } catch (e) {
      console.log('[AudioStream] Source node already disconnected', e);
    }
  }

  if (refs.analyserNode) {
    try {
      refs.analyserNode.disconnect();
      console.log('[AudioStream] Analyser node disconnected');
    } catch (e) {
      console.log('[AudioStream] Analyser node already disconnected', e);
    }
  }

  if (refs.stream) {
    const tracks = refs.stream.getTracks();
    console.log('[AudioStream] Stopping', tracks.length, 'track(s)');
    tracks.forEach((track) => {
      console.log('[AudioStream] Track before stop:', {
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        id: track.id,
      });
      track.stop();
      console.log('[AudioStream] Track after stop:', {
        kind: track.kind,
        readyState: track.readyState,
      });
    });
  }

  if (refs.audioContext && refs.audioContext.state !== 'closed') {
    await refs.audioContext.close();
    console.log('[AudioStream] AudioContext closed');
  }

  console.log('[AudioStream] ⏸️ Listening stopped - all resources released');
};
