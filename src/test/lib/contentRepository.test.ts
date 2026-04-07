import { describe, expect, it, vi } from 'vitest';
import type { ContentRepository } from '../../lib/contentRepository';
import { FallbackContentRepository } from '../../lib/contentRepository';
import type { LessonContentSection } from '../../types/lessonContent';
import type { Lesson } from '../../types/lesson';
import type { Quiz } from '../../types/quiz';

function createRepositoryStub(overrides: Partial<ContentRepository> = {}): ContentRepository {
  return {
    getLessonSections: vi.fn().mockResolvedValue([] as LessonContentSection[]),
    getDictionary: vi.fn().mockResolvedValue([]),
    getQuizForSection: vi.fn().mockResolvedValue(null as Quiz | null),
    getLiveLessons: vi.fn().mockResolvedValue([]),
    getConversationClubs: vi.fn().mockResolvedValue([]),
    getFlashcardWords: vi.fn().mockResolvedValue([]),
    getLessons: vi.fn().mockResolvedValue([] as Lesson[]),
    ...overrides,
  };
}

describe('FallbackContentRepository', () => {
  it('uses the local draft repository before the seed repository in mock mode', async () => {
    const seedRepository = createRepositoryStub({
      getLessons: vi.fn().mockResolvedValue([{ id: 1, title: 'Static lesson', icon: '📘', status: 'current', sections: [] }]),
    });
    const localDraftRepository = createRepositoryStub({
      getLessons: vi.fn().mockResolvedValue([{ id: 11, title: 'Draft lesson', icon: '📘', status: 'current', sections: [] }]),
    });
    const apiRepository = createRepositoryStub({
      getLessons: vi.fn().mockResolvedValue([{ id: 2, title: 'API lesson', icon: '📘', status: 'current', sections: [] }]),
    });

    const repository = new FallbackContentRepository(seedRepository, apiRepository, true, localDraftRepository);
    const lessons = await repository.getLessons();

    expect(lessons[0]?.title).toBe('Draft lesson');
    expect(localDraftRepository.getLessons).toHaveBeenCalledOnce();
    expect(seedRepository.getLessons).not.toHaveBeenCalled();
    expect(apiRepository.getLessons).not.toHaveBeenCalled();
  });

  it('prefers the api repository when mock mode is disabled and api calls succeed', async () => {
    const seedRepository = createRepositoryStub();
    const localDraftRepository = createRepositoryStub();
    const apiRepository = createRepositoryStub({
      getLessonSections: vi.fn().mockResolvedValue([{ id: 1, title: 'API', blocks: [] }]),
    });

    const repository = new FallbackContentRepository(seedRepository, apiRepository, false, localDraftRepository);
    const sections = await repository.getLessonSections();

    expect(sections[0]?.title).toBe('API');
    expect(apiRepository.getLessonSections).toHaveBeenCalledOnce();
    expect(localDraftRepository.getLessonSections).not.toHaveBeenCalled();
    expect(seedRepository.getLessonSections).not.toHaveBeenCalled();
  });

  it('falls back to the local draft repository when api content calls fail', async () => {
    const seedRepository = createRepositoryStub({
      getLessonSections: vi.fn().mockResolvedValue([{ id: 1, title: 'Static fallback', blocks: [] }]),
      getQuizForSection: vi.fn().mockResolvedValue({
        id: 'quiz-1',
        sectionId: 1,
        questions: [],
      } as Quiz),
    });
    const localDraftRepository = createRepositoryStub({
      getLessonSections: vi.fn().mockResolvedValue([{ id: 99, title: 'Draft fallback', blocks: [] }]),
      getQuizForSection: vi.fn().mockResolvedValue({
        id: 'quiz-draft',
        sectionId: 1,
        questions: [],
      } as Quiz),
    });
    const apiRepository = createRepositoryStub({
      getLessonSections: vi.fn().mockRejectedValue(new Error('network failed')),
      getQuizForSection: vi.fn().mockRejectedValue(new Error('network failed')),
    });

    const repository = new FallbackContentRepository(seedRepository, apiRepository, false, localDraftRepository);
    const sections = await repository.getLessonSections();
    const quiz = await repository.getQuizForSection(1);

    expect(sections[0]?.title).toBe('Draft fallback');
    expect(quiz?.id).toBe('quiz-draft');
    expect(localDraftRepository.getLessonSections).toHaveBeenCalledOnce();
    expect(localDraftRepository.getQuizForSection).toHaveBeenCalledWith(1);
    expect(seedRepository.getLessonSections).not.toHaveBeenCalled();
  });

  it('falls back to the seed repository when neither api nor local draft can provide content', async () => {
    const seedRepository = createRepositoryStub({
      getLessonSections: vi.fn().mockResolvedValue([{ id: 1, title: 'Seed fallback', blocks: [] }]),
    });
    const localDraftRepository = createRepositoryStub({
      getLessonSections: vi.fn().mockRejectedValue(new Error('no local draft')),
    });
    const apiRepository = createRepositoryStub({
      getLessonSections: vi.fn().mockRejectedValue(new Error('network failed')),
    });

    const repository = new FallbackContentRepository(seedRepository, apiRepository, false, localDraftRepository);
    const sections = await repository.getLessonSections();

    expect(sections[0]?.title).toBe('Seed fallback');
    expect(seedRepository.getLessonSections).toHaveBeenCalledOnce();
  });
});
