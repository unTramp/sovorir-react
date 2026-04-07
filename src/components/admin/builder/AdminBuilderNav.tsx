import { SettingsGearIcon } from '../../../icons';

interface AdminBuilderNavProps {
  isCollapsed: boolean;
  firstName: string;
  fullName: string;
  roleLabel: string;
  disabled: boolean;
  onToggleCollapsed: () => void;
  onPublish: () => void;
  onLogout: () => void;
}

export function AdminBuilderNav({
  isCollapsed,
  firstName,
  fullName,
  roleLabel,
  disabled,
  onToggleCollapsed,
  onPublish,
  onLogout,
}: AdminBuilderNavProps) {
  return (
    <aside className="admin-builder__nav">
      <div className="admin-builder__nav-top">
        <div className="admin-builder__nav-brand-row">
          <div className="admin-builder__nav-logo">Sovorir</div>
          <button
            className="admin-builder__nav-collapse-btn"
            type="button"
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель'}
            title={isCollapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d={isCollapsed ? 'M6 3l4 5-4 5' : 'M10 3L6 8l4 5'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <nav className="admin-builder__nav-links">
          <div className="admin-builder__nav-link admin-builder__nav-link--inactive" title="Обзор">
            <SettingsGearIcon size={18} />
            <span className="admin-builder__nav-link-text">Обзор</span>
          </div>
          <div className="admin-builder__nav-link admin-builder__nav-link--active" title="Конструктор урока">
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
              <rect x="0" y="0" width="7" height="3" rx="1.5" fill="currentColor" />
              <rect x="0" y="5" width="18" height="3" rx="1.5" fill="currentColor" />
              <rect x="0" y="10" width="13" height="3" rx="1.5" fill="currentColor" />
              <rect x="0" y="15" width="9" height="1" rx="0.5" fill="currentColor" />
            </svg>
            <span className="admin-builder__nav-link-text">Конструктор урока</span>
          </div>
          <div className="admin-builder__nav-link admin-builder__nav-link--inactive" title="Настройки">
            <SettingsGearIcon size={18} />
            <span className="admin-builder__nav-link-text">Настройки</span>
          </div>
        </nav>
      </div>

      <div className="admin-builder__nav-bottom">
        <div className="admin-builder__nav-profile" title={fullName}>
          <div className="admin-builder__nav-avatar">{firstName.charAt(0).toUpperCase()}</div>
          <div className="admin-builder__nav-user">
            <div className="admin-builder__nav-username">{fullName}</div>
            <div className="admin-builder__nav-role">{roleLabel}</div>
          </div>
        </div>

        <button
          className="admin-builder__publish-btn"
          type="button"
          onClick={onPublish}
          disabled={disabled}
          title="Опубликовать урок"
        >
          <span className="admin-builder__publish-btn-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.75v10.5M7 1.75l3 3M7 1.75l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="admin-builder__publish-btn-text">Опубликовать урок</span>
        </button>

        <div className="admin-builder__nav-footer-links">
          <button className="admin-builder__nav-footer-link" type="button" onClick={onLogout} title="Выйти">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M4.5 1.5H2.25A.75.75 0 001.5 2.25v7.5c0 .414.336.75.75.75H4.5M8.25 9l3-3-3-3M11.25 6H4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="admin-builder__nav-link-text">Выйти</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
