import { Outlet } from 'react-router-dom';

export function CenterPanel() {
  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-content">
      <Outlet />
    </main>
  );
}
