import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TunerInterface from './components/TunerInterface';
import './App.css';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const handleReady = (mediaStream: MediaStream, context: AudioContext) => {
    setStream(mediaStream);
    setAudioContext(context);
    setIsReady(true);
  };

  return (
    <>
      {!isReady ? (
        <WelcomeScreen onReady={handleReady} />
      ) : (
        stream && audioContext && (
          <TunerInterface stream={stream} audioContext={audioContext} />
        )
      )}
    </>
  );
}

export default App;
