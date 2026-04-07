import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import { LoginView } from '@shared/components/auth/LoginView';
import { AdminLessonBuilderView } from '@shared/components/center/AdminLessonBuilderView';
import { useAuthStore } from '@shared/stores/useAuthStore';

function AdminFallback() {
  return (
    <div className="admin-shell__loading">
      <div className="admin-shell__spinner" aria-hidden="true" />
    </div>
  );
}

function AdminForbidden() {
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="admin-shell">
      <section className="admin-shell__hero">
        <div className="admin-shell__badge">Админка Sovorir</div>
        <h1 className="admin-shell__title">Доступ к панели ограничен</h1>
        <p className="admin-shell__lead">
          Этот интерфейс доступен только для преподавателей и администраторов. Текущий аккаунт:
          {' '}
          {profile?.email ?? 'неизвестен'}.
        </p>
        <button className="login-form__submit" type="button" onClick={logout}>
          Выйти
        </button>
      </section>
    </div>
  );
}

function AdminAppContent() {
  const profile = useAuthStore((state) => state.profile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authReady = useAuthStore((state) => state.authReady);

  useEffect(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }, []);

  useEffect(() => {
    void useAuthStore.getState().initialize();
  }, []);

  if (!authReady || (isLoading && !profile)) {
    return <AdminFallback />;
  }

  if (!profile) {
    return (
      <div className="admin-shell">
        <section className="admin-shell__hero">
          <div className="admin-shell__badge">Админка Sovorir</div>
          <h1 className="admin-shell__title">Конструктор уроков</h1>
          <p className="admin-shell__lead">
            Отдельное приложение для преподавателей: сборка секций, редактирование контента
            и публикация уроков без смешивания с ученическим интерфейсом.
          </p>
        </section>
        <section className="admin-shell__panel">
          <LoginView />
        </section>
      </div>
    );
  }

  if (profile.role !== 'teacher' && profile.role !== 'admin') {
    return <AdminForbidden />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="builder" replace />} />
        <Route path="builder" element={<AdminLessonBuilderView />} />
        <Route path="*" element={<Navigate to="builder" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export function AdminApp() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AdminAppContent />
    </BrowserRouter>
  );
}
