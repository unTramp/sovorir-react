import { useAuthStore } from '../../stores/useAuthStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { useLessonCatalog } from '../../hooks/useLessonCatalog';
import { FlameIcon } from '../../icons';

export function SettingsView() {
  const profile = useAuthStore((s) => s.profile);
  const firstName = useAuthStore((s) => s.firstName);
  const lastName = useAuthStore((s) => s.lastName);
  const avatarUrl = useAuthStore((s) => s.avatarUrl);
  const email = useAuthStore((s) => s.profile?.email ?? '—');
  const logout = useAuthStore((s) => s.logout);
  const streak = useStreakStore((s) => s.currentStreak);
  const { lessons, completedLessons } = useLessonCatalog();

  const completedSections = lessons
    .flatMap((lesson) => lesson.sections)
    .filter((section) => section.type !== 'video' && section.status === 'completed').length;
  const xp = completedSections * 32;
  const isStudent = profile?.role === 'student';
  const coursePercent = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  return (
    <div className="profile-screen">
      <section className="profile-hero">
        <img className="profile-hero__avatar" src={avatarUrl} alt={`${firstName} ${lastName}`} />
        <div className="profile-hero__identity">
          <h1>{firstName} {lastName}</h1>
          <p>{profile?.className ? `Группа ${profile.className}` : 'Ученик Sovorir'}</p>
        </div>
      </section>

      {isStudent && <section className="profile-stats" aria-label="Прогресс">
        <div className="profile-stat">
          <strong>{xp}</strong>
          <span>XP</span>
        </div>
        <div className="profile-stat">
          <strong>{completedLessons}</strong>
          <span>уроков пройдено</span>
        </div>
        <div className="profile-stat profile-stat--streak">
          <strong><FlameIcon size={16} /> {streak}</strong>
          <span>{streak === 1 ? 'день' : streak >= 2 && streak <= 4 ? 'дня' : 'дней'} подряд</span>
        </div>
      </section>}

      {isStudent && (
        <section className="profile-progress surface-card" aria-label={`Прогресс курса ${coursePercent}%`}>
          <div className="profile-progress__header">
            <div>
              <strong>Прогресс курса</strong>
              <span>{completedLessons} из {lessons.length} уроков завершено</span>
            </div>
            <b>{coursePercent}%</b>
          </div>
          <div className="profile-progress__track" aria-hidden="true">
            <span style={{ width: `${coursePercent}%` }} />
          </div>
        </section>
      )}

      <section className="profile-account">
        <div>
          <span className="profile-account__label">Аккаунт</span>
          <span className="profile-account__value">{email}</span>
        </div>
        <button
          className="profile-account__logout"
          type="button"
          onClick={logout}
        >
          Выйти
        </button>
      </section>
    </div>
  );
}
