import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonView } from '../../components/center/LessonView';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';
import type { LessonContentSection } from '../../types/lessonContent';

// Prevent actual fetches
vi.mock('../../lib/contentRepository', () => ({
  contentRepository: {
    getLessonSections: vi.fn().mockResolvedValue([]),
    getQuizForSection: vi.fn().mockResolvedValue(null),
    getDictionary: vi.fn().mockResolvedValue([]),
    getLessons: vi.fn().mockResolvedValue([]),
    getLiveLessons: vi.fn().mockResolvedValue([]),
    getConversationClubs: vi.fn().mockResolvedValue([]),
    getFlashcardWords: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../lib/adminLessonBuilderStorage', () => ({
  subscribeAdminLessonBuilderSync: () => () => {},
  getSyncedAdminLessonSections: () => null,
  getSyncedAdminLessonsCatalog: () => null,
  getSyncedAdminLessonId: () => null,
  emitAdminLessonBuilderSync: vi.fn(),
}));

vi.mock('../../lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
  isMockApiEnabled: false,
}));

// Mock BlockRenderer to avoid deep rendering of lesson content
vi.mock('../../components/lesson/BlockRenderer', () => ({
  BlockRenderer: ({ block }: { block: { type: string } }) => (
    <div data-testid={`block-${block.type}`}>{block.type}</div>
  ),
}));

vi.mock('../../components/lesson/StickyRecordCTA', () => ({
  StickyRecordCTA: () => null,
}));

const MOCK_SECTIONS: LessonContentSection[] = [
  {
    id: 1,
    title: 'Введение',
    type: 'intro',
    blocks: [{ type: 'heading', text: 'Заголовок' }],
  },
  {
    id: 2,
    title: 'Словарь',
    type: 'vocabulary',
    blocks: [
      { type: 'phrase', russian: 'Привет', armenian: 'Բarев', transcription: 'barev', translation: 'Привет', status: 'new' },
    ],
  },
  {
    id: 3,
    title: 'Практика',
    type: 'practice',
    blocks: [{ type: 'heading', text: 'Практика' }],
  },
] as unknown as LessonContentSection[];

function renderLesson(initialEntry = '/lesson') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LessonView />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useLessonStore.setState({ currentSection: 1, totalSections: 3, isFullscreen: false });
  useLessonSectionsStore.setState({ sections: MOCK_SECTIONS });
  useLessonProgress.setState({ sections: {} });
});

afterEach(() => {
  cleanup();
});

describe('LessonView', () => {
  it('renders lesson tabs', () => {
    renderLesson();
    expect(screen.getByText('Материалы')).toBeInTheDocument();
    expect(screen.getByText('Словарь')).toBeInTheDocument();
    expect(screen.getByText('Аудио')).toBeInTheDocument();
    expect(screen.getByText('Видео')).toBeInTheDocument();
  });

  it('shows section 1 content by default', () => {
    renderLesson();
    expect(screen.getByTestId('block-heading')).toBeInTheDocument();
  });

  it('shows section 2 content when currentSection is 2', () => {
    useLessonStore.setState({ currentSection: 2, totalSections: 3 });
    renderLesson();
    expect(screen.getByTestId('block-phrase')).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    renderLesson();
    fireEvent.click(screen.getByText('Словарь'));
    // Dictionary tab shows phrase blocks only — block-heading not visible
    expect(screen.queryByTestId('block-heading')).not.toBeInTheDocument();
  });

  it('respects ?section= query param', () => {
    useLessonStore.setState({ currentSection: 1, totalSections: 3 });
    renderLesson('/lesson?section=2');
    // Should switch to section 2 via useEffect
    expect(useLessonStore.getState().currentSection).toBe(2);
  });

  it('syncs totalSections from store', () => {
    renderLesson();
    expect(useLessonStore.getState().totalSections).toBe(3);
  });

  it('renders "Секция не найдена" when section is out of range', () => {
    useLessonStore.setState({ currentSection: 99, totalSections: 3 });
    renderLesson();
    expect(screen.getByText('Секция не найдена')).toBeInTheDocument();
  });
});
