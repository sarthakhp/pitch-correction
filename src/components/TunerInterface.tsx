import { useEffect } from 'react';
import './TunerInterface.css';
import { ListeningState, type ListeningStateType, useAudioStream } from '../hooks/useAudioStream';

const TunerInterface = () => {
  const { isListening, error, audioRefs, toggleListening } = useAudioStream({
    autoStart: true,
  });

  const listeningButtonStateConfigs: Record<
    ListeningStateType,
    { class: string; icon: string; label: string }
  > = {
    [ListeningState.Starting]: { class: 'loading', icon: '⏳', label: 'Starting Microphone...' },
    [ListeningState.Listening]: { class: 'listening', icon: '⏸️', label: 'Stop Listening' },
    [ListeningState.Stopped]: { class: 'ready', icon: '🎤', label: 'Start Listening' },
  };

  const statusIndicatorConfigs: Record<ListeningStateType, { class: string; label: string }> = {
    [ListeningState.Listening]: { class: 'listening', label: 'Listening' },
    [ListeningState.Stopped]: { class: 'active', label: 'Ready' },
    [ListeningState.Starting]: { class: 'active', label: 'Ready' },
  };

  const currentListeningButtonClass =
    listeningButtonStateConfigs[isListening] ?? listeningButtonStateConfigs[ListeningState.Stopped];

  const currentStatusIndicatorConfig =
    statusIndicatorConfigs[isListening] ?? statusIndicatorConfigs[ListeningState.Stopped];

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.code === 'Space' &&
        event.target === document.body &&
        isListening !== ListeningState.Starting
      ) {
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
            <span className={`status-dot ${currentStatusIndicatorConfig.class}`}></span>
            <span className="status-text">{currentStatusIndicatorConfig.label}</span>
          </div>
        </header>

        <div className="tuner-content">
          <div className="control-section">
            <button
              className={`listening-button ${currentListeningButtonClass.class}`}
              onClick={toggleListening}
              disabled={isListening === ListeningState.Starting}
            >
              <span className="button-icon">{currentListeningButtonClass.icon}</span>
              <span className="button-text">{currentListeningButtonClass.label}</span>
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
            <p>Play your flute to detect pitch!</p>
            {isListening === ListeningState.Listening &&
              audioRefs.current.audioContext &&
              audioRefs.current.stream && (
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Audio Context State:</span>
                    <span className="info-value">{audioRefs.current.audioContext.state}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Sample Rate:</span>
                    <span className="info-value">
                      {audioRefs.current.audioContext.sampleRate} Hz
                    </span>
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
