import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomeView } from '../../components/center/HomeView';
import { useAuthStore } from '../../stores/useAuthStore';
import { useStreakStore } from '../../stores/useStreakStore';
import { useLessonCatalogStore } from '../../stores/useLessonCatalogStore';
import type { Lesson } from '../../types/lesson';

// Prevent actual API / network calls
vi.mock('../../lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
  isMockApiEnabled: false,
}));

vi.mock('../../lib/contentRepository', () => ({
  contentRepository: {
    getLessons: vi.fn().mockResolvedValue([]),
    getLessonSections: vi.fn().mockResolvedValue([]),
    getDictionary: vi.fn().mockResolvedValue([]),
    getQuizForSection: vi.fn().mockResolvedValue(null),
    getLiveLessons: vi.fn().mockResolvedValue([]),
    getConversationClubs: vi.fn().mockResolvedValue([]),
    getFlashcardWords: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../lib/adminLessonBuilderStorage', () => ({
  subscribeAdminLessonBuilderSync: () => () => {},
  getSyncedAdminLessonsCatalog: () => null,
  getSyncedAdminLessonSections: () => null,
  getSyncedAdminLessonId: () => null,
}));

const STUDENT_PROFILE = {
  id: 'u1',
  schoolId: 's1',
  role: 'student' as const,
  fullName: 'Анна Иванова',
  avatarUrl: null,
  email: 'anna@test.com',
  className: 'A1',
};

const MOCK_LESSON: Lesson = {
  id: 1,
  title: 'Приветствия',
  icon: '👋',
  status: 'current',
  sections: [
    { id: 'sec-1', title: 'Введение', type: 'lesson', icon: '', status: 'completed' },
    { id: 'sec-2', title: 'Словарь', type: 'lesson', icon: '', status: 'current' },
    { id: 'sec-3', title: 'Практика', type: 'lesson', icon: '', status: 'pending' },
    { id: 'vid-1', title: 'Видео', type: 'video', icon: '', status: 'pending' },
  ],
};

function renderHome() {
  return render(
    <MemoryRouter>
      <HomeView />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useAuthStore.setState({
    profile: STUDENT_PROFILE,
    firstName: 'Анна',
    lastName: 'Иванова',
    avatarUrl: '/assets/student-avatar.png',
    isLoading: false,
    error: null,
    authReady: true,
  });
  useStreakStore.setState({ currentStreak: 3, practiceDates: [] });
  useLessonCatalogStore.setState({
    lessons: [MOCK_LESSON],
    isLoading: false,
    hasLoaded: true,
    error: null,
  });
});

afterEach(() => {
  cleanup();
});

describe('HomeView', () => {
  it('renders greeting with first name', () => {
    renderHome();
    expect(screen.getByText(/Анна/)).toBeInTheDocument();
  });

  it('shows current lesson hero card', () => {
    renderHome();
    expect(screen.getByText(/Приветствия/)).toBeInTheDocument();
    expect(screen.getByText(/Продолжить урок/)).toBeInTheDocument();
  });

  it('calculates correct steps left (excludes video sections)', () => {
    renderHome();
    // 3 non-video sections, 1 completed → 2 left
    expect(screen.getByText(/Осталось 2 шага/)).toBeInTheDocument();
  });

  it('shows streak badge when streak > 0', () => {
    renderHome();
    expect(screen.getByText(/3 дня/)).toBeInTheDocument();
  });

  it('renders practice items', () => {
    renderHome();
    expect(screen.getByText('Карточки')).toBeInTheDocument();
    expect(screen.getByText('Ежедневный квиз')).toBeInTheDocument();
  });

  it('shows 0 steps left when all sections completed', () => {
    useLessonCatalogStore.setState({
      lessons: [{
        ...MOCK_LESSON,
        sections: MOCK_LESSON.sections.map((s) => ({ ...s, status: 'completed' as const })),
      }],
      isLoading: false,
      hasLoaded: true,
      error: null,
    });
    renderHome();
    // 0 < 5 → "шага"
    expect(screen.getByText(/Осталось 0 шага/)).toBeInTheDocument();
  });

  it('renders teacher dashboard when role is teacher', () => {
    useAuthStore.setState({
      profile: { ...STUDENT_PROFILE, role: 'teacher' },
      firstName: 'Лусине',
      lastName: '',
      avatarUrl: '/assets/student-avatar.png',
      isLoading: false,
      error: null,
      authReady: true,
    });
    renderHome();
    // TeacherDashboardView renders instead — no lesson hero card
    expect(screen.queryByText('Продолжить урок')).not.toBeInTheDocument();
  });
});
