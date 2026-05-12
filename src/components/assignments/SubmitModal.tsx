import { useState, useEffect, useCallback } from 'react';
import { useAssignmentStore } from '../../stores/useAssignmentStore';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { AudioLevelMeter } from '../audio/AudioLevelMeter';
import type { Assignment } from '../../types/assignment';

interface Props {
  assignment: Assignment;
  onClose: () => void;
}

export function SubmitModal({ assignment, onClose }: Props) {
  const [textContent, setTextContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submitAssignment = useAssignmentStore((s) => s.submitAssignment);
  const { start, stop, isRecording, audioBlob: recBlob, audioLevel, duration, error: recError } = useMediaRecorder();

  useEffect(() => {
    if (recBlob) setAudioBlob(recBlob);
  }, [recBlob]);

  const canSubmit = (textContent.trim().length > 0 || audioBlob !== null) && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // In production: upload audioBlob to R2 first, get audioUrl
      // For now: pass null for audioUrl (mock accepts it)
      await submitAssignment(assignment.id, {
        textContent: textContent.trim() || undefined,
        audioUrl: undefined,
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Не удалось отправить задание. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  }, [assignment.id, submitAssignment, textContent]);

  return (
    <div className="submit-modal__backdrop" onClick={onClose}>
      <div className="submit-modal" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="submit-modal__success">
            <div className="submit-modal__success-icon">✓</div>
            <div className="submit-modal__success-title">Задание отправлено!</div>
            <p className="submit-modal__success-hint">Преподаватель получит уведомление и проверит вашу работу.</p>
            <button className="submit-modal__btn submit-modal__btn--primary" onClick={onClose}>
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <div className="submit-modal__header">
              <div className="submit-modal__title">{assignment.title}</div>
              <button className="submit-modal__close" onClick={onClose} aria-label="Закрыть">✕</button>
            </div>

            {assignment.description && (
              <p className="submit-modal__desc">{assignment.description}</p>
            )}

            <label className="submit-modal__label">Ваш ответ</label>
            <textarea
              className="submit-modal__textarea"
              placeholder="Напишите ответ..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={4}
            />

            <div className="submit-modal__record-section">
              <label className="submit-modal__label">Или запишите голос</label>
              {recError && <p className="submit-modal__error">{recError}</p>}
              {isRecording && <AudioLevelMeter level={audioLevel} />}
              <div className="submit-modal__record-row">
                {isRecording ? (
                  <button
                    className="submit-modal__rec-btn submit-modal__rec-btn--active"
                    onMouseUp={() => stop()}
                    onTouchEnd={(e) => { e.preventDefault(); stop(); }}
                  >
                    <span className="submit-modal__pulse" /> {duration}с — отпустите
                  </button>
                ) : (
                  <button
                    className="submit-modal__rec-btn"
                    onMouseDown={() => void start()}
                    onTouchStart={(e) => { e.preventDefault(); void start(); }}
                  >
                    🎤 Удерживайте для записи
                  </button>
                )}
                {audioBlob && !isRecording && (
                  <span className="submit-modal__rec-done">✓ Запись готова</span>
                )}
              </div>
            </div>

            {submitError && <p className="submit-modal__error">{submitError}</p>}

            <div className="submit-modal__actions">
              <button className="submit-modal__btn submit-modal__btn--ghost" onClick={onClose}>
                Отмена
              </button>
              <button
                className="submit-modal__btn submit-modal__btn--primary"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
