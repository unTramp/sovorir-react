import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from '../../App';
import { useAuthStore } from '../../stores/useAuthStore';

describe('App auth bootstrap', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
    useAuthStore.setState({
      profile: null,
      firstName: '',
      lastName: '',
      avatarUrl: '/assets/student-avatar.png',
      isLoading: false,
      error: null,
      authReady: false,
    });
  });

  it('renders login view when unauthenticated', async () => {
    render(<App />);
    expect(await screen.findByText('Sovorir')).toBeInTheDocument();
  });

  it('renders app shell when authenticated', async () => {
    useAuthStore.setState({
      profile: {
        id: 'u1',
        schoolId: 's1',
        role: 'student',
        fullName: 'Тестовый Пользователь',
        avatarUrl: '/assets/student-avatar.png',
        email: 'student@sovorir.dev',
        className: 'A1',
      },
      firstName: 'Тестовый',
      lastName: 'Пользователь',
      avatarUrl: '/assets/student-avatar.png',
      isLoading: false,
      error: null,
      authReady: true,
    });

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    expect((await screen.findAllByText('Главная')).length).toBeGreaterThan(0);
  });
});
import { StrictMode } from 'react';
