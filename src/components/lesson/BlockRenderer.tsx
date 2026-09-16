import type { ContentBlock } from '../../types/lessonContent';
import type { AudioMessage } from '../../types/audio';
import { VoiceBubble } from '../audio/VoiceBubble';
import { PhraseCard } from './PhraseCard';
import { RuleCard } from './RuleCard';
import { LessonVideoBubble } from './LessonVideoBubble';
import { RecordPrompt } from './RecordPrompt';
import { LessonAudioCard } from './LessonAudioCard';
import { MultipleChoiceCard } from '../quiz/MultipleChoiceCard';
import { MiniDialogue } from './MiniDialogue';
import { ActiveRecall } from './ActiveRecall';

interface Props {
  block: ContentBlock;
  index: number;
  onSkipRecord?: () => void;
  recordRef?: React.Ref<HTMLDivElement>;
  recordCompleted?: boolean;
  sectionId?: number;
  recordIndex?: number;
  actionDock?: HTMLElement | null;
}

function toAudioMessage(
  block:
    | Extract<ContentBlock, { type: 'audio' }>
    | Extract<ContentBlock, { type: 'teacherBubble' }>
    | Extract<ContentBlock, { type: 'studentBubble' }>,
  index: number,
): AudioMessage {
  if (block.type === 'teacherBubble') {
    return {
      id: `lesson-audio-${index}`,
      sender: 'teacher',
      senderName: block.teacherName,
      text: block.text,
      duration: block.duration,
      src: block.audioSrc,
      time: '',
    };
  }

  if (block.type === 'studentBubble') {
    return {
      id: `lesson-audio-${index}`,
      sender: 'student',
      senderName: block.studentName,
      text: block.text,
      duration: block.duration,
      src: block.audioSrc,
      time: '',
    };
  }

  return {
    id: `lesson-audio-${index}`,
    sender: block.sender,
    senderName: block.senderName,
    text: block.text,
    duration: block.duration,
    src: block.src,
    time: '',
  };
}

export function BlockRenderer({ block, index, onSkipRecord, recordRef, recordCompleted, sectionId, recordIndex, actionDock }: Props) {
  switch (block.type) {
    case 'heading':
      return <h2 className="lesson-heading">{block.text}</h2>;
    case 'text':
    case 'readingText':
      return <p className="lesson-text">{block.content}</p>;
    case 'phrase':
    case 'phraseCard':
      return <PhraseCard block={block} audioId={`phrase-${sectionId ?? 'section'}-${index}`} />;
    case 'audioExample':
      return <LessonAudioCard block={block} index={index} />;
    case 'multipleChoice':
      return (
        <div className="my-5">
          <MultipleChoiceCard question={{
            type: 'multiple-choice',
            question: block.question,
            options: block.options,
            correctIndex: block.correctIndex,
            explanation: block.explanation,
          }} onAnswer={() => {}} />
        </div>
      );
    case 'rule':
      return <RuleCard block={block} />;
    case 'audio':
    case 'teacherBubble':
    case 'studentBubble':
      return (
        <div className="my-5">
          <VoiceBubble message={toAudioMessage(block, index)} />
        </div>
      );
    case 'video':
      return <LessonVideoBubble block={block} />;
    case 'record':
    case 'pronunciationPrompt':
      return (
        <RecordPrompt
          ref={recordRef}
          block={block.type === 'pronunciationPrompt'
            ? { type: 'record', prompt: block.prompt, tracking: block.tracking }
            : block}
          onSkip={onSkipRecord}
          completed={recordCompleted}
          sectionId={sectionId}
          recordIndex={recordIndex}
        />
      );
    case 'dialogue':
      return <MiniDialogue block={block} completed={recordCompleted} onComplete={onSkipRecord} />;
    case 'activeRecall':
      return <ActiveRecall block={block} completed={recordCompleted} onComplete={onSkipRecord} actionDock={actionDock} />;
  }
}
