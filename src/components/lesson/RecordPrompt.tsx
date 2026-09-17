import { useState, useEffect, useMemo, forwardRef } from 'react';
import type { RecordBlock } from '../../types/lessonContent';
import { useRecordingStore } from '../../stores/useRecordingStore';
import { RecordingPlayback } from '../audio/RecordingPlayback';
import { CheckIcon, MicSmallIcon } from '../../icons';

interface Props {
  block: RecordBlock;
  onSkip?: () => void;
  completed?: boolean;
  sectionId?: number;
  recordIndex?: number;
  onRetry?: () => void;
}

export const RecordPrompt = forwardRef<HTMLDivElement, Props>(
  ({ block, onSkip, completed, sectionId, recordIndex, onRetry }, ref) => {
    const colonIdx = block.prompt.indexOf(':');
    const label = colonIdx !== -1 ? block.prompt.slice(0, colonIdx).trim() : 'Произнесите';
    const phrase = colonIdx !== -1 ? block.prompt.slice(colonIdx + 1).trim() : block.prompt;

    const getRecordingForPrompt = useRecordingStore((s) => s.getRecordingForPrompt);
    const getRecordingUrl = useRecordingStore((s) => s.getRecordingUrl);
    const deleteRecording = useRecordingStore((s) => s.deleteRecording);
    const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
    const [retryError, setRetryError] = useState<string | null>(null);
    const recording = useMemo(() => {
      if (!completed || sectionId == null || recordIndex == null) return undefined;
      return getRecordingForPrompt(sectionId, recordIndex);
    }, [completed, getRecordingForPrompt, recordIndex, sectionId]);

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

    const handleRetry = async () => {
      if (!recording || !onRetry) return;
      setRetryError(null);
      try {
        await deleteRecording(recording.id);
        onRetry();
      } catch {
        setRetryError('Не удалось удалить запись. Попробуйте ещё раз.');
      }
    };

    return (
      <div ref={ref} className={`lesson-record-prompt ${completed ? 'lesson-record-prompt--done' : ''}`}>
        <div className="lesson-record-prompt__body">
          <div className="lesson-record-prompt__label">
            {completed ? <CheckIcon /> : <MicSmallIcon />}
            <span>{label}</span>
          </div>
          <div className="lesson-record-prompt__phrase" lang="hy">{phrase}</div>
          {completed && playbackUrl && (
            <div className="mt-2">
              <RecordingPlayback id={`recording-${recording?.id}`} audioUrl={playbackUrl} duration={recording?.duration ?? 0} />
            </div>
          )}
          {completed && recording && onRetry && (
            <button type="button" className="lesson-record-prompt__retry" onClick={() => void handleRetry()}>
              Записать ещё раз
            </button>
          )}
          {retryError && <div className="lesson-record-sticky__error" role="alert">{retryError}</div>}
        </div>
        {onSkip && (
          <button className="lesson-record-prompt__skip" onClick={onSkip}>
            Пропустить
          </button>
        )}
      </div>
    );
  },
);
