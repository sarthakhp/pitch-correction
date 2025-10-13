import { useState } from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen = ({ onContinue }: WelcomeScreenProps) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckPermission = async () => {
    setIsChecking(true);
    setError(null);

    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });

      if (result.state === 'granted') {
        console.log('[WelcomeScreen] Microphone permission already granted');
        setPermissionGranted(true);
      } else if (result.state === 'prompt') {
        console.log('[WelcomeScreen] Requesting microphone permission...');
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        testStream.getTracks().forEach(track => track.stop());
        console.log('[WelcomeScreen] Microphone permission granted');
        setPermissionGranted(true);
      } else {
        setError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      }
    } catch (err) {
      console.error('[WelcomeScreen] Error checking microphone permission:', err);
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
  };

  const handleContinue = () => {
    onContinue();
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

          {permissionGranted && (
            <div className="status-message status-granted">
              <span className="status-icon">✓</span>
              <span className="status-text">Microphone permission granted! Ready to start.</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠</div>
              <div className="error-text">{error}</div>
            </div>
          )}

          <div className="action-section">
            {permissionGranted ? (
              <button className="primary-button continue-button" onClick={handleContinue}>
                Continue to Tuner
              </button>
            ) : (
              <button
                className="primary-button enable-button"
                onClick={handleCheckPermission}
                disabled={isChecking}
              >
                {isChecking ? 'Checking Permission...' : 'Enable Microphone'}
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
