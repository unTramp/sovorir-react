import { useMemo, useEffect, useRef, useCallback, useState, forwardRef } from 'react';
import type { ContentBlock, LessonPage, PhraseBlock, RuleBlock, AudioBubbleBlock, VideoBubbleBlock, RecordBlock } from '../../types/lessonContent';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioStore } from '../../stores/useAudioStore';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { useRecordingStore } from '../../stores/useRecordingStore';
import { PlayIcon, PauseIcon, MicIcon } from '../../icons';
import { WaveformBars } from '../audio/WaveformBars';
import { formatDuration } from '../../lib/formatDuration';
import { RecordingPlayback } from '../audio/RecordingPlayback';
import { AudioLevelMeter } from '../audio/AudioLevelMeter';
import { VideoOverlay } from '../audio/VideoOverlay';
import { QuizContainer } from '../quiz/QuizContainer';
import { contentRepository } from '../../lib/contentRepository';
import type { Quiz, QuizResult } from '../../types/quiz';

/* ── Speaker Icon ── */
function SpeakerIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="btn-bg" cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#F8EFEA"/>
          <stop offset="100%" stopColor="#D9C8BE"/>
        </radialGradient>
      </defs>
      <rect width="48" height="48" rx="24" fill="url(#btn-bg)"/>
      <path d="M26 32.75V30.7C27.5 30.2667 28.7083 29.4333 29.625 28.2C30.5417 26.9667 31 25.5667 31 24C31 22.4333 30.5417 21.0333 29.625 19.8C28.7083 18.5667 27.5 17.7333 26 17.3V15.25C28.0667 15.7167 29.75 16.7625 31.05 18.3875C32.35 20.0125 33 21.8833 33 24C33 26.1167 32.35 27.9875 31.05 29.6125C29.75 31.2375 28.0667 32.2833 26 32.75V32.75M15 27.025V21.025H19L24 16.025V32.025L19 27.025H15V27.025M26 28.025V19.975C26.7833 20.3417 27.3958 20.8917 27.8375 21.625C28.2792 22.3583 28.5 23.1583 28.5 24.025C28.5 24.875 28.2792 25.6625 27.8375 26.3875C27.3958 27.1125 26.7833 27.6583 26 28.025V28.025M22 20.875L19.85 23.025H17V25.025H19.85L22 27.175V20.875V20.875M19.5 24.025V24.025V24.025V24.025V24.025V24.025V24.025V24.025" fill="#8D4A2A"/>
    </svg>
  );
}

const WORD_STATUS_LABELS: Record<NonNullable<PhraseBlock['status']>, string> = {
  new: 'Новое',
  learned: 'Изучено',
  review: 'Повтор',
};

/* ── Phrase Card ── */
function PhraseCard({ block }: { block: PhraseBlock }) {
  const { togglePlay } = useAudioPlayer();
  const msgId = `phrase-${block.armenian}`;
  const status = block.status ?? 'new';

  return (
    <div className={`word-card word-card--${status}`}>
      <div className="word-card__info">
        <div className="word-card__header">
          <span className="word-card__armenian" lang="hy">{block.armenian}</span>
          <span className="word-card__badge">{WORD_STATUS_LABELS[status]}</span>
        </div>
        <div className="word-card__meta">
          <span className="word-card__transcription">{block.transcription}</span>
          <span className="word-card__dot" aria-hidden="true" />
          <span className="word-card__russian">{block.russian}</span>
        </div>
        {block.translation && (
          <div className="word-card__translation">{block.translation}</div>
        )}
      </div>
      <button
        className="word-card__audio-btn"
        aria-label="Прослушать произношение"
        onClick={() => block.audioSrc && togglePlay(msgId, block.audioSrc)}
      >
        <SpeakerIcon />
      </button>
    </div>
  );
}

