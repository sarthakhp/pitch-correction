import { useEffect, useState, useRef } from 'react';
import './TunerInterface.css';
import {
  startAudioStream,
  stopAudioStream,
  type AudioStreamRefs,
  type AudioStreamResult,
} from '../utils/audioStream';

const TunerInterface = () => {
  const [isActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRefsRef = useRef<AudioStreamRefs>({
    stream: null,
    audioContext: null,
    sourceNode: null,
    analyserNode: null,
  });

  const handleAudioStreamResult = (result: AudioStreamResult) => {
    if (result.success) {
      audioRefsRef.current = result.refs;
      setIsListening(true);
    } else {
      setError(result.error || 'Failed to start audio stream');
      setIsListening(false);
    }
  };

  useEffect(() => {
    console.log('[TunerInterface] useEffect mounted');
    const abortController = new AbortController();

    const initializeAudio = async () => {
      console.log('[TunerInterface] Auto-starting audio listening...');
      setError(null);

      const result = await startAudioStream();

      if (!abortController.signal.aborted) {
        handleAudioStreamResult(result);
      } else {
        console.log('[TunerInterface] Component unmounted before audio started, stopping audio...');
        await stopAudioStream(result.refs);
      }
    };

    initializeAudio();

    return () => {
      console.log('[TunerInterface] useEffect cleanup running');
      abortController.abort();
      stopAudioStream(audioRefsRef.current);
    };
  }, []);

  const handleToggleListening = async () => {
    if (!isListening) {
      console.log('[TunerInterface] Toggling to start audio listening...');
      setError(null);

      const result = await startAudioStream();
      handleAudioStreamResult(result);
    } else {
      console.log('[TunerInterface] Toggling to stop audio listening...');
      console.log('[TunerInterface] Current refs before stop:', {
        hasStream: !!audioRefsRef.current.stream,
        streamId: audioRefsRef.current.stream?.id,
        streamActive: audioRefsRef.current.stream?.active,
        hasAudioContext: !!audioRefsRef.current.audioContext,
        audioContextState: audioRefsRef.current.audioContext?.state,
      });

      await stopAudioStream(audioRefsRef.current);

      audioRefsRef.current = {
        analyserNode: null,
        audioContext: null,
        sourceNode: null,
        stream: null,
      };

      console.log('[TunerInterface] Setting isListening to false');
      setIsListening(false);
      console.log('[TunerInterface] isListening state updated');
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
            {isListening && audioRefsRef.current.audioContext && audioRefsRef.current.stream && (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Audio Context State:</span>
                  <span className="info-value">{audioRefsRef.current.audioContext.state}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Sample Rate:</span>
                  <span className="info-value">
                    {audioRefsRef.current.audioContext.sampleRate} Hz
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Stream Active:</span>
                  <span className="info-value">
                    {audioRefsRef.current.stream.active ? 'Yes' : 'No'}
                  </span>
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
