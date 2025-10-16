export interface NoteInfo {
  note: string;
  octave: number;
  fullNoteName: string;
  midiNumber: number;
  centsOff: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

export const frequencyToNote = (frequency: number): NoteInfo => {
  const midiNumber = Math.round(12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NUMBER);
  
  const noteIndex = midiNumber % 12;
  const octave = Math.floor(midiNumber / 12) - 1;
  const note = NOTE_NAMES[noteIndex];
  
  const exactMidiNumber = 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NUMBER;
  const centsOff = Math.round((exactMidiNumber - midiNumber) * 100);
  
  const fullNoteName = `${note}${octave}`;
  
  return {
    note,
    octave,
    fullNoteName,
    midiNumber,
    centsOff,
  };
};

