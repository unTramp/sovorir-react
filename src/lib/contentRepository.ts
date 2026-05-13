import { apiClient, isMockApiEnabled } from './apiClient';
import type { LessonContentSection } from '../types/lessonContent';
import type { DictionaryWord } from '../types/dictionary';
import type { Quiz } from '../types/quiz';
import type { LiveLesson, ConversationClubSession } from '../types/liveLesson';
import type { Lesson, Section, SectionStatus, SectionType } from '../types/lesson';
import { lessonPages } from '../data/lessonPages';
import { dictionary } from '../data/dictionary';
import { liveLessons } from '../data/liveLessons';
import { conversationClubs } from '../data/conversationClubs';
import { lessons as staticLessons } from '../data/lessons';
import { generateQuizForPage } from './quizGenerator';
import { todayISO } from './dateUtils';
import {
  getSyncedAdminLessonsCatalog,
  getSyncedAdminLessonSections,
} from './adminLessonBuilderStorage';

export interface ContentRepository {
  getLessonSections(): Promise<LessonContentSection[]>;
  getDictionary(): Promise<DictionaryWord[]>;
  getQuizForSection(sectionId: number): Promise<Quiz | null>;
  getLiveLessons(): Promise<LiveLesson[]>;
  getConversationClubs(): Promise<ConversationClubSession[]>;
  getFlashcardWords(): Promise<DictionaryWord[]>;
  getLessons(): Promise<Lesson[]>;
}

interface ApiCourse {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiLessonSectionSummary {
  id: string;
  lessonId: string;
  orderIndex: number;
  type: string;
  title: string;
  createdAt: string;
  completed: boolean;
}

interface ApiCourseLesson {
  id: string;
  courseId: string;
  orderIndex: number;
  title: string;
  slug: string | null;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  createdAt: string;
  totalSections: number;
  completedSections: number;
  sections: ApiLessonSectionSummary[];
}

interface ApiLessonBlock {
  id: string;
  sectionId: string;
  orderIndex: number;
  type: LessonContentSection['blocks'][number]['type'];
  content: LessonContentSection['blocks'][number];
  createdAt: string;
}

interface ApiLessonDetail {
  id: string;
  courseId: string;
  orderIndex: number;
  title: string;
  slug: string | null;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  createdAt: string;
  sections: Array<{
    id: string;
    lessonId: string;
    orderIndex: number;
    type: string;
    title: string;
    content: Record<string, unknown> | null;
    createdAt: string;
    blocks: ApiLessonBlock[];
    progress: { completed: boolean } | null;
  }>;
}

interface CatalogSnapshot {
  lessons: Lesson[];
  currentLessonApiId: string | null;
}

class MissingContentSourceError extends Error {
  constructor(message = 'Локальный источник контента недоступен') {
    super(message);
    this.name = 'MissingContentSourceError';
  }
}

function sectionTypeToNavType(type: string): SectionType {
  switch (type) {
    case 'dictionary':
      return 'dictionary';
    case 'notes':
      return 'notes';
    case 'video':
      return 'video';
    case 'ai_practice':
      return 'practice';
    default:
      return 'lesson';
  }
}

function iconForSectionType(type: SectionType) {
  switch (type) {
    case 'dictionary':
      return '\u{1F4D8}';
    case 'notes':
      return '\u{1F4DD}';
    case 'video':
      return '\u{1F3AC}';
    case 'practice':
      return '\u{26A1}';
    case 'audio':
      return '\u{1F3A7}';
    default:
      return '\u{1F4C4}';
  }
}

function deriveLessonStatuses(lessons: ApiCourseLesson[]) {
  const currentIndex = lessons.findIndex((lesson) => lesson.completedSections < lesson.totalSections);

  return lessons.map((_, index) => {
    if (currentIndex === -1) return 'completed' as const;
    if (index < currentIndex) return 'completed' as const;
    if (index === currentIndex) return 'current' as const;
    return 'locked' as const;
  });
}

function deriveSectionStatuses(
  sections: ApiLessonSectionSummary[],
  lessonStatus: Lesson['status'],
): SectionStatus[] {
  if (lessonStatus === 'completed') {
    return sections.map(() => 'completed');
  }

  if (lessonStatus === 'locked') {
    return sections.map(() => 'locked');
  }

  const firstIncompleteIndex = sections.findIndex((section) => !section.completed);

  return sections.map((section, index) => {
    if (section.completed) return 'completed';
    if (firstIncompleteIndex === -1) return 'completed';
    if (index === firstIncompleteIndex) return 'in-progress';
    return 'pending';
  });
}

function mapApiLessonsToFrontend(apiLessons: ApiCourseLesson[]): CatalogSnapshot {
  const ordered = apiLessons
    .filter((lesson) => lesson.status === 'published')
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const lessonStatuses = deriveLessonStatuses(ordered);

  const lessons = ordered.map<Lesson>((lesson, lessonIndex) => {
    const sectionStatuses = deriveSectionStatuses(lesson.sections, lessonStatuses[lessonIndex]);

    return {
      id: lessonIndex + 1,
      title: lesson.title,
      icon: '\u{1F4D6}',
      status: lessonStatuses[lessonIndex],
      sections: lesson.sections.map<Section>((section, sectionIndex) => {
        const navType = sectionTypeToNavType(section.type);
        return {
          id: section.id,
          title: section.title,
          type: navType,
          icon: iconForSectionType(navType),
          status: sectionStatuses[sectionIndex],
        };
      }),
    };
  });

  const currentLessonIndex = lessons.findIndex((lesson) => lesson.status === 'current');
  const currentLessonApiId = currentLessonIndex >= 0 ? ordered[currentLessonIndex]?.id ?? null : ordered[0]?.id ?? null;

  return {
    lessons,
    currentLessonApiId,
  };
}

function sortSections<T extends { orderIndex: number }>(sections: T[]) {
  return sections.slice().sort((a, b) => a.orderIndex - b.orderIndex);
}

export class SeedContentRepository implements ContentRepository {
  getLessonSections(): Promise<LessonContentSection[]> {
    return Promise.resolve(lessonPages);
  }

