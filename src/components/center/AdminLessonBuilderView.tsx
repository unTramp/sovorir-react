import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLessonBuilderRepository } from '../../lib/adminLessonBuilderRepository';
import { useAuthStore } from '../../stores/useAuthStore';
import type {
  AdminAiLessonDraft,
  AdminAiLessonReview,
  AdminAiQuizDraft,
  AdminBlockType,
  AdminCourseSummary,
  AdminLessonBlock,
  AdminLessonBuilder,
  AdminLessonSummary,
  AdminLessonStatus,
  AdminSectionType,
} from '../../types/admin';
import type { ContentBlock } from '../../types/lessonContent';
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon, CloseIcon, PlusIcon, SettingsGearIcon } from '../../icons';

const SECTION_TYPE_OPTIONS: AdminSectionType[] = [
  'intro',
  'vocabulary',
  'grammar',
  'practice',
  'quiz',
  'speaking',
  'review',
  'dictionary',
  'notes',
  'video',
  'pdf',
  'ai_practice',
];

const BLOCK_TYPE_OPTIONS: AdminBlockType[] = [
  'heading',
  'text',
  'phrase',
  'audio',
  'record',
  'rule',
  'video',
];

const STATUS_OPTIONS: AdminLessonStatus[] = ['draft', 'published', 'archived'];

function makeDefaultBlockContent(type: AdminBlockType): ContentBlock {
  switch (type) {
    case 'heading':
      return { type, text: 'Новый заголовок' };
    case 'text':
      return { type, content: 'Короткий поясняющий текст для секции.' };
    case 'phrase':
      return {
        type,
        russian: 'Здравствуйте',
        armenian: 'Բարև',
        transcription: 'barev',
        translation: 'Приветствие',
        status: 'new',
      };
    case 'audio':
      return {
        type,
        sender: 'teacher',
        senderName: 'Лусине',
        text: 'Пример реплики преподавателя',
        duration: 12,
        src: 'https://example.com/audio.opus',
      };
    case 'record':
      return { type, prompt: 'Запишите свой вариант произношения' };
    case 'rule':
      return {
        type,
        title: 'Короткое правило',
        items: ['Добавьте 2-3 тезиса, которые нужно запомнить ученику.'],
      };
    case 'video':
      return {
        type,
        senderName: 'Лусине',
        text: 'Видео-объяснение преподавателя',
        videoSrc: 'https://example.com/video.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      };
  }
}

function serializeJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseObjectJson(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed === 'null') return null;

  const parsed = JSON.parse(trimmed) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Ожидался JSON-объект');
  }

  return parsed as Record<string, unknown>;
}

function parseBlockJson(raw: string, type: AdminBlockType): ContentBlock {
  const parsed = JSON.parse(raw) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Ожидался JSON-объект блока');
  }

  return { ...(parsed as Record<string, unknown>), type } as ContentBlock;
}

function statusLabel(status: AdminLessonStatus) {
  if (status === 'draft') return 'Черновик';
  if (status === 'published') return 'Опубликован';
  return 'Архив';
}

