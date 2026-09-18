import { useEffect, useCallback, useRef, useState } from 'react';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { useRecordingStore } from '../../stores/useRecordingStore';
import { useInteractionAttemptStore } from '../../stores/useInteractionAttemptStore';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';
import { MicSmallIcon } from '../../icons';
import type { InteractionTracking } from '../../types/lessonContent';

interface Props {
  onComplete: () => void;
  sectionId: number;
  recordIndex: number;
  tracking?: InteractionTracking;
}

function recordingUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export function StickyRecordCTA({ onComplete, sectionId, recordIndex, tracking }: Props) {
  const { start, stop, isRecording, audioBlob, duration, error } = useMediaRecorder();
  const saveRecording = useRecordingStore((state) => state.saveRecording);
  const startAttempt = useInteractionAttemptStore((state) => state.startAttempt);
  const completeAttempt = useInteractionAttemptStore((state) => state.completeAttempt);
  const getOrCreateLessonAttemptId = useLessonAttemptSessionStore((state) => state.getOrCreateAttemptId);
  const attemptIdRef = useRef<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!audioBlob) return;

    const id = recordingUuid();
    const lessonAttemptId = tracking ? getOrCreateLessonAttemptId(tracking.lessonId) : undefined;
    void saveRecording(
      {
        id,
        sectionId,
        recordIndex,
        duration,
        createdAt: Date.now(),
        lessonAttemptId,
        interactionId: tracking?.interactionId,
        learningItemIds: tracking?.learningItemIds,
      },
      audioBlob,
    ).then(() => {
      if (attemptIdRef.current) {
        completeAttempt(attemptIdRef.current, 'completed', { recordingId: id });
      }
      onComplete();
    }).catch(() => {
      setIsSaving(false);
      setSaveError('Не удалось сохранить запись. Попробуйте ещё раз.');
    });
  }, [
    audioBlob,
    completeAttempt,
    duration,
    getOrCreateLessonAttemptId,
    onComplete,
    recordIndex,
    saveRecording,
    sectionId,
    tracking,
  ]);

  const handleStart = useCallback(() => {
    setSaveError(null);
    setIsSaving(false);

    if (tracking) {
      const lessonAttemptId = getOrCreateLessonAttemptId(tracking.lessonId);
      attemptIdRef.current = startAttempt({
        lessonAttemptId,
        lessonId: tracking.lessonId,
        lessonRevision: tracking.lessonRevision,
        stepId: tracking.stepId,
        interactionId: tracking.interactionId,
        hintUsed: false,
        retryCount: 0,
      });
    }

    void start();
  }, [getOrCreateLessonAttemptId, start, startAttempt, tracking]);

  const handleStop = useCallback(() => {
    setIsSaving(true);
    stop();
  }, [stop]);

  const showingSaveState = isSaving || Boolean(audioBlob && !saveError);

  return (
    <div className="lesson-record-sticky">
      {(error || saveError) && (
        <div className="speaking-record-dock__error" role="alert">{error || saveError}</div>
      )}

      <div className="speaking-record-dock">
        {showingSaveState && !isRecording ? (
          <div className="speaking-record-dock__saving" role="status">
            <span className="speaking-record-dock__saving-dot" aria-hidden="true" />
            Сохраняем запись…
          </div>
        ) : isRecording ? (
          <>
            <div className="speaking-record-dock__status" role="status">
              <span className="speaking-record-dock__live-dot" aria-hidden="true" />
              <span>Запись · {duration}с</span>
            </div>
            <button
              type="button"
              className="speaking-record-dock__finish"
              onClick={handleStop}
              aria-label="Завершить запись"
            >
              Завершить
            </button>
          </>
        ) : (
          <div className="speaking-record-dock__idle">
            <button
              type="button"
              className="speaking-record-dock__mic"
              onClick={handleStart}
              aria-label="Начать запись"
            >
              <MicSmallIcon />
            </button>
            <span className="speaking-record-dock__hint">Нажмите, чтобы сказать</span>
          </div>
        )}
      </div>
    </div>
  );
}
