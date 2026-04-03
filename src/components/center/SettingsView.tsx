export function SettingsView() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        style={{
          background: 'var(--color-bg-white)',
          borderRadius: 20,
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(30,20,18,0.08)',
          maxWidth: 320,
          width: '100%',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
          Настройки
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-muted)', opacity: 0.7 }}>
          Скоро появится
        </div>
      </div>
    </div>
  );
}
