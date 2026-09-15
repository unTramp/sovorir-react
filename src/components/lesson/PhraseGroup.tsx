import type { PhraseBlock, PhraseCardBlock } from '../../types/lessonContent';
import { PhraseCard } from './PhraseCard';

interface PhraseGroupItem {
  block: PhraseBlock | PhraseCardBlock;
  index: number;
}

interface Props {
  items: PhraseGroupItem[];
  sectionId: number;
}

export function PhraseGroup({ items, sectionId }: Props) {
  return (
    <div className="phrase-group" aria-label="Фразы для изучения">
      {items.map(({ block, index }) => (
        <PhraseCard
          key={`${block.armenian}-${index}`}
          block={block}
          audioId={`phrase-${sectionId}-${index}`}
          grouped
        />
      ))}
    </div>
  );
}
