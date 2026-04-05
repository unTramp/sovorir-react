import { memo, useEffect, useState } from 'react';
import type { LiveLesson } from '../../types/liveLesson';

interface Props {
  lesson: LiveLesson;
  isFirstFree?: boolean;
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
  const lessonDate = new Date(`${date}T${time}:00`);
  const now = new Date();
  const diffMs = lessonDate.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 60) {
    return `Начало через ${diffMin} ${pluralize(diffMin, 'минуту', 'минуты', 'минут')}`;
  }
  if (diffHours < 24) {
    return `Начало через ${diffHours} ${pluralize(diffHours, 'час', 'часа', 'часов')}`;
  }
  if (diffDays === 1) return 'Начало завтра';
  return `Начало через ${diffDays} ${pluralize(diffDays, 'день', 'дня', 'дней')}`;
}

export const LiveLessonCard = memo(function LiveLessonCard({ lesson, isFirstFree }: Props) {
  const spotsLeft = lesson.spotsTotal - lesson.spotsTaken;
  const isFull = spotsLeft <= 0;

  const [countdown, setCountdown] = useState(() =>
    formatCountdown(lesson.date, lesson.time),
  );

  useEffect(() => {
    setCountdown(formatCountdown(lesson.date, lesson.time));
    const id = setInterval(() => {
      setCountdown(formatCountdown(lesson.date, lesson.time));
    }, 60_000);
    return () => clearInterval(id);
  }, [lesson.date, lesson.time]);

  const formatMeta = () => {
    const parts: string[] = [];
    parts.push(`${lesson.duration} минут`);
    if (lesson.type === 'group') {
      parts.push(`группа ${lesson.spotsTotal} человек`);
    } else {
      parts.push('индивидуально');
    }
    return parts.join(' \u00b7 ');
  };

  const displayPrice = isFirstFree && lesson.type === 'group' ? 0 : lesson.price;

  return (
    <div className="live-lesson-card">
      <div className="live-lesson-card__header">
        <span className={`live-lesson-card__type live-lesson-card__type--${lesson.type}`}>
          {lesson.type === 'group' ? 'Группа' : 'Индивидуально'}
        </span>
        <div className="live-lesson-card__header-right">
          {countdown && (
            <span className="live-lesson-card__countdown">{countdown}</span>
          )}
          <div className="live-lesson-card__time">
            {lesson.time}
          </div>
        </div>
      </div>

      <div className="live-lesson-card__title">{lesson.title}</div>

      <div className="live-lesson-card__teacher">
        <div className="live-lesson-card__teacher-avatar">
          {lesson.teacher.name.charAt(0)}
        </div>
        <div className="live-lesson-card__teacher-info">
          <div className="live-lesson-card__teacher-name">{lesson.teacher.name}</div>
          <div className="live-lesson-card__teacher-detail">
            {lesson.teacher.role} &middot; {lesson.teacher.experience}
          </div>
        </div>
      </div>

      {lesson.topics && lesson.topics.length > 0 && (
        <div className="live-lesson-card__topics">
          <div className="live-lesson-card__topics-label">Вы научитесь:</div>
          <ul className="live-lesson-card__topics-list">
            {lesson.topics.map((topic, i) => (
              <li key={i}>{topic}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="live-lesson-card__meta">{formatMeta()}</div>

      <div className="live-lesson-card__price">
        {displayPrice === 0 ? (
          <>
            <span className="live-lesson-card__price-old">{lesson.price} ₽</span>
            {' '}
            <span className="live-lesson-card__price-free">Бесплатно</span>
          </>
        ) : (
          <>
            {lesson.price} ₽
            {lesson.type === 'group' && <span className="live-lesson-card__price-note"> за участие</span>}
          </>
        )}
      </div>

      <div className="live-lesson-card__footer">
        <span className={`live-lesson-card__spots ${isFull ? 'live-lesson-card__spots--full' : ''}`}>
          {isFull ? 'Мест нет' : `${spotsLeft} / ${lesson.spotsTotal} мест`}
        </span>
        <a
          href={lesson.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`live-lesson-card__cta ${isFull ? 'live-lesson-card__cta--disabled' : ''}`}
          onClick={isFull ? (e) => e.preventDefault() : undefined}
          {...(isFull ? { 'aria-disabled': 'true', tabIndex: -1 } : {})}
        >
          {isFull
            ? 'Мест нет'
            : lesson.type === 'group'
              ? 'Забронировать место'
              : 'Записаться на урок'}
        </a>
      </div>
    </div>
  );
});
