import { useAudioInput, type MicrophoneStatus } from '../hooks/useAudioInput';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onReady: (stream: MediaStream, audioContext: AudioContext) => void;
}

const WelcomeScreen = ({ onReady }: WelcomeScreenProps) => {
  const { status, error, stream, audioContext, requestMicrophone } = useAudioInput();

  const handleEnableMicrophone = async () => {
    await requestMicrophone();
  };

  const handleContinue = () => {
    if (stream && audioContext) {
      onReady(stream, audioContext);
    }
  };

  const getStatusMessage = (status: MicrophoneStatus): string => {
    switch (status) {
      case 'requesting':
        return 'Requesting microphone access...';
      case 'granted':
        return 'Microphone access granted! Ready to start.';
      case 'denied':
        return 'Microphone access denied';
      case 'unavailable':
        return 'Microphone unavailable';
      case 'error':
        return 'Error accessing microphone';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: MicrophoneStatus): string => {
    switch (status) {
      case 'requesting':
        return '⏳';
      case 'granted':
        return '✓';
      case 'denied':
      case 'unavailable':
      case 'error':
        return '⚠';
      default:
        return '🎵';
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="welcome-header">
          <h1 className="welcome-title">
            <span className="title-icon">🎼</span>
            Flute Tuner
          </h1>
          <p className="welcome-subtitle">
            Real-Time Pitch Detection and Audio Feedback Application
          </p>
        </div>

        <div className="welcome-content">
          <div className="info-section">
            <h2>How It Works</h2>
            <ul className="feature-list">
              <li>
                <span className="feature-icon">🎤</span>
                <span>Detects flute pitch in real-time using your microphone</span>
              </li>
              <li>
                <span className="feature-icon">🎹</span>
                <span>Generates corresponding piano notes for tuning reference</span>
              </li>
              <li>
                <span className="feature-icon">⚡</span>
                <span>Low latency audio processing (&lt;50ms)</span>
              </li>
              <li>
                <span className="feature-icon">🎯</span>
                <span>Continuous audio feedback during sustained notes</span>
              </li>
            </ul>
          </div>

          <div className="recommendation-box">
            <div className="recommendation-icon">🎧</div>
            <div className="recommendation-text">
              <strong>Recommendation:</strong> Use headphones to prevent audio feedback between the
              synthesized piano notes and your microphone.
            </div>
          </div>

          {status !== 'idle' && (
            <div className={`status-message status-${status}`}>
              <span className="status-icon">{getStatusIcon(status)}</span>
              <span className="status-text">{getStatusMessage(status)}</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠</div>
              <div className="error-text">{error}</div>
            </div>
          )}

          <div className="action-section">
            {status === 'granted' ? (
              <button className="primary-button continue-button" onClick={handleContinue}>
                Continue to Tuner
              </button>
            ) : (
              <button
                className="primary-button enable-button"
                onClick={handleEnableMicrophone}
                disabled={status === 'requesting'}
              >
                {status === 'requesting' ? 'Requesting Access...' : 'Enable Microphone'}
              </button>
            )}
          </div>

          <div className="browser-info">
            <p className="info-text">
              <strong>Browser Requirements:</strong> Chrome 89+, Firefox 88+, Safari 14.1+, or Edge
              89+
            </p>
            <p className="info-text">
              <strong>Note:</strong> HTTPS is required for microphone access (localhost is exempt)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
