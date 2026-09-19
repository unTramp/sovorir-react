import { MicSmallIcon } from '../../icons';
import type { InteractionTracking } from '../../types/lessonContent';
import { useVoiceRecordingInteraction } from '../../hooks/useVoiceRecordingInteraction';

interface Props {
  onComplete: () => void;
  sectionId: number;
  recordIndex: number;
  tracking?: InteractionTracking;
}

export function StickyRecordCTA({ onComplete, sectionId, recordIndex, tracking }: Props) {
  const {
    start,
    stop,
    isRecording,
    isSaving,
    duration,
    error,
  } = useVoiceRecordingInteraction({
    sectionId,
    recordIndex,
    tracking,
    autoComplete: true,
    onComplete,
  });

  return (
    <div className="lesson-record-sticky">
      {error && (
        <div className="speaking-record-dock__error" role="alert">{error}</div>
      )}

      <div className="speaking-record-dock">
        {isSaving && !isRecording ? (
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
              onClick={stop}
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
              onClick={start}
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
