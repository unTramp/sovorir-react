import { beforeEach, describe, expect, it } from 'vitest';
import type { LearningItem } from '../../domain/learning';
import { useLearningItemStore } from '../../stores/useLearningItemStore';

const item: LearningItem = {
  id: '9b3ba598-f263-4f33-80a2-2944caa10179', revision: 1, type: 'phrase',
  armenian: 'Բարև', transliteration: 'barev', translation: 'Привет', contexts: [],
  register: 'neutral', difficulty: 1, tags: ['greeting'], reviewable: true,
};

beforeEach(() => useLearningItemStore.setState({ items: {} }));

describe('useLearningItemStore', () => {
  it('replaces and updates canonical items by UUID', () => {
    useLearningItemStore.getState().replaceItems([item]);
    expect(useLearningItemStore.getState().getItem(item.id)?.translation).toBe('Привет');

    useLearningItemStore.getState().upsertItems([{ ...item, revision: 2, translation: 'Здравствуйте' }]);
    expect(useLearningItemStore.getState().getItem(item.id)).toMatchObject({ revision: 2, translation: 'Здравствуйте' });
  });

  it('removes an item without affecting the rest of the catalog', () => {
    const second = { ...item, id: 'd255b01a-73e4-4f0e-a56a-576181894b80' };
    useLearningItemStore.getState().replaceItems([item, second]);
    useLearningItemStore.getState().removeItem(item.id);
    expect(useLearningItemStore.getState().getItem(item.id)).toBeUndefined();
    expect(useLearningItemStore.getState().getItem(second.id)).toBeDefined();
  });
});
