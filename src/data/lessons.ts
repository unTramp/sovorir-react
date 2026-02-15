import type { Lesson } from '../types/lesson';

export const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Армянский алфавит',
    icon: '\u{1F4D6}',
    status: 'completed',
    sections: [
      { id: 's1-1', title: 'Гласные буквы', type: 'pdf', icon: '\u{1F4C4}', status: 'completed' },
      { id: 's1-2', title: 'Согласные буквы', type: 'pdf', icon: '\u{1F4C4}', status: 'completed' },
      { id: 's1-3', title: 'Произношение', type: 'audio', icon: '\u{1F3A7}', status: 'completed' },
      { id: 's1-4', title: 'Словарь: Алфавит', type: 'dictionary', icon: '\u{1F4D8}', status: 'completed' },
    ],
  },
  {
    id: 2,
    title: 'Приветствия и знакомство',
    icon: '\u{1F4D6}',
    status: 'completed',
    sections: [
      { id: 's2-1', title: 'Диалоги', type: 'pdf', icon: '\u{1F4C4}', status: 'completed' },
      { id: 's2-2', title: 'Аудио диалоги', type: 'audio', icon: '\u{1F3A7}', status: 'completed' },
      { id: 's2-3', title: 'Словарь: Приветствия', type: 'dictionary', icon: '\u{1F4D8}', status: 'completed' },
      { id: 's2-4', title: 'Заметки', type: 'notes', icon: '\u{1F4DD}', status: 'completed' },
    ],
  },
  {
    id: 3,
    title: 'Чтение и произношение',
    icon: '\u{1F4D6}',
    status: 'current',
    sections: [
      { id: 's3-0', title: 'Видео преподавателя', type: 'video', icon: '\u{1F3AC}', status: 'completed' },
      { id: 's3-1', title: 'Материалы для чтения', type: 'pdf', icon: '\u{1F4C4}', status: 'completed' },
      { id: 's3-2', title: 'Аудио от преподавателя', type: 'audio', icon: '\u{1F3A7}', status: 'completed' },
      { id: 's3-3', title: 'Словарь урока', type: 'dictionary', icon: '\u{1F4D8}', status: 'in-progress' },
      { id: 's3-4', title: 'Заметки преподавателя', type: 'notes', icon: '\u{1F4DD}', status: 'pending' },
    ],
  },
  {
    id: 4,
    title: 'Числа и счёт',
    icon: '\u{1F4D6}',
    status: 'locked',
    sections: [
      { id: 's4-1', title: 'Числа от 1 до 100', type: 'pdf', icon: '\u{1F4C4}', status: 'locked' },
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
      { id: 's5-1', title: 'Члены семьи', type: 'pdf', icon: '\u{1F4C4}', status: 'locked' },
      { id: 's5-2', title: 'Диалоги о семье', type: 'audio', icon: '\u{1F3A7}', status: 'locked' },
      { id: 's5-3', title: 'Словарь: Семья', type: 'dictionary', icon: '\u{1F4D8}', status: 'locked' },
      { id: 's5-4', title: 'Заметки', type: 'notes', icon: '\u{1F4DD}', status: 'locked' },
    ],
  },
];
