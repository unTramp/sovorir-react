import { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import type { ContentBlock } from '../../types/lessonContent';
import { useLessonStore } from '../../stores/useLessonStore';
import { contentRepository } from '../../lib/contentRepository';
import type { LessonContentSection } from '../../types/lessonContent';
import { BlockRenderer } from '../lesson/BlockRenderer';
import { StickyRecordCTA } from '../lesson/StickyRecordCTA';
import { LessonCompleteCard } from '../lesson/LessonCompleteCard';
import {
  subscribeAdminLessonBuilderSync,
} from '../../lib/adminLessonBuilderStorage';

function isRecordLikeBlock(block: ContentBlock) {
  return block.type === 'record' || block.type === 'pronunciationPrompt';
}

type LessonTab = 'materials' | 'dictionary' | 'audio' | 'video';

const AUDIO_BLOCK_TYPES = new Set(['audio', 'audioExample', 'teacherBubble', 'studentBubble']);
const DICTIONARY_BLOCK_TYPES = new Set(['phrase', 'phraseCard']);

interface Props {
  completedRecords: number;
  onRecordComplete: () => void;
  activeTab?: LessonTab;
}

export function LessonSectionView({ completedRecords, onRecordComplete, activeTab = 'materials' }: Props) {
  const currentSection = useLessonStore((s) => s.currentSection);
  const [allSections, setAllSections] = useState<LessonContentSection[]>([]);

  const loadSections = useCallback(() => {
    contentRepository.getLessonSections().then(setAllSections);
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    function handleSync() {
      loadSections();
    }

    function handleFocus() {
      loadSections();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadSections();
      }
    }

    const unsubscribeSync = subscribeAdminLessonBuilderSync(handleSync);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      unsubscribeSync();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadSections]);

  const section = allSections.find((item) => item.id === currentSection);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevSectionRef = useRef(currentSection);
  const recordPromptRef = useRef<HTMLDivElement>(null);
  const [recordPromptVisible, setRecordPromptVisible] = useState(false);

  // Scroll to top on section change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [currentSection]);

  // Compute record indices and visible blocks
  const tabFilteredBlocks = useMemo(() => {
    if (!section) return [] as ContentBlock[];
    if (activeTab === 'dictionary') return section.blocks.filter((b) => DICTIONARY_BLOCK_TYPES.has(b.type));
    if (activeTab === 'audio') return section.blocks.filter((b) => AUDIO_BLOCK_TYPES.has(b.type));
    if (activeTab === 'video') return section.blocks.filter((b) => b.type === 'video');
    return section.blocks;
  }, [section, activeTab]);

  const { visibleBlocks, allRecordsCompleted } = useMemo(() => {
    if (!section) return { visibleBlocks: [] as ContentBlock[], allRecordsCompleted: false };

    // Non-materials tabs show all filtered blocks without record gating
    if (activeTab !== 'materials') {
      return { visibleBlocks: tabFilteredBlocks, allRecordsCompleted: false };
    }

    const recIndices: number[] = [];
    tabFilteredBlocks.forEach((b, i) => {
      if (isRecordLikeBlock(b)) recIndices.push(i);
    });

    const allDone = completedRecords >= recIndices.length;

    if (allDone) {
      return { visibleBlocks: tabFilteredBlocks, allRecordsCompleted: true };
    }

    const cutoffIndex = recIndices[completedRecords];
    return { visibleBlocks: tabFilteredBlocks.slice(0, cutoffIndex + 1), allRecordsCompleted: false };
  }, [section, completedRecords, activeTab, tabFilteredBlocks]);

  // Scroll to bottom when new blocks appear (skip on section change)
  useEffect(() => {
    if (prevSectionRef.current !== currentSection) {
      prevSectionRef.current = currentSection;
      return;
    }
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [visibleBlocks.length, allRecordsCompleted, currentSection]);

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
  }, [visibleBlocks.length, currentSection]);

  const handleRecordComplete = useCallback(() => {
    onRecordComplete();
  }, [onRecordComplete]);

  // Precompute record indices — O(n) instead of O(n²) inside map
  // Must be before early return to satisfy Rules of Hooks
  const recordIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    let counter = 0;
    visibleBlocks.forEach((block, i) => {
      if (isRecordLikeBlock(block)) map.set(i, counter++);
    });
    return map;
  }, [visibleBlocks]);

  if (!section) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        Секция не найдена
      </div>
    );
  }

  if (visibleBlocks.length === 0 && activeTab !== 'materials') {
    const labels: Record<string, string> = { dictionary: 'слов', audio: 'аудио', video: 'видео' };
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-sm">
        В этом разделе нет {labels[activeTab] ?? 'контента'}
      </div>
    );
  }

  const hasActiveRecord = !allRecordsCompleted &&
    visibleBlocks.length > 0 &&
    isRecordLikeBlock(visibleBlocks[visibleBlocks.length - 1]);
  const showRecordCTA = hasActiveRecord && recordPromptVisible;

  return (
    <div ref={scrollRef} className="lesson-scroll">
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {visibleBlocks.map((block, i) => {
          const isLastRecord = hasActiveRecord && i === visibleBlocks.length - 1;
          const isCompletedRecord = isRecordLikeBlock(block) && !isLastRecord;
          const recIdx = recordIndexMap.get(i);
          return (
            <div key={`${currentSection}-${i}`} className="lesson-block-enter">
              <BlockRenderer
                block={block}
                index={i}
                onSkipRecord={isLastRecord ? handleRecordComplete : undefined}
                recordRef={isLastRecord ? recordPromptRef : undefined}
                recordCompleted={isCompletedRecord}
                sectionId={currentSection}
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
        <StickyRecordCTA onComplete={handleRecordComplete} sectionId={currentSection} recordIndex={completedRecords} />
      )}
    </div>
  );
}