  getDictionary(): Promise<DictionaryWord[]> {
    return Promise.resolve(dictionary);
  }

  getQuizForSection(sectionId: number): Promise<Quiz | null> {
    const section = lessonPages.find((item) => item.id === sectionId);
    if (!section || !section.quizId) return Promise.resolve(null);
    return Promise.resolve(generateQuizForPage(section, dictionary));
  }

  getLiveLessons(): Promise<LiveLesson[]> {
    const today = todayISO();
    return Promise.resolve(liveLessons.filter((lesson) => lesson.date >= today));
  }

  getConversationClubs(): Promise<ConversationClubSession[]> {
    const today = todayISO();
    return Promise.resolve(conversationClubs.filter((club) => club.date >= today));
  }

  getFlashcardWords(): Promise<DictionaryWord[]> {
    return Promise.resolve(dictionary);
  }

  getLessons(): Promise<Lesson[]> {
    return Promise.resolve(staticLessons);
  }
}

export class LocalAdminDraftContentRepository implements ContentRepository {
  private readonly seedRepository: ContentRepository;

  constructor(seedRepository: ContentRepository = new SeedContentRepository()) {
    this.seedRepository = seedRepository;
  }

  private requireSections() {
    const sections = getSyncedAdminLessonSections();
    if (!sections) {
      throw new MissingContentSourceError();
    }
    return sections;
  }

  private requireLessons() {
    const lessons = getSyncedAdminLessonsCatalog();
    if (!lessons) {
      throw new MissingContentSourceError();
    }
    return lessons;
  }

  getLessonSections(): Promise<LessonContentSection[]> {
    return Promise.resolve(this.requireSections());
  }

  getDictionary(): Promise<DictionaryWord[]> {
    return this.seedRepository.getDictionary();
  }

  getQuizForSection(sectionId: number): Promise<Quiz | null> {
    const section = this.requireSections().find((item) => item.id === sectionId);
    if (!section || !section.quizId) return Promise.resolve(null);
    return Promise.resolve(generateQuizForPage(section, dictionary));
  }

  getLiveLessons(): Promise<LiveLesson[]> {
    return this.seedRepository.getLiveLessons();
  }

  getConversationClubs(): Promise<ConversationClubSession[]> {
    return this.seedRepository.getConversationClubs();
  }

  getFlashcardWords(): Promise<DictionaryWord[]> {
    return this.seedRepository.getFlashcardWords();
  }

  getLessons(): Promise<Lesson[]> {
    return Promise.resolve(this.requireLessons());
  }
}

export class ApiContentRepository implements ContentRepository {
  private catalogCache: CatalogSnapshot | null = null;
  private currentSectionsCache: LessonContentSection[] | null = null;

  private async loadCatalog(): Promise<CatalogSnapshot> {
    if (this.catalogCache) {
      return this.catalogCache;
    }

    const courses = await apiClient.get<ApiCourse[]>('/courses');
    const activeCourse = courses.find((course) => course.isActive) ?? courses[0];
    if (!activeCourse) {
      this.catalogCache = { lessons: [], currentLessonApiId: null };
      return this.catalogCache;
    }

    const apiLessons = await apiClient.get<ApiCourseLesson[]>(`/courses/${activeCourse.id}/lessons`);
    this.catalogCache = mapApiLessonsToFrontend(apiLessons);
    return this.catalogCache;
  }

