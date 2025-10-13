import { useEffect, useState, useRef } from 'react';
import './TunerInterface.css';

const TunerInterface = () => {
  const [isActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      console.log('[TunerInterface] Component unmounting - cleaning up');

      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
          console.log('[TunerInterface] Source node disconnected');
        } catch (e) {
          console.log('[TunerInterface] Source already disconnected', e);
        }
      }

      if (analyserNodeRef.current) {
        try {
          analyserNodeRef.current.disconnect();
          console.log('[TunerInterface] Analyser node disconnected');
        } catch (e) {
          console.log('[TunerInterface] Analyser already disconnected', e);
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log('[TunerInterface] Media track stopped');
        });
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        console.log('[TunerInterface] AudioContext closed');
      }
    };
  }, []);

  const handleToggleListening = async () => {
    if (!isListening) {
      console.log('[TunerInterface] Starting audio listening...');
      setError(null);

      try {
        console.log('[TunerInterface] Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 48000,
          },
        });

        console.log('[TunerInterface] MediaStream obtained:', {
          id: stream.id,
          active: stream.active,
          tracks: stream.getTracks().length,
        });

        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('[TunerInterface] AudioContext created:', {
          state: context.state,
          sampleRate: context.sampleRate,
        });

        if (context.state === 'suspended') {
          console.log('[TunerInterface] Resuming suspended AudioContext...');
          await context.resume();
        }

        streamRef.current = stream;
        audioContextRef.current = context;

        sourceNodeRef.current = context.createMediaStreamSource(stream);
        analyserNodeRef.current = context.createAnalyser();
        analyserNodeRef.current.fftSize = 2048;

        sourceNodeRef.current.connect(analyserNodeRef.current);

        console.log('[TunerInterface] ✅ Audio pipeline connected - listening started');
        setIsListening(true);
      } catch (err) {
        console.error('[TunerInterface] ❌ Error starting audio:', err);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setError('Microphone access was denied. Please allow microphone access and try again.');
          } else if (err.name === 'NotFoundError') {
            setError('No microphone found. Please connect a microphone and try again.');
          } else {
            setError(`Failed to access microphone: ${err.message}`);
          }
        } else {
          setError('An unknown error occurred while accessing the microphone.');
        }
      }
    } else {
      console.log('[TunerInterface] Stopping audio listening...');

      if (sourceNodeRef.current && analyserNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect(analyserNodeRef.current);
          console.log('[TunerInterface] Audio nodes disconnected');
        } catch (e) {
          console.log('[TunerInterface] Nodes already disconnected', e);
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log('[TunerInterface] Media track stopped');
        });
        streamRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
        console.log('[TunerInterface] AudioContext closed');
        audioContextRef.current = null;
      }

      sourceNodeRef.current = null;
      analyserNodeRef.current = null;

      console.log('[TunerInterface] ⏸️ Listening stopped - all resources released');
      setIsListening(false);
    }
  };

  return (
    <div className="tuner-interface">
      <div className="tuner-container">
        <header className="tuner-header">
          <h1>🎼 Flute Tuner</h1>
          <div className="status-indicator">
            <span
              className={`status-dot ${isListening ? 'listening' : isActive ? 'active' : ''}`}
            ></span>
            <span className="status-text">
              {isListening ? 'Listening' : isActive ? 'Ready' : 'Initializing...'}
            </span>
          </div>
        </header>

        <div className="tuner-content">
          <div className="control-section">
            <button
              className={`listening-button ${isListening ? 'listening' : 'ready'}`}
              onClick={handleToggleListening}
              disabled={!isActive}
            >
              <span className="button-icon">{isListening ? '⏸️' : '🎤'}</span>
              <span className="button-text">
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </span>
            </button>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠</div>
              <div className="error-text">{error}</div>
            </div>
          )}

          <div className="placeholder-message">
            <div className="placeholder-icon">🎵</div>
            <h2>Tuner Interface</h2>
            <p>
              {isListening
                ? 'Listening to audio input... Play your flute to detect pitch!'
                : 'Click "Start Listening" to begin audio processing'}
            </p>
            {isListening && audioContextRef.current && streamRef.current && (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Audio Context State:</span>
                  <span className="info-value">{audioContextRef.current.state}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Sample Rate:</span>
                  <span className="info-value">{audioContextRef.current.sampleRate} Hz</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Stream Active:</span>
                  <span className="info-value">{streamRef.current.active ? 'Yes' : 'No'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Listening Status:</span>
                  <span className="info-value">Active</span>
                </div>
              </div>
            )}
            <p className="next-steps">
              Next steps: Implement pitch detection and piano synthesis components
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TunerInterface;
