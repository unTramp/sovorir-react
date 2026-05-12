import type { AdminLessonBuilder } from '../../../types/admin';
import type { ContentBlock } from '../../../types/lessonContent';

function isBlank(value: string | null | undefined) {
  return !value || !value.trim();
}

function validateBlock(block: ContentBlock, sectionTitle: string, blockIndex: number) {
  const location = `секция «${sectionTitle}», блок ${blockIndex + 1}`;

  switch (block.type) {
    case 'audioExample':
      if (isBlank(block.title)) {
        return `В ${location} у аудио-примера не заполнен заголовок.`;
      }
      if (isBlank(block.audioSrc)) {
        return `В ${location} у аудио-примера не указана ссылка на аудио.`;
      }
      return null;
    case 'teacherBubble':
      if (isBlank(block.teacherName)) {
        return `В ${location} у бабла преподавателя не указано имя преподавателя.`;
      }
      if (isBlank(block.text)) {
        return `В ${location} у бабла преподавателя не заполнен текст.`;
      }
      if (isBlank(block.audioSrc)) {
        return `В ${location} у бабла преподавателя не указана ссылка на аудио.`;
      }
      return null;
    case 'multipleChoice': {
      if (isBlank(block.question)) {
        return `В ${location} у теста с выбором не заполнен вопрос.`;
      }
      const filledOptions = block.options.filter((option) => !isBlank(option));
      if (filledOptions.length < 2) {
        return `В ${location} у теста с выбором должно быть хотя бы два заполненных варианта.`;
      }
      if (
        block.correctIndex < 0
        || block.correctIndex >= block.options.length
        || isBlank(block.options[block.correctIndex])
      ) {
        return `В ${location} у теста с выбором не выбран корректный правильный ответ.`;
      }
      return null;
    }
    case 'pronunciationPrompt':
    case 'record':
      if (isBlank(block.prompt)) {
        return `В ${location} у задания на запись не заполнен текст задания.`;
      }
      return null;
    default:
      return null;
  }
}

export function validateLessonForPublish(lesson: AdminLessonBuilder) {
  const errors: string[] = [];
  const nonEmptySections = lesson.sections.filter((section) => section.blocks.length > 0);

  if (nonEmptySections.length === 0) {
    errors.push('Добавьте хотя бы одну секцию с контентным блоком.');
    return errors;
  }

  for (const section of lesson.sections) {
    const sectionTitle = section.title.trim() || 'Новая секция';
    for (const [index, block] of section.blocks.entries()) {
      const error = validateBlock(block.content, sectionTitle, index);
      if (error) {
        errors.push(error);
      }
    }
  }

  return errors;
}
