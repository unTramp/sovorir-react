import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMediaRecorder } from './useMediaRecorder';
import { useRecordingStore } from '../stores/useRecordingStore';
import { useInteractionAttemptStore } from '../stores/useInteractionAttemptStore';
import { useLessonAttemptSessionStore } from '../stores/useLessonAttemptSessionStore';
import type { InteractionTracking } from '../types/lessonContent';

interface Options {
  sectionId: number;
  recordIndex: number;
  tracking?: InteractionTracking;
  autoComplete?: boolean;
  onComplete?: () => void;
  onRetry?: () => void;
}

function recordingUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export function useVoiceRecordingInteraction({
  sectionId,
  recordIndex,
  tracking,
  autoComplete = false,
  onComplete,
  onRetry,
}: Options) {
  const media = useMediaRecorder();
  const recordings = useRecordingStore((state) => state.recordings);
  const saveRecording = useRecordingStore((state) => state.saveRecording);
  const getRecordingUrl = useRecordingStore((state) => state.getRecordingUrl);
  const deleteRecording = useRecordingStore((state) => state.deleteRecording);
  const startAttempt = useInteractionAttemptStore((state) => state.startAttempt);
  const completeAttempt = useInteractionAttemptStore((state) => state.completeAttempt);
  const getOrCreateLessonAttemptId = useLessonAttemptSessionStore((state) => state.getOrCreateAttemptId);

  const attemptIdRef = useRef<string | null>(null);
  const processedBlobRef = useRef<Blob | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  const recording = useMemo(
    () => Object.values(recordings).find(
      (item) => item.sectionId === sectionId && item.recordIndex === recordIndex,
    ),
    [recordIndex, recordings, sectionId],
  );

  useEffect(() => {
    if (!recording) return;

    let cancelled = false;
    let currentUrl: string | null = null;

    void getRecordingUrl(recording.id).then((url) => {
      if (!url || cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      currentUrl = url;
      setPlaybackUrl(url);
    });

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [getRecordingUrl, recording]);

  useEffect(() => {
    if (!media.audioBlob || processedBlobRef.current === media.audioBlob) return;

    processedBlobRef.current = media.audioBlob;
    const id = recordingUuid();
    const lessonAttemptId = tracking
      ? getOrCreateLessonAttemptId(tracking.lessonId)
      : undefined;

    void saveRecording(
      {
        id,
        sectionId,
        recordIndex,
        duration: media.duration,
        createdAt: Date.now(),
        lessonAttemptId,
        interactionId: tracking?.interactionId,
        learningItemIds: tracking?.learningItemIds,
      },
      media.audioBlob,
    ).then(() => {
      if (attemptIdRef.current) {
        completeAttempt(attemptIdRef.current, 'completed', { recordingId: id });
      }
      setIsSaving(false);
      if (autoComplete) onComplete?.();
    }).catch(() => {
      setIsSaving(false);
      setSaveError('Не удалось сохранить запись. Попробуйте ещё раз.');
    });
  }, [
    autoComplete,
    completeAttempt,
    getOrCreateLessonAttemptId,
    media.audioBlob,
    media.duration,
    onComplete,
    recordIndex,
    saveRecording,
    sectionId,
    tracking,
  ]);

  const start = useCallback(() => {
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

    void media.start();
  }, [getOrCreateLessonAttemptId, media, startAttempt, tracking]);

  const stop = useCallback(() => {
    setIsSaving(true);
    media.stop();
  }, [media]);

  const retry = useCallback(async () => {
    setSaveError(null);
    setPlaybackUrl(null);
    media.reset();

    if (recording) {
      await deleteRecording(recording.id);
    }

    onRetry?.();
  }, [deleteRecording, media, onRetry, recording]);

  return {
    start,
    stop,
    retry,
    isRecording: media.isRecording,
    isSaving: isSaving || Boolean(media.audioBlob && !recording && !saveError),
    duration: media.duration,
    error: media.error || saveError,
    recording,
    playbackUrl,
  };
}
