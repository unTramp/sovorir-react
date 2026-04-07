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

interface Props {
  completedRecords: number;
  onRecordComplete: () => void;
}

export function LessonSectionView({ completedRecords, onRecordComplete }: Props) {
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
  const { visibleBlocks, allRecordsCompleted } = useMemo(() => {
    if (!section) return { visibleBlocks: [] as ContentBlock[], allRecordsCompleted: false };

    const recIndices: number[] = [];
    section.blocks.forEach((b, i) => {
      if (b.type === 'record') recIndices.push(i);
    });

    const allDone = completedRecords >= recIndices.length;

    if (allDone) {
      return { visibleBlocks: section.blocks, allRecordsCompleted: true };
    }

    const cutoffIndex = recIndices[completedRecords];
    return { visibleBlocks: section.blocks.slice(0, cutoffIndex + 1), allRecordsCompleted: false };
  }, [section, completedRecords]);

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
      if (block.type === 'record') map.set(i, counter++);
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

  const hasActiveRecord = !allRecordsCompleted &&
    visibleBlocks.length > 0 &&
    visibleBlocks[visibleBlocks.length - 1].type === 'record';
  const showRecordCTA = hasActiveRecord && recordPromptVisible;

  return (
    <div ref={scrollRef} className="lesson-scroll">
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {visibleBlocks.map((block, i) => {
          const isLastRecord = hasActiveRecord && i === visibleBlocks.length - 1;
          const isCompletedRecord = block.type === 'record' && !isLastRecord;
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
