import { useEffect, useState } from 'react';
import { PauseIcon, PlayIcon } from '../../icons';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';
import { useLearningItemStore } from '../../stores/useLearningItemStore';
import { usePracticeSessionStore, type PracticeQuality } from '../../stores/usePracticeSessionStore';
import { practiceModeLabel, practicePrompt } from '../../lib/practiceEngine';

const QUALITY_ACTIONS: Array<{
  quality: PracticeQuality;
  label: string;
  helper: string;
}> = [
  { quality: 'again', label: 'Ещё раз', helper: 'Не вспомнил' },
  { quality: 'hard', label: 'С трудом', helper: 'Вспомнил с усилием' },
  { quality: 'easy', label: 'Знаю', helper: 'Ответ пришёл быстро' },
];

export function MixedPracticeDeck() {
  const session = usePracticeSessionStore((state) => state.session);
  const answerCurrent = usePracticeSessionStore((state) => state.answerCurrent);
  const clearSession = usePracticeSessionStore((state) => state.clearSession);
  const items = useLearningItemStore((state) => state.items);
  const [revealed, setRevealed] = useState(false);
  const { togglePlay, playingId, loadingId, errorId } = useAudioPlayer();

  const card = session?.cards[session.currentIndex];
  const item = card ? items[card.itemId] : undefined;
  const audioId = card ? `practice:${card.itemId}` : '';
  const audioProgress = useAudioStore((state) => audioId ? state.progress[audioId] || 0 : 0);

  useEffect(() => {
    setRevealed(false);
  }, [session?.currentIndex]);

  if (!session) return null;

  if (session.currentIndex >= session.cards.length) {
    const values = Object.values(session.results);
    const easy = values.filter((quality) => quality === 'easy').length;
    const hard = values.filter((quality) => quality === 'hard').length;
    const again = values.filter((quality) => quality === 'again').length;

    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-muted">Сессия завершена</div>
        <h2 className="mt-2 text-2xl font-semibold text-dark">Повторение готово</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Мы пересчитаем дату следующего появления каждой фразы по вашей оценке.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-2xl bg-black/[0.035] p-3"><strong className="block text-lg text-dark">{easy}</strong>Знаю</div>
          <div className="rounded-2xl bg-black/[0.035] p-3"><strong className="block text-lg text-dark">{hard}</strong>С трудом</div>
          <div className="rounded-2xl bg-black/[0.035] p-3"><strong className="block text-lg text-dark">{again}</strong>Повторить</div>
        </div>
        <button type="button" className="btn btn--primary btn--md mt-6" onClick={clearSession}>
          Готово
        </button>
      </div>
    );
  }

  if (!card || !item) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-black/10 bg-white p-5 text-center">
        <p className="text-sm text-muted">Эта карточка больше недоступна.</p>
        <button type="button" className="btn btn--secondary btn--sm mt-3" onClick={() => answerCurrent('again')}>
          Пропустить
        </button>
      </div>
    );
  }

  const audioUrl = item.audio?.normal.url;
  const isPlaying = playingId === audioId;
  const isLoading = loadingId === audioId;
  const hasAudioError = errorId === audioId;
  const position = session.currentIndex + 1;
  const total = session.cards.length;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted">
        <span className="rounded-full bg-black/[0.045] px-3 py-1 font-medium">{practiceModeLabel(card.mode)}</span>
        <span>{position} / {total}</span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <p className="text-sm leading-6 text-muted">{practicePrompt(item, card.mode)}</p>

          {card.mode === 'recognition' && (
            <div className="mt-7 text-center">
              <div className="text-3xl font-semibold text-dark" lang="hy">{item.armenian}</div>
              {item.transliteration && <div className="mt-2 text-sm text-muted">{item.transliteration}</div>}
            </div>
          )}

          {card.mode === 'listening' && audioUrl && (
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                className="relative grid h-16 w-16 place-items-center rounded-full border border-primary/20 bg-primary/5 text-primary disabled:opacity-50"
                onClick={() => togglePlay(audioId, audioUrl)}
                disabled={isLoading}
                aria-label={isPlaying ? 'Поставить фразу на паузу' : 'Прослушать фразу'}
              >
                <svg className="absolute inset-1 h-14 w-14 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" pathLength="1" />
                  <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - audioProgress} />
                </svg>
                <span className="relative z-10" aria-hidden="true">
                  {isLoading ? '…' : hasAudioError ? '!' : isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={24} />}
                </span>
              </button>
            </div>
          )}

          {card.mode === 'recall' && (
            <div className="mt-7 rounded-2xl bg-black/[0.035] px-4 py-5 text-center text-sm text-muted">
              Скажите ответ вслух до того, как откроете подсказку.
            </div>
          )}

          {!revealed ? (
            <button
              type="button"
              className="btn btn--primary btn--md mt-7 w-full"
              onClick={() => setRevealed(true)}
            >
              Показать ответ
            </button>
          ) : (
            <div className="mt-7 border-t border-black/10 pt-6">
              <div className="text-center">
                <div className="text-3xl font-semibold text-dark" lang="hy">{item.armenian}</div>
                {item.transliteration && <div className="mt-2 text-sm text-muted">{item.transliteration}</div>}
                <div className="mt-3 text-base text-dark/80">{item.translation}</div>
                {item.contexts[0] && <div className="mt-2 text-xs text-muted">{item.contexts[0]}</div>}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {QUALITY_ACTIONS.map((action) => (
                  <button
                    key={action.quality}
                    type="button"
                    className="rounded-2xl border border-black/10 px-2 py-3 text-center transition-colors hover:bg-black/[0.03]"
                    onClick={() => answerCurrent(action.quality)}
                    aria-label={`${action.label}: ${action.helper}`}
                  >
                    <span className="block text-sm font-semibold text-dark">{action.label}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-muted">{action.helper}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
