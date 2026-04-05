import { memo, useEffect, useState } from 'react';
import type { ConversationClubSession } from '../../types/liveLesson';

interface Props {
  session: ConversationClubSession;
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const lastTwo = n % 100;
  const lastOne = n % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return many;
  if (lastOne === 1) return one;
  if (lastOne >= 2 && lastOne <= 4) return few;
  return many;
}

function formatCountdown(date: string, time: string): string | null {
  const sessionDate = new Date(`${date}T${time}:00`);
  const now = new Date();
  const diffMs = sessionDate.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 60) {
    return `Через ${diffMin} ${pluralize(diffMin, 'минуту', 'минуты', 'минут')}`;
  }
  if (diffHours < 24) {
    return `Через ${diffHours} ${pluralize(diffHours, 'час', 'часа', 'часов')}`;
  }
  if (diffDays === 1) return 'Завтра';
  return `Через ${diffDays} ${pluralize(diffDays, 'день', 'дня', 'дней')}`;
}

export const ConversationClubCard = memo(function ConversationClubCard({ session }: Props) {
  const spotsLeft = session.spotsTotal - session.spotsTaken;
  const isFull = spotsLeft <= 0;

  const [countdown, setCountdown] = useState(() =>
    formatCountdown(session.date, session.time),
  );

  useEffect(() => {
    setCountdown(formatCountdown(session.date, session.time));
    const id = setInterval(() => {
      setCountdown(formatCountdown(session.date, session.time));
    }, 60_000);
    return () => clearInterval(id);
  }, [session.date, session.time]);

  return (
    <div className="club-card">
      <div className="club-card__header">
        <span className="club-card__badge">Разговорный клуб</span>
        <div className="club-card__header-right">
          {countdown && (
            <span className="club-card__countdown">{countdown}</span>
          )}
          <div className="club-card__time">{session.time}</div>
        </div>
      </div>

      <div className="club-card__theme">{session.theme}</div>
      <div className="club-card__title">{session.title}</div>

      <div className="club-card__flags">
        <span className="club-card__flags-label">Участники из:</span>
        <span className="club-card__flags-list">
          {session.participantCountries.join(' ')}
        </span>
      </div>

      <div className="club-card__phrases">
        <div className="club-card__phrases-label">Будем практиковать:</div>
        <ul className="club-card__phrases-list">
          {session.phrases.map((phrase, i) => (
            <li key={i}>
              <span className="club-card__phrase-arm">{phrase.armenian}</span>
              {' \u2014 '}
              <span className="club-card__phrase-rus">{phrase.russian}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="club-card__meta">
        {session.duration} минут &middot; группа {session.spotsTotal} человек
      </div>

      <div className="club-card__price">
        {session.price} ₽
        <span className="club-card__price-note"> за участие</span>
      </div>

      <div className="club-card__footer">
        <span className={`club-card__spots ${isFull ? 'club-card__spots--full' : ''}`}>
          {isFull ? 'Мест нет' : `${spotsLeft} / ${session.spotsTotal} мест`}
        </span>
        <a
          href={session.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`club-card__cta ${isFull ? 'club-card__cta--disabled' : ''}`}
          onClick={isFull ? (e) => e.preventDefault() : undefined}
          {...(isFull ? { 'aria-disabled': 'true', tabIndex: -1 } : {})}
        >
          {isFull ? 'Мест нет' : 'Присоединиться'}
        </a>
      </div>
    </div>
  );
});
