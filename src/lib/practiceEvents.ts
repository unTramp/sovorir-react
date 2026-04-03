export type PracticeSource = 'quiz' | 'flashcard' | 'recording';
type Listener = (source: PracticeSource) => void;

let listeners: Listener[] = [];

export const practiceEvents = {
  emit: (source: PracticeSource) => listeners.forEach((l) => l(source)),
  on: (fn: Listener) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },
};
