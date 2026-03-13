import type { LessonPage } from '../types/lessonContent';

export const lessonPages: LessonPage[] = [
  {
    id: 1,
    blocks: [
      { type: 'heading', text: 'Приветствия и прощания в армянском языке' },

      { type: 'heading', text: 'Приветствия' },
      { type: 'phrase', russian: 'Барев', armenian: '\u0532\u0561\u0580\u0587', transcription: 'barev', translation: '\u00ab\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u00bb \u0438\u043b\u0438 \u00ab\u041f\u0440\u0438\u0432\u0435\u0442\u00bb' },
      { type: 'phrase', russian: 'Барев дзез', armenian: '\u0532\u0561\u0580\u0587 \u0571\u0565\u0566', transcription: 'barev dzez', translation: '\u00ab\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435\u00bb' },
      { type: 'phrase', russian: 'Вохджуйн', armenian: '\u0548\u0572\u057b\u0578\u0582\u0575\u0576', transcription: 'voghdjuyn', translation: '\u00ab\u041f\u0440\u0438\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044e!\u00bb' },

      { type: 'heading', text: 'Временные приветствия' },
      { type: 'phrase', russian: 'Бари луйс', armenian: '\u0532\u0561\u0580\u056b \u056c\u0578\u0582\u0575\u057d', transcription: 'bari luys', translation: 'Доброе утро (дословно: \u00ab\u0434\u043e\u0431\u0440\u044b\u0439 \u0441\u0432\u0435\u0442\u00bb)' },
      { type: 'phrase', russian: 'Бари ор', armenian: '\u0532\u0561\u0580\u056b \u0585\u0580', transcription: 'bari or', translation: 'Добрый день' },
      { type: 'phrase', russian: 'Бари ереко', armenian: '\u0532\u0561\u0580\u056b \u0565\u0580\u0565\u056f\u0578', transcription: 'bari yereko', translation: 'Добрый вечер' },

      { type: 'heading', text: 'Вопросы при встрече' },
      { type: 'phrase', russian: 'Вонц эс?', armenian: '\u0548\u055e\u0576\u0581 \u0565\u057d', transcription: 'vonts es', translation: '\u00ab\u041a\u0430\u043a \u0442\u044b?\u00bb (\u043d\u0435\u0444\u043e\u0440\u043c\u0430\u043b\u044c\u043d\u043e)' },
      { type: 'phrase', russian: 'Инчпес эк?', armenian: '\u053b\u0576\u0579\u057a\u0565\u055e\u057d \u0565\u0584', transcription: 'inchpes ek', translation: '\u00ab\u041a\u0430\u043a \u0412\u044b?\u00bb (\u0444\u043e\u0440\u043c\u0430\u043b\u044c\u043d\u043e)' },
      { type: 'phrase', russian: 'Лав', armenian: '\u053c\u0561\u057e', transcription: 'lav', translation: '\u00ab\u0425\u043e\u0440\u043e\u0448\u043e\u00bb' },
    ],
  },
  {
    id: 2,
    blocks: [
      { type: 'heading', text: 'Прощания' },
      { type: 'phrase', russian: 'Цтесутюн', armenian: '\u0551\u057f\u0565\u057d\u0578\u0582\u0569\u0575\u0578\u0582\u0576', transcription: 'tstesutyun', translation: '\u00ab\u0414\u043e \u0441\u0432\u0438\u0434\u0430\u043d\u0438\u044f\u00bb' },
      { type: 'phrase', russian: 'Арайжм', armenian: '\u0531\u057c\u0561\u0575\u056a\u0574', transcription: 'araydzhm', translation: '\u00ab\u041f\u043e\u043a\u0430\u00bb \u0438\u043b\u0438 \u00ab\u0414\u043e \u0432\u0441\u0442\u0440\u0435\u0447\u0438\u00bb' },
      { type: 'phrase', russian: 'Минч нор андипум', armenian: '\u0544\u056b\u0576\u0579 \u0576\u0578\u0580 \u0570\u0561\u0576\u0564\u056b\u057a\u0578\u0582\u0574', transcription: 'minch nor handipum', translation: '\u00ab\u0414\u043e \u043d\u043e\u0432\u043e\u0439 \u0432\u0441\u0442\u0440\u0435\u0447\u0438\u00bb' },
      { type: 'phrase', russian: 'Мнас баров', armenian: '\u0544\u0576\u0561\u057d \u0562\u0561\u0580\u0578\u057e', transcription: 'mnas barov', translation: '\u00ab\u041f\u0440\u043e\u0449\u0430\u0439\u00bb' },
      { type: 'phrase', russian: 'Мнак баров', armenian: '\u0544\u0576\u0561\u0584 \u0562\u0561\u0580\u0578\u057e', transcription: 'mnak barov', translation: '\u00ab\u041f\u0440\u043e\u0449\u0430\u0439\u0442\u0435\u00bb' },
      { type: 'phrase', russian: 'Бари гишер', armenian: '\u0532\u0561\u0580\u056b \u0563\u056b\u0577\u0565\u0580', transcription: 'bari gisher', translation: '\u00ab\u0421\u043f\u043e\u043a\u043e\u0439\u043d\u043e\u0439 \u043d\u043e\u0447\u0438\u00bb' },

      { type: 'heading', text: 'Этикет и особенности' },
      { type: 'phrase', russian: 'Дзез', armenian: '\u0541\u0565\u0566', transcription: 'dzez', translation: '\u0444\u043e\u0440\u043c\u0430 \u0432\u0435\u0436\u043b\u0438\u0432\u043e\u0441\u0442\u0438 (\u00ab\u0412\u0430\u043c / \u0412\u0430\u0441\u00bb)' },
      { type: 'phrase', russian: 'Парон', armenian: '\u054a\u0561\u0580\u0578\u0576', transcription: 'paron', translation: '\u0433\u043e\u0441\u043f\u043e\u0434\u0438\u043d' },
      { type: 'phrase', russian: 'Тикин', armenian: '\u054f\u056b\u056f\u056b\u0576', transcription: 'tikin', translation: '\u0433\u043e\u0441\u043f\u043e\u0436\u0430' },
      { type: 'rule', title: 'Особенности', items: [
        '\u0413\u043b\u0430\u0433\u043e\u043b\u044b: \u00ab\u044d\u0441\u00bb (\u0565\u057d) \u2014 \u0435\u0434. \u0447\u0438\u0441\u043b\u043e; \u00ab\u044d\u043a\u00bb (\u0565\u0584) \u2014 \u0432\u0435\u0436\u043b\u0438\u0432\u0430\u044f \u0444\u043e\u0440\u043c\u0430 \u0438\u043b\u0438 \u043c\u043d. \u0447\u0438\u0441\u043b\u043e.',
        '\u0412\u043e\u0441\u043a\u043b\u0438\u0446\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0437\u043d\u0430\u043a (\u055c) \u0438 \u0432\u043e\u043f\u0440\u043e\u0441\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0437\u043d\u0430\u043a (\u055e) \u0441\u0442\u0430\u0432\u044f\u0442\u0441\u044f \u043d\u0430\u0434 \u0433\u043b\u0430\u0441\u043d\u043e\u0439.',
      ]},
      { type: 'phrase', russian: 'Ачели эр цанотанал', armenian: '\u0540\u0561\u0573\u0565\u056c\u056b \u0567\u0580 \u056e\u0561\u0576\u0578\u0569\u0561\u0576\u0561\u056c', transcription: 'hacheli er tsanotanal', translation: '\u00ab\u0411\u044b\u043b\u043e \u043f\u0440\u0438\u044f\u0442\u043d\u043e \u043f\u043e\u0437\u043d\u0430\u043a\u043e\u043c\u0438\u0442\u044c\u0441\u044f\u00bb' },
      { type: 'phrase', russian: 'Шнорхакалутюн', armenian: '\u0547\u0576\u0578\u0580\u0570\u0561\u056f\u0561\u056c\u0578\u0582\u0569\u0575\u0578\u0582\u0576', transcription: 'shnorhakalutyun', translation: '\u00ab\u0421\u043f\u0430\u0441\u0438\u0431\u043e\u00bb' },
      { type: 'phrase', russian: 'Хндрем', armenian: '\u053d\u0576\u0564\u0580\u0565\u0574', transcription: 'khndrem', translation: '\u00ab\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430\u00bb' },
    ],
  },
];
