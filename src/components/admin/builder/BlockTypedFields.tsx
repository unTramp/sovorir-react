import type { SemanticBlockType } from '../../../lib/semanticContent';
import type { ContentBlock } from '../../../types/lessonContent';

interface BlockTypedFieldsProps {
  blockId: string;
  semanticType: SemanticBlockType;
  content: ContentBlock;
  busy: boolean;
  onChange: (nextContent: ContentBlock) => void;
}

export function BlockTypedFields({
  blockId,
  semanticType,
  content,
  busy,
  onChange,
}: BlockTypedFieldsProps) {
  if (semanticType === 'heading' && content.type === 'heading') {
    return (
      <div className="ab-block-card__editor ab-block-card__editor--compact">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-heading-${blockId}`}>Текст заголовка</label>
          <input
            id={`block-heading-${blockId}`}
            className="ab-block-card__input"
            value={content.text}
            onChange={(event) => onChange({ ...content, text: event.target.value })}
            disabled={busy}
          />
        </div>
      </div>
    );
  }

  if ((semanticType === 'text' || semanticType === 'readingText') && content.type === 'text') {
    return (
      <div className="ab-block-card__editor">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-text-${blockId}`}>
            {semanticType === 'readingText' ? 'Текст для чтения' : 'Текст'}
          </label>
          <textarea
            id={`block-text-${blockId}`}
            className="ab-block-card__input ab-block-card__input--textarea"
            rows={5}
            value={content.content}
            onChange={(event) => onChange({ ...content, content: event.target.value })}
            disabled={busy}
          />
        </div>
      </div>
    );
  }

  if (semanticType === 'audioExample' && content.type === 'audioExample') {
    return (
      <div className="ab-block-card__editor">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-audio-title-${blockId}`}>Заголовок</label>
          <input
            id={`block-audio-title-${blockId}`}
            className="ab-block-card__input"
            value={content.title}
            onChange={(event) => onChange({ ...content, title: event.target.value })}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-audio-description-${blockId}`}>Описание</label>
          <textarea
            id={`block-audio-description-${blockId}`}
            className="ab-block-card__input ab-block-card__input--textarea"
            rows={3}
            value={content.description ?? ''}
            onChange={(event) => onChange({ ...content, description: event.target.value || undefined })}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-audio-src-${blockId}`}>Ссылка на аудио</label>
          <input
            id={`block-audio-src-${blockId}`}
            className="ab-block-card__input"
            value={content.audioSrc}
            onChange={(event) => onChange({ ...content, audioSrc: event.target.value })}
            disabled={busy}
          />
        </div>
      </div>
    );
  }

  if (
    semanticType === 'pronunciationPrompt'
    && (content.type === 'pronunciationPrompt' || content.type === 'record')
  ) {
    return (
      <div className="ab-block-card__editor">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-pronunciation-prompt-${blockId}`}>
            Текст задания
          </label>
          <textarea
            id={`block-pronunciation-prompt-${blockId}`}
            className="ab-block-card__input ab-block-card__input--textarea"
            rows={3}
            value={content.prompt}
            onChange={(event) => onChange({ ...content, prompt: event.target.value })}
            disabled={busy}
          />
        </div>
      </div>
    );
  }

  if (semanticType === 'multipleChoice' && content.type === 'multipleChoice') {
    return (
      <div className="ab-block-card__editor">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-mc-question-${blockId}`}>Вопрос</label>
          <textarea
            id={`block-mc-question-${blockId}`}
            className="ab-block-card__input ab-block-card__input--textarea"
            rows={3}
            value={content.question}
            onChange={(event) => onChange({ ...content, question: event.target.value })}
            disabled={busy}
          />
        </div>

        <div className="ab-block-card__editor ab-block-card__editor--grid">
          {content.options.map((option, index) => (
            <div className="ab-block-card__field" key={index}>
              <label className="ab-block-card__label" htmlFor={`block-mc-option-${blockId}-${index}`}>
                Вариант {index + 1}
              </label>
              <input
                id={`block-mc-option-${blockId}-${index}`}
                className="ab-block-card__input"
                value={option}
                onChange={(event) => {
                  const nextOptions = [...content.options] as typeof content.options;
                  nextOptions[index] = event.target.value;
                  onChange({ ...content, options: nextOptions });
                }}
                disabled={busy}
              />
            </div>
          ))}
        </div>

        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-mc-correct-${blockId}`}>Правильный ответ</label>
          <select
            id={`block-mc-correct-${blockId}`}
            className="ab-block-card__input"
            value={String(content.correctIndex)}
            onChange={(event) => onChange({ ...content, correctIndex: Number(event.target.value) })}
            disabled={busy}
          >
            {content.options.map((_, index) => (
              <option key={index} value={index}>
                Вариант {index + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-mc-explanation-${blockId}`}>Пояснение после ответа</label>
          <textarea
            id={`block-mc-explanation-${blockId}`}
            className="ab-block-card__input ab-block-card__input--textarea"
            rows={3}
            value={content.explanation ?? ''}
            onChange={(event) => onChange({ ...content, explanation: event.target.value || undefined })}
            disabled={busy}
          />
        </div>
      </div>
    );
  }

  if (semanticType === 'rule' && content.type === 'rule') {
    return (
      <div className="ab-block-card__editor">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-rule-title-${blockId}`}>Заголовок правила</label>
          <input
            id={`block-rule-title-${blockId}`}
            className="ab-block-card__input"
            value={content.title}
            onChange={(event) => onChange({ ...content, title: event.target.value })}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-rule-items-${blockId}`}>Пункты правила</label>
          <textarea
            id={`block-rule-items-${blockId}`}
            className="ab-block-card__input ab-block-card__input--textarea"
            rows={5}
            value={content.items.join('\n')}
            onChange={(event) => onChange({
              ...content,
              items: event.target.value
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean),
            })}
            disabled={busy}
          />
        </div>
      </div>
    );
  }

  if (semanticType === 'phraseCard' && content.type === 'phrase') {
    const phraseContent = {
      ...content,
      status: content.status ?? 'new',
    } as typeof content;

    return (
      <div className="ab-block-card__editor ab-block-card__editor--grid">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-armenian-${blockId}`}>Армянский текст</label>
          <input
            id={`block-armenian-${blockId}`}
            className="ab-block-card__input"
            value={phraseContent.armenian}
            onChange={(event) => onChange({ ...phraseContent, armenian: event.target.value })}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-russian-${blockId}`}>Русская подпись</label>
          <input
            id={`block-russian-${blockId}`}
            className="ab-block-card__input"
            value={phraseContent.russian}
            onChange={(event) => onChange({ ...phraseContent, russian: event.target.value })}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-translation-${blockId}`}>Перевод</label>
          <input
            id={`block-translation-${blockId}`}
            className="ab-block-card__input"
            value={phraseContent.translation}
            onChange={(event) => onChange({ ...phraseContent, translation: event.target.value })}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-transcription-${blockId}`}>Транскрипция</label>
          <input
            id={`block-transcription-${blockId}`}
            className="ab-block-card__input"
            value={phraseContent.transcription}
            onChange={(event) => onChange({ ...phraseContent, transcription: event.target.value })}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-audio-${blockId}`}>Ссылка на аудио</label>
          <input
            id={`block-audio-${blockId}`}
            className="ab-block-card__input"
            value={phraseContent.audioSrc ?? ''}
            onChange={(event) => onChange({ ...phraseContent, audioSrc: event.target.value || undefined })}
            disabled={busy}
          />
        </div>
      </div>
    );
  }

  if (semanticType === 'teacherBubble' && content.type === 'audio' && content.sender === 'teacher') {
    return (
      <div className="ab-block-card__editor ab-block-card__editor--grid">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-teacher-name-${blockId}`}>Имя преподавателя</label>
          <input
            id={`block-teacher-name-${blockId}`}
            className="ab-block-card__input"
            value={content.senderName}
            onChange={(event) => onChange({ ...content, senderName: event.target.value })}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__field ab-block-card__field--full">
          <label className="ab-block-card__label" htmlFor={`block-message-${blockId}`}>Сообщение преподавателя</label>
          <textarea
            id={`block-message-${blockId}`}
            className="ab-block-card__input ab-block-card__input--textarea"
            rows={4}
            value={content.text}
            onChange={(event) => onChange({ ...content, text: event.target.value })}
            disabled={busy}
          />
        </div>
        <div className="ab-block-card__field ab-block-card__field--full">
          <label className="ab-block-card__label" htmlFor={`block-src-${blockId}`}>Ссылка на аудио</label>
          <input
            id={`block-src-${blockId}`}
            className="ab-block-card__input"
            value={content.src}
            onChange={(event) => onChange({ ...content, src: event.target.value })}
            disabled={busy}
          />
        </div>
      </div>
    );
  }

  return null;
}