/* ── Rule Card ── */
function RuleCard({ block }: { block: RuleBlock }) {
  return (
    <div className="lesson-rule">
      <div className="lesson-rule__title">{block.title}</div>
      <ul className="lesson-rule__list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
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
            isPlaying={isPlaying}
          />
          <span className="voice-bubble__duration">
            {formatDuration(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Inline Video Bubble ── */
function InlineVideoBubble({ block }: { block: VideoBubbleBlock }) {
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <>
      <div className="flex justify-start my-5">
        <div className="voice-bubble voice-bubble--teacher">
          <img
            src="/assets/teacher-avatar.png"
            className="voice-bubble__teacher-img"
            alt={block.senderName}
          />
          <div className="voice-bubble__name">{block.senderName}</div>
          <div className="voice-bubble__text">{block.text}</div>
          <button
            className="lesson-video-thumb"
            onClick={() => setOverlayOpen(true)}
            aria-label="Открыть видео"
          >
            <img
              src={block.thumbnail}
              alt={block.text}
              className="lesson-video-thumb__img"
            />
            <div className="lesson-video-thumb__overlay">
              <div className="lesson-video-thumb__play">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 4l10 6-10 6V4z" fill="#7A3E34" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
      {overlayOpen && (
        <VideoOverlay
          videoSrc={block.videoSrc}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </>
  );
}

/* ── Inline Record Prompt ── */
const InlineRecordPrompt = forwardRef<HTMLDivElement, { block: RecordBlock; onSkip?: () => void; completed?: boolean; pageId?: number; recordIndex?: number }>(
  ({ block, onSkip, completed, pageId, recordIndex }, ref) => {
    const colonIdx = block.prompt.indexOf(':');
    const label = colonIdx !== -1 ? block.prompt.slice(0, colonIdx).trim() : 'Произнесите';
    const phrase = colonIdx !== -1 ? block.prompt.slice(colonIdx + 1).trim() : block.prompt;

    const getRecordingForPrompt = useRecordingStore((s) => s.getRecordingForPrompt);
    const getRecordingUrl = useRecordingStore((s) => s.getRecordingUrl);
    const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
    const [playbackDuration, setPlaybackDuration] = useState(0);

    useEffect(() => {
      if (!completed || pageId == null || recordIndex == null) return;
      const rec = getRecordingForPrompt(pageId, recordIndex);
      if (!rec) return;
      setPlaybackDuration(rec.duration);
      getRecordingUrl(rec.id).then((url) => {
        if (url) setPlaybackUrl(url);
      });
      return () => { if (playbackUrl) URL.revokeObjectURL(playbackUrl); };
    }, [completed, pageId, recordIndex]);

    return (
      <div ref={ref} className={`lesson-record-prompt ${completed ? 'lesson-record-prompt--done' : ''}`}>
        <div className="lesson-record-prompt__body">
          <div className="lesson-record-prompt__label">{completed ? '✓' : '🎤'} {label}</div>
          <div className="lesson-record-prompt__phrase" lang="hy">{phrase}</div>
          {completed && playbackUrl && (
            <div className="mt-2">
              <RecordingPlayback audioUrl={playbackUrl} duration={playbackDuration} />
            </div>
          )}
        </div>
        {onSkip && (
          <button className="lesson-record-prompt__skip" onClick={onSkip}>
            Пропустить
          </button>
        )}
      </div>
    );
  },
);

/* ── Sticky Record CTA ── */
function StickyRecordCTA({ onComplete, pageId, recordIndex }: { onComplete: () => void; pageId: number; recordIndex: number }) {
  const { start, stop, isRecording, audioBlob, audioLevel, duration, error } = useMediaRecorder();
  const saveRecording = useRecordingStore((s) => s.saveRecording);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [savedDuration, setSavedDuration] = useState(0);

  useEffect(() => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    setRecordingUrl(url);
    setSavedDuration(duration);

    const id = `rec-${pageId}-${recordIndex}-${Date.now()}`;
    saveRecording(
      { id, pageId, recordIndex, duration, createdAt: Date.now() },
      audioBlob,
    ).then(() => onComplete());

    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  const handleStart = useCallback(() => {
    setRecordingUrl(null);
    start();
  }, [start]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  return (
    <div className="lesson-record-sticky">
      {error && (
        <div className="lesson-record-sticky__error">{error}</div>
      )}
      <div className="lesson-record-sticky__actions">
        {isRecording && <AudioLevelMeter level={audioLevel} />}
        {isRecording ? (
          <button
            className="lesson-record-sticky__btn lesson-record-sticky__btn--recording"
            onMouseUp={handleStop}
            onTouchEnd={(e) => { e.preventDefault(); handleStop(); }}
          >
            <span className="lesson-record-sticky__pulse" /> {duration}с
          </button>
        ) : (
          <div className="lesson-record-sticky__mic-wrap">
            <button
              className="lesson-record-sticky__mic-btn"
              onMouseDown={handleStart}
              onTouchStart={(e) => { e.preventDefault(); handleStart(); }}
            >
              <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="38" y="13" width="64" height="64" rx="32" fill="url(#rec_grad)"/>
                <g filter="url(#rec_shadow)">
                  <rect x="38" y="13" width="64" height="64" rx="32" fill="white" fillOpacity="0.01" shapeRendering="crispEdges"/>
                </g>
                <path d="M70 48.125C68.9583 48.125 68.0729 47.7604 67.3438 47.0312C66.6146 46.3021 66.25 45.4167 66.25 44.375V36.875C66.25 35.8333 66.6146 34.9479 67.3438 34.2188C68.0729 33.4896 68.9583 33.125 70 33.125C71.0417 33.125 71.9271 33.4896 72.6562 34.2188C73.3854 34.9479 73.75 35.8333 73.75 36.875V44.375C73.75 45.4167 73.3854 46.3021 72.6562 47.0312C71.9271 47.7604 71.0417 48.125 70 48.125ZM68.75 56.875V53.0312C66.5833 52.7396 64.7917 51.7708 63.375 50.125C61.9583 48.4792 61.25 46.5625 61.25 44.375H63.75C63.75 46.1042 64.3594 47.5781 65.5781 48.7969C66.7969 50.0156 68.2708 50.625 70 50.625C71.7292 50.625 73.2031 50.0156 74.4219 48.7969C75.6406 47.5781 76.25 46.1042 76.25 44.375H78.75C78.75 46.5625 78.0417 48.4792 76.625 50.125C75.2083 51.7708 73.4167 52.7396 71.25 53.0312V56.875H68.75Z" fill="white"/>
                <defs>
                  <filter id="rec_shadow" x="0" y="0" width="140" height="140" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feMorphology radius="12" operator="erode" in="SourceAlpha" result="effect1_dropShadow"/>
                    <feOffset dy="25"/>
                    <feGaussianBlur stdDeviation="25"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                  </filter>
                  <linearGradient id="rec_grad" x1="38" y1="13" x2="102" y2="77" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8D4A2A"/>
                    <stop offset="1" stopColor="#AB613F"/>
                  </linearGradient>
                </defs>
              </svg>
            </button>
            <span className="lesson-record-sticky__hint">Удерживайте</span>
          </div>
        )}
      </div>
      {recordingUrl && (
        <div className="mt-2">
          <RecordingPlayback audioUrl={recordingUrl} duration={savedDuration} />
        </div>
      )}
    </div>
  );
}

/* ── Delayed Teacher Block ── */
function DelayedTeacherBlock({ children }: { children: React.ReactNode; senderName?: string }) {
  return <div>{children}</div>;
}

/* ── Block Renderer ── */
function BlockRenderer({ block, index, onSkipRecord, recordRef, recordCompleted, pageId, recordIndex }: {
  block: ContentBlock;
  index: number;
  onSkipRecord?: () => void;
  recordRef?: React.Ref<HTMLDivElement>;
  recordCompleted?: boolean;
  pageId?: number;
  recordIndex?: number;
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
    case 'video':
      return (
        <DelayedTeacherBlock senderName={block.senderName}>
          <InlineVideoBubble block={block} />
        </DelayedTeacherBlock>
      );
    case 'record':
      return <InlineRecordPrompt ref={recordRef} block={block} onSkip={onSkipRecord} completed={recordCompleted} pageId={pageId} recordIndex={recordIndex} />;
  }
}

/* ── Lesson Complete Card ── */
function LessonCompleteCard() {
  const currentPage = useLessonStore((s) => s.currentPage);
  const totalPages = useLessonStore((s) => s.totalPages);
  const nextPage = useLessonStore((s) => s.nextPage);
  const isQuizPassed = useLessonProgress((s) => s.isQuizPassed(currentPage));
  const saveQuizResult = useLessonProgress((s) => s.saveQuizResult);

  const [allPages, setAllPages] = useState<LessonPage[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    contentRepository.getLessonPages().then(setAllPages);
  }, []);

  useEffect(() => {
    contentRepository.getQuizForPage(currentPage).then(setQuiz);
  }, [currentPage]);

  const page = allPages.find((p) => p.id === currentPage);
  const nextPageData = allPages.find((p) => p.id === currentPage + 1);

  // Find the first heading block for the current page summary
  const currentHeading = page?.blocks.find((b) => b.type === 'heading');
  const summaryText = currentHeading?.type === 'heading' ? currentHeading.text : 'этот урок';

  // Find the first heading block for the next page
  const nextHeading = nextPageData?.blocks.find((b) => b.type === 'heading');
  const nextPageTitle = nextHeading?.type === 'heading' ? nextHeading.text : '';

  const isLastPage = currentPage >= totalPages;
  const needsQuiz = !!quiz && !isQuizPassed;

  const handleQuizComplete = useCallback((result: QuizResult) => {
    saveQuizResult(currentPage, result);
  }, [currentPage, saveQuizResult]);

  return (
    <>
      <div className="lesson-complete">
        <div className="lesson-complete__emoji">🎉</div>
        <div className="lesson-complete__title">Отлично!</div>
        <div className="lesson-complete__summary">
          Вы изучили: {summaryText.toLowerCase()}.
        </div>
        {!isLastPage && nextPageTitle && (
          <div className="lesson-complete__next-hint">
            <img
              src="/assets/teacher-avatar.png"
              className="lesson-complete__avatar"
              alt="Лусине"
            />
            <span>Готовы перейти к: {nextPageTitle.toLowerCase()}?</span>
          </div>
        )}
        <button
          className="lesson-complete__btn"
          onClick={isLastPage ? undefined : nextPage}
          disabled={isLastPage || needsQuiz}
        >
          {isLastPage ? 'Урок завершён ✓' : needsQuiz ? 'Пройдите тест ↓' : 'Следующий урок →'}
        </button>
      </div>
      {quiz && (
        <div className="mt-4">
          <QuizContainer quiz={quiz} onComplete={handleQuizComplete} />
        </div>
      )}
    </>
  );
}

/* ── Main Component ── */
interface Props {
  completedRecords: number;
  onRecordComplete: () => void;
}

export function LessonPageView({ completedRecords, onRecordComplete }: Props) {
  const currentPage = useLessonStore((s) => s.currentPage);
  const [allPages, setAllPages] = useState<LessonPage[]>([]);

  useEffect(() => {
    contentRepository.getLessonPages().then(setAllPages);
  }, []);

  const page = allPages.find((p) => p.id === currentPage);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef(currentPage);
  const recordPromptRef = useRef<HTMLDivElement>(null);
  const [recordPromptVisible, setRecordPromptVisible] = useState(false);

  // Scroll to top on page change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [currentPage]);

  // Compute record indices and visible blocks
  const { visibleBlocks, allRecordsCompleted } = useMemo(() => {
    if (!page) return { visibleBlocks: [] as ContentBlock[], allRecordsCompleted: false };

    const recIndices: number[] = [];
    page.blocks.forEach((b, i) => {
      if (b.type === 'record') recIndices.push(i);
    });

    const allDone = completedRecords >= recIndices.length;

    // If all records completed, show everything
    if (allDone) {
      return { visibleBlocks: page.blocks, allRecordsCompleted: true };
    }

    // Show up to and including the current incomplete record
    const cutoffIndex = recIndices[completedRecords];
    return { visibleBlocks: page.blocks.slice(0, cutoffIndex + 1), allRecordsCompleted: false };
  }, [page, completedRecords]);

  // Scroll to bottom when new blocks appear (skip on page change)
  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage;
      return;
    }
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [visibleBlocks.length, allRecordsCompleted, currentPage]);

  // Show/hide sticky CTA based on record prompt visibility
  useEffect(() => {
    const el = recordPromptRef.current;
    const root = scrollRef.current;
    if (!el || !root) { setRecordPromptVisible(false); return; }

    const observer = new IntersectionObserver(
      ([entry]) => setRecordPromptVisible(entry.isIntersecting),
      { root, threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleBlocks.length, currentPage]);

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

  // Show sticky CTA when last visible block is a record, not all completed, and prompt is in view
  const hasActiveRecord = !allRecordsCompleted &&
    visibleBlocks.length > 0 &&
    visibleBlocks[visibleBlocks.length - 1].type === 'record';
  const showRecordCTA = hasActiveRecord && recordPromptVisible;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar" style={{ background: '#FDFBF9' }}>
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {visibleBlocks.map((block, i) => {
          const isLastRecord = hasActiveRecord && i === visibleBlocks.length - 1;
          const isCompletedRecord = block.type === 'record' && !isLastRecord;
          // Compute recordIndex for this block
          let recIdx: number | undefined;
          if (block.type === 'record') {
            recIdx = visibleBlocks.slice(0, i).filter((b) => b.type === 'record').length;
          }
          return (
            <div key={`${currentPage}-${i}`} className="lesson-block-enter">
              <BlockRenderer
                block={block}
                index={i}
                onSkipRecord={isLastRecord ? handleRecordComplete : undefined}
                recordRef={isLastRecord ? recordPromptRef : undefined}
                recordCompleted={isCompletedRecord}
                pageId={currentPage}
                recordIndex={recIdx}
              />
            </div>
          );
        })}
        {allRecordsCompleted && (
          <div className="lesson-block-enter">
            <LessonCompleteCard />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {showRecordCTA && (
        <StickyRecordCTA onComplete={handleRecordComplete} pageId={currentPage} recordIndex={completedRecords} />
      )}
    </div>
  );
}
