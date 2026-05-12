import { useState, useEffect, useCallback } from 'react';
import { dictionary } from '../../data/dictionary';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { useRecordingStore } from '../../stores/useRecordingStore';
import { RecordingPlayback } from '../audio/RecordingPlayback';
import { AudioLevelMeter } from '../audio/AudioLevelMeter';

const TRAINER_SECTION_ID = 9000; // virtual section for trainer recordings

function getSyllables(transcription: string): string {
  // Strip brackets: [ba-rev] → ba-rev → Ба · рев
  return transcription
    .replace(/^\[|\]$/g, '')
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' · ');
}

export function PronunciationTrainer() {
  const [wordIndex, setWordIndex] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const { start, stop, isRecording, audioBlob, audioLevel, duration, error } = useMediaRecorder();
  const saveRecording = useRecordingStore((s) => s.saveRecording);
  const getRecordingUrl = useRecordingStore((s) => s.getRecordingUrl);

  const word = dictionary[wordIndex];
  const total = dictionary.length;

  // Reset playback on word change
  useEffect(() => {
    setPlaybackUrl(null);
    setRecordingId(null);
  }, [wordIndex]);

  // Save recording when blob is ready
  useEffect(() => {
    if (!audioBlob) return;
    const id = `trainer-${wordIndex}-${word.id}-${Date.now()}`;
    setRecordingDuration(duration);
    void saveRecording(
      { id, sectionId: TRAINER_SECTION_ID, recordIndex: wordIndex, duration, createdAt: Date.now() },
      audioBlob,
    ).then(() => setRecordingId(id));
  }, [audioBlob, duration, saveRecording, word.id, wordIndex]);

  // Load playback URL when recording is saved
  useEffect(() => {
    if (!recordingId) return;
    let cancelled = false;
    let url: string | null = null;
    void getRecordingUrl(recordingId).then((u) => {
      if (cancelled || !u) return;
      url = u;
      setPlaybackUrl(u);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [recordingId, getRecordingUrl]);

  const handleStart = useCallback(() => void start(), [start]);
  const handleStop = useCallback(() => stop(), [stop]);

  const goNext = () => setWordIndex((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setWordIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="trainer">
      {/* Header */}
      <div className="trainer__header">
        <button
          className="trainer__nav-btn"
          onClick={goPrev}
          disabled={wordIndex === 0}
          aria-label="Назад"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="trainer__header-center">
          <div className="trainer__teacher">Лусине · слово {wordIndex + 1}/{total}</div>
        </div>
        <button
          className="trainer__nav-btn"
          onClick={goNext}
          disabled={wordIndex === total - 1}
          aria-label="Вперёд"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Word card */}
      <div className="trainer__word-card">
        <div className="trainer__word-label">ТЕКУЩЕЕ СЛОВО</div>
        <div className="trainer__word-armenian" lang="hy">{word.armenian}</div>
        <div className="trainer__word-transcription">{word.transcription}</div>
        <div className="trainer__word-translation">{word.translation}</div>
      </div>

      {/* Syllables */}
      <div className="trainer__syllables">
        <div className="trainer__syllables-label">Разбейте на слоги</div>
        <div className="trainer__syllables-text">{getSyllables(word.transcription)}</div>
      </div>

      {/* Playback */}
      {playbackUrl && (
        <div className="trainer__playback">
          <div className="trainer__playback-label">Ваша запись</div>
          <RecordingPlayback audioUrl={playbackUrl} duration={recordingDuration} />
        </div>
      )}

      {/* Record */}
      <div className="trainer__record">
        {error && <div className="trainer__error">{error}</div>}
        {isRecording && <AudioLevelMeter level={audioLevel} />}
        <div className="trainer__mic-wrap">
          {isRecording ? (
            <button
              className="trainer__mic-btn trainer__mic-btn--recording"
              onMouseUp={handleStop}
              onTouchEnd={(e) => { e.preventDefault(); handleStop(); }}
            >
              <span className="trainer__pulse" /> {duration}с
            </button>
          ) : (
            <button
              className="trainer__mic-btn"
              onMouseDown={handleStart}
              onTouchStart={(e) => { e.preventDefault(); handleStart(); }}
              aria-label="Записать произношение"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C10.9 2 10 2.9 10 4V12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12V4C14 2.9 13.1 2 12 2Z" fill="currentColor"/>
                <path d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.93V22H13V18.93C16.39 18.43 19 15.53 19 12H17Z" fill="currentColor"/>
              </svg>
            </button>
          )}
          <span className="trainer__mic-hint">
            {isRecording ? 'Отпустите, чтобы остановить' : 'Удерживайте для записи'}
          </span>
        </div>
      </div>

      {/* Next word */}
      {playbackUrl && wordIndex < total - 1 && (
        <button className="trainer__next-btn" onClick={goNext}>
          Следующее слово →
        </button>
      )}
    </div>
  );
}
