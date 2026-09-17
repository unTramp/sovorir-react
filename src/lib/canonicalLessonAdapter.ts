import type { ContentBlock, InteractionTracking, LessonContentSection, PhraseBlock } from '../types/lessonContent';
import type { Interaction, LearningItem, Lesson, LessonStep, PresentationNode } from '../domain/learning';

function legacySectionKind(type: LessonStep['type']): LessonContentSection['kind'] {
  switch (type) {
    case 'context': return 'situation';
    case 'phrase-intro': return 'phrases';
    case 'listen-repeat': return 'pronunciation';
    case 'dialogue': return 'dialogue';
    case 'active-recall': return 'recall';
    case 'completion': return 'completion';
    default: return 'phrases';
  }
}

function trackingFor(lesson: Lesson, step: LessonStep, interaction: Interaction): InteractionTracking {
  return {
    lessonId: lesson.id,
    lessonRevision: lesson.revision,
    stepId: step.id,
    interactionId: interaction.id,
    learningItemIds: interaction.learningItemIds,
  };
}

function phraseBlock(item: LearningItem): PhraseBlock {
  return {
    type: 'phrase' as const,
    id: item.id,
    learningItemId: item.id,
    russian: item.transliteration,
    armenian: item.armenian,
    transcription: item.transliteration,
    translation: item.translation,
    audioSrc: item.audio?.normal.url,
    context: item.contexts[0],
    reviewable: item.reviewable,
  };
}

function presentationBlock(node: PresentationNode, items: Map<string, LearningItem>): ContentBlock | null {
  switch (node.type) {
    case 'text': return { type: 'text' as const, content: node.text };
    case 'learning-item': {
      const item = items.get(node.itemId);
      return item ? phraseBlock(item) : null;
    }
    case 'mentor-bubble':
      return node.audio ? {
        type: 'teacherBubble' as const,
        teacherName: 'Лусине',
        text: node.text,
        audioSrc: node.audio.url,
        duration: node.audio.durationMs ? Math.round(node.audio.durationMs / 1000) : undefined,
      } : { type: 'text' as const, content: node.text };
    case 'student-bubble':
      return node.audio ? {
        type: 'studentBubble' as const,
        studentName: 'Вы',
        text: node.text,
        audioSrc: node.audio.url,
        duration: node.audio.durationMs ? Math.round(node.audio.durationMs / 1000) : undefined,
      } : { type: 'text' as const, content: node.text };
    case 'audio': return {
      type: 'audioExample' as const,
      title: node.title,
      description: node.description,
      audioSrc: node.asset.url,
      duration: node.asset.durationMs ? Math.round(node.asset.durationMs / 1000) : undefined,
    };
    case 'rule': return { type: 'rule' as const, title: node.title, items: node.items };
    case 'video': return {
      type: 'video' as const,
      senderName: 'Лусине',
      text: node.title,
      videoSrc: node.asset.url,
      thumbnail: node.thumbnailUrl ?? '',
    };
  }
}

function interactionBlocks(
  interaction: Interaction,
  lesson: Lesson,
  step: LessonStep,
  items: Map<string, LearningItem>,
): ContentBlock[] {
  const tracking = trackingFor(lesson, step, interaction);
  switch (interaction.type) {
    case 'listen-repeat': {
      const item = interaction.learningItemIds[0] ? items.get(interaction.learningItemIds[0]) : undefined;
      return [
        ...(item ? [phraseBlock(item)] : []),
        { type: 'pronunciationPrompt' as const, prompt: interaction.prompt, tracking },
      ];
    }
    case 'choice': {
      const options = interaction.options.map((option) => option.text);
      while (options.length < 4) options.push('—');
      return [{
        type: 'multipleChoice' as const,
        question: interaction.prompt,
        options: options.slice(0, 4) as [string, string, string, string],
        correctIndex: Math.max(0, interaction.options.findIndex((option) => option.correct)),
        explanation: interaction.options.find((option) => option.correct)?.feedback,
      }];
    }
    case 'dialogue': {
      const firstTurn = interaction.turns[0];
      return [{
        type: 'dialogue' as const,
        characterName: 'Ани',
        characterRole: 'бариста',
        message: firstTurn?.text ?? '',
        instruction: interaction.context,
        options: (interaction.options ?? []).map((option) => ({
          id: option.id,
          text: option.text,
          correct: option.correct,
          reply: option.reply ?? '',
          feedback: option.feedback,
        })),
        tracking,
      }];
    }
    case 'recall': {
      const item = interaction.learningItemIds[0] ? items.get(interaction.learningItemIds[0]) : undefined;
      if (!item) return [];
      return [{
        type: 'activeRecall' as const,
        prompt: interaction.prompt,
        hint: interaction.hint?.text ?? item.transliteration,
        answer: { armenian: item.armenian, transcription: item.transliteration, translation: item.translation },
        reviewIds: interaction.learningItemIds,
        tracking,
      }];
    }
  }
}

export function adaptCanonicalLessonToLegacySections(lesson: Lesson, learningItems: LearningItem[]): LessonContentSection[] {
  const items = new Map(learningItems.map((item) => [item.id, item]));
  return lesson.steps.map((step, index) => ({
    id: index + 1,
    title: step.title,
    kind: legacySectionKind(step.type),
    objective: step.objective,
    canonical: {
      lessonId: lesson.id,
      lessonRevision: lesson.revision,
      stepId: step.id,
      learningItems,
    },
    blocks: [
      ...step.content.map((node) => presentationBlock(node, items)).filter((block): block is NonNullable<typeof block> => Boolean(block)),
      ...step.interactions.flatMap((interaction) => interactionBlocks(interaction, lesson, step, items)),
    ],
  }));
}
