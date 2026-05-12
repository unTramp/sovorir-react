import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleRoute } from '../../components/auth/RoleRoute';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Profile } from '../../types/api';

const mockProfile: Profile = {
  id: 'u1',
  schoolId: 's1',
  role: 'student',
  fullName: 'Тест Тестов',
  avatarUrl: null,
  email: 'test@sovorir.dev',
  className: 'A1',
};

function renderWithRouter(initialPath: string, role: Profile['role']) {
  useAuthStore.setState({ profile: { ...mockProfile, role }, authReady: true });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Главная</div>} />
        <Route
          path="/teacher"
          element={
            <RoleRoute allow={['teacher', 'admin']}>
              <div>Панель преподавателя</div>
            </RoleRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleRoute allow={['admin']}>
              <div>Панель администратора</div>
            </RoleRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleRoute', () => {
  afterEach(() => {
    cleanup();
    useAuthStore.setState({ profile: null, authReady: false });
  });

  it('redirects student from /teacher route to /', () => {
    renderWithRouter('/teacher', 'student');
    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.queryByText('Панель преподавателя')).not.toBeInTheDocument();
  });

  it('allows teacher on /teacher route', () => {
    renderWithRouter('/teacher', 'teacher');
    expect(screen.getByText('Панель преподавателя')).toBeInTheDocument();
  });

  it('allows admin on /teacher route', () => {
    renderWithRouter('/teacher', 'admin');
    expect(screen.getByText('Панель преподавателя')).toBeInTheDocument();
  });

  it('redirects teacher from /admin route to /', () => {
    renderWithRouter('/admin', 'teacher');
    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.queryByText('Панель администратора')).not.toBeInTheDocument();
  });

  it('allows admin on /admin route', () => {
    renderWithRouter('/admin', 'admin');
    expect(screen.getByText('Панель администратора')).toBeInTheDocument();
  });

  it('renders children when role matches', () => {
    renderWithRouter('/teacher', 'teacher');
    expect(screen.getByText('Панель преподавателя')).toBeInTheDocument();
  });
});
