import type { ContentBlock } from '../../types/lessonContent';
import type { AudioMessage } from '../../types/audio';
import { VoiceBubble } from '../audio/VoiceBubble';
import { PhraseCard } from './PhraseCard';
import { RuleCard } from './RuleCard';
import { LessonVideoBubble } from './LessonVideoBubble';
import { RecordPrompt } from './RecordPrompt';

interface Props {
  block: ContentBlock;
  index: number;
  onSkipRecord?: () => void;
  recordRef?: React.Ref<HTMLDivElement>;
  recordCompleted?: boolean;
  sectionId?: number;
  recordIndex?: number;
}

function toAudioMessage(block: Extract<ContentBlock, { type: 'audio' }>, index: number): AudioMessage {
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

export function BlockRenderer({ block, index, onSkipRecord, recordRef, recordCompleted, sectionId, recordIndex }: Props) {
  switch (block.type) {
    case 'heading':
      return <h2 className="lesson-heading">{block.text}</h2>;
    case 'text':
      return <p className="lesson-text">{block.content}</p>;
    case 'phrase':
      return <PhraseCard block={block} />;
    case 'rule':
      return <RuleCard block={block} />;
    case 'audio':
      return (
        <div className="my-5">
          <VoiceBubble message={toAudioMessage(block, index)} />
        </div>
      );
    case 'video':
      return <LessonVideoBubble block={block} />;
    case 'record':
      return (
        <RecordPrompt
          ref={recordRef}
          block={block}
          onSkip={onSkipRecord}
          completed={recordCompleted}
          sectionId={sectionId}
          recordIndex={recordIndex}
        />
      );
  }
}
