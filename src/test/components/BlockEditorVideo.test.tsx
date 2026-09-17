import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BlockEditor } from '../../components/admin/builder/BlockEditor';
import type { AdminLessonBlock } from '../../types/admin';

const videoBlock: AdminLessonBlock = {
  id: 'video-block-1',
  sectionId: 'section-1',
  orderIndex: 1,
  type: 'video',
  content: {
    type: 'video',
    presentation: 'lesson',
    senderName: 'Ани',
    text: 'Короткое объяснение',
    videoSrc: 'https://example.com/video.mp4',
    posterMode: 'first-frame',
  },
  createdAt: new Date().toISOString(),
};

describe('BlockEditor video authoring', () => {
  it('changes a video lesson into a Telegram-like circle without changing block type', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <BlockEditor
        block={videoBlock}
        busy={false}
        onSave={onSave}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.change(screen.getByLabelText('Роль видео в уроке'), {
      target: { value: 'circle' },
    });

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave).toHaveBeenLastCalledWith(
      'video-block-1',
      expect.objectContaining({
        type: 'video',
        content: expect.objectContaining({
          type: 'video',
          presentation: 'circle',
          senderName: 'Ани',
        }),
      }),
    );
  });

  it('allows scene-specific metadata to be authored', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <BlockEditor
        block={{
          ...videoBlock,
          content: { ...videoBlock.content, presentation: 'scene' },
        } as AdminLessonBlock}
        busy={false}
        onSave={onSave}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.change(screen.getByLabelText('Транскрипт'), {
      target: { value: 'Բարև։ Ո՞նց ես։' },
    });

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave).toHaveBeenLastCalledWith(
      'video-block-1',
      expect.objectContaining({
        content: expect.objectContaining({
          presentation: 'scene',
          transcript: 'Բարև։ Ո՞նց ես։',
        }),
      }),
    );
  });
});
