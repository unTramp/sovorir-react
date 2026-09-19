import type { PhrasePracticeInteraction, PhrasePracticePhrase } from '../../lib/phrasePracticeFlow';
import { MicSmallIcon } from '../../icons';
import { RecordingPlayback } from '../audio/RecordingPlayback';
import { useVoiceRecordingInteraction } from '../../hooks/useVoiceRecordingInteraction';

interface Props {
  phrase: PhrasePracticePhrase;
  interaction: PhrasePracticeInteraction;
  sectionId: number;
  recordIndex: number;
  onSkip?: () => void;
  onRetry?: () => void;
}

export function PhraseVoicePractice({
  phrase,
  interaction,
  sectionId,
  recordIndex,
  onSkip,
  onRetry,
}: Props) {
  const {
    start,
    stop,
    retry,
    isRecording,
    isSaving,
    duration,
    error,
    recording,
    playbackUrl,
  } = useVoiceRecordingInteraction({
    sectionId,
    recordIndex,
    tracking: interaction.tracking,
    onRetry,
  });

  const recorded = Boolean(recording);

  return (
    <section className="phrase-voice-practice" aria-label="Теперь вы">
      <div className="phrase-voice-practice__heading">
        <span className="phrase-voice-practice__eyebrow">
          {recorded ? 'Ваш ответ' : isRecording ? 'Записываем…' : 'Теперь вы'}
        </span>
        {!recorded && !isRecording && !isSaving && (
          <span className="phrase-voice-practice__subtitle">Повторите фразу вслух</span>
        )}
      </div>

      <div className={`phrase-voice-practice__surface${recorded ? ' is-recorded' : ''}`}>
        {recorded ? (
          <>
            {playbackUrl ? (
              <RecordingPlayback
                id={`recording-${recording?.id}`}
                audioUrl={playbackUrl}
                duration={recording?.duration ?? 0}
              />
            ) : (
              <div className="phrase-voice-practice__status" role="status">
                Готовим запись…
              </div>
            )}

            <button
              type="button"
              className="phrase-voice-practice__retry"
              onClick={() => void retry()}
            >
              Записать ещё раз
            </button>
          </>
        ) : isSaving ? (
          <div className="phrase-voice-practice__status" role="status">
            <span className="phrase-voice-practice__pulse" aria-hidden="true" />
            Сохраняем запись…
          </div>
        ) : isRecording ? (
          <>
            <div className="phrase-voice-practice__recording-status" role="status">
              <span className="phrase-voice-practice__pulse" aria-hidden="true" />
              <span>{duration}с</span>
            </div>
            <button
              type="button"
              className="phrase-voice-practice__stop"
              onClick={stop}
              aria-label="Завершить запись"
            >
              Завершить
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="phrase-voice-practice__mic"
              onClick={start}
              aria-label={`Начать запись: ${phrase.armenian}`}
            >
              <MicSmallIcon />
            </button>
            <div className="phrase-voice-practice__prompt">
              Нажмите и скажите <span lang="hy">«{phrase.armenian}»</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="phrase-voice-practice__error" role="alert">{error}</div>
      )}

      {!recorded && !isRecording && !isSaving && onSkip && (
        <button type="button" className="phrase-voice-practice__skip" onClick={onSkip}>
          Пропустить
        </button>
      )}
    </section>
  );
}
