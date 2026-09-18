import { useEffect, useMemo, useState, forwardRef } from 'react';
import type { RecordBlock } from '../../types/lessonContent';
import { useRecordingStore } from '../../stores/useRecordingStore';
import { RecordingPlayback } from '../audio/RecordingPlayback';
import { StudentBubble } from '../conversation/StudentBubble';

interface Props {
  block: RecordBlock;
  onSkip?: () => void;
  completed?: boolean;
  sectionId?: number;
  recordIndex?: number;
  onRetry?: () => void;
}

export const SpeakingTurn = forwardRef<HTMLDivElement, Props>(
  ({ block, onSkip, completed = false, sectionId, recordIndex, onRetry }, ref) => {
    const colonIdx = block.prompt.indexOf(':');
    const instruction = colonIdx !== -1
      ? block.prompt.slice(0, colonIdx).trim()
      : 'Произнесите фразу';
    const phrase = colonIdx !== -1
      ? block.prompt.slice(colonIdx + 1).trim()
      : block.prompt;

    const getRecordingForPrompt = useRecordingStore((state) => state.getRecordingForPrompt);
    const getRecordingUrl = useRecordingStore((state) => state.getRecordingUrl);
    const deleteRecording = useRecordingStore((state) => state.deleteRecording);
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
      if (!onRetry) return;
      setRetryError(null);

      try {
        if (recording) await deleteRecording(recording.id);
        onRetry();
      } catch {
        setRetryError('Не удалось подготовить новую запись. Попробуйте ещё раз.');
      }
    };

    if (completed) {
      return (
        <div ref={ref} className="speaking-turn speaking-turn--completed">
          <StudentBubble>
            {playbackUrl && recording ? (
              <RecordingPlayback
                id={`recording-${recording.id}`}
                audioUrl={playbackUrl}
                duration={recording.duration}
              />
            ) : (
              <span className="speaking-turn__completed-placeholder">
                {recording ? 'Готовим запись…' : 'Ответ выполнен'}
              </span>
            )}
          </StudentBubble>

          {onRetry && (
            <div className="speaking-turn__completed-actions">
              <button
                type="button"
                className="speaking-turn__retry"
                onClick={() => void handleRetry()}
              >
                Записать ещё раз
              </button>
            </div>
          )}

          {retryError && (
            <div className="speaking-turn__error" role="alert">{retryError}</div>
          )}
        </div>
      );
    }

    return (
      <section ref={ref} className="speaking-turn" aria-label="Ваш ход">
        <div className="speaking-turn__eyebrow">Ваш ход</div>
        <div className="speaking-turn__instruction">{instruction}</div>
        <div className="speaking-turn__phrase" lang="hy">{phrase}</div>

        {onSkip && (
          <button type="button" className="speaking-turn__skip" onClick={onSkip}>
            Пропустить
          </button>
        )}
      </section>
    );
  },
);

SpeakingTurn.displayName = 'SpeakingTurn';
