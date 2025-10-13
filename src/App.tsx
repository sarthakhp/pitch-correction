import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TunerInterface from './components/TunerInterface';
import './App.css';

function App() {
  const [isReady, setIsReady] = useState(false);

  const handleContinue = () => {
    setIsReady(true);
  };

  return (
    <>
      {!isReady ? (
        <WelcomeScreen onContinue={handleContinue} />
      ) : (
        <TunerInterface />
      )}
    </>
  );
}

export default App;
