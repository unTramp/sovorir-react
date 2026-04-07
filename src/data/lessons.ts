import { lesson1Draft } from './lesson1Draft';
import type { Lesson } from '../types/lesson';

export const lessons: Lesson[] = [
  {
    id: 1,
    title: lesson1Draft.title,
    icon: '\u{1F4D6}',
    status: 'current',
    sections: lesson1Draft.sections.map((section, index) => ({
      id: `s1-${index + 1}`,
      title: section.title,
      type: 'lesson',
      icon: '\u{1F4C4}',
      status: index === 0 ? 'in-progress' : 'pending',
    })),
  },
  {
    id: 2,
    title: 'Армянский алфавит',
    icon: '\u{1F4D6}',
    status: 'locked',
    sections: [
      { id: 's2-1', title: 'Гласные буквы', type: 'lesson', icon: '\u{1F4C4}', status: 'locked' },
      { id: 's2-2', title: 'Согласные буквы', type: 'lesson', icon: '\u{1F4C4}', status: 'locked' },
      { id: 's2-3', title: 'Произношение', type: 'audio', icon: '\u{1F3A7}', status: 'locked' },
      { id: 's2-4', title: 'Словарь: Алфавит', type: 'dictionary', icon: '\u{1F4D8}', status: 'locked' },
    ],
  },
  {
    id: 3,
    title: 'Чтение и произношение',
    icon: '\u{1F4D6}',
    status: 'locked',
    sections: [
      { id: 's3-1', title: 'Материалы для чтения', type: 'lesson', icon: '\u{1F4C4}', status: 'locked' },
      { id: 's3-2', title: 'Аудио от преподавателя', type: 'audio', icon: '\u{1F3A7}', status: 'locked' },
      { id: 's3-3', title: 'Словарь урока', type: 'dictionary', icon: '\u{1F4D8}', status: 'locked' },
      { id: 's3-4', title: 'Заметки преподавателя', type: 'notes', icon: '\u{1F4DD}', status: 'locked' },
    ],
  },
  {
    id: 4,
    title: 'Числа и счёт',
    icon: '\u{1F4D6}',
    status: 'locked',
    sections: [
      { id: 's4-1', title: 'Числа от 1 до 100', type: 'lesson', icon: '\u{1F4C4}', status: 'locked' },
      { id: 's4-2', title: 'Произношение чисел', type: 'audio', icon: '\u{1F3A7}', status: 'locked' },
      { id: 's4-3', title: 'Словарь: Числа', type: 'dictionary', icon: '\u{1F4D8}', status: 'locked' },
    ],
  },
  {
    id: 5,
    title: 'Семья и родство',
    icon: '\u{1F4D6}',
    status: 'locked',
    sections: [
      { id: 's5-1', title: 'Члены семьи', type: 'lesson', icon: '\u{1F4C4}', status: 'locked' },
      { id: 's5-2', title: 'Диалоги о семье', type: 'audio', icon: '\u{1F3A7}', status: 'locked' },
      { id: 's5-3', title: 'Словарь: Семья', type: 'dictionary', icon: '\u{1F4D8}', status: 'locked' },
      { id: 's5-4', title: 'Заметки', type: 'notes', icon: '\u{1F4DD}', status: 'locked' },
    ],
  },
];
