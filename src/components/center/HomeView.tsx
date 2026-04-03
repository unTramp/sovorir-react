import { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { lessons } from '../../data/lessons';
import { teacherNotes } from '../../data/teacherNotes';
import { liveLessons } from '../../data/liveLessons';
import type { SectionType } from '../../types/lesson';

function getWeekDays(): { label: string; date: string; isToday: boolean }[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));

  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const todayISO = now.toISOString().slice(0, 10);

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return { label, date: iso, isToday: iso === todayISO };
  });
}

function getDailyTask(_practicedToday: boolean): { label: string; emoji: string; view: SectionType } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const tasks: { label: string; emoji: string; view: SectionType; duration: string; xp: number }[] = [
    { label: 'Карточки', emoji: '\uD83C\uDCCF', view: 'practice', duration: '2 минуты', xp: 15 },
    { label: 'Квиз', emoji: '\uD83E\uDDE0', view: 'lesson', duration: '3 минуты', xp: 20 },
    { label: 'Запись речи', emoji: '\uD83C\uDF99\uFE0F', view: 'practice', duration: '5 минут', xp: 25 },
  ];
  return tasks[dayOfYear % 3];
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

export function HomeView() {
  const [noteExpanded, setNoteExpanded] = useState(false);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const streak = useStreakStore((s) => s.currentStreak);
  const longestStreak = useStreakStore((s) => s.longestStreak);
  const practiceDates = useStreakStore((s) => s.practiceDates);
  const overallPct = useLessonProgress.getState().getOverallPercentage();

  const todayISO = new Date().toISOString().slice(0, 10);
  const practicedToday = practiceDates.includes(todayISO);
  const weekDays = getWeekDays();
  const dailyTask = getDailyTask(practicedToday);

  const currentLesson = lessons.find((l) => l.status === 'current');
  const latestNote = teacherNotes[0];

  const now = new Date();
  const nextLive = liveLessons.find((ll) => new Date(ll.date) >= now);

  const completedLessonsCount = lessons.filter(l => l.status === 'completed').length;
  const wordsLearned = lessons.flatMap(l => l.sections)
    .filter(s => s.type !== 'video' && s.status === 'completed').length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
      {/* Greeting */}
      <div className="home-card home-greeting">
        <h1 className="home-greeting__title">Բարև, Андрей!</h1>
        <p className="home-greeting__sub">Продолжай изучать армянский</p>
        <div className="home-stat-row">
          <div className="home-stat-box">
            <div className="home-stat-box__value">{wordsLearned}</div>
            <div className="home-stat-box__label">слов изучено</div>
          </div>
          <div className="home-stat-box">
            <div className="home-stat-box__value">{completedLessonsCount}</div>
            <div className="home-stat-box__label">урока</div>
          </div>
          <div className="home-stat-box">
            <div className="home-stat-box__value">{overallPct}%</div>
            <div className="home-stat-box__label">до A1+</div>
          </div>
        </div>
      </div>

      {/* Continue Lesson — Hero CTA */}
      {currentLesson && (
        <button className="home-hero__card" onClick={() => setCurrentView('lesson')}>
          <div className="home-hero__card-top">
            <div>
              <div className="home-hero__label">Продолжить урок</div>
              <div className="home-hero__card-title">
                Урок {currentLesson.id} · {currentLesson.title}
              </div>
            </div>
            <div className="home-hero__play"><PlayIcon /></div>
          </div>
          <div className="home-hero__bar-row">
            <div className="home-hero__bar">
              <div className="home-hero__bar-fill" style={{ width: `${overallPct}%` }} />
            </div>
            <span className="home-hero__pct">{overallPct}%</span>
          </div>
          <div className="home-hero__urgency">Начни сейчас и получи +20 XP</div>
        </button>
      )}

      {/* Daily Practice */}
      <div
        className={`home-card home-daily${practicedToday ? ' home-daily--done' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => !practicedToday && setCurrentView(dailyTask.view)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !practicedToday) setCurrentView(dailyTask.view); }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="home-daily__header">
              <span className="home-daily__label">Ежедневная практика</span>
            </div>
            {practicedToday ? (
              <>
                <div className="home-daily__done-title">Выполнено!</div>
                <div className="home-daily__done-sub">Отличная работа. Завтра новая практика.</div>
              </>
            ) : (
              <>
                <div className="home-daily__task">{dailyTask.emoji} {dailyTask.label}</div>
                <div className="home-daily__meta">
                  <span className="home-daily__meta-pill">⏱ {dailyTask.duration}</span>
                  <span className="home-daily__meta-pill home-daily__meta-pill--xp">+{dailyTask.xp} XP</span>
                </div>
              </>
            )}
          </div>
          {practicedToday
            ? <div className="home-daily__check">✓</div>
            : <span className="text-2xl">{dailyTask.emoji}</span>}
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="home-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-semibold text-muted uppercase tracking-wide">Неделя</div>
            <div className="text-sm font-semibold mt-0.5" style={{ color: streak > 0 ? '#C87941' : undefined }}>
              {streak > 0
                ? `🔥 ${streak} ${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд`
                : 'Начни сегодня!'}
            </div>
            {streak > 0 && !practicedToday && (
              <div className="home-streak__pressure">Не прерви серию 🔥</div>
            )}
          </div>
          {longestStreak > 0 && (
            <div className="text-xs text-muted">Рекорд: {longestStreak} дн.</div>
          )}
        </div>
        <div className="home-weekly">
          {weekDays.map((d) => {
            const done = practiceDates.includes(d.date);
            const missed = !done && !d.isToday && d.date < todayISO;
            return (
              <div key={d.date} className="home-weekly__col">
                <span className="text-[11px] text-muted font-medium">{d.label}</span>
                <div
                  className={`home-weekly__day${d.isToday ? ' home-weekly__day--today' : ''}${done ? ' home-weekly__day--done' : ''}${missed ? ' home-weekly__day--missed' : ''}`}
                >
                  {done ? '✓' : missed ? '✕' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Teacher Note */}
      {latestNote && (
        <div className="home-card">
          <div className="home-teacher__header">
            <div className="home-teacher__avatar-row">
              <div className="home-teacher__avatar">Л</div>
              <div>
                <div className="home-teacher__name">Лусине</div>
                <div className="home-teacher__role">Ваш преподаватель</div>
              </div>
            </div>
            <button className="home-teacher__link" onClick={() => setCurrentView('notes')}>
              Все заметки →
            </button>
          </div>
          <p className={`home-teacher__text${noteExpanded ? '' : ' home-teacher__text--clamped'}`}>
            {latestNote.text}
          </p>
          {!noteExpanded && (
            <button className="home-teacher__expand" onClick={() => setNoteExpanded(true)}>
              читать дальше
            </button>
          )}
        </div>
      )}

      {/* Next Live Lesson */}
      {nextLive && (
        <div
          className="home-card"
          role="button"
          tabIndex={0}
          onClick={() => setCurrentView('live-lessons')}
          onKeyDown={(e) => { if (e.key === 'Enter') setCurrentView('live-lessons'); }}
        >
          <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{'\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0439 \u0443\u0440\u043E\u043A'}</div>
          <div className="text-base font-semibold text-dark mb-1">{nextLive.title}</div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>{new Date(nextLive.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
            <span>{nextLive.time}</span>
            <span>{nextLive.spotsTotal - nextLive.spotsTaken} {'\u043C\u0435\u0441\u0442'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
