import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
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

vi.mock('../../hooks/useLessonCatalog', () => ({
  useLessonCatalog: () => ({
    currentLesson: null,
    allCompleted: false,
    hasLoaded: false,
  }),
}));

// Mock BlockRenderer to avoid deep rendering of lesson content
vi.mock('../../components/lesson/BlockRenderer', () => ({
  BlockRenderer: ({ block, onSkipRecord }: { block: { type: string }; onSkipRecord?: () => void }) =>
    onSkipRecord ? (
      <button data-testid={`block-${block.type}`} onClick={onSkipRecord}>
        Завершить интерактив
      </button>
    ) : (
      <div data-testid={`block-${block.type}`}>{block.type}</div>
    ),
}));

vi.mock('../../components/lesson/StickyRecordCTA', () => ({
  StickyRecordCTA: () => null,
}));

vi.mock('../../components/lesson/LessonCompleteCard', () => ({
  LessonCompleteCard: () => <div data-testid="lesson-completion-action" />,
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
      { type: 'phrase', russian: 'Привет', armenian: 'Բարև', transcription: 'barev', translation: 'Привет', status: 'new' },
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
  useLessonSectionsStore.setState({ sections: MOCK_SECTIONS, isLoading: false, error: null });
  useLessonProgress.setState({ sections: {} });
});

afterEach(() => {
  cleanup();
});

describe('LessonView', () => {
  it('renders a single linear lesson flow without content tabs', () => {
    renderLesson();
    expect(screen.getByRole('heading', { name: 'Введение' })).toBeInTheDocument();
    expect(screen.queryByText('Шаг 1 из 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Материалы')).not.toBeInTheDocument();
  });

  it('shows section 1 content by default', () => {
    renderLesson();
    expect(screen.getByTestId('block-heading')).toBeInTheDocument();
  });

  it('renders completion CTA outside the scrollable lesson content', () => {
    const { container } = renderLesson();
    const scroll = container.querySelector('.lesson-scroll');
    const action = screen.getByTestId('lesson-completion-action');

    expect(scroll).not.toContainElement(action);
    expect(action.parentElement).toHaveClass('lesson-section-layout');
  });

  it('shows section 2 content when currentSection is 2', () => {
    useLessonStore.setState({ currentSection: 2, totalSections: 3 });
    renderLesson();
    expect(screen.getByText('Բարև')).toBeInTheDocument();
    expect(screen.getByLabelText('Фразы для изучения')).toBeInTheDocument();
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

  it('bounds an out-of-range section to the last available step', () => {
    useLessonStore.setState({ currentSection: 99, totalSections: 3 });
    renderLesson();
    expect(screen.getByRole('heading', { name: 'Практика' })).toBeInTheDocument();
    expect(useLessonStore.getState().currentSection).toBe(3);
  });

  it('advances through multiple active recall blocks before unlocking completion', () => {
    const interactiveSections = [
      {
        id: 1,
        title: 'Без подсказки',
        type: 'practice',
        blocks: [
          {
            type: 'activeRecall',
            prompt: 'Как поздороваться?',
            answer: {
              armenian: 'Բարև',
              transcription: 'barev',
              translation: 'Привет',
            },
            reviewIds: ['greeting'],
          },
          {
            type: 'activeRecall',
            prompt: 'Как попрощаться?',
            answer: {
              armenian: 'Ցտեսություն',
              transcription: 'ts’tesut’yun',
              translation: 'До свидания',
            },
            reviewIds: ['goodbye'],
          },
        ],
      },
    ] as unknown as LessonContentSection[];

    useLessonStore.setState({ currentSection: 1, totalSections: 1 });
    useLessonSectionsStore.setState({
      sections: interactiveSections,
      isLoading: false,
      error: null,
    });
    renderLesson('/lesson?section=1');

    fireEvent.click(screen.getByRole('button', { name: 'Завершить интерактив' }));
    expect(useLessonProgress.getState().sections[1]?.completedRecords).toEqual([0]);

    fireEvent.click(screen.getByRole('button', { name: 'Завершить интерактив' }));
    expect(useLessonProgress.getState().sections[1]?.completedRecords).toEqual([0, 1]);
  });
});
