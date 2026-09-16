import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreakStore } from '../../stores/useStreakStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { teacherNotes } from '../../data/teacherNotes';
import { todayISO, getWeekDays } from '../../lib/dateUtils';
import { BookOpenIcon, FlameIcon } from '../../icons';
import { useLessonCatalog } from '../../hooks/useLessonCatalog';
import { TeacherDashboardView } from './TeacherDashboardView';
import { useLearningItemStore } from '../../stores/useLearningItemStore';
import { useAppStore } from '../../stores/useAppStore';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';

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

export function HomeView() {
  const role = useAuthStore((s) => s.profile?.role);

  return role === 'teacher' || role === 'admin'
    ? <TeacherDashboardView />
    : <StudentHomeView />;
}

function StudentHomeView() {
  const navigate = useNavigate();
  const streak = useStreakStore((s) => s.currentStreak);
  const practiceDates = useStreakStore((s) => s.practiceDates);
  const firstName = useAuthStore((s) => s.firstName);
  const { currentLesson, allCompleted } = useLessonCatalog();
  const reviewQueue = useLearningItemStore((state) => state.reviewQueue);
  const today = todayISO();
  const reviewCount = Object.keys(reviewQueue).length;
  const dueCount = Object.values(reviewQueue)
    .filter((entry) => entry.nextReviewAt.slice(0, 10) <= today).length;
  const setCurrentLesson = useAppStore((state) => state.setCurrentLesson);
  const setCurrentSection = useLessonStore((state) => state.setCurrentSection);
  const selectLesson = useLessonSectionsStore((state) => state.selectLesson);

  const weekDays = useMemo(() => getWeekDays(), []);
  const latestNote = teacherNotes[0];

  const continueLesson = () => {
    if (!currentLesson) return;
    setCurrentLesson(currentLesson.id);
    setCurrentSection(1);
    selectLesson(currentLesson.apiId);
    navigate('/lesson');
  };

  const { completedPct, stepsLeft } = useMemo(() => {
    const total = currentLesson ? currentLesson.sections.filter(s => s.type !== 'video').length : 0;
    const completed = currentLesson ? currentLesson.sections.filter(s => s.type !== 'video' && s.status === 'completed').length : 0;
    return {
      completedPct: total > 0 ? Math.round((completed / total) * 100) : 0,
      stepsLeft: total - completed,
    };
  }, [currentLesson]);

  return (
    <div className="home-screen">

      {/* Greeting */}
      <div className="home-greeting-section">
        <h1 className="home-greeting__title"><span lang="hy">Բարև</span>, {firstName}!</h1>
        <p className="home-greeting__sub">Небольшой шаг сегодня поможет сохранить ритм <FlameIcon size={14} /></p>
      </div>

      {/* Hero Lesson Card */}
      {allCompleted && (
        <button className="home-hero__card surface-card--primary" onClick={() => navigate('/course')}>
          <div className="home-hero__deco" />
          <div className="home-hero__top-row">
            <div className="home-hero__left">
              <div className="home-hero__label">Урок завершён</div>
              <div className="home-hero__title">Фразы можно повторить в любой момент</div>
            </div>
            <div className="home-hero__play" style={{ fontSize: 28 }}>✓</div>
          </div>
          <div className="home-hero__bottom">
            <div className="home-hero__bar">
              <div className="home-hero__bar-fill" style={{ width: '100%' }} />
            </div>
            <div className="home-hero__footer-row">
              <span className="home-hero__steps-hint">Открыть пройденные уроки</span>
            </div>
          </div>
        </button>
      )}
      {!allCompleted && currentLesson && (
        <button className="home-hero__card surface-card--primary" onClick={continueLesson}>
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
                Осталось {stepsLeft} {stepsLeft === 1 ? 'шаг' : stepsLeft < 5 ? 'шага' : 'шагов'}
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
          <button className="home-daily-item surface-card--interactive" onClick={() => navigate('/practice')}>
            <div className="home-daily-item__icon" style={{ background: 'rgb(var(--color-primary-rgb) / 0.12)' }}>
              <BookOpenIcon size={21} />
            </div>
            <div className="home-daily-item__body">
              <div className="home-daily-item__name">Повторение</div>
              <div className="home-daily-item__sub">
                {dueCount > 0
                  ? `${dueCount} ${dueCount === 1 ? 'фраза' : 'фраз'} на сегодня · около 2 минут`
                  : reviewCount > 0
                    ? `${reviewCount} ${reviewCount === 1 ? 'фраза добавлена' : 'фраз добавлено'} в план повторения`
                    : 'Фразы появятся после первого урока'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Weekly Activity */}
      <div
        className="home-weekly-section surface-card"
        role="button"
        tabIndex={0}
        onClick={() => navigate('/practice')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/practice'); } }}
      >
        <div className="home-weekly-section__header">
          <h3 className="home-weekly__title">Недельная активность</h3>
          {streak > 0 && (
            <div className="home-weekly__streak-badge streak-inline"><FlameIcon size={12} /> {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}</div>
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
                  {done ? <CheckIcon /> : null}
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
          <div className="home-teacher__bubble surface-card">
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
