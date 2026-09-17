import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LessonVideoBubble } from '../../components/lesson/LessonVideoBubble';

vi.mock('../../components/audio/VideoOverlay', () => ({
  VideoOverlay: ({ videoSrc, onClose }: { videoSrc: string; onClose: () => void }) => (
    <div data-testid="video-overlay">
      <span>{videoSrc}</span>
      <button type="button" onClick={onClose}>Закрыть</button>
    </div>
  ),
}));

afterEach(() => cleanup());

describe('LessonVideoBubble', () => {
  it('renders a Telegram-like circle presentation and opens the video', () => {
    render(<LessonVideoBubble block={{
      type: 'video',
      presentation: 'circle',
      senderName: 'Ани',
      text: 'Посмотрите, как звучит фраза.',
      videoSrc: 'https://example.com/circle.mp4',
      thumbnail: 'https://example.com/circle.jpg',
      duration: 8,
    }} />);

    expect(screen.getByText('Ани')).toBeInTheDocument();
    const open = screen.getByRole('button', { name: /Открыть видео-кружок/i });
    fireEvent.click(open);
    expect(screen.getByTestId('video-overlay')).toHaveTextContent('https://example.com/circle.mp4');
  });

  it('renders a scene presentation with an explicit scene label', () => {
    render(<LessonVideoBubble block={{
      type: 'video',
      presentation: 'scene',
      text: 'Короткий разговор в кафе',
      videoSrc: 'https://example.com/scene.mp4',
      thumbnail: 'https://example.com/scene.jpg',
    }} />);

    expect(screen.getByText('Сцена')).toBeInTheDocument();
    expect(screen.getByText('Короткий разговор в кафе')).toBeInTheDocument();
  });

  it('keeps legacy blocks on the lesson-card presentation', () => {
    render(<LessonVideoBubble block={{
      type: 'video',
      senderName: 'Ани',
      text: 'Объяснение',
      videoSrc: 'https://example.com/lesson.mp4',
      thumbnail: 'https://example.com/lesson.jpg',
    }} />);

    expect(screen.getByRole('button', { name: /Открыть видео: Объяснение/i })).toBeInTheDocument();
  });
});
