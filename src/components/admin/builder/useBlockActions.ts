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
  updateDraftLesson,
  setNotice,
  setHighlightedBlockId,
}: UseBlockActionsParams) {
  const handleCreateBlock = useCallback(async (type: SemanticBlockType = 'heading') => {
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
        type: semanticToLegacyBlockType(type),
        content: makeDefaultSemanticBlockContent(type),
        createdAt: new Date().toISOString(),
      });
    });
    setHighlightedBlockId(blockId);
    setNotice('Блок добавлен в черновик');
  }, [selectedLesson, selectedSection, setHighlightedBlockId, setNotice, updateDraftLesson]);

  const handleInsertBlockAfter = useCallback(async (
    sectionId: string,
    afterBlockId: string,
    semanticType: SemanticBlockType,
  ) => {
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
        type: semanticToLegacyBlockType(semanticType),
        content: makeDefaultSemanticBlockContent(semanticType),
        createdAt: new Date().toISOString(),
      });

      section.blocks = ordered.map((block, blockIndex) => ({
        ...block,
        orderIndex: blockIndex + 1,
      }));
    });
    setHighlightedBlockId(blockId);
    setNotice('Блок вставлен в черновик');
  }, [selectedLesson, selectedSection, setHighlightedBlockId, setNotice, updateDraftLesson]);

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

  const handleReorderBlock = useCallback(async (sectionId: string, draggedBlockId: string, overBlockId: string) => {
    if (!selectedLesson || !selectedSection || draggedBlockId === overBlockId) return;
    const currentIndex = orderedBlocks.findIndex((block) => block.id === draggedBlockId);
    const nextIndex = orderedBlocks.findIndex((block) => block.id === overBlockId);
    if (currentIndex < 0 || nextIndex < 0 || currentIndex === nextIndex) return;

    const reordered = orderedBlocks.map((block) => block.id);
    const [movedId] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, movedId);

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
    handleReorderBlock,
  };
}
