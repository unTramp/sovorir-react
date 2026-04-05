import { useAuthStore } from '../../stores/useAuthStore';

export function SettingsView() {
  const email = useAuthStore((s) => s.profile?.email ?? '—');
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="placeholder-card max-w-sm w-full">
        <div className="placeholder-card__emoji">⚙️</div>
        <div className="placeholder-card__title">Настройки</div>
        <div className="placeholder-card__hint">Текущий аккаунт: {email}</div>
        <button
          className="login-form__submit mt-4"
          type="button"
          onClick={logout}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
