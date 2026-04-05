import { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import type { ContentBlock } from '../../types/lessonContent';
import { useLessonStore } from '../../stores/useLessonStore';
import { contentRepository } from '../../lib/contentRepository';
import type { LessonPage } from '../../types/lessonContent';
import { BlockRenderer } from '../lesson/BlockRenderer';
import { StickyRecordCTA } from '../lesson/StickyRecordCTA';
import { LessonCompleteCard } from '../lesson/LessonCompleteCard';

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

    if (allDone) {
      return { visibleBlocks: page.blocks, allRecordsCompleted: true };
    }

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

  const hasActiveRecord = !allRecordsCompleted &&
    visibleBlocks.length > 0 &&
    visibleBlocks[visibleBlocks.length - 1].type === 'record';
  const showRecordCTA = hasActiveRecord && recordPromptVisible;

  // Precompute record indices — O(n) instead of O(n²) inside map
  const recordIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    let counter = 0;
    visibleBlocks.forEach((block, i) => {
      if (block.type === 'record') map.set(i, counter++);
    });
    return map;
  }, [visibleBlocks]);

  return (
    <div ref={scrollRef} className="lesson-scroll">
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {visibleBlocks.map((block, i) => {
          const isLastRecord = hasActiveRecord && i === visibleBlocks.length - 1;
          const isCompletedRecord = block.type === 'record' && !isLastRecord;
          const recIdx = recordIndexMap.get(i);
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
