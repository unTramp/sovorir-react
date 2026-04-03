function CrownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 19h20v2H2v-2zm2-8l4 4 4-6 4 6 4-4v6H4v-6z" />
    </svg>
  );
}

export function DrawerUpgrade() {
  return (
    <div className="drawer-upgrade">
      <div className="drawer-upgrade__header">
        <span className="drawer-upgrade__crown"><CrownIcon /></span>
        <span className="drawer-upgrade__title">Sovorir Pro</span>
      </div>
      <p className="drawer-upgrade__text">
        Все уроки · Живые занятия · Безлимитная практика
      </p>
      <button className="drawer-upgrade__btn">Перейти на Pro</button>
    </div>
  );
}
