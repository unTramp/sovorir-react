import type { AdminAiLessonDraft } from '../types/admin';

const mentorAudio = 'https://pub-eda80acf66874b9e9fa764f5722fdf1b.r2.dev/audio1.opus';

export const lesson1Reference: AdminAiLessonDraft = {
  title: 'Поздороваться и попрощаться',
  description: 'После урока вы сможете начать и закончить короткий разговор в Ереване.',
  sections: [
    {
      title: 'Утро в ереванском кафе',
      type: 'intro',
      blocks: [
        {
          type: 'audio',
          sender: 'teacher',
          senderName: 'Лусине',
          text: 'Представьте: утром вы заходите в небольшое кафе в Ереване. Бариста улыбается и здоровается. Сейчас разберём три фразы, которых достаточно, чтобы уверенно ответить.',
          duration: 15,
          src: mentorAudio,
        },
        { type: 'text', content: 'Сначала поймайте интонацию. Запоминать всё с первого раза не нужно.' },
      ],
    },
    {
      title: 'Три фразы для разговора',
      type: 'vocabulary',
      blocks: [
        { type: 'phrase', id: 'w1', russian: 'Барев', armenian: 'Բարև', transcription: 'barev', translation: 'Привет', context: 'С друзьями и знакомыми', reviewable: true, audioSrc: mentorAudio },
        { type: 'phrase', id: 'greeting-polite', russian: 'Барев дзез', armenian: 'Բարև ձեզ', transcription: 'barev dzez', translation: 'Здравствуйте', context: 'Вежливо · с незнакомыми и старшими', reviewable: true, audioSrc: mentorAudio },
        { type: 'phrase', id: 'goodbye-neutral', russian: 'Цтесутюн', armenian: 'Ցտեսություն', transcription: 'tstesutyun', translation: 'До свидания', context: 'Нейтральное прощание', reviewable: true, audioSrc: mentorAudio },
        {
          type: 'audio',
          sender: 'teacher',
          senderName: 'Лусине',
          text: 'С незнакомым человеком лучше сказать «Барев дзез». Короткое «Барев» оставьте для друзей и знакомых.',
          duration: 11,
          src: mentorAudio,
        },
      ],
    },
    {
      title: 'Слушаем и повторяем',
      type: 'speaking',
      blocks: [
        { type: 'phrase', id: 'w1', russian: 'Барев', armenian: 'Բարև', transcription: 'barev', translation: 'Привет', audioSrc: mentorAudio },
        { type: 'pronunciationPrompt', prompt: 'Скажите спокойно: Բարև' },
        { type: 'phrase', id: 'greeting-polite', russian: 'Барев дзез', armenian: 'Բարև ձեզ', transcription: 'barev dzez', translation: 'Здравствуйте', audioSrc: mentorAudio },
        { type: 'pronunciationPrompt', prompt: 'Теперь вежливо: Բարև ձեզ' },
        { type: 'phrase', id: 'goodbye-neutral', russian: 'Цтесутюн', armenian: 'Ցտեսություն', transcription: 'tstesutyun', translation: 'До свидания', audioSrc: mentorAudio },
        { type: 'pronunciationPrompt', prompt: 'И прощание: Ցտեսություն' },
      ],
    },
    {
      title: 'Короткий разговор',
      type: 'practice',
      blocks: [
        {
          type: 'dialogue',
          characterName: 'Ани',
          characterRole: 'бариста',
          message: 'Բարև ձեզ։',
          instruction: 'Вы вошли в кафе. Ответьте Ани вежливо.',
          options: [
            { id: 'polite', text: 'Բարև ձեզ։', translation: 'Здравствуйте.', correct: true, reply: 'Ի՞նչ կցանկանաք։' },
            { id: 'goodbye', text: 'Ցտեսություն։', translation: 'До свидания.', correct: false, reply: '' },
          ],
        },
      ],
    },
    {
      title: 'Теперь без подсказки',
      type: 'review',
      blocks: [
        {
          type: 'activeRecall',
          prompt: 'Вы входите в кафе. Поздоровайтесь вежливо.',
          hint: 'Начните с «Барев…»',
          answer: { armenian: 'Բարև ձեզ։', transcription: 'barev dzez', translation: 'Здравствуйте.' },
          reviewIds: ['greeting-polite'],
        },
        {
          type: 'activeRecall',
          prompt: 'Вы уходите из кафе. Попрощайтесь нейтрально.',
          hint: 'Фраза начинается со звука «цт…»',
          answer: { armenian: 'Ցտեսություն։', transcription: 'tstesutyun', translation: 'До свидания.' },
          reviewIds: ['w1', 'goodbye-neutral'],
        },
      ],
    },
  ],
};
