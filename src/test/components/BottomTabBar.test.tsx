import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
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

function renderTabBar(role: Profile['role'], path = '/') {
  useAuthStore.setState({ profile: { ...mockProfile, role }, authReady: true });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomTabBar />
    </MemoryRouter>,
  );
}

describe('BottomTabBar', () => {
  afterEach(() => {
    cleanup();
    useAuthStore.setState({ profile: null });
  });

  it('shows student tabs for student role', () => {
    renderTabBar('student');
    expect(screen.getByLabelText('Главная')).toBeInTheDocument();
    expect(screen.getByLabelText('Уроки')).toBeInTheDocument();
    expect(screen.getByLabelText('Задания')).toBeInTheDocument();
    expect(screen.getByLabelText('Профиль')).toBeInTheDocument();
    expect(screen.queryByLabelText('Студенты')).not.toBeInTheDocument();
  });

  it('shows teacher tabs for teacher role', () => {
    renderTabBar('teacher');
    expect(screen.getByLabelText('Главная')).toBeInTheDocument();
    expect(screen.getByLabelText('Задания')).toBeInTheDocument();
    expect(screen.getByLabelText('Студенты')).toBeInTheDocument();
    expect(screen.getByLabelText('Профиль')).toBeInTheDocument();
    expect(screen.queryByLabelText('Тренажёр')).not.toBeInTheDocument();
  });

  it('shows admin tabs for admin role', () => {
    renderTabBar('admin');
    expect(screen.getByLabelText('Главная')).toBeInTheDocument();
    expect(screen.getByLabelText('Аналитика')).toBeInTheDocument();
    expect(screen.queryByLabelText('Задания')).not.toBeInTheDocument();
  });

  it('active tab matches current route /', () => {
    renderTabBar('student', '/');
    const homeBtn = screen.getByLabelText('Главная');
    expect(homeBtn.className).toContain('active');
    expect(screen.getByLabelText('Уроки').className).not.toContain('active');
  });

  it('active tab matches /lesson route', () => {
    renderTabBar('student', '/lesson');
    expect(screen.getByLabelText('Уроки').className).toContain('active');
    expect(screen.getByLabelText('Главная').className).not.toContain('active');
  });
});
