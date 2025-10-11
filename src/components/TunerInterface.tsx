import { useEffect, useState } from 'react';
import './TunerInterface.css';

interface TunerInterfaceProps {
  stream: MediaStream;
  audioContext: AudioContext;
}

const TunerInterface = ({ stream, audioContext }: TunerInterfaceProps) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    console.log('TunerInterface mounted with:', {
      stream,
      audioContext,
      audioContextState: audioContext.state,
      streamActive: stream.active,
      tracks: stream.getTracks().length,
    });

    setIsActive(true);

    return () => {
      console.log('TunerInterface unmounting');
    };
  }, [stream, audioContext]);

  return (
    <div className="tuner-interface">
      <div className="tuner-container">
        <header className="tuner-header">
          <h1>🎼 Flute Tuner</h1>
          <div className="status-indicator">
            <span className={`status-dot ${isActive ? 'active' : ''}`}></span>
            <span className="status-text">
              {isActive ? 'Ready' : 'Initializing...'}
            </span>
          </div>
        </header>

        <div className="tuner-content">
          <div className="placeholder-message">
            <div className="placeholder-icon">🎵</div>
            <h2>Tuner Interface Ready</h2>
            <p>Microphone and audio context successfully initialized!</p>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Audio Context State:</span>
                <span className="info-value">{audioContext.state}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Sample Rate:</span>
                <span className="info-value">{audioContext.sampleRate} Hz</span>
              </div>
              <div className="info-item">
                <span className="info-label">Stream Active:</span>
                <span className="info-value">{stream.active ? 'Yes' : 'No'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Audio Tracks:</span>
                <span className="info-value">{stream.getTracks().length}</span>
              </div>
            </div>
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

