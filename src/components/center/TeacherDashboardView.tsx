import { useAuthStore } from '../../stores/useAuthStore';

export function TeacherDashboardView() {
  const firstName = useAuthStore((s) => s.firstName);

  return (
    <div className="view-panel home-screen">
      <div className="home-greeting-section">
        <h1 className="home-greeting__title">Барев, {firstName}!</h1>
        <p className="home-greeting__sub">Панель преподавателя</p>
      </div>

      <div className="teacher-dash__section">
        <div className="teacher-dash__section-title">Очередь проверки</div>
        <div className="teacher-dash__empty">
          <span className="teacher-dash__empty-icon">📋</span>
          <p className="teacher-dash__empty-text">Нет заданий на проверке</p>
          <p className="teacher-dash__empty-hint">Когда студенты отправят задания, они появятся здесь</p>
        </div>
      </div>

      <div className="teacher-dash__section">
        <div className="teacher-dash__section-title">Ближайшие консультации</div>
        <div className="teacher-dash__empty">
          <span className="teacher-dash__empty-icon">📅</span>
          <p className="teacher-dash__empty-text">Нет запланированных консультаций</p>
        </div>
      </div>
    </div>
  );
}
