import { useEffect } from 'react';
import { ListeningState, type ListeningStateType } from '../hooks/useAudioStream';

interface ListeningControlProps {
  isListening: ListeningStateType;
  toggleListening: () => void;
}

const ListeningControl = ({ isListening, toggleListening }: ListeningControlProps) => {
  const listeningButtonStateConfigs: Record<
    ListeningStateType,
    { class: string; icon: string; label: string }
  > = {
    [ListeningState.Starting]: { class: 'loading', icon: '⏳', label: 'Starting Microphone...' },
    [ListeningState.Listening]: { class: 'listening', icon: '⏸️', label: 'Stop Listening' },
    [ListeningState.Stopped]: { class: 'ready', icon: '🎤', label: 'Start Listening' },
  };

  const currentListeningButtonClass =
    listeningButtonStateConfigs[isListening] ?? listeningButtonStateConfigs[ListeningState.Stopped];

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
  );
};

export default ListeningControl;

