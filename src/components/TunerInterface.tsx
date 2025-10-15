import './TunerInterface.css';
import { ListeningState, type ListeningStateType, useAudioStream } from '../hooks/useAudioStream';
import ListeningControl from './ListeningControl';
import { usePitchDetection } from '../hooks/usePitchDetection';
import { usePitchDetectionYIN } from '../hooks/usePitchDetectionYIN';

const TunerInterface = () => {
  const { isListening, error, audioRefs, toggleListening } = useAudioStream({
    autoStart: true,
  });

  const pitchResultAutocorrelation = usePitchDetection({
    analyserNode: audioRefs.current.analyserNode,
    audioContext: audioRefs.current.audioContext,
    isActive: isListening === ListeningState.Listening,
  });

  const pitchResultYIN = usePitchDetectionYIN({
    analyserNode: audioRefs.current.analyserNode,
    audioContext: audioRefs.current.audioContext,
    isActive: isListening === ListeningState.Listening,
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

          {isListening === ListeningState.Listening && (
            <div className="pitch-comparison-container">
              <div className="pitch-display">
                <div className="pitch-method-label">Autocorrelation Method</div>
                <div className="pitch-label">Detected Pitch:</div>
                <div className="pitch-value">
                  {pitchResultAutocorrelation.frequency !== null
                    ? `${pitchResultAutocorrelation.frequency.toFixed(1)} Hz`
                    : 'No pitch detected'}
                </div>
                {pitchResultAutocorrelation.frequency !== null && (
                  <div className="pitch-clarity">
                    Clarity: {(pitchResultAutocorrelation.clarity * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              <div className="pitch-display pitch-display-yin">
                <div className="pitch-method-label">YIN Algorithm Method</div>
                <div className="pitch-label">Detected Pitch:</div>
                <div className="pitch-value">
                  {pitchResultYIN.frequency !== null
                    ? `${pitchResultYIN.frequency.toFixed(1)} Hz`
                    : 'No pitch detected'}
                </div>
                {pitchResultYIN.frequency !== null && (
                  <div className="pitch-clarity">
                    Clarity: {(pitchResultYIN.clarity * 100).toFixed(0)}%
                  </div>
                )}
              </div>
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
