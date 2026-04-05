import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreakStore } from '../../stores/useStreakStore';
import { useUserStore } from '../../stores/useUserStore';
import { lessons } from '../../data/lessons';
import { teacherNotes } from '../../data/teacherNotes';
import { todayISO, getWeekDays } from '../../lib/dateUtils';
import { FlameIcon } from '../../icons';
import type { SectionType } from '../../types/lesson';

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

const PRACTICE_ITEMS: { label: string; sub: string; emoji: string; view: SectionType; xp: number; iconBg: string }[] = [
  { label: 'Карточки', sub: 'Повтори слова за 2 минуты', emoji: '🃏', view: 'practice', xp: 15, iconBg: '#FFDBCD' },
  { label: 'Ежедневный квиз', sub: 'Проверь себя за 2 минуты', emoji: '🧠', view: 'lesson', xp: 20, iconBg: '#ECE0DA' },
];

export function HomeView() {
  const navigate = useNavigate();
  const streak = useStreakStore((s) => s.currentStreak);
  const practiceDates = useStreakStore((s) => s.practiceDates);
  const { firstName } = useUserStore();

  const today = todayISO();
  const weekDays = useMemo(() => getWeekDays(), []);
  const currentLesson = lessons.find((l) => l.status === 'current');
  const latestNote = teacherNotes[0];

  const totalSections = currentLesson ? currentLesson.sections.filter(s => s.type !== 'video').length : 0;
  const completedSections = currentLesson ? currentLesson.sections.filter(s => s.type !== 'video' && s.status === 'completed').length : 0;
  const completedPct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  const stepsLeft = totalSections - completedSections;

  return (
    <div className="home-screen">

      {/* Greeting */}
      <div className="home-greeting-section">
        <h1 className="home-greeting__title">Բарев, {firstName}!</h1>
        <p className="home-greeting__sub">Не прерви серию сегодня <FlameIcon size={14} /></p>
      </div>

      {/* Hero Lesson Card */}
      {currentLesson && (
        <button className="home-hero__card" onClick={() => navigate('/lesson')}>
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
            <button key={item.label} className="home-daily-item" onClick={() => navigate(`/${item.view}`)}>
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
        onClick={() => navigate('/practice')}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/practice'); }}
      >
        <div className="home-weekly-section__header">
          <h3 className="home-weekly__title">Недельная активность</h3>
          {streak > 0 && (
            <div className="home-weekly__streak-badge" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FlameIcon size={12} color="#C87941" /> {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}</div>
          )}
        </div>
        <div className="home-weekly-days">
          {weekDays.map((d) => {
            const done = practiceDates.includes(d.date);
            const missed = !done && !d.isToday && d.date < today;
            const future = !done && !d.isToday && d.date > today;
            return (
              <div key={d.date} className="home-weekly__col">
                <div className={[
                  'home-weekly__day',
                  d.isToday ? 'today' : '',
                  done ? 'done' : '',
                  missed ? 'missed' : '',
                  future ? 'future' : '',
                ].filter(Boolean).join(' ')}>
                  {done || d.isToday ? <CheckIcon /> : null}
                </div>
                <span className={`home-weekly__day-label${d.isToday ? ' today' : ''}`}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher Section */}
      {latestNote && (
        <div className="home-teacher-section">
          <div className="home-teacher__bubble" onClick={() => navigate('/notes')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate('/notes'); }}>
            <div className="home-teacher__photo-wrap">
              <img src="/assets/teacher-avatar.png" alt="Лусине" className="home-teacher__photo" />
            </div>
            <div className="home-teacher__role">Ваш преподаватель · Лусине</div>
            <p className="home-teacher__note home-teacher__note--clamped">
              {latestNote.text}
            </p>
            <button
              className="home-teacher__view-tips"
              onClick={() => navigate('/notes')}
            >
              Смотреть советы →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
