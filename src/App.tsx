import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TunerInterface from './components/TunerInterface';
import { checkMicrophonePermission } from './utils/microphonePermission';
import './App.css';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    const checkInitialPermission = async () => {
      const isGranted = await checkMicrophonePermission();

      if (isGranted) {
        console.log('[App] Microphone permission already granted - skipping welcome screen');
        setIsReady(true);
      }

      setIsCheckingPermission(false);
    };

    void checkInitialPermission();
  }, []);

  const handleContinue = () => {
    setIsReady(true);
  };

  if (isCheckingPermission) {
    return null;
  }

  return <>{isReady ? <TunerInterface /> : <WelcomeScreen onContinue={handleContinue} />}</>;
}

export default App;
