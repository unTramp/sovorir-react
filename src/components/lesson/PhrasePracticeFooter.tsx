interface Props {
  current: number;
  total: number;
  canContinue: boolean;
  onContinue: () => void;
}

export function PhrasePracticeFooter({ current, total, canContinue, onContinue }: Props) {
  return (
    <footer className="phrase-practice-footer" aria-label="Переход к следующей фразе">
      <div className="phrase-practice-footer__progress">
        <span className="phrase-practice-footer__eyebrow">Дальше</span>
        <span className="phrase-practice-footer__label">Фраза {current} из {total}</span>
      </div>

      <button
        type="button"
        className="lesson-action-dock__btn phrase-practice-footer__btn"
        disabled={!canContinue}
        onClick={canContinue ? onContinue : undefined}
      >
        <span>Продолжить</span>
        <span aria-hidden="true">→</span>
      </button>
    </footer>
  );
}
