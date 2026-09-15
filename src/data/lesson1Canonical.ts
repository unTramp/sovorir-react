import type { LearningItem, Lesson, MediaAsset } from '../domain/learning';

const placeholderAudioUrl = 'https://pub-eda80acf66874b9e9fa764f5722fdf1b.r2.dev/audio1.opus';

const audio = (id: string, durationMs = 4000): MediaAsset => ({
  id,
  url: placeholderAudioUrl,
  mimeType: 'audio/ogg; codecs=opus',
  durationMs,
});

export const lesson1LearningItems: LearningItem[] = [
  {
    id: '0e4f97bb-9e24-4fbb-8f88-c44a3ff6e710', revision: 1, type: 'phrase',
    armenian: 'Բարև', transliteration: 'barev', translation: 'Привет',
    audio: { normal: audio('33459936-7627-44ea-9ff5-30f5f1d492ad') },
    contexts: ['👥 Друзья / знакомые'], register: 'informal', difficulty: 1,
    tags: ['greeting', 'informal'], reviewable: true,
  },
  {
    id: '59400459-0a85-4d9a-b46b-a2d75d930b40', revision: 1, type: 'phrase',
    armenian: 'Բարև ձեզ', transliteration: 'barev dzez', translation: 'Здравствуйте',
    audio: { normal: audio('7452626a-6bb0-41d8-b7be-c06a29c90c82') },
    contexts: ['👔 Вежливо / незнакомые / старшие'], register: 'polite', difficulty: 1,
    tags: ['greeting', 'polite'], reviewable: true,
  },
  {
    id: '8570f017-9ac9-40d0-85bb-02d2c7ff22cd', revision: 1, type: 'phrase',
    armenian: 'Ցտեսություն', transliteration: 'stesityun', translation: 'До свидания',
    audio: { normal: audio('efae8ce6-1de4-4c88-88d8-2578aab868e5') },
    contexts: ['👔 Формально'], register: 'formal', difficulty: 1,
    tags: ['goodbye', 'formal'], reviewable: true,
  },
  {
    id: '94577364-0721-42ed-a1ec-2771af2a1aa0', revision: 1, type: 'phrase',
    armenian: 'Առայժմ', transliteration: 'arayzhm', translation: 'Пока / До скорого',
    audio: { normal: audio('4d877191-0dde-446a-bbc6-4b961954d6f4') },
    contexts: ['👥 Неформально'], register: 'informal', difficulty: 1,
    tags: ['goodbye', 'informal'], reviewable: true,
  },
];

const [barev, barevDzez, stesityun, arayzhm] = lesson1LearningItems;

