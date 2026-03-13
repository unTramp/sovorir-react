import { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import type { ContentBlock, PhraseBlock, RuleBlock, AudioBubbleBlock, RecordBlock } from '../../types/lessonContent';
import { lessonPages } from '../../data/lessonPages';
import { useLessonStore } from '../../stores/useLessonStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';
import { PlayIcon, PauseIcon, MicIcon } from '../../icons';
import { WaveformBars } from '../audio/WaveformBars';
import { formatDuration } from '../../lib/formatDuration';

/* ── Speaker Icon ── */
function SpeakerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  );
}

/* ── Phrase Card ── */
function PhraseCard({ block }: { block: PhraseBlock }) {
  const { togglePlay } = useAudioPlayer();
  const msgId = `phrase-${block.armenian}`;

  return (
    <div className="lesson-phrase">
      <div className="lesson-phrase__top">
        <div className="lesson-phrase__left">
          <span className="lesson-phrase__armenian" lang="hy">{block.armenian}</span>
          <span className="lesson-phrase__transcription">
            / {block.transcription} /
            <button
              className="lesson-phrase__audio-btn"
              aria-label="Прослушать произношение"
              onClick={() => block.audioSrc && togglePlay(msgId, block.audioSrc)}
            >
              <SpeakerIcon />
            </button>
          </span>
        </div>
      </div>
      <div className="lesson-phrase__russian">{block.russian}</div>
      <div className="lesson-phrase__translation">{block.translation}</div>
    </div>
  );
}

/* ── Rule Card ── */
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

/* ── Inline Audio Bubble ── */
function InlineAudioBubble({ block, index }: { block: AudioBubbleBlock; index: number }) {
  const msgId = `lesson-audio-${index}`;
  const { togglePlay, playingId } = useAudioPlayer();
  const progress = useAudioStore((s) => s.progress[msgId] || 0);
  const isPlaying = playingId === msgId;
  const isTeacher = block.sender === 'teacher';

  const remaining = isPlaying
    ? Math.max(0, Math.ceil(block.duration * (1 - progress)))
    : block.duration;

  return (
    <div className={`flex ${isTeacher ? 'justify-start' : 'justify-end'} my-5`}>
      <div className={`voice-bubble ${isTeacher ? 'voice-bubble--teacher' : 'voice-bubble--student'}`}>
        {isTeacher && (
          <img
            src="/assets/teacher-avatar.png"
            className="voice-bubble__teacher-img"
            alt={block.senderName}
          />
        )}
        <div className="voice-bubble__name">{block.senderName}</div>
        {isTeacher && <div className="voice-bubble__text">{block.text}</div>}
        <div className="voice-bubble__player">
          <button
            className="voice-bubble__play"
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
            onClick={() => togglePlay(msgId, block.src, block.duration)}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <WaveformBars
            messageId={msgId}
            progress={progress}
            isTeacher={isTeacher}
          />
          <span className="voice-bubble__duration">
            {formatDuration(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Inline Record with Record / Skip ── */
function InlineRecordButton({ block, onComplete }: { block: RecordBlock; onComplete: () => void }) {
  return (
    <div className="lesson-record">
      <button
        className="lesson-record__btn"
        aria-label="Записать произношение"
        onClick={onComplete}
      >
        <MicIcon />
      </button>
      <div className="lesson-record__body">
        <span className="lesson-record__prompt">{block.prompt}</span>
        <button
          className="lesson-record__skip"
          onClick={onComplete}
        >
          Пропустить
        </button>
      </div>
    </div>
  );
}

/* ── Typing Indicator ── */
function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex justify-start my-5">
      <div className="typing-indicator">
        <span className="typing-indicator__name">{name} печатает</span>
        <span className="typing-indicator__dots">
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
        </span>
      </div>
    </div>
  );
}

/* ── Delayed Teacher Block ── */
function DelayedTeacherBlock({ children, senderName }: { children: React.ReactNode; senderName: string }) {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [ready]);

  if (!ready) return <TypingIndicator name={senderName} />;
  return <div ref={ref}>{children}</div>;
}

/* ── Block Renderer ── */
function BlockRenderer({ block, index, onRecordComplete }: {
  block: ContentBlock;
  index: number;
  onRecordComplete: () => void;
}) {
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
      if (block.sender === 'teacher') {
        return (
          <DelayedTeacherBlock senderName={block.senderName}>
            <InlineAudioBubble block={block} index={index} />
          </DelayedTeacherBlock>
        );
      }
      return <InlineAudioBubble block={block} index={index} />;
    case 'record':
      return <InlineRecordButton block={block} onComplete={onRecordComplete} />;
  }
}

/* ── Main Component ── */
interface Props {
  completedRecords: number;
  onRecordComplete: () => void;
}

export function LessonPageView({ completedRecords, onRecordComplete }: Props) {
  const currentPage = useLessonStore((s) => s.currentPage);
  const page = lessonPages.find((p) => p.id === currentPage);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Compute visible blocks
  const visibleBlocks = useMemo(() => {
    if (!page) return [];

    const recIndices: number[] = [];
    page.blocks.forEach((b, i) => {
      if (b.type === 'record') recIndices.push(i);
    });

    // If all records completed, show everything
    if (completedRecords >= recIndices.length) {
      return page.blocks;
    }

    // Show up to and including the current incomplete record
    const cutoffIndex = recIndices[completedRecords];
    return page.blocks.slice(0, cutoffIndex + 1);
  }, [page, completedRecords]);

  // Scroll to bottom when new blocks appear
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [visibleBlocks.length]);

  const handleRecordComplete = useCallback(() => {
    onRecordComplete();
  }, [onRecordComplete]);

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        Страница не найдена
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar" style={{ background: '#FDFBF9' }}>
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {visibleBlocks.map((block, i) => (
          <div key={`${currentPage}-${i}`} className="lesson-block-enter">
            <BlockRenderer
              block={block}
              index={i}
              onRecordComplete={handleRecordComplete}
            />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
