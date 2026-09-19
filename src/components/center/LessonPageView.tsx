import { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import type { ContentBlock } from '../../types/lessonContent';
import { useLessonStore } from '../../stores/useLessonStore';
import { useLessonSectionsStore } from '../../stores/useLessonSectionsStore';
import { useLessonProgress } from '../../stores/useLessonProgress';
import { BlockRenderer } from '../lesson/BlockRenderer';
import { StickyRecordCTA } from '../lesson/StickyRecordCTA';
import { LessonCompleteCard } from '../lesson/LessonCompleteCard';
import { PhraseGroup } from '../lesson/PhraseGroup';
import { PhrasePracticeCard } from '../lesson/PhrasePracticeCard';
import { getPhrasePracticePairs } from '../../lib/phrasePracticeFlow';

function isRequiredInteraction(block: ContentBlock) {
  return block.type === 'record'
    || block.type === 'pronunciationPrompt'
    || block.type === 'dialogue'
    || block.type === 'activeRecall';
}

function isPhraseBlock(
  block: ContentBlock,
): block is Extract<ContentBlock, { type: 'phrase' | 'phraseCard' }> {
  return block.type === 'phrase' || block.type === 'phraseCard';
}

interface Props {
  completedRecords: number;
  onRecordComplete: () => void;
  onRecordRetry: (recordIndex: number) => void;
}

export function LessonSectionView({ completedRecords, onRecordComplete, onRecordRetry }: Props) {
  const currentSection = useLessonStore((s) => s.currentSection);
  const allSections = useLessonSectionsStore((s) => s.sections);
  const sectionCompleted = useLessonProgress((s) => Boolean(s.sections[currentSection]?.completed));

  const section = allSections.find((item) => item.id === currentSection);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevSectionRef = useRef(currentSection);
  const previousVisibleCountRef = useRef(0);
  const [interactionDock, setInteractionDock] = useState<HTMLDivElement | null>(null);
  const phrasePracticePairs = useMemo(
    () => section ? getPhrasePracticePairs(section.blocks) : null,
    [section],
  );
  const activePhraseIndex = phrasePracticePairs
    ? Math.min(completedRecords, phrasePracticePairs.length - 1)
    : 0;

  // Scroll to top on section change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [currentSection]);

  // Compute record indices and visible blocks
  const { visibleBlocks, allRecordsCompleted } = useMemo(() => {
    if (!section) return { visibleBlocks: [] as ContentBlock[], allRecordsCompleted: false };

    if (phrasePracticePairs) {
      const phraseIndex = Math.min(completedRecords, phrasePracticePairs.length - 1);
      const pair = phrasePracticePairs[phraseIndex];
      return {
        visibleBlocks: [pair.phrase, pair.interaction] as ContentBlock[],
        allRecordsCompleted: sectionCompleted || completedRecords >= phrasePracticePairs.length,
      };
    }

    const recIndices: number[] = [];
    section.blocks.forEach((b, i) => {
      if (isRequiredInteraction(b)) recIndices.push(i);
    });

    const allDone = sectionCompleted || completedRecords >= recIndices.length;

    if (allDone) {
      return { visibleBlocks: section.blocks, allRecordsCompleted: true };
    }

    const cutoffIndex = recIndices[completedRecords];
    return { visibleBlocks: section.blocks.slice(0, cutoffIndex + 1), allRecordsCompleted: false };
  }, [section, completedRecords, sectionCompleted, phrasePracticePairs]);

  // Scroll to bottom when new blocks appear (skip on section change)
  useEffect(() => {
    if (prevSectionRef.current !== currentSection) {
      prevSectionRef.current = currentSection;
      previousVisibleCountRef.current = visibleBlocks.length;
      return;
    }
    if (previousVisibleCountRef.current === 0) {
      previousVisibleCountRef.current = visibleBlocks.length;
      return;
    }
    if (visibleBlocks.length > previousVisibleCountRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
    previousVisibleCountRef.current = visibleBlocks.length;
  }, [visibleBlocks.length, allRecordsCompleted, currentSection]);

  const handleRecordComplete = useCallback(() => {
    onRecordComplete();
  }, [onRecordComplete]);

  // Precompute record indices — O(n) instead of O(n²) inside map
  // Must be before early return to satisfy Rules of Hooks
  const recordIndexMap = useMemo(() => {
    const map = new Map<number, number>();

    if (phrasePracticePairs) {
      visibleBlocks.forEach((block, i) => {
        if (isRequiredInteraction(block)) map.set(i, activePhraseIndex);
      });
      return map;
    }

    let counter = 0;
    visibleBlocks.forEach((block, i) => {
      if (isRequiredInteraction(block)) map.set(i, counter++);
    });
    return map;
  }, [activePhraseIndex, phrasePracticePairs, visibleBlocks]);

  if (!section) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        Секция не найдена
      </div>
    );
  }

  if (section.blocks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center text-muted text-sm">
        Этот шаг ещё не наполнен. Вернитесь к нему немного позже.
      </div>
    );
  }

  const hasActiveRecord = !allRecordsCompleted &&
    visibleBlocks.length > 0 &&
    isRequiredInteraction(visibleBlocks[visibleBlocks.length - 1]);
  const activeBlock = visibleBlocks[visibleBlocks.length - 1];
  const showRecordCTA = hasActiveRecord
    && (activeBlock?.type === 'record' || activeBlock?.type === 'pronunciationPrompt');

  const isLastSection = currentSection >= allSections.length;
  const showCompletedSuccessInScroll = allRecordsCompleted && sectionCompleted && isLastSection;
  const showCompletionDock = allRecordsCompleted && (!sectionCompleted || !isLastSection);

  return (
    <div className="lesson-section-layout">
      <div ref={scrollRef} className="lesson-scroll">
        <div className="lesson-section-content">
          <header className="lesson-step-heading">
            {phrasePracticePairs && (
              <span className="lesson-step-heading__eyebrow">
                Шаг {currentSection} из {allSections.length} · Повторяем фразы
              </span>
            )}
            <h1 className="lesson-step-heading__title">{section.title}</h1>
          </header>
          {visibleBlocks.map((block, i) => {
            if (isPhraseBlock(block)) {
              if (phrasePracticePairs) {
                return (
                  <div key={`${currentSection}-phrase-practice-${activePhraseIndex}`} className="lesson-block-enter phrase-practice-scene__phrase">
                    <PhrasePracticeCard
                      block={block}
                      audioId={`phrase-practice-${currentSection}-${activePhraseIndex}`}
                    />
                    <p className="phrase-practice-scene__instruction">
                      Сначала послушайте фразу. Затем повторите её вслух.
                    </p>
                  </div>
                );
              }

              if (i > 0 && isPhraseBlock(visibleBlocks[i - 1])) return null;

              const items: Array<{
                block: Extract<ContentBlock, { type: 'phrase' | 'phraseCard' }>;
                index: number;
              }> = [];

              for (let phraseIndex = i; phraseIndex < visibleBlocks.length; phraseIndex++) {
                const phraseBlock = visibleBlocks[phraseIndex];
                if (!isPhraseBlock(phraseBlock)) break;
                items.push({ block: phraseBlock, index: phraseIndex });
              }

              return (
                <div key={`${currentSection}-phrases-${i}`} className="lesson-block-enter">
                  <PhraseGroup items={items} sectionId={currentSection} />
                </div>
              );
            }

            const isLastRecord = hasActiveRecord && i === visibleBlocks.length - 1;
            const isCompletedRecord = isRequiredInteraction(block) && !isLastRecord;
            const recIdx = recordIndexMap.get(i);
            return (
              <div key={`${currentSection}-${i}`} className="lesson-block-enter">
                <BlockRenderer
                  block={block}
                  index={i}
                  onSkipRecord={isLastRecord ? handleRecordComplete : undefined}
                  recordCompleted={isCompletedRecord}
                  sectionId={currentSection}
                  recordIndex={recIdx}
                  actionDock={interactionDock}
                  onRecordRetry={recIdx == null ? undefined : () => onRecordRetry(recIdx)}
                />
              </div>
            );
          })}
          {showCompletedSuccessInScroll && <LessonCompleteCard />}
          <div ref={bottomRef} />
        </div>
      </div>
      {showCompletionDock && <LessonCompleteCard />}
      <div ref={setInteractionDock} className="lesson-interaction-dock" />
      {showRecordCTA && (
        <StickyRecordCTA
          key={`${currentSection}-${completedRecords}`}
          onComplete={handleRecordComplete}
          sectionId={currentSection}
          recordIndex={completedRecords}
          tracking={activeBlock.type === 'record' || activeBlock.type === 'pronunciationPrompt' ? activeBlock.tracking : undefined}
        />
      )}
    </div>
  );
}
