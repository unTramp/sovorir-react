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
        busy={false}
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

  it('asks for confirmation before replacing a filled block with another type', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <BlockEditor
        block={phraseBlock}
        busy={false}
        onSave={onSave}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Карточка фразы/i }));
    fireEvent.click(screen.getByRole('option', { name: /Внутренний заголовок/i }));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      'block-1',
      expect.objectContaining({
        type: 'heading',
        content: expect.objectContaining({
          type: 'heading',
          text: 'Новый заголовок',
        }),
      }),
    );
  });

  it('keeps the current block when type change confirmation is cancelled', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <BlockEditor
        block={phraseBlock}
        busy={false}
        onSave={onSave}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Карточка фразы/i }));
    fireEvent.click(screen.getByRole('option', { name: /Внутренний заголовок/i }));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onSave).not.toHaveBeenCalled());
  });

  it('shows a content preview when the block is collapsed', async () => {
    render(
      <BlockEditor
        block={phraseBlock}
        busy={false}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Свернуть блок' }));

    expect(screen.getByText('Содержимое блока')).toBeInTheDocument();
    expect(screen.getByText('Բարև — Привет')).toBeInTheDocument();
    expect(screen.queryByLabelText('Перевод')).not.toBeInTheDocument();
  });
});
