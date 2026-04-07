import type { AdminAiLessonDraft } from '../types/admin';

export const lesson1Draft: AdminAiLessonDraft = {
  title: 'Приветствия и прощания',
  description: 'Базовые приветствия, формы вежливости и прощания на армянском языке.',
  sections: [
    {
      title: 'Введение',
      type: 'intro',
      blocks: [
        { type: 'heading', text: 'Приветствия и прощания в армянском языке' },
        {
          type: 'audio',
          sender: 'teacher',
          senderName: 'Лусине',
          text: 'Сегодня разберём основные приветствия и прощания на армянском языке. Начнём с самых простых!',
          duration: 15,
          src: 'https://pub-eda80acf66874b9e9fa764f5722fdf1b.r2.dev/audio1.opus',
        },
      ],
    },
    {
      title: 'Базовые приветствия',
      type: 'vocabulary',
      blocks: [
        { type: 'heading', text: 'Приветствия' },
        { type: 'phrase', russian: 'Барев', armenian: 'Բարև', transcription: 'barev', translation: 'Привет / Здравствуйте', status: 'learned' },
        { type: 'phrase', russian: 'Барев дзез', armenian: 'Բարև ձեզ', transcription: 'barev dzez', translation: 'Здравствуйте', status: 'review' },
        { type: 'phrase', russian: 'Вохджуйн', armenian: 'Ողջույն', transcription: 'voghdjuyn', translation: 'Приветствую!', status: 'new' },
        {
          type: 'audio',
          sender: 'teacher',
          senderName: 'Лусине',
          text: 'Обрати внимание: «Барев дзез» звучит более вежливо и подходит для официального общения.',
          duration: 10,
          src: 'https://pub-eda80acf66874b9e9fa764f5722fdf1b.r2.dev/audio1.opus',
        },
      ],
    },
    {
      title: 'Приветствия по времени суток',
      type: 'vocabulary',
      blocks: [
        { type: 'heading', text: 'Временные приветствия' },
        { type: 'phrase', russian: 'Бари луйс', armenian: 'Բարի լույս', transcription: 'bari luys', translation: 'Доброе утро', status: 'new' },
        { type: 'phrase', russian: 'Бари ор', armenian: 'Բարի օր', transcription: 'bari or', translation: 'Добрый день', status: 'new' },
        { type: 'phrase', russian: 'Бари ереко', armenian: 'Բարի երեկո', transcription: 'bari yereko', translation: 'Добрый вечер', status: 'new' },
        { type: 'text', content: 'Слово «բարի» означает «добрый» и часто используется в вежливых приветствиях.' },
      ],
    },
    {
      title: 'Вопросы при встрече',
      type: 'practice',
      blocks: [
        { type: 'heading', text: 'Как спросить «Как дела?»' },
        { type: 'phrase', russian: 'Вонц эс?', armenian: 'Ոնց ես', transcription: 'vonts es', translation: 'Как ты?', status: 'new' },
        { type: 'phrase', russian: 'Инчпес эк?', armenian: 'Ինչպե՞ս եք', transcription: 'inchpes ek', translation: 'Как Вы?', status: 'new' },
        { type: 'phrase', russian: 'Лав', armenian: 'Լավ', transcription: 'lav', translation: 'Хорошо', status: 'learned' },
        {
          type: 'audio',
          sender: 'teacher',
          senderName: 'Лусине',
          text: '«Вонц эс?» подходит для неформального общения, а «Инчпес эк?» — для вежливого.',
          duration: 10,
          src: 'https://pub-eda80acf66874b9e9fa764f5722fdf1b.r2.dev/audio1.opus',
        },
      ],
    },
    {
      title: 'Прощания',
      type: 'vocabulary',
      blocks: [
        { type: 'heading', text: 'Прощания' },
        { type: 'phrase', russian: 'Цтесутюн', armenian: 'Ցտեսություն', transcription: 'tstesutyun', translation: 'До свидания', status: 'new' },
        { type: 'phrase', russian: 'Арайжм', armenian: 'Առայժմ', transcription: 'arayzhm', translation: 'Пока / До встречи', status: 'new' },
        { type: 'phrase', russian: 'Минч нор андипум', armenian: 'Մինչ նոր հանդիպում', transcription: 'minch nor handipum', translation: 'До новой встречи', status: 'new' },
        { type: 'phrase', russian: 'Мнас баров', armenian: 'ՄՆաս բարով', transcription: 'mnas barov', translation: 'Прощай', status: 'review' },
        { type: 'phrase', russian: 'Мнак баров', armenian: 'ՄՆաք բարով', transcription: 'mnak barov', translation: 'Прощайте', status: 'review' },
        { type: 'phrase', russian: 'Бари гишер', armenian: 'Բարի գիշեր', transcription: 'bari gisher', translation: 'Спокойной ночи', status: 'new' },
      ],
    },
    {
      title: 'Этикет и формы вежливости',
      type: 'grammar',
      blocks: [
        { type: 'heading', text: 'Этикет и особенности' },
        { type: 'phrase', russian: 'Дзез', armenian: 'Ձեզ', transcription: 'dzez', translation: 'Вам / Вас', status: 'new' },
        { type: 'phrase', russian: 'Парон', armenian: 'Պարոն', transcription: 'paron', translation: 'Господин', status: 'new' },
        { type: 'phrase', russian: 'Тикин', armenian: 'Տիկին', transcription: 'tikin', translation: 'Госпожа', status: 'new' },
        {
          type: 'rule',
          title: 'Важно запомнить',
          items: [
            '«Эс» — форма для одного собеседника в неформальном общении.',
            '«Эк» — вежливая форма или обращение к нескольким людям.',
            'В армянском вопросительный и восклицательный знаки ставятся над буквой.',
          ],
        },
        { type: 'phrase', russian: 'Шноракалутюн', armenian: 'Շնորհակալություն', transcription: 'shnorhakalutyun', translation: 'Спасибо', status: 'learned' },
        { type: 'phrase', russian: 'Хндрем', armenian: 'Խնդրեմ', transcription: 'khndrem', translation: 'Пожалуйста', status: 'learned' },
      ],
    },
    {
      title: 'Итог урока',
      type: 'review',
      blocks: [
        {
          type: 'audio',
          sender: 'teacher',
          senderName: 'Лусине',
          text: 'Отлично! Теперь ты знаешь базовые приветствия, прощания и формы вежливости. Повтори их ещё раз перед следующим уроком.',
          duration: 18,
          src: 'https://pub-eda80acf66874b9e9fa764f5722fdf1b.r2.dev/audio1.opus',
        },
        {
          type: 'text',
          content: 'После этого урока ученик должен уметь поздороваться, попрощаться и задать простой вопрос при встрече.',
        },
      ],
    },
  ],
};