export const lesson1Canonical: Lesson = {
  schemaVersion: 1,
  id: 'dd473bdf-f7a8-4560-aaff-1778d4ba6705',
  courseId: '9e303fe3-6f52-42cc-bc80-323d30e21f86',
  slug: 'greetings-and-goodbyes',
  revision: 1,
  title: 'Поздороваться и попрощаться',
  description: 'Начните и завершите короткий разговор в ереванском кафе.',
  level: 'A0',
  estimatedMinutes: 8,
  outcomes: ['Поздороваться неформально', 'Поздороваться вежливо', 'Попрощаться формально', 'Попрощаться с друзьями'],
  learningItemIds: lesson1LearningItems.map((item) => item.id),
  status: 'published',
  steps: [
    {
      id: 'c7bf4554-3d4c-44f6-bf91-0fc1e82ec937', revision: 1, order: 1, type: 'context',
      title: 'Утро в ереванском кафе', objective: 'Понять ситуацию и услышать живую армянскую речь.',
      learningItemIds: [], interactions: [], completion: { mode: 'viewed' },
      content: [
        {
          id: 'bf9d48f1-9937-4ac5-aede-921b177552fa', type: 'mentor-bubble',
          text: 'Представьте: утром вы заходите в небольшое кафе в Ереване. Ани за стойкой улыбается и здоровается. Сейчас научимся естественно ответить ей — и правильно попрощаться перед уходом.',
          audio: audio('38c43ae8-5632-4553-a247-e3a24d83f215', 15000),
        },
        { id: 'dc89109e-4444-4a68-80ba-972ed880e8c2', type: 'text', variant: 'instruction', text: 'Сначала поймайте смысл и интонацию. Запоминать всё с первого раза не нужно.' },
      ],
    },
    {
      id: '8f7144cc-65eb-426f-a1c9-c1eeec320938', revision: 1, order: 2, type: 'phrase-intro',
      title: 'Четыре фразы', objective: 'Различать формальное и неформальное приветствие и прощание.',
      learningItemIds: lesson1LearningItems.map((item) => item.id), interactions: [], completion: { mode: 'viewed' },
      content: lesson1LearningItems.map((item) => ({ id: `f${item.id.slice(1)}`, type: 'learning-item' as const, itemId: item.id, variant: 'phrase-card' as const })),
    },
    {
      id: '973711e6-3157-4c63-94fe-27f4916099ee', revision: 1, order: 3, type: 'listen-repeat',
      title: 'Слушаем и повторяем', objective: 'Произнести четыре фразы вслед за Лусине.', content: [],
      learningItemIds: lesson1LearningItems.map((item) => item.id),
      interactions: lesson1LearningItems.map((item, index) => ({
        id: ['a47ddb3f-ed6e-4b26-91b7-45b38f43fd71', '52c58827-ff58-4465-ad05-a9e88a5c30d0', '9e36ee93-280d-44b1-87d2-d82793ad5a73', '2ace8735-1cdd-456a-b980-f7b982f8257d'][index],
        revision: 1, type: 'listen-repeat' as const,
        prompt: `Повторите спокойно: ${item.armenian}`,
        referenceAudio: item.audio?.normal, recordingMode: 'tap-to-record' as const,
        minimumAttempts: 1, allowComparison: true, required: true,
        learningItemIds: [item.id], analyticsKey: `lesson.greetings.repeat.${item.tags[0]}.${item.register}`,
      })),
      completion: { mode: 'all-required', requiredInteractionIds: ['a47ddb3f-ed6e-4b26-91b7-45b38f43fd71', '52c58827-ff58-4465-ad05-a9e88a5c30d0', '9e36ee93-280d-44b1-87d2-d82793ad5a73', '2ace8735-1cdd-456a-b980-f7b982f8257d'] },
    },
    {
      id: '0418594e-daad-4208-a6b2-4aa76235d9a9', revision: 1, order: 4, type: 'dialogue',
      title: 'Разговор с Ани', objective: 'Выбрать уместные реплики в начале и конце разговора.', content: [],
      learningItemIds: lesson1LearningItems.map((item) => item.id),
      interactions: [
        {
          id: '91172a40-15a2-49ca-abce-36ed2c250155', revision: 1, type: 'dialogue', required: true,
          learningItemIds: [barevDzez.id], analyticsKey: 'lesson.greetings.dialogue.hello',
          context: 'Вы вошли в кафе. Ответьте Ани вежливо.', responseMode: 'choice',
          turns: [{ id: '0c94f98c-2b5c-4224-b559-df96283cf9ec', speaker: 'character', text: 'Բարև ձեզ։' }],
          options: [
            { id: '53e11f07-547b-4b94-b4a0-40c49af433c8', text: barevDzez.armenian, correct: true, feedback: 'Верно: с незнакомым человеком выбираем вежливую форму.', reply: 'Բարի գալուստ։' },
            { id: '51f40e1a-1146-4348-b785-ebd78644a92b', text: barev.armenian, correct: false, feedback: '«Բարև» подходит друзьям. Ани вы пока не знаете — попробуйте вежливую форму.' },
            { id: '8f976009-5831-4125-be20-a96851fc64d3', text: stesityun.armenian, correct: false, feedback: 'Это формальное прощание, а разговор только начинается.' },
          ],
        },
        {
          id: '2df14770-3e8a-42f0-a732-f66e75a2951a', revision: 1, type: 'dialogue', required: true,
          learningItemIds: [arayzhm.id], analyticsKey: 'lesson.greetings.dialogue.goodbye',
          context: 'Вы встретили в кафе знакомого и уже уходите. Попрощайтесь неформально.', responseMode: 'choice',
          turns: [{ id: 'b62c3022-b284-4f41-95c6-54fd62018f96', speaker: 'character', text: 'Ուրախ էի քեզ տեսնել։' }],
          options: [
            { id: 'aef46e36-faf6-4429-bd50-c4899138d122', text: arayzhm.armenian, correct: true, feedback: 'Отлично: со знакомым естественно сказать «Առայժմ».', reply: 'Առայժմ։' },
            { id: '930940e3-911f-438d-9fd5-b09702ef9b46', text: stesityun.armenian, correct: false, feedback: 'Так можно, но это звучит формальнее. Для знакомого выберите тёплую неформальную фразу.' },
            { id: 'b400e7c4-ec21-4a23-92bd-f458499471f2', text: barevDzez.armenian, correct: false, feedback: 'Это приветствие. Сейчас вам нужна фраза для прощания.' },
          ],
        },
      ],
      completion: { mode: 'all-required', requiredInteractionIds: ['91172a40-15a2-49ca-abce-36ed2c250155', '2df14770-3e8a-42f0-a732-f66e75a2951a'] },
    },
    {
      id: '81d3f8a4-3d95-46a0-8fab-b3b2bcc876b5', revision: 1, order: 5, type: 'active-recall',
      title: 'Теперь без подсказки', objective: 'Вспомнить четыре фразы без готовых вариантов.', content: [],
      learningItemIds: lesson1LearningItems.map((item) => item.id),
      interactions: lesson1LearningItems.map((item, index) => ({
        id: ['67895208-982f-466c-90ba-7dcf2498014f', '93604e4a-21ee-4b73-83a1-9a6e2a45849b', '8eebd760-7e9f-40f7-9a02-da8413c0bb01', '3b841db3-2f78-41e0-8818-b43e70129216'][index],
        revision: 1, type: 'recall' as const, required: true, learningItemIds: [item.id],
        analyticsKey: `lesson.greetings.recall.${item.tags[0]}.${item.register}`,
        prompt: [
          'Вы встретили знакомого. Поздоровайтесь неформально.',
          'Вы входите в кафе. Поздоровайтесь с Ани вежливо.',
          'Вы уходите с официальной встречи. Попрощайтесь.',
          'Вы прощаетесь с другом. Скажите «пока».',
        ][index],
        responseMode: 'self-report' as const,
        hint: { type: 'text' as const, text: `Вспомните звучание: ${item.transliteration}` }, evaluation: 'self-report' as const,
      })),
      completion: { mode: 'all-required', requiredInteractionIds: ['67895208-982f-466c-90ba-7dcf2498014f', '93604e4a-21ee-4b73-83a1-9a6e2a45849b', '8eebd760-7e9f-40f7-9a02-da8413c0bb01', '3b841db3-2f78-41e0-8818-b43e70129216'] },
    },
  ],
};
