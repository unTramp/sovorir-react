import type { LessonPage } from '../types/lessonContent';
import type { DictionaryWord } from '../types/dictionary';
import type { Quiz } from '../types/quiz';
import type { LiveLesson, ConversationClubSession } from '../types/liveLesson';
import type { Lesson } from '../types/lesson';
import { lessonPages } from '../data/lessonPages';
import { dictionary } from '../data/dictionary';
import { liveLessons } from '../data/liveLessons';
import { conversationClubs } from '../data/conversationClubs';
import { lessons } from '../data/lessons';
import { generateQuizForPage } from './quizGenerator';
import { todayISO } from './dateUtils';

export interface ContentRepository {
  getLessonPages(): Promise<LessonPage[]>;
  getDictionary(): Promise<DictionaryWord[]>;
  getQuizForPage(pageId: number): Promise<Quiz | null>;
  getLiveLessons(): Promise<LiveLesson[]>;
  getConversationClubs(): Promise<ConversationClubSession[]>;
  getFlashcardWords(): Promise<DictionaryWord[]>;
  getLessons(): Promise<Lesson[]>;
}

class StaticContentRepository implements ContentRepository {
  getLessonPages(): Promise<LessonPage[]> {
    return Promise.resolve(lessonPages);
  }

  getDictionary(): Promise<DictionaryWord[]> {
    return Promise.resolve(dictionary);
  }

  getQuizForPage(pageId: number): Promise<Quiz | null> {
    const page = lessonPages.find((p) => p.id === pageId);
    if (!page) return Promise.resolve(null);
    return Promise.resolve(generateQuizForPage(page, dictionary));
  }

  getLiveLessons(): Promise<LiveLesson[]> {
    const today = todayISO();
    return Promise.resolve(liveLessons.filter((l) => l.date >= today));
  }

  getConversationClubs(): Promise<ConversationClubSession[]> {
    const today = todayISO();
    return Promise.resolve(conversationClubs.filter((c) => c.date >= today));
  }

  getFlashcardWords(): Promise<DictionaryWord[]> {
    return Promise.resolve(dictionary);
  }

  getLessons(): Promise<Lesson[]> {
    return Promise.resolve(lessons);
  }
}

export const contentRepository: ContentRepository = new StaticContentRepository();
