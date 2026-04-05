import { useState, type FormEvent } from 'react';
import { isMockApiEnabled } from '../../lib/apiClient';
import { mockAuthCredentials } from '../../lib/mockApi';
import { useAuthStore } from '../../stores/useAuthStore';

export function LoginView() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void login(email, password);
  };

  const fillMockStudent = () => {
    setEmail(mockAuthCredentials.student.email);
    setPassword(mockAuthCredentials.student.password);
  };

  const fillMockTeacher = () => {
    setEmail(mockAuthCredentials.teacher.email);
    setPassword(mockAuthCredentials.teacher.password);
  };

  const fillMockAdmin = () => {
    setEmail(mockAuthCredentials.admin.email);
    setPassword(mockAuthCredentials.admin.password);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo__text">Sovorir</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {isMockApiEnabled && (
            <div className="login-form__field">
              <p className="login-form__error">
                Dev mock API включён. Доступны student / teacher / admin демо-аккаунты.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  className="login-form__submit"
                  type="button"
                  onClick={fillMockStudent}
                  disabled={isLoading}
                >
                  Student: student@sovorir.dev
                </button>
                <button
                  className="login-form__submit"
                  type="button"
                  onClick={fillMockTeacher}
                  disabled={isLoading}
                >
                  Teacher: teacher@sovorir.dev
                </button>
                <button
                  className="login-form__submit"
                  type="button"
                  onClick={fillMockAdmin}
                  disabled={isLoading}
                >
                  Admin: admin@sovorir.dev
                </button>
              </div>
            </div>
          )}

          <div className="login-form__field">
            <label className="login-form__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="login-form__input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="login-form__field">
            <label className="login-form__label" htmlFor="login-password">
              Пароль
            </label>
            <input
              id="login-password"
              className="login-form__input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="login-form__error">{error}</p>}

          <button
            className="login-form__submit"
            type="submit"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <span className="login-form__spinner" aria-hidden="true" />
            ) : (
              'Войти'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
