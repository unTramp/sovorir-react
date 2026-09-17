import type { VideoBubbleBlock } from '../../../types/lessonContent';

interface VideoBlockFieldsProps {
  blockId: string;
  content: VideoBubbleBlock;
  busy: boolean;
  onChange: (nextContent: VideoBubbleBlock) => void;
}

const PRESENTATIONS: Array<{
  value: NonNullable<VideoBubbleBlock['presentation']>;
  label: string;
  description: string;
}> = [
  { value: 'circle', label: 'Видео-кружок', description: 'Короткая человеческая реплика, артикуляция или комментарий наставника.' },
  { value: 'lesson', label: 'Видео-объяснение', description: 'Обычный учебный ролик с объяснением или демонстрацией.' },
  { value: 'scene', label: 'Сцена', description: 'Реалистичная ситуация или диалог перед заданием.' },
];

export function VideoBlockFields({ blockId, content, busy, onChange }: VideoBlockFieldsProps) {
  const presentation = content.presentation ?? 'lesson';

  return (
    <div className="ab-block-card__editor">
      <div className="ab-block-card__field ab-block-card__field--full">
        <label className="ab-block-card__label" htmlFor={`block-video-presentation-${blockId}`}>
          Роль видео в уроке
        </label>
        <select
          id={`block-video-presentation-${blockId}`}
          className="ab-block-card__input"
          value={presentation}
          onChange={(event) => onChange({
            ...content,
            presentation: event.target.value as VideoBubbleBlock['presentation'],
          })}
          disabled={busy}
        >
          {PRESENTATIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="ab-block-card__hint">
          {PRESENTATIONS.find((option) => option.value === presentation)?.description}
        </div>
      </div>

      <div className="ab-block-card__editor ab-block-card__editor--grid">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-video-sender-${blockId}`}>Персонаж / автор</label>
          <input
            id={`block-video-sender-${blockId}`}
            className="ab-block-card__input"
            value={content.senderName ?? ''}
            placeholder="Ани"
            onChange={(event) => onChange({ ...content, senderName: event.target.value || undefined })}
            disabled={busy}
          />
        </div>

        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-video-duration-${blockId}`}>Длительность, сек.</label>
          <input
            id={`block-video-duration-${blockId}`}
            className="ab-block-card__input"
            type="number"
            min="1"
            step="1"
            value={content.duration ?? ''}
            onChange={(event) => onChange({
              ...content,
              duration: event.target.value ? Number(event.target.value) : undefined,
            })}
            disabled={busy}
          />
        </div>
      </div>

      <div className="ab-block-card__field">
        <label className="ab-block-card__label" htmlFor={`block-video-text-${blockId}`}>Подпись / учебная цель</label>
        <textarea
          id={`block-video-text-${blockId}`}
          className="ab-block-card__input ab-block-card__input--textarea"
          rows={3}
          value={content.text ?? ''}
          onChange={(event) => onChange({ ...content, text: event.target.value || undefined })}
          disabled={busy}
        />
      </div>

      <div className="ab-block-card__field">
        <label className="ab-block-card__label" htmlFor={`block-video-src-${blockId}`}>Ссылка на видео</label>
        <input
          id={`block-video-src-${blockId}`}
          className="ab-block-card__input"
          value={content.videoSrc}
          placeholder="https://.../video.mp4"
          onChange={(event) => onChange({ ...content, videoSrc: event.target.value })}
          disabled={busy}
        />
      </div>

      <div className="ab-block-card__editor ab-block-card__editor--grid">
        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-video-thumbnail-${blockId}`}>Обложка</label>
          <input
            id={`block-video-thumbnail-${blockId}`}
            className="ab-block-card__input"
            value={content.thumbnail ?? ''}
            placeholder="Необязательно"
            onChange={(event) => onChange({ ...content, thumbnail: event.target.value || undefined })}
            disabled={busy}
          />
        </div>

        <div className="ab-block-card__field">
          <label className="ab-block-card__label" htmlFor={`block-video-poster-${blockId}`}>Постер</label>
          <select
            id={`block-video-poster-${blockId}`}
            className="ab-block-card__input"
            value={content.posterMode ?? (content.thumbnail ? 'image' : 'first-frame')}
            onChange={(event) => onChange({
              ...content,
              posterMode: event.target.value as NonNullable<VideoBubbleBlock['posterMode']>,
            })}
            disabled={busy}
          >
            <option value="first-frame">Первый кадр видео</option>
            <option value="image">Отдельная обложка</option>
          </select>
        </div>
      </div>

      <div className="ab-block-card__field">
        <label className="ab-block-card__label" htmlFor={`block-video-transcript-${blockId}`}>Транскрипт</label>
        <textarea
          id={`block-video-transcript-${blockId}`}
          className="ab-block-card__input ab-block-card__input--textarea"
          rows={4}
          value={content.transcript ?? ''}
          placeholder="Можно добавить позже вместе с финальным видео."
          onChange={(event) => onChange({ ...content, transcript: event.target.value || undefined })}
          disabled={busy}
        />
      </div>

      <div className="ab-block-card__hint">
        Видео-кружки: ориентир 4–20 сек. Сцены: 8–35 сек. Видео-объяснения: обычно 30–90 сек.
      </div>
    </div>
  );
}
