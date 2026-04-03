import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

export function LoginView() {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo__text">Sovorir</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
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
