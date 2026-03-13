import type { ContentBlock, PhraseBlock, RuleBlock } from '../../types/lessonContent';
import { lessonPages } from '../../data/lessonPages';
import { usePdfStore } from '../../stores/usePdfStore';
import { PlayIcon } from '../../icons';

function PhraseCard({ block }: { block: PhraseBlock }) {
  return (
    <div className="lesson-phrase">
      <div className="lesson-phrase__top">
        <div className="lesson-phrase__left">
          <span className="lesson-phrase__armenian" lang="hy">{block.armenian}</span>
          <span className="lesson-phrase__transcription">[{block.transcription}]</span>
        </div>
        {block.audioSrc && (
          <button className="lesson-phrase__play" aria-label={`Прослушать ${block.russian}`}>
            <PlayIcon size={14} />
          </button>
        )}
      </div>
      <div className="lesson-phrase__russian">{block.russian}</div>
      <div className="lesson-phrase__translation">{block.translation}</div>
    </div>
  );
}

function RuleCard({ block }: { block: RuleBlock }) {
  return (
    <div className="lesson-rule">
      <div className="lesson-rule__title">{block.title}</div>
      <ul className="lesson-rule__list">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="lesson-heading">{block.text}</h2>;
    case 'text':
      return <p className="lesson-text">{block.content}</p>;
    case 'phrase':
      return <PhraseCard block={block} />;
    case 'rule':
      return <RuleCard block={block} />;
  }
}

export function LessonPageView() {
  const currentPage = usePdfStore((s) => s.currentPage);
  const page = lessonPages.find((p) => p.id === currentPage);

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        Страница не найдена
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar" style={{ background: '#FDFBF9' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {page.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  );
}
