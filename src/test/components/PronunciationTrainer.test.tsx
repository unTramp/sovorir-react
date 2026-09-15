import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PronunciationTrainer } from '../../components/practice/PronunciationTrainer';

const recorder = vi.hoisted(() => ({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  reset: vi.fn(),
  isRecording: false,
  audioBlob: null as Blob | null,
  audioLevel: 0,
  duration: 0,
  error: null as string | null,
}));

const recordings = vi.hoisted(() => ({
  saveRecording: vi.fn().mockResolvedValue(undefined),
  getRecordingUrl: vi.fn().mockResolvedValue('blob:student-recording'),
}));

vi.mock('../../hooks/useMediaRecorder', () => ({ useMediaRecorder: () => recorder }));
vi.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({ togglePlay: vi.fn(), playingId: null, loadingId: null }),
}));
vi.mock('../../stores/useRecordingStore', () => ({
  useRecordingStore: (selector: (state: typeof recordings) => unknown) => selector(recordings),
}));

describe('PronunciationTrainer recording flow', () => {
  beforeEach(() => {
    recorder.isRecording = false;
    recorder.audioBlob = null;
    recorder.audioLevel = 0;
    recorder.duration = 0;
    recorder.error = null;
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it('starts recording with a tap and exposes teacher reference audio', () => {
    render(<PronunciationTrainer />);

    expect(screen.getByText('Ba · Rev')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Прослушать произношение преподавателя' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Записать произношение' }));
    expect(recorder.start).toHaveBeenCalledOnce();
  });

  it('shows timer and stops an active recording with a tap', () => {
    recorder.isRecording = true;
    recorder.duration = 7;
    render(<PronunciationTrainer />);

    expect(screen.getByText(/Запись · 0:07/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Остановить' }));
    expect(recorder.stop).toHaveBeenCalledOnce();
  });
});
