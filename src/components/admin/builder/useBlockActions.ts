import { useCallback } from 'react';
import {
  makeClientId,
} from './utils';
import {
  makeDefaultSemanticBlockContent,
  semanticToLegacyBlockType,
  type SemanticBlockType,
} from '../../../lib/semanticContent';
import type { AdminBlockType, AdminLessonBuilder, AdminLessonSection } from '../../../types/admin';
import type { ContentBlock } from '../../../types/lessonContent';

interface UseBlockActionsParams {
  selectedLesson: AdminLessonBuilder | null;
  selectedSection: AdminLessonSection | null;
  orderedBlocks: AdminLessonSection['blocks'];
  newBlockType: SemanticBlockType;
  updateDraftLesson: (
    updater: (draft: AdminLessonBuilder) => AdminLessonBuilder | void,
    options?: { markDirty?: boolean },
  ) => void;
  setNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setHighlightedBlockId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useBlockActions({
  selectedLesson,
  selectedSection,
  orderedBlocks,
  newBlockType,
  updateDraftLesson,
  setNotice,
  setHighlightedBlockId,
}: UseBlockActionsParams) {
  const handleCreateBlock = useCallback(async () => {
    if (!selectedLesson || !selectedSection) return;
    const nextOrder = selectedSection.blocks.length > 0
      ? Math.max(...selectedSection.blocks.map((block) => block.orderIndex)) + 1
      : 1;
    const blockId = makeClientId('block');

    updateDraftLesson((draft) => {
      const section = draft.sections.find((item) => item.id === selectedSection.id);
      if (!section) return;
      section.blocks.push({
        id: blockId,
        sectionId: section.id,
        orderIndex: nextOrder,
        type: semanticToLegacyBlockType(newBlockType),
        content: makeDefaultSemanticBlockContent(newBlockType),
        createdAt: new Date().toISOString(),
      });
    });
    setHighlightedBlockId(blockId);
    setNotice('Блок добавлен в черновик');
  }, [newBlockType, selectedLesson, selectedSection, setHighlightedBlockId, setNotice, updateDraftLesson]);

  const handleInsertBlockAfter = useCallback(async (sectionId: string, afterBlockId: string, type: AdminBlockType) => {
    if (!selectedLesson || !selectedSection) return;
    const blockId = makeClientId('block');
    updateDraftLesson((draft) => {
      const section = draft.sections.find((item) => item.id === sectionId);
      if (!section) return;
      const ordered = [...section.blocks].sort((a, b) => a.orderIndex - b.orderIndex);
      const insertIndex = ordered.findIndex((block) => block.id === afterBlockId);
      if (insertIndex < 0) return;

      ordered.splice(insertIndex + 1, 0, {
        id: blockId,
        sectionId,
        orderIndex: ordered.length + 1,
        type,
        content: makeDefaultSemanticBlockContent(
          semanticToLegacyBlockType(newBlockType) === type ? newBlockType : 'heading',
        ),
        createdAt: new Date().toISOString(),
      });

      section.blocks = ordered.map((block, blockIndex) => ({
        ...block,
        orderIndex: blockIndex + 1,
      }));
    });
    setHighlightedBlockId(blockId);
    setNotice('Блок вставлен в черновик');
  }, [newBlockType, selectedLesson, selectedSection, setHighlightedBlockId, setNotice, updateDraftLesson]);

  const handleSaveBlock = useCallback(async (
    blockId: string,
    patch: { orderIndex: number; type: AdminBlockType; content: ContentBlock },
  ) => {
    if (!selectedLesson) return;
    updateDraftLesson((draft) => {
      for (const section of draft.sections) {
        const block = section.blocks.find((item) => item.id === blockId);
        if (!block) continue;
        block.orderIndex = patch.orderIndex;
        block.type = patch.type;
        block.content = patch.content;
        break;
      }
    });
  }, [selectedLesson, updateDraftLesson]);

  const handleDeleteBlock = useCallback(async (blockId: string) => {
    if (!selectedLesson) return;
    updateDraftLesson((draft) => {
      for (const section of draft.sections) {
        const nextBlocks = section.blocks.filter((block) => block.id !== blockId);
        if (nextBlocks.length !== section.blocks.length) {
          section.blocks = nextBlocks.map((block, blockIndex) => ({
            ...block,
            orderIndex: blockIndex + 1,
          }));
          break;
        }
      }
    });
    setNotice('Блок удалён из черновика');
  }, [selectedLesson, setNotice, updateDraftLesson]);

  const handleMoveBlock = useCallback(async (sectionId: string, blockId: string, direction: 'up' | 'down') => {
    if (!selectedLesson || !selectedSection) return;
    const currentIndex = orderedBlocks.findIndex((block) => block.id === blockId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedBlocks.length) return;

    const reordered = orderedBlocks.map((block) => block.id);
    [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];

    updateDraftLesson((draft) => {
      const section = draft.sections.find((item) => item.id === sectionId);
      if (!section) return;
      section.blocks = reordered.map((id, index) => {
        const block = section.blocks.find((item) => item.id === id);
        if (!block) {
          throw new Error('Блок не найден');
        }

        return {
          ...block,
          orderIndex: index + 1,
        };
      });
    });
    setNotice('Порядок блоков обновлён в черновике');
  }, [orderedBlocks, selectedLesson, selectedSection, setNotice, updateDraftLesson]);

  return {
    handleCreateBlock,
    handleInsertBlockAfter,
    handleSaveBlock,
    handleDeleteBlock,
    handleMoveBlock,
  };
}