function BlockEditor({
  block,
  canMoveUp,
  canMoveDown,
  busy,
  onMove,
  onSave,
  onDelete,
}: {
  block: AdminLessonBlock;
  canMoveUp: boolean;
  canMoveDown: boolean;
  busy: boolean;
  onMove: (blockId: string, direction: 'up' | 'down') => Promise<void>;
  onSave: (blockId: string, patch: { orderIndex: number; type: AdminBlockType; content: ContentBlock }) => Promise<void>;
  onDelete: (blockId: string) => Promise<void>;
}) {
  const [type, setType] = useState<AdminBlockType>(block.type);
  const [orderIndex, setOrderIndex] = useState(String(block.orderIndex));
  const [json, setJson] = useState(serializeJson(block.content));
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    try {
      const content = parseBlockJson(json, type);
      await onSave(block.id, {
        orderIndex: Number(orderIndex),
        type,
        content,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить блок');
    }
  }

  return (
    <div className="admin-builder__block">
      <div className="admin-builder__row">
        <div className="admin-builder__field admin-builder__field--compact">
          <label className="admin-builder__label" htmlFor={`block-order-${block.id}`}>Порядок</label>
          <input
            id={`block-order-${block.id}`}
            className="admin-builder__input"
            type="number"
            min={1}
            value={orderIndex}
            onChange={(event) => setOrderIndex(event.target.value)}
            disabled={busy}
          />
        </div>

        <div className="admin-builder__field">
          <label className="admin-builder__label" htmlFor={`block-type-${block.id}`}>Тип блока</label>
          <select
            id={`block-type-${block.id}`}
            className="admin-builder__input"
            value={type}
            onChange={(event) => setType(event.target.value as AdminBlockType)}
            disabled={busy}
          >
            {BLOCK_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-builder__field">
        <label className="admin-builder__label" htmlFor={`block-json-${block.id}`}>Контент JSON</label>
        <textarea
          id={`block-json-${block.id}`}
          className="admin-builder__textarea"
          rows={7}
          value={json}
          onChange={(event) => setJson(event.target.value)}
          disabled={busy}
        />
      </div>

      {error && <div className="admin-builder__inline-error">{error}</div>}

      <div className="admin-builder__actions">
        <div className="admin-builder__inline-actions">
          <button className="admin-builder__icon-btn" type="button" onClick={() => void onMove(block.id, 'up')} disabled={busy || !canMoveUp} aria-label="Поднять блок">
            <ChevronUpIcon />
          </button>
          <button className="admin-builder__icon-btn" type="button" onClick={() => void onMove(block.id, 'down')} disabled={busy || !canMoveDown} aria-label="Опустить блок">
            <ChevronDownIcon />
          </button>
        </div>
        <button className="admin-builder__btn" type="button" onClick={() => void handleSave()} disabled={busy}>
          Сохранить блок
        </button>
        <button className="admin-builder__btn admin-builder__btn--ghost" type="button" onClick={() => void onDelete(block.id)} disabled={busy}>
          Удалить блок
        </button>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  canMoveUp,
  canMoveDown,
  busy,
  onMoveSection,
  onSaveSection,
  onDeleteSection,
  onCreateBlock,
  onMoveBlock,
  onSaveBlock,
  onDeleteBlock,
}: {
  section: AdminLessonBuilder['sections'][number];
  canMoveUp: boolean;
  canMoveDown: boolean;
  busy: boolean;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => Promise<void>;
  onSaveSection: (
    sectionId: string,
    patch: { title: string; orderIndex: number; type: AdminSectionType; content: Record<string, unknown> | null },
  ) => Promise<void>;
  onDeleteSection: (sectionId: string) => Promise<void>;
  onCreateBlock: (sectionId: string, type: AdminBlockType, orderIndex: number) => Promise<void>;
  onMoveBlock: (sectionId: string, blockId: string, direction: 'up' | 'down') => Promise<void>;
  onSaveBlock: (blockId: string, patch: { orderIndex: number; type: AdminBlockType; content: ContentBlock }) => Promise<void>;
  onDeleteBlock: (blockId: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(section.title);
  const [type, setType] = useState<AdminSectionType>(section.type);
  const [orderIndex, setOrderIndex] = useState(String(section.orderIndex));
  const [contentJson, setContentJson] = useState(serializeJson(section.content));
  const [newBlockType, setNewBlockType] = useState<AdminBlockType>('heading');
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    try {
      await onSaveSection(section.id, {
        title,
        orderIndex: Number(orderIndex),
        type,
        content: parseObjectJson(contentJson),
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить секцию');
    }
  }

  async function handleCreateBlock() {
    const nextOrder = section.blocks.length > 0
      ? Math.max(...section.blocks.map((block) => block.orderIndex)) + 1
      : 1;
    await onCreateBlock(section.id, newBlockType, nextOrder);
  }

  return (
    <section className="admin-builder__section">
      <div className="admin-builder__section-header">
        <div>
          <div className="admin-builder__section-title">{section.title}</div>
          <div className="admin-builder__section-meta">{section.blocks.length} блоков</div>
        </div>
        <div className="admin-builder__inline-actions">
          <button className="admin-builder__icon-btn" type="button" onClick={() => void onMoveSection(section.id, 'up')} disabled={busy || !canMoveUp} aria-label="Поднять секцию">
            <ChevronUpIcon />
          </button>
          <button className="admin-builder__icon-btn" type="button" onClick={() => void onMoveSection(section.id, 'down')} disabled={busy || !canMoveDown} aria-label="Опустить секцию">
            <ChevronDownIcon />
          </button>
          <button className="admin-builder__icon-btn" type="button" onClick={() => void onDeleteSection(section.id)} disabled={busy} aria-label="Удалить секцию">
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="admin-builder__row">
        <div className="admin-builder__field">
          <label className="admin-builder__label" htmlFor={`section-title-${section.id}`}>Название секции</label>
          <input
            id={`section-title-${section.id}`}
            className="admin-builder__input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={busy}
          />
        </div>

        <div className="admin-builder__field">
          <label className="admin-builder__label" htmlFor={`section-type-${section.id}`}>Тип секции</label>
          <select
            id={`section-type-${section.id}`}
            className="admin-builder__input"
            value={type}
            onChange={(event) => setType(event.target.value as AdminSectionType)}
            disabled={busy}
          >
            {SECTION_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="admin-builder__field admin-builder__field--compact">
          <label className="admin-builder__label" htmlFor={`section-order-${section.id}`}>Порядок</label>
          <input
            id={`section-order-${section.id}`}
            className="admin-builder__input"
            type="number"
            min={1}
            value={orderIndex}
            onChange={(event) => setOrderIndex(event.target.value)}
            disabled={busy}
          />
        </div>
      </div>

      <div className="admin-builder__field">
        <label className="admin-builder__label" htmlFor={`section-content-${section.id}`}>Доп. JSON секции</label>
        <textarea
          id={`section-content-${section.id}`}
          className="admin-builder__textarea"
          rows={4}
          value={contentJson}
          onChange={(event) => setContentJson(event.target.value)}
          disabled={busy}
        />
      </div>

      {error && <div className="admin-builder__inline-error">{error}</div>}

      <div className="admin-builder__actions">
        <button className="admin-builder__btn" type="button" onClick={() => void handleSave()} disabled={busy}>
          Сохранить секцию
        </button>
      </div>

      <div className="admin-builder__section-subheader">
        <span>Блоки</span>
        <div className="admin-builder__inline-actions">
          <select
            className="admin-builder__input admin-builder__input--small"
            value={newBlockType}
            onChange={(event) => setNewBlockType(event.target.value as AdminBlockType)}
            disabled={busy}
          >
            {BLOCK_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button className="admin-builder__btn admin-builder__btn--ghost" type="button" onClick={() => void handleCreateBlock()} disabled={busy}>
            <PlusIcon /> Добавить блок
          </button>
        </div>
      </div>

      <div className="admin-builder__block-list">
        {section.blocks.length === 0 && (
          <div className="admin-builder__empty">В этой секции пока нет блоков.</div>
        )}

        {section.blocks.map((block, index) => (
          <BlockEditor
            key={`${block.id}:${block.orderIndex}:${block.type}:${serializeJson(block.content)}`}
            block={block}
            canMoveUp={index > 0}
            canMoveDown={index < section.blocks.length - 1}
            busy={busy}
            onMove={async (blockId, direction) => onMoveBlock(section.id, blockId, direction)}
            onSave={onSaveBlock}
            onDelete={onDeleteBlock}
          />
        ))}
      </div>
    </section>
  );
}

export function AdminLessonBuilderView() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const [courses, setCourses] = useState<AdminCourseSummary[]>([]);
  const [lessons, setLessons] = useState<AdminLessonSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<AdminLessonBuilder | null>(null);
  const [metaDraft, setMetaDraft] = useState({
    title: '',
    slug: '',
    description: '',
    status: 'draft' as AdminLessonStatus,
    orderIndex: '1',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [aiDraftInput, setAiDraftInput] = useState({
    title: '',
    objective: '',
    vocabulary: '',
    grammarFocus: '',
    sectionCount: '4',
    difficulty: 'A1-A2',
  });
  const [aiLessonDraft, setAiLessonDraft] = useState<AdminAiLessonDraft | null>(null);
  const [aiQuizDraft, setAiQuizDraft] = useState<AdminAiQuizDraft | null>(null);
  const [aiReview, setAiReview] = useState<AdminAiLessonReview | null>(null);

  const canManageLessons = profile?.role === 'teacher' || profile?.role === 'admin';

  async function refreshCatalog(preferredLessonId?: string | null) {
    const [nextCourses, nextLessons] = await Promise.all([
      adminLessonBuilderRepository.listCourses(),
      adminLessonBuilderRepository.listLessons(),
    ]);

    setCourses(nextCourses);
    setLessons(nextLessons);

    const nextCourseId = selectedCourseId || nextCourses[0]?.id || '';
    if (!selectedCourseId && nextCourseId) {
      setSelectedCourseId(nextCourseId);
    }

    const visibleLessons = nextLessons.filter((lesson) => !nextCourseId || lesson.courseId === nextCourseId);
    const fallbackLessonId = preferredLessonId
      ?? (visibleLessons.find((lesson) => lesson.id === selectedLessonId)?.id ?? visibleLessons[0]?.id ?? null);
    setSelectedLessonId(fallbackLessonId);
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [nextCourses, nextLessons] = await Promise.all([
          adminLessonBuilderRepository.listCourses(),
          adminLessonBuilderRepository.listLessons(),
        ]);

        if (!active) return;

        setCourses(nextCourses);
        setLessons(nextLessons);
        const initialCourseId = nextCourses[0]?.id ?? '';
        const initialLessons = nextLessons.filter((lesson) => lesson.courseId === initialCourseId);
        setSelectedCourseId(initialCourseId);
        setSelectedLessonId(initialLessons[0]?.id ?? nextLessons[0]?.id ?? null);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Не удалось загрузить админку');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const visibleLessons = lessons.filter((lesson) => !selectedCourseId || lesson.courseId === selectedCourseId);
    if (visibleLessons.length === 0) {
      if (selectedLessonId !== null) setSelectedLessonId(null);
      return;
    }

    if (!visibleLessons.some((lesson) => lesson.id === selectedLessonId)) {
      setSelectedLessonId(visibleLessons[0]?.id ?? null);
    }
  }, [lessons, selectedCourseId, selectedLessonId]);

  useEffect(() => {
    if (!selectedLessonId) {
      setSelectedLesson(null);
      return;
    }

    let active = true;
    void (async () => {
      try {
        const lesson = await adminLessonBuilderRepository.getLessonBuilder(selectedLessonId);
        if (!active) return;

        setSelectedLesson(lesson);
        if (lesson) {
          setMetaDraft({
            title: lesson.title,
            slug: lesson.slug ?? '',
            description: lesson.description ?? '',
            status: lesson.status,
            orderIndex: String(lesson.orderIndex),
          });
          setAiDraftInput((current) => ({
            ...current,
            title: lesson.title,
            objective: lesson.description ?? '',
          }));
        }
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Не удалось загрузить урок');
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedLessonId]);

  async function runAction(task: () => Promise<void>, successMessage: string) {
    setSaving(true);
    setNotice(null);
    try {
      await task();
      setNotice(successMessage);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Операция не выполнена');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateLesson() {
    const courseId = selectedCourseId || courses[0]?.id;
    if (!courseId) return;

    const courseLessons = lessons.filter((lesson) => lesson.courseId === courseId);
    const orderIndex = courseLessons.length > 0
      ? Math.max(...courseLessons.map((lesson) => lesson.orderIndex)) + 1
      : 1;

    await runAction(async () => {
      const lesson = await adminLessonBuilderRepository.createLesson({
        courseId,
        title: 'Новый урок',
        orderIndex,
        status: 'draft',
      });
      await refreshCatalog(lesson.id);
    }, 'Новый урок создан');
  }

  async function handleGenerateLessonDraft() {
    await runAction(async () => {
      const draft = await adminLessonBuilderRepository.generateLessonDraft({
        title: aiDraftInput.title,
        objective: aiDraftInput.objective || undefined,
        vocabulary: aiDraftInput.vocabulary
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        grammarFocus: aiDraftInput.grammarFocus || undefined,
        sectionCount: Number(aiDraftInput.sectionCount),
        difficulty: aiDraftInput.difficulty || undefined,
      });
      setAiLessonDraft(draft);
      setAiQuizDraft(null);
      setAiReview(null);
    }, 'AI-черновик урока готов');
  }

  async function handleApplyLessonDraft() {
    if (!selectedLesson || !aiLessonDraft) return;

    await runAction(async () => {
      if (
        selectedLesson.title === 'Новый урок'
        || !selectedLesson.description
      ) {
        const updatedLesson = await adminLessonBuilderRepository.updateLesson(selectedLesson.id, {
          title: aiLessonDraft.title,
          description: aiLessonDraft.description,
        });
        setSelectedLesson(updatedLesson);
        setMetaDraft({
          title: updatedLesson.title,
          slug: updatedLesson.slug ?? '',
          description: updatedLesson.description ?? '',
          status: updatedLesson.status,
          orderIndex: String(updatedLesson.orderIndex),
        });
      }

      const baseLesson = await adminLessonBuilderRepository.getLessonBuilder(selectedLesson.id);
      if (!baseLesson) {
        throw new Error('Не удалось загрузить урок перед применением AI draft');
      }

      let nextOrderIndex = baseLesson.sections.length > 0
        ? Math.max(...baseLesson.sections.map((section) => section.orderIndex)) + 1
        : 1;

      for (const section of aiLessonDraft.sections) {
        const createdSection = await adminLessonBuilderRepository.createSection({
          lessonId: selectedLesson.id,
          title: section.title,
          orderIndex: nextOrderIndex,
          type: section.type,
          content: section.content ?? null,
        });
        nextOrderIndex += 1;

        let blockOrderIndex = 1;
        for (const block of section.blocks) {
          await adminLessonBuilderRepository.createBlock({
            sectionId: createdSection.id,
            orderIndex: blockOrderIndex,
            type: block.type,
            content: block,
          });
          blockOrderIndex += 1;
        }
      }

      const updated = await adminLessonBuilderRepository.getLessonBuilder(selectedLesson.id);
      setSelectedLesson(updated);
      await refreshCatalog(selectedLesson.id);
    }, 'AI-черновик добавлен в урок');
  }

  async function handleGenerateQuizDraft() {
    if (!selectedLesson) return;

    await runAction(async () => {
      const quiz = await adminLessonBuilderRepository.generateQuizDraft(selectedLesson);
      setAiQuizDraft(quiz);
      setAiReview(null);
    }, 'AI-квиз собран');
  }

  async function handleReviewLesson() {
    if (!selectedLesson) return;

    await runAction(async () => {
      const review = await adminLessonBuilderRepository.reviewLessonDraft(selectedLesson);
      setAiReview(review);
      setAiQuizDraft(null);
    }, 'AI-review урока готов');
  }

  async function handleSaveLessonMeta() {
    if (!selectedLesson) return;

    await runAction(async () => {
      const lesson = await adminLessonBuilderRepository.updateLesson(selectedLesson.id, {
        title: metaDraft.title,
        slug: metaDraft.slug || null,
        description: metaDraft.description || null,
        status: metaDraft.status,
        orderIndex: Number(metaDraft.orderIndex),
      });

      setSelectedLesson(lesson);
      setMetaDraft({
        title: lesson.title,
        slug: lesson.slug ?? '',
        description: lesson.description ?? '',
        status: lesson.status,
        orderIndex: String(lesson.orderIndex),
      });
      await refreshCatalog(lesson.id);
    }, 'Метаданные урока сохранены');
  }

  async function handleDeleteLesson() {
    if (!selectedLesson) return;

    await runAction(async () => {
      await adminLessonBuilderRepository.deleteLesson(selectedLesson.id);
      setSelectedLesson(null);
      await refreshCatalog(null);
    }, 'Урок удалён');
  }

  async function handleCreateSection() {
    if (!selectedLesson) return;

    const nextOrder = selectedLesson.sections.length > 0
      ? Math.max(...selectedLesson.sections.map((section) => section.orderIndex)) + 1
      : 1;

    await runAction(async () => {
      await adminLessonBuilderRepository.createSection({
        lessonId: selectedLesson.id,
        title: `Секция ${nextOrder}`,
        orderIndex: nextOrder,
        type: 'intro',
      });
      const updated = await adminLessonBuilderRepository.getLessonBuilder(selectedLesson.id);
      setSelectedLesson(updated);
    }, 'Секция добавлена');
  }

  async function handleSaveSection(
    sectionId: string,
    patch: { title: string; orderIndex: number; type: AdminSectionType; content: Record<string, unknown> | null },
  ) {
    if (!selectedLesson) return;

    await runAction(async () => {
      await adminLessonBuilderRepository.updateSection(sectionId, patch);
      const updated = await adminLessonBuilderRepository.getLessonBuilder(selectedLesson.id);
      setSelectedLesson(updated);
      await refreshCatalog(selectedLesson.id);
    }, 'Секция сохранена');
  }

  async function handleDeleteSection(sectionId: string) {
    if (!selectedLesson) return;

    await runAction(async () => {
      await adminLessonBuilderRepository.deleteSection(sectionId);
      const updated = await adminLessonBuilderRepository.getLessonBuilder(selectedLesson.id);
      setSelectedLesson(updated);
    }, 'Секция удалена');
  }

  async function handleMoveSection(sectionId: string, direction: 'up' | 'down') {
    if (!selectedLesson) return;

    const orderedSections = selectedLesson.sections
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = orderedSections.findIndex((section) => section.id === sectionId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedSections.length) return;

    const reordered = orderedSections.map((section) => section.id);
    [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];

    await runAction(async () => {
      const updated = await adminLessonBuilderRepository.reorderSections(selectedLesson.id, reordered);
      setSelectedLesson(updated);
      await refreshCatalog(selectedLesson.id);
    }, 'Порядок секций обновлён');
  }

  async function handleCreateBlock(sectionId: string, type: AdminBlockType, orderIndex: number) {
    if (!selectedLesson) return;

    await runAction(async () => {
      await adminLessonBuilderRepository.createBlock({
        sectionId,
        orderIndex,
        type,
        content: makeDefaultBlockContent(type),
      });
      const updated = await adminLessonBuilderRepository.getLessonBuilder(selectedLesson.id);
      setSelectedLesson(updated);
    }, 'Блок добавлен');
  }

  async function handleSaveBlock(
    blockId: string,
    patch: { orderIndex: number; type: AdminBlockType; content: ContentBlock },
  ) {
    if (!selectedLesson) return;

    await runAction(async () => {
      await adminLessonBuilderRepository.updateBlock(blockId, patch);
      const updated = await adminLessonBuilderRepository.getLessonBuilder(selectedLesson.id);
      setSelectedLesson(updated);
    }, 'Блок сохранён');
  }

  async function handleDeleteBlock(blockId: string) {
    if (!selectedLesson) return;

    await runAction(async () => {
      await adminLessonBuilderRepository.deleteBlock(blockId);
      const updated = await adminLessonBuilderRepository.getLessonBuilder(selectedLesson.id);
      setSelectedLesson(updated);
    }, 'Блок удалён');
  }

  async function handleMoveBlock(sectionId: string, blockId: string, direction: 'up' | 'down') {
    if (!selectedLesson) return;

    const section = selectedLesson.sections.find((item) => item.id === sectionId);
    if (!section) return;

    const orderedBlocks = section.blocks
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = orderedBlocks.findIndex((block) => block.id === blockId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedBlocks.length) return;

    const reordered = orderedBlocks.map((block) => block.id);
    [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];

    await runAction(async () => {
      const updated = await adminLessonBuilderRepository.reorderBlocks(sectionId, reordered);
      setSelectedLesson(updated);
    }, 'Порядок блоков обновлён');
  }

  if (!canManageLessons) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="placeholder-card max-w-md w-full">
          <div className="placeholder-card__emoji">🔒</div>
          <div className="placeholder-card__title">Доступ только для teacher/admin</div>
          <div className="placeholder-card__hint">Эта панель нужна для сборки уроков и публикации контента.</div>
          <button className="login-form__submit mt-4" type="button" onClick={() => navigate('/')}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const visibleLessons = lessons.filter((lesson) => !selectedCourseId || lesson.courseId === selectedCourseId);

  return (
    <div className="admin-builder">
      <aside className="admin-builder__sidebar">
        <div className="admin-builder__sidebar-header">
          <div>
            <div className="admin-builder__eyebrow">Админка</div>
            <h1 className="admin-builder__sidebar-title">Lesson Builder</h1>
          </div>
          <button className="admin-builder__btn" type="button" onClick={() => void handleCreateLesson()} disabled={saving}>
            <PlusIcon /> Новый урок
          </button>
        </div>

        <div className="admin-builder__surface">
          <label className="admin-builder__label" htmlFor="course-select">Курс</label>
          <select
            id="course-select"
            className="admin-builder__input"
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            disabled={saving}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        <div className="admin-builder__lesson-list">
          {visibleLessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              className={`admin-builder__lesson-item ${selectedLessonId === lesson.id ? 'active' : ''}`}
              onClick={() => setSelectedLessonId(lesson.id)}
            >
              <div className="admin-builder__lesson-item-top">
                <span className="admin-builder__lesson-item-icon"><BookOpenIcon size={16} /></span>
                <span className="admin-builder__badge">{statusLabel(lesson.status)}</span>
              </div>
              <div className="admin-builder__lesson-item-title">{lesson.title}</div>
              <div className="admin-builder__lesson-item-meta">
                Урок {lesson.orderIndex}{lesson.slug ? ` · ${lesson.slug}` : ''}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="admin-builder__content">
        {error && <div className="admin-builder__alert admin-builder__alert--error">{error}</div>}
        {notice && <div className="admin-builder__alert admin-builder__alert--success">{notice}</div>}

        {!selectedLesson ? (
          <div className="admin-builder__empty-panel">
            <SettingsGearIcon size={24} />
            <div>Выбери урок слева или создай новый черновик.</div>
          </div>
        ) : (
          <>
            <section className="admin-builder__surface">
              <div className="admin-builder__surface-header">
                <div>
                  <div className="admin-builder__eyebrow">AI actions</div>
                  <div className="admin-builder__surface-title">Генерация и review</div>
                </div>
                <div className="admin-builder__badge">teacher-in-the-loop</div>
              </div>

              <div className="admin-builder__meta-grid">
                <div className="admin-builder__field">
                  <label className="admin-builder__label" htmlFor="ai-title">Тема урока</label>
                  <input
                    id="ai-title"
                    className="admin-builder__input"
                    value={aiDraftInput.title}
                    onChange={(event) => setAiDraftInput((current) => ({ ...current, title: event.target.value }))}
                    disabled={saving}
                  />
                </div>

                <div className="admin-builder__field">
                  <label className="admin-builder__label" htmlFor="ai-grammar">Grammar focus</label>
                  <input
                    id="ai-grammar"
                    className="admin-builder__input"
                    value={aiDraftInput.grammarFocus}
                    onChange={(event) => setAiDraftInput((current) => ({ ...current, grammarFocus: event.target.value }))}
                    disabled={saving}
                  />
                </div>

                <div className="admin-builder__field admin-builder__field--compact">
                  <label className="admin-builder__label" htmlFor="ai-count">Секций</label>
                  <input
                    id="ai-count"
                    className="admin-builder__input"
                    type="number"
                    min={3}
                    max={6}
                    value={aiDraftInput.sectionCount}
                    onChange={(event) => setAiDraftInput((current) => ({ ...current, sectionCount: event.target.value }))}
                    disabled={saving}
                  />
                </div>

                <div className="admin-builder__field admin-builder__field--full">
                  <label className="admin-builder__label" htmlFor="ai-objective">Цель урока</label>
                  <textarea
                    id="ai-objective"
                    className="admin-builder__textarea"
                    rows={3}
                    value={aiDraftInput.objective}
                    onChange={(event) => setAiDraftInput((current) => ({ ...current, objective: event.target.value }))}
                    disabled={saving}
                  />
                </div>

                <div className="admin-builder__field admin-builder__field--full">
                  <label className="admin-builder__label" htmlFor="ai-vocabulary">Словарь через запятую</label>
                  <textarea
                    id="ai-vocabulary"
                    className="admin-builder__textarea"
                    rows={3}
                    value={aiDraftInput.vocabulary}
                    onChange={(event) => setAiDraftInput((current) => ({ ...current, vocabulary: event.target.value }))}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="admin-builder__actions mt-4">
                <button className="admin-builder__btn" type="button" onClick={() => void handleGenerateLessonDraft()} disabled={saving || !aiDraftInput.title.trim()}>
                  Сгенерировать черновик урока
                </button>
                <button className="admin-builder__btn admin-builder__btn--ghost" type="button" onClick={() => void handleGenerateQuizDraft()} disabled={saving || !selectedLesson}>
                  Сгенерировать квиз
                </button>
                <button className="admin-builder__btn admin-builder__btn--ghost" type="button" onClick={() => void handleReviewLesson()} disabled={saving || !selectedLesson}>
                  Проверить урок AI review
                </button>
              </div>

              {(aiLessonDraft || aiQuizDraft || aiReview) && (
                <div className="admin-builder__ai-results">
                  {aiLessonDraft && (
                    <div className="admin-builder__ai-card">
                      <div className="admin-builder__section-header">
                        <div>
                          <div className="admin-builder__section-title">{aiLessonDraft.title}</div>
                          <div className="admin-builder__section-meta">{aiLessonDraft.sections.length} AI-секций</div>
                        </div>
                        <button
                          className="admin-builder__btn"
                          type="button"
                          onClick={() => void handleApplyLessonDraft()}
                          disabled={saving || !selectedLesson}
                        >
                          Применить в урок
                        </button>
                      </div>
                      <div className="admin-builder__ai-summary">{aiLessonDraft.description}</div>
                      <div className="admin-builder__ai-list">
                        {aiLessonDraft.sections.map((section, index) => (
                          <div key={`${section.title}-${index}`} className="admin-builder__ai-item">
                            <strong>{index + 1}. {section.title}</strong>
                            <span>{section.type} · {section.blocks.length} блоков</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiQuizDraft && (
                    <div className="admin-builder__ai-card">
                      <div className="admin-builder__section-title">{aiQuizDraft.title}</div>
                      <pre className="admin-builder__ai-pre">{serializeJson(aiQuizDraft)}</pre>
                    </div>
                  )}

                  {aiReview && (
                    <div className="admin-builder__ai-card">
                      <div className="admin-builder__section-title">AI review</div>
                      <div className="admin-builder__ai-summary">{aiReview.summary}</div>
                      <div className="admin-builder__ai-columns">
                        <div>
                          <div className="admin-builder__label">Сильные стороны</div>
                          <ul className="admin-builder__ai-bullets">
                            {aiReview.strengths.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="admin-builder__label">Риски</div>
                          <ul className="admin-builder__ai-bullets">
                            {aiReview.risks.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="admin-builder__label">Рекомендации</div>
                          <ul className="admin-builder__ai-bullets">
                            {aiReview.suggestions.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="admin-builder__surface">
              <div className="admin-builder__surface-header">
                <div>
                  <div className="admin-builder__eyebrow">Метаданные урока</div>
                  <div className="admin-builder__surface-title">{selectedLesson.title}</div>
                </div>
                <div className="admin-builder__inline-actions">
                  <button className="admin-builder__btn" type="button" onClick={() => void handleSaveLessonMeta()} disabled={saving}>
                    Сохранить урок
                  </button>
                  <button className="admin-builder__btn admin-builder__btn--ghost" type="button" onClick={() => void handleDeleteLesson()} disabled={saving}>
                    Удалить урок
                  </button>
                </div>
              </div>

              <div className="admin-builder__meta-grid">
                <div className="admin-builder__field">
                  <label className="admin-builder__label" htmlFor="lesson-title">Название</label>
                  <input
                    id="lesson-title"
                    className="admin-builder__input"
                    value={metaDraft.title}
                    onChange={(event) => setMetaDraft((current) => ({ ...current, title: event.target.value }))}
                    disabled={saving}
                  />
                </div>

                <div className="admin-builder__field">
                  <label className="admin-builder__label" htmlFor="lesson-slug">Slug</label>
                  <input
                    id="lesson-slug"
                    className="admin-builder__input"
                    value={metaDraft.slug}
                    onChange={(event) => setMetaDraft((current) => ({ ...current, slug: event.target.value }))}
                    disabled={saving}
                  />
                </div>

                <div className="admin-builder__field admin-builder__field--compact">
                  <label className="admin-builder__label" htmlFor="lesson-order">Порядок</label>
                  <input
                    id="lesson-order"
                    className="admin-builder__input"
                    type="number"
                    min={1}
                    value={metaDraft.orderIndex}
                    onChange={(event) => setMetaDraft((current) => ({ ...current, orderIndex: event.target.value }))}
                    disabled={saving}
                  />
                </div>

                <div className="admin-builder__field">
                  <label className="admin-builder__label" htmlFor="lesson-status">Статус</label>
                  <select
                    id="lesson-status"
                    className="admin-builder__input"
                    value={metaDraft.status}
                    onChange={(event) => setMetaDraft((current) => ({ ...current, status: event.target.value as AdminLessonStatus }))}
                    disabled={saving}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{statusLabel(status)}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-builder__field admin-builder__field--full">
                  <label className="admin-builder__label" htmlFor="lesson-description">Описание</label>
                  <textarea
                    id="lesson-description"
                    className="admin-builder__textarea"
                    rows={3}
                    value={metaDraft.description}
                    onChange={(event) => setMetaDraft((current) => ({ ...current, description: event.target.value }))}
                    disabled={saving}
                  />
                </div>
              </div>
            </section>

            <section className="admin-builder__surface">
              <div className="admin-builder__surface-header">
                <div>
                  <div className="admin-builder__eyebrow">Секции</div>
                  <div className="admin-builder__surface-title">
                    {selectedLesson.sections.length} секций
                  </div>
                </div>
                <button className="admin-builder__btn" type="button" onClick={() => void handleCreateSection()} disabled={saving}>
                  <PlusIcon /> Добавить секцию
                </button>
              </div>

              <div className="admin-builder__section-list">
                {selectedLesson.sections.length === 0 && (
                  <div className="admin-builder__empty">Урок пока пустой. Начни с первой секции.</div>
                )}

                {selectedLesson.sections
                  .slice()
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((section, index, orderedSections) => (
                    <SectionEditor
                      key={`${section.id}:${section.orderIndex}:${section.type}:${serializeJson(section.content)}`}
                      section={section}
                      canMoveUp={index > 0}
                      canMoveDown={index < orderedSections.length - 1}
                      busy={saving}
                      onMoveSection={handleMoveSection}
                      onSaveSection={handleSaveSection}
                      onDeleteSection={handleDeleteSection}
                      onCreateBlock={handleCreateBlock}
                      onMoveBlock={handleMoveBlock}
                      onSaveBlock={handleSaveBlock}
                      onDeleteBlock={handleDeleteBlock}
                    />
                  ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
