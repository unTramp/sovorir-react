import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RecordingPlayback } from '../../components/audio/RecordingPlayback';

afterEach(cleanup);

describe('RecordingPlayback', () => {
  it('renders as a reusable playback control with accessible progress', () => {
    render(
      <RecordingPlayback
        id="recording-test"
        audioUrl="/audio/test.webm"
        duration={4}
      />,
    );

    expect(screen.getByRole('button', { name: 'Воспроизвести' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Прогресс воспроизведения записи' }))
      .toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('4с')).toBeInTheDocument();
  });
});
