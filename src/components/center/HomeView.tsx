import { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { lessons } from '../../data/lessons';
import { teacherNotes } from '../../data/teacherNotes';
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

function CheckIcon() {
  return (
    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
      <path d="M1 5L5 9L12 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="17" viewBox="0 0 18 22" fill="none">
      <path d="M1 1L17 11L1 21V1Z" fill="#8D4A2A" stroke="#8D4A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

const PRACTICE_ITEMS: { label: string; sub: string; emoji: string; view: SectionType; xp: number; iconBg: string }[] = [
  { label: 'Карточки', sub: 'Повтори слова за 2 минуты', emoji: '🃏', view: 'practice', xp: 15, iconBg: '#FFDBCD' },
  { label: 'Ежедневный квиз', sub: 'Проверь себя за 2 минуты', emoji: '🧠', view: 'lesson', xp: 20, iconBg: '#ECE0DA' },
];

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
  const currentLesson = lessons.find((l) => l.status === 'current');
  const latestNote = teacherNotes[0];

  const totalSections = currentLesson ? currentLesson.sections.filter(s => s.type !== 'video').length : 0;
  const completedSections = currentLesson ? currentLesson.sections.filter(s => s.type !== 'video' && s.status === 'completed').length : 0;
  const completedPct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  const stepsLeft = totalSections - completedSections;

  const streakTitle = streak === 0
    ? 'Начни сегодня 🔥'
    : streak === 1
    ? '🔥 Начни серию'
    : `🔥 Уже ${streak} ${streak < 5 ? 'дня' : 'дней'} подряд`;

  const streakSubtitle = practicedToday ? 'Отлично! Серия продолжается' : 'Сохрани серию сегодня 🔥';

  return (
    <div className="home-screen">

      {/* Greeting */}
      <div className="home-greeting-section">
        <h1 className="home-greeting__title">Բարև, Андрей!</h1>
        <p className="home-greeting__sub">Не прерви серию сегодня 🔥</p>
      </div>

      {/* Hero Lesson Card */}
      {currentLesson && (
        <button className="home-hero__card" onClick={() => setCurrentView('lesson')}>
          <div className="home-hero__deco" />
          <div className="home-hero__top-row">
            <div className="home-hero__left">
              <div className="home-hero__label">Продолжить урок</div>
              <div className="home-hero__title">
                Урок {currentLesson.id} · {currentLesson.title}
              </div>
            </div>
            <div className="home-hero__play"><PlayIcon /></div>
          </div>
          <div className="home-hero__bottom">
            <div className="home-hero__bar">
              <div className="home-hero__bar-fill" style={{ width: `${completedPct}%` }} />
            </div>
            <div className="home-hero__footer-row">
              <span className="home-hero__steps-hint">
                Осталось {stepsLeft} {stepsLeft === 1 ? 'шаг' : stepsLeft < 5 ? 'шага' : 'шагов'} · +20 XP
              </span>
              <span className="home-hero__pct-label">{completedPct}%</span>
            </div>
          </div>
        </button>
      )}

      {/* Daily Practice */}
      <div className="home-section">
        <h3 className="home-section__title">Быстрая практика</h3>
        <div className="home-daily-list">
          {PRACTICE_ITEMS.map((item) => (
            <button
              key={item.label}
              className="home-daily-item"
              onClick={() => setCurrentView(item.view)}
            >
              <div className="home-daily-item__icon" style={{ background: item.iconBg }}>
                <span>{item.emoji}</span>
              </div>
              <div className="home-daily-item__body">
                <div className="home-daily-item__name">{item.label}</div>
                <div className="home-daily-item__sub">{item.sub}</div>
              </div>
              <div className="home-daily-item__xp">+{item.xp} XP</div>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div
        className="home-weekly-section"
        role="button"
        tabIndex={0}
        onClick={() => setCurrentView('practice')}
        onKeyDown={(e) => { if (e.key === 'Enter') setCurrentView('practice'); }}
      >
        <div className="home-weekly-section__header">
          <div>
            <h3 className="home-section__title">{streakTitle}</h3>
            <p className="home-weekly__subtitle">{streakSubtitle}</p>
          </div>
          {longestStreak > 0 && (
            <div className="home-weekly__record">Рекорд: {longestStreak} дн.</div>
          )}
        </div>
        <div className="home-weekly-days">
          {weekDays.map((d) => {
            const done = practiceDates.includes(d.date);
            const missed = !done && !d.isToday && d.date < todayISO;
            const future = !done && !d.isToday && d.date > todayISO;
            return (
              <div key={d.date} className="home-weekly__col">
                <div className={[
                  'home-weekly__day',
                  d.isToday ? 'today' : '',
                  done ? 'done' : '',
                  missed ? 'missed' : '',
                  future ? 'future' : '',
                ].filter(Boolean).join(' ')}>
                  {done ? <CheckIcon /> : missed ? '✕' : ''}
                </div>
                <span className="home-weekly__day-label">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher Section */}
      {latestNote && (
        <div className="home-teacher-section">
          <div className="home-teacher__photo-wrap">
            <img src="/assets/teacher-avatar.png" alt="Лусине" className="home-teacher__photo" />
            <div className="home-teacher__online-dot" />
          </div>
          <div className="home-teacher__body">
            <div className="home-teacher__role">Ваш преподаватель</div>
            <div className="home-teacher__name">Лусине</div>
            <p className="home-teacher__note home-teacher__note--clamped">
              {latestNote.text}
            </p>
            <button
              className="home-teacher__view-tips"
              onClick={() => setCurrentView('notes')}
            >
              Смотреть советы →
            </button>
          </div>
          <button className="home-teacher__arrow-btn" onClick={() => setCurrentView('notes')}>
            <ArrowIcon />
          </button>
        </div>
      )}

    </div>
  );
}
