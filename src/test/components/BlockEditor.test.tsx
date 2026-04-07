import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BlockEditor } from '../../components/admin/builder/BlockEditor';
import type { AdminLessonBlock } from '../../types/admin';

const phraseBlock: AdminLessonBlock = {
  id: 'block-1',
  sectionId: 'section-1',
  orderIndex: 1,
  type: 'phrase',
  content: {
    type: 'phrase',
    russian: 'Барев',
    armenian: 'Բարև',
    transcription: 'barev',
    translation: 'Привет',
    status: 'new',
  },
  createdAt: new Date().toISOString(),
};

describe('BlockEditor', () => {
  it('saves typed phrase card edits through the shared save handler', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <BlockEditor
        block={phraseBlock}
        canMoveUp={false}
        canMoveDown={false}
        busy={false}
        onMove={vi.fn().mockResolvedValue(undefined)}
        onSave={onSave}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.change(screen.getByLabelText('Перевод'), {
      target: { value: 'Здравствуйте' },
    });

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      'block-1',
      expect.objectContaining({
        type: 'phrase',
        content: expect.objectContaining({
          translation: 'Здравствуйте',
        }),
      }),
    );

    expect(screen.queryByRole('button', { name: 'Применить блок' })).not.toBeInTheDocument();
  });
});
