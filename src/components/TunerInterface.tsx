import { useEffect } from 'react';
import './TunerInterface.css';
import { useAudioStream } from '../hooks/useAudioStream';

const TunerInterface = () => {
  const { isListening, error, audioRefs, toggleListening } = useAudioStream({
    autoStart: true,
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && event.target === document.body && isListening !== 0) {
        event.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [toggleListening, isListening]);

  return (
    <div className="tuner-interface">
      <div className="tuner-container">
        <header className="tuner-header">
          <h1>🎼 Flute Tuner</h1>
          <div className="status-indicator">
            <span className={`status-dot ${isListening === 1 ? 'listening' : isListening === 0 ? 'loading' : 'active'}`}></span>
            <span className="status-text">
              {isListening === 1 ? 'Listening' : isListening === 0 ? 'Starting...' : 'Ready'}
            </span>
          </div>
        </header>

        <div className="tuner-content">
          <div className="control-section">
            <button
              className={`listening-button ${isListening === 1 ? 'listening' : isListening === 0 ? 'loading' : 'ready'}`}
              onClick={toggleListening}
              disabled={isListening === 0}
            >
              <span className="button-icon">
                {isListening === 1 ? '⏸️' : isListening === 0 ? '⏳' : '🎤'}
              </span>
              <span className="button-text">
                {isListening === 1 ? 'Stop Listening' : isListening === 0 ? 'Starting Microphone...' : 'Start Listening'}
              </span>
            </button>
            <p className="keyboard-hint">
              Press <kbd>Space</kbd> to toggle
            </p>
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
              {isListening === 1
                ? 'Listening to audio input... Play your flute to detect pitch!'
                : isListening === 0
                ? 'Requesting microphone access...'
                : 'Click "Start Listening" to begin audio processing'}
            </p>
            {isListening === 1 && audioRefs.current.audioContext && audioRefs.current.stream && (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Audio Context State:</span>
                  <span className="info-value">{audioRefs.current.audioContext.state}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Sample Rate:</span>
                  <span className="info-value">{audioRefs.current.audioContext.sampleRate} Hz</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Stream Active:</span>
                  <span className="info-value">
                    {audioRefs.current.stream.active ? 'Yes' : 'No'}
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
