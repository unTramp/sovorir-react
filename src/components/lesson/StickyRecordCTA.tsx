import { useEffect, useCallback, useRef, useState } from 'react';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { useRecordingStore } from '../../stores/useRecordingStore';
import { useInteractionAttemptStore } from '../../stores/useInteractionAttemptStore';
import { useLessonAttemptSessionStore } from '../../stores/useLessonAttemptSessionStore';
import { AudioLevelMeter } from '../audio/AudioLevelMeter';
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
  const { start, stop, isRecording, audioBlob, audioLevel, duration, error } = useMediaRecorder();
  const saveRecording = useRecordingStore((s) => s.saveRecording);
  const startAttempt = useInteractionAttemptStore((s) => s.startAttempt);
  const completeAttempt = useInteractionAttemptStore((s) => s.completeAttempt);
  const getOrCreateLessonAttemptId = useLessonAttemptSessionStore((s) => s.getOrCreateAttemptId);
  const attemptIdRef = useRef<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      if (attemptIdRef.current) completeAttempt(attemptIdRef.current, 'completed', { recordingId: id });
      onComplete();
    }).catch(() => {
      setSaveError('Не удалось сохранить запись. Освободите место и попробуйте ещё раз.');
    });
  }, [audioBlob, completeAttempt, duration, getOrCreateLessonAttemptId, onComplete, recordIndex, saveRecording, sectionId, tracking]);

  const handleStart = useCallback(() => {
    setSaveError(null);
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
    stop();
  }, [stop]);

  return (
    <div className="lesson-record-sticky">
      {(error || saveError) && (
        <div className="lesson-record-sticky__error" role="alert">{error || saveError}</div>
      )}
      <div className="lesson-record-sticky__actions">
        {isRecording && <AudioLevelMeter level={audioLevel} />}
        {isRecording ? (
          <button
            className="lesson-record-sticky__btn lesson-record-sticky__btn--recording"
            onClick={handleStop}
            aria-label="Остановить запись"
          >
            <span className="lesson-record-sticky__pulse" /> Остановить · {duration}с
          </button>
        ) : (
          <div className="lesson-record-sticky__mic-wrap">
            <button
              className="lesson-record-sticky__mic-btn"
              onClick={handleStart}
              aria-label="Начать запись"
            >
              <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="38" y="13" width="64" height="64" rx="32" fill="url(#rec_grad)"/>
                <g filter="url(#rec_shadow)">
                  <rect x="38" y="13" width="64" height="64" rx="32" fill="white" fillOpacity="0.01" shapeRendering="crispEdges"/>
                </g>
                <path d="M70 48.125C68.9583 48.125 68.0729 47.7604 67.3438 47.0312C66.6146 46.3021 66.25 45.4167 66.25 44.375V36.875C66.25 35.8333 66.6146 34.9479 67.3438 34.2188C68.0729 33.4896 68.9583 33.125 70 33.125C71.0417 33.125 71.9271 33.4896 72.6562 34.2188C73.3854 34.9479 73.75 35.8333 73.75 36.875V44.375C73.75 45.4167 73.3854 46.3021 72.6562 47.0312C71.9271 47.7604 71.0417 48.125 70 48.125ZM68.75 56.875V53.0312C66.5833 52.7396 64.7917 51.7708 63.375 50.125C61.9583 48.4792 61.25 46.5625 61.25 44.375H63.75C63.75 46.1042 64.3594 47.5781 65.5781 48.7969C66.7969 50.0156 68.2708 50.625 70 50.625C71.7292 50.625 73.2031 50.0156 74.4219 48.7969C75.6406 47.5781 76.25 46.1042 76.25 44.375H78.75C78.75 46.5625 78.0417 48.4792 76.625 50.125C75.2083 51.7708 73.4167 52.7396 71.25 53.0312V56.875H68.75Z" fill="white"/>
                <defs>
                  <filter id="rec_shadow" x="0" y="0" width="140" height="140" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feMorphology radius="12" operator="erode" in="SourceAlpha" result="effect1_dropShadow"/>
                    <feOffset dy="25"/>
                    <feGaussianBlur stdDeviation="25"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                  </filter>
                  <linearGradient id="rec_grad" x1="38" y1="13" x2="102" y2="77" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8D4A2A"/>
                    <stop offset="1" stopColor="#AB613F"/>
                  </linearGradient>
                </defs>
              </svg>
            </button>
            <span className="lesson-record-sticky__hint">Нажмите, чтобы записать</span>
          </div>
        )}
      </div>
    </div>
  );
}
