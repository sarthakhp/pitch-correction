import './TunerInterface.css';
import { ListeningState, type ListeningStateType, useAudioStream } from '../hooks/useAudioStream';
import ListeningControl from './ListeningControl';

const TunerInterface = () => {
  const { isListening, error, audioRefs, toggleListening } = useAudioStream({
    autoStart: true,
  });

  const statusIndicatorConfigs: Record<ListeningStateType, { class: string; label: string }> = {
    [ListeningState.Listening]: { class: 'listening', label: 'Listening' },
    [ListeningState.Stopped]: { class: 'active', label: 'Ready' },
    [ListeningState.Starting]: { class: 'active', label: 'Ready' },
  };

  const currentStatusIndicatorConfig =
    statusIndicatorConfigs[isListening] ?? statusIndicatorConfigs[ListeningState.Stopped];

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
          <ListeningControl isListening={isListening} toggleListening={toggleListening} />

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