  private async loadCurrentLessonSections(): Promise<LessonContentSection[]> {
    if (this.currentSectionsCache) {
      return this.currentSectionsCache;
    }

    const catalog = await this.loadCatalog();
    if (!catalog.currentLessonApiId) {
      this.currentSectionsCache = [];
      return this.currentSectionsCache;
    }

    const detail = await apiClient.get<ApiLessonDetail>(`/lessons/${catalog.currentLessonApiId}`);
    this.currentSectionsCache = sortSections(detail.sections).map((section, index) => ({
      id: index + 1,
      apiId: section.id,
      title: section.title,
      quizId:
        typeof section.content?.quizId === 'string'
          ? section.content.quizId
          : undefined,
      blocks: sortSections(section.blocks).map((block) => block.content),
    }));
    return this.currentSectionsCache;
  }

  async getLessonSections(): Promise<LessonContentSection[]> {
    return this.loadCurrentLessonSections();
  }

  getDictionary(): Promise<DictionaryWord[]> {
    return Promise.resolve(dictionary);
  }

  async getQuizForSection(sectionId: number): Promise<Quiz | null> {
    const sections = await this.loadCurrentLessonSections();
    const section = sections.find((item) => item.id === sectionId);
    if (!section || !section.quizId) return null;
    return generateQuizForPage(section, dictionary);
  }

  getLiveLessons(): Promise<LiveLesson[]> {
    const today = todayISO();
    return Promise.resolve(liveLessons.filter((lesson) => lesson.date >= today));
  }

  getConversationClubs(): Promise<ConversationClubSession[]> {
    const today = todayISO();
    return Promise.resolve(conversationClubs.filter((club) => club.date >= today));
  }

  getFlashcardWords(): Promise<DictionaryWord[]> {
    return Promise.resolve(dictionary);
  }

  async getLessons(): Promise<Lesson[]> {
    const catalog = await this.loadCatalog();
    return catalog.lessons;
  }
}

export const seedContentRepository = new SeedContentRepository();
export const staticContentRepository = seedContentRepository;
export const localAdminDraftContentRepository = new LocalAdminDraftContentRepository(seedContentRepository);
export const apiContentRepository = new ApiContentRepository();

export class FallbackContentRepository implements ContentRepository {
  private readonly seedRepository: ContentRepository;
  private readonly apiRepository: ContentRepository;
  private readonly localDraftRepository: ContentRepository;
  private readonly mockApiEnabled: boolean;

  constructor(
    seedRepository: ContentRepository = seedContentRepository,
    apiRepository: ContentRepository = apiContentRepository,
    mockApiEnabled: boolean = isMockApiEnabled,
    localDraftRepository: ContentRepository = localAdminDraftContentRepository,
  ) {
    this.seedRepository = seedRepository;
    this.apiRepository = apiRepository;
    this.mockApiEnabled = mockApiEnabled;
    this.localDraftRepository = localDraftRepository;
  }

  private async readFromLocalDraftOrSeed<T>(
    read: (repository: ContentRepository) => Promise<T>,
  ): Promise<T> {
    try {
      return await read(this.localDraftRepository);
    } catch {
      return read(this.seedRepository);
    }
  }

  async getLessonSections() {
    if (this.mockApiEnabled) {
      return this.readFromLocalDraftOrSeed((repository) => repository.getLessonSections());
    }
    try {
      return await this.apiRepository.getLessonSections();
    } catch {
      return this.readFromLocalDraftOrSeed((repository) => repository.getLessonSections());
    }
  }

  getDictionary() {
    return this.seedRepository.getDictionary();
  }

  async getQuizForSection(sectionId: number) {
    if (this.mockApiEnabled) {
      return this.readFromLocalDraftOrSeed((repository) => repository.getQuizForSection(sectionId));
    }
    try {
      return await this.apiRepository.getQuizForSection(sectionId);
    } catch {
      return this.readFromLocalDraftOrSeed((repository) => repository.getQuizForSection(sectionId));
    }
  }

  getLiveLessons() {
    return this.seedRepository.getLiveLessons();
  }

  getConversationClubs() {
    return this.seedRepository.getConversationClubs();
  }

  getFlashcardWords() {
    return this.seedRepository.getFlashcardWords();
  }

  async getLessons() {
    if (this.mockApiEnabled) {
      return this.readFromLocalDraftOrSeed((repository) => repository.getLessons());
    }
    try {
      return await this.apiRepository.getLessons();
    } catch {
      return this.readFromLocalDraftOrSeed((repository) => repository.getLessons());
    }
  }
}

export const contentRepository: ContentRepository = new FallbackContentRepository();
